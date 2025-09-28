import { type NextRequest, NextResponse } from "next/server";

export const updateSession = async (request: NextRequest) => {
  // This `try/catch` block is only here for the interactive tutorial.
  // Feel free to remove once you have Supabase connected.
  try {
    const pathname = request.nextUrl.pathname;
    if (process.env.SKIP_AUTH_FETCH === "1") {
      return NextResponse.next({ request: { headers: request.headers } });
    }
    const isProtected = pathname.startsWith("/dashboard");

    // Fast path: avoid creating Supabase client or doing any network call
    // in middleware for public routes to prevent noisy fetch failures.
    if (!isProtected) {
      return NextResponse.next({
        request: { headers: request.headers },
      });
    }

    // Create an unmodified response for protected routes
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    const { createServerClient } = await import("@supabase/ssr");
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Refresh session for protected routes only
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const user = await supabase.auth.getUser();
    if (user.error) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    // Redirect to dashboard all the time if user is logged in
    // if (request.nextUrl.pathname === "/" && !user.error) {
    //   return NextResponse.redirect(new URL("/dashboard", request.url));
    // }

    return response;
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    // Check out http://localhost:3000 for Next Steps.
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    });
  }
};
