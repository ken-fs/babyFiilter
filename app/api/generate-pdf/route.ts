import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import puppeteer from 'puppeteer';
import { generateCertificateHTML } from '@/utils/pdf-templates/name-certificate';

interface NameData {
  chinese: string;
  pinyin: string;
  characters: Array<{
    character: string;
    pinyin: string;
    meaning: string;
    explanation: string;
  }>;
  meaning: string;
  culturalNotes: string;
  personalityMatch: string;
  style: string;
}

interface RequestBody {
  nameData: NameData;
  userData: {
    englishName: string;
    gender: string;
  };
}

export async function POST(request: NextRequest) {
  console.log('=== PDF Generation API Called ===');

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required for PDF generation' },
        { status: 401 }
      );
    }

    const body: RequestBody = await request.json();
    const { nameData, userData } = body;

    if (!nameData || !userData) {
      return NextResponse.json(
        { error: 'Missing required data: nameData and userData' },
        { status: 400 }
      );
    }

    console.log('PDF generation request:', {
      user: user.id,
      chineseName: nameData.chinese,
      englishName: userData.englishName,
    });

    // Subscription/credits: subscribers unlimited; others need 1 credit
    const { data: customer, error: fetchError } = await supabase
      .from('customers')
      .select('id, credits')
      .eq('user_id', user.id)
      .single();

    if (fetchError && (fetchError as any).code !== 'PGRST116') {
      console.error('Error fetching customer:', fetchError);
      return NextResponse.json(
        { error: 'Unable to verify user account' },
        { status: 500 }
      );
    }

    let hasActiveSubscription = false;
    if (customer) {
      const { data: sub, error: subError } = await supabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('customer_id', customer.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (subError && (subError as any).code !== 'PGRST116') {
        console.error('Subscription fetch error:', subError);
      }
      const status = sub?.status as string | undefined;
      hasActiveSubscription = status === 'active' || status === 'trialing';
    }

    // Generate HTML content
    const htmlContent = generateCertificateHTML(nameData, userData);

    // Render PDF via Puppeteer
    let browser;
    try {
      console.log('Launching Puppeteer...');
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu',
        ],
      });

      const page = await browser.newPage();

      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      console.log('Generating PDF...');
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0.5cm',
          right: '0.5cm',
          bottom: '0.5cm',
          left: '0.5cm',
        },
      });

      await browser.close();
      console.log('PDF generated successfully');

      // Deduct 1 credit for non-subscribers
      if (!hasActiveSubscription) {
        if (!customer || (customer.credits || 0) < 1) {
          return NextResponse.json(
            {
              error: 'Insufficient credits. PDF generation requires 1 credit.',
              creditsRequired: 1,
              currentCredits: customer?.credits || 0,
            },
            { status: 403 }
          );
        }

        const newCredits = (customer.credits || 0) - 1;
        const { error: updateError } = await supabase
          .from('customers')
          .update({
            credits: newCredits,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customer.id);

        if (updateError) {
          console.error('Failed to deduct credits:', updateError);
        } else {
          await supabase.from('credits_history').insert({
            customer_id: customer.id,
            amount: 1,
            type: 'subtract',
            description: 'pdf_generation',
            metadata: {
              operation: 'pdf_generation',
              chinese_name: nameData.chinese,
              english_name: userData.englishName,
              credits_before: customer.credits,
              credits_after: newCredits,
              generated_at: new Date().toISOString(),
            },
          });

          console.log('Credits deducted successfully:', {
            userId: user.id,
            creditsBefore: customer.credits,
            creditsAfter: newCredits,
          });
        }
      }

      const fileName = `${nameData.chinese}_certificate.pdf`;

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
          'Content-Length': pdfBuffer.length.toString(),
        },
      });
    } catch (puppeteerError) {
      console.error('Puppeteer error:', puppeteerError);
      if (browser) {
        await browser.close();
      }
      throw puppeteerError;
    }
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate PDF. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

