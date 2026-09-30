# Campus Marketplace

A modern Next.js campus marketplace for discovering, listing, and managing products.

## Tech stack

- Next.js 15 App Router
- React 19
- Tailwind CSS
- Supabase Auth / Database
- `@supabase/ssr`
- Framer Motion
- Lucide icons

## Environment setup

Create a local `.env.local` file from `.env.example`:

```bash
cp .env.example .env.local
```

Then add your Supabase project values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

The older `NEXT_PUBLIC_SUPABASE_ANON_KEY` variable is also supported.

### Vercel

For production, add the same variables in:

**Vercel → Project → Settings → Environment Variables**

Enable them for **Production, Preview, and Development** as appropriate, then redeploy.

The Supabase project must also allow the production callback URL in:

**Supabase → Authentication → URL Configuration**

For example:

```
https://your-domain.com/auth/callback
```

## Development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm start
```

## Supabase build-safety

Supabase browser clients are created lazily at runtime. This prevents Next.js from trying to construct a Supabase client during static build evaluation when Vercel environment variables are not available to the build.

Never commit `.env.local`, API keys, service-role keys, or other secrets.
