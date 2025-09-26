# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Commands
- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application
- `npm run start` - Start production server

### Installation
- `npm i` - Install all dependencies

## Project Architecture

This is a Next.js App Router application implementing a Chinese name generator SaaS with subscription and credit systems, **targeting English-speaking users primarily in Europe and North America**.

## Content Strategy
- **Primary Language**: English - all user-facing content should be written in English first
- **Target Audience**: English-speaking users interested in Chinese names and culture
- **Content Tone**: Professional, culturally respectful, and accessible to Western audiences

### Tech Stack
- **Framework**: Next.js 14+ with App Router
- **Authentication**: Supabase Auth (email/password + OAuth providers like Google)
- **Database**: Supabase (PostgreSQL)
- **Payment Processing**: Creem.io (optimized for Chinese mainland users)
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI Integration**: OpenAI/OpenRouter APIs for name generation
- **PDF Generation**: Puppeteer for name certificates
- **Theme**: next-themes for dark/light mode

### Key Features
- AI-powered Chinese name generation with cultural analysis
- Subscription-based and credit-based payment models
- PDF certificate generation for names
- User dashboard with generation history
- Popular names showcase
- TTS (Text-to-Speech) for name pronunciation

### Directory Structure
```
app/
├── (auth-pages)/          # Authentication pages (sign-in, sign-up, etc.)
├── api/                   # API routes
│   ├── chinese-names/     # Name generation endpoints
│   ├── webhooks/creem/    # Payment webhook handlers
│   ├── credits/           # Credit management
│   └── saved-names/       # User saved names
├── dashboard/             # User dashboard pages
├── product/               # Product feature pages
└── profile/               # User profile pages

components/
├── ui/                    # shadcn/ui base components
├── dashboard/             # Dashboard-specific components
├── product/               # Product feature components
└── layout/                # Layout components (header, footer, etc.)

utils/
├── supabase/              # Supabase client configurations
└── creem/                 # Creem payment utilities

hooks/                     # Custom React hooks (user, subscription, credits)
types/                     # TypeScript type definitions
lib/                       # Utility libraries
```

### Authentication Flow
- Uses Supabase Auth with middleware for route protection
- Supports email/password and OAuth (Google, GitHub)
- `middleware.ts` handles session updates and route protection
- Authentication pages are grouped under `(auth-pages)` route group

### Payment Integration (Creem.io)
- Supports both subscription and credit-based models
- Webhook handling at `/api/webhooks/creem` for payment events
- Customer portal integration for subscription management
- Environment variables required: `CREEM_API_KEY`, `CREEM_WEBHOOK_SECRET`

### Database Schema
Uses Supabase with tables for:
- User profiles and subscription status
- Generation history and batches
- Saved names and user preferences
- Credit balances and transactions

### Environment Setup
Key environment variables needed:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `CREEM_API_KEY` - Creem payment API key
- `CREEM_WEBHOOK_SECRET` - Creem webhook verification secret
- `CREEM_API_URL` - Creem API endpoint (test or production)
- `NEXT_PUBLIC_SITE_URL` - Application URL
- OpenAI/OpenRouter API keys for name generation

### Component Patterns
- Uses shadcn/ui component library with customized styling
- Implements React Hook Form with Zod validation
- Custom hooks for user state, subscriptions, and credits management
- Framer Motion for animations and transitions

### API Design
- RESTful API design under `/api` directory
- Webhook endpoints for external service integration
- Credit system with usage tracking
- Generation batches for bulk operations

## Important Development Notes

- The application uses TypeScript throughout with strict typing
- Tailwind CSS with CSS variables for theming support
- All forms use react-hook-form with Zod schema validation
- PDF generation uses Puppeteer for creating name certificates
- TTS functionality integrated for name pronunciation
- Responsive design with mobile-first approach

## Localization Guidelines

- **Default Language**: English - all new content, UI text, and user communications should be in English
- **Content Creation**: When adding new features or copy, write in English first
- **Cultural Context**: Provide clear explanations of Chinese cultural concepts for Western audiences
- **User Experience**: Design flows and explanations should be intuitive for English-speaking users unfamiliar with Chinese naming traditions