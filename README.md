This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## API Services

This backend provides several API services for the Promise Keeper iOS app:

### Basecamp OAuth Integration
- `/api/basecamp/auth` - Initiates the OAuth flow
- `/api/basecamp/token` - Exchanges authorization code for access token
- `/api/basecamp/refresh` - Refreshes an expired access token
- `/api/basecamp/callback` - Handles OAuth redirect

For more details, see [Basecamp API README](src/app/api/basecamp/README.md)

### OpenAI Integration
- `/api/openai` - Detects promises in Slack messages
- `/api/openai/gmail` - Detects promises in Gmail threads

For more details, see [OpenAI API README](src/app/api/openai/README.md)

### Waitlist Management
- `/api/waitlist` - Adds users to the waitlist via Airtable

## Environment Setup

1. Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your actual API keys and secrets in `.env.local`

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## ESLint Fixes
- Fixed ESLint errors related to unused variables and interfaces on May 1, 2024
