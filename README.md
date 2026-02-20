# Founder Signal Dashboard - Next.js

Complete production-ready dashboard for Founder Growth Signal API.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev

# Open http://localhost:3000
```

## Environment Variables

```
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

## Features

- ✅ Authentication with Supabase
- ✅ Dashboard with stats
- ✅ Bulk LinkedIn upload
- ✅ Signal templates (Funding, Hiring, Launch, Expansion)
- ✅ Instant preview (first 5 profiles)
- ✅ Background processing
- ✅ Signals detection table
- ✅ Razorpay billing integration
- ✅ Settings & webhook management

## File Structure

```
/app
  /login          - Login page
  /dashboard      - Main dashboard
  /prospects      - Upload & manage prospects
  /signals        - View detected signals
  /billing        - Manage subscription
  /settings       - Webhook & API key settings
/components       - Reusable UI components
/lib              - API client, auth helpers
/types            - TypeScript definitions
```

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase Auth
- React Query
- Zustand (state management)

## User Flow

1. Login with email/password (Supabase)
2. Get API key from backend
3. Upload LinkedIn URLs with signal template
4. See instant preview (5 profiles scanned)
5. View all detected signals
6. Upgrade plan via Razorpay

## Development

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Production Checklist

- [ ] Set all environment variables
- [ ] Enable CORS on backend
- [ ] Test Razorpay integration
- [ ] Configure custom domain
- [ ] Add analytics (optional)

## Support

For issues, check:
1. Backend API is running
2. Environment variables are set correctly
3. CORS is enabled on API
4. Supabase auth is configured

---

Built for monitoring Founder Growth Signals on LinkedIn.
