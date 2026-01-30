# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## How to Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (optional)

## Troubleshooting

### "Supabase environment variables are missing"

1. Make sure your `.env` or `.env.local` file exists in the project root
2. Verify the variable names are **exactly** as shown above (case-sensitive)
3. Restart the development server after changing env variables:
   ```bash
   # Stop the server (Ctrl+C) then:
   npm run dev
   ```

### Environment Variables Not Loading

Next.js loads environment variables in this order:
1. `.env.local` (highest priority)
2. `.env.development.local`
3. `.env.development`
4. `.env`

If you have a `.env` file, it should work. Try creating `.env.local` instead if issues persist.

## For Production Deployment

When deploying to Vercel, Netlify, or other platforms:
1. Add the environment variables in your platform's dashboard
2. Do NOT commit `.env` or `.env.local` files to git
