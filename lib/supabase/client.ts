import { createBrowserClient } from "@supabase/ssr"

let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ CRITICAL: Supabase environment variables are missing!')
    console.error('Create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    throw new Error('Supabase configuration missing. Check ENV_SETUP.md')
  }

  // Return existing instance to prevent multiple WebSocket connections
  if (supabaseInstance) {
    return supabaseInstance
  }

  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
      global: {
        fetch: (url, options = {}) => {
          // Add timeout to prevent hanging
          return fetch(url, {
            ...options,
            signal: AbortSignal.timeout(60000), // 60 second timeout
          })
        },
      },
    }
  )

  return supabaseInstance
}
