# Environment Variables Setup

## 🚨 CRITICAL: Your app is slow because environment variables are missing!

Create a `.env.local` file in the root directory with:

```env
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How to Get These Values

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon)
3. Click on **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Example

```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## After Creating .env.local

1. Restart your dev server: `npm run dev`
2. Render times should drop from **3 minutes to < 2 seconds**

---

**Without these variables, Supabase connections timeout causing 2-3 minute render times!**
