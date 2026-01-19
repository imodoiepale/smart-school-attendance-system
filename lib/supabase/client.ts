import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ CRITICAL: Supabase environment variables are missing!')
    console.error('Create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    throw new Error('Supabase configuration missing. Check ENV_SETUP.md')
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: (url, options = {}) => {
          // Add timeout to prevent hanging
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(10000), // 10 second timeout
          })
        },
      },
    }
  )
}
