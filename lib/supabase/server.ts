import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import dns from "node:dns"

export async function createClient() {
  dns.setDefaultResultOrder("ipv4first")
  const cookieStore = await cookies()

  // Check if environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ CRITICAL: Supabase environment variables are missing!')
    console.error('Create a .env.local file with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    throw new Error('Supabase configuration missing. Check ENV_SETUP.md')
  }

  console.time('🔍 createClient')
  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Ignored - setAll may be called from Server Component
          }
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: async (url, options = {}) => {
          const start = Date.now()
          const response = await fetch(url, {
            ...options,
            signal: AbortSignal.timeout(60000),
          })
          const duration = Date.now() - start

          const logMsg = `${new Date().toISOString()} - Fetch ${url} took ${duration}ms\n`
          try {
            require('fs').appendFileSync('perf.log', logMsg)
          } catch (e) { }

          return response
        },
      },
    }
  )
  console.timeEnd('🔍 createClient')
  return client
}
