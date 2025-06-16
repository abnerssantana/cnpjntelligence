import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseInstance: SupabaseClient | null = null
let supabaseAdminInstance: SupabaseClient | null = null

/**
 * Get or create the Supabase client instance
 * This ensures we only create one instance and handle missing env vars gracefully
 */
export function getSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[Supabase Client] Variáveis de ambiente não encontradas:', {
        NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey
      })
      // Em desenvolvimento, use valores padrão se as variáveis não estiverem definidas
      if (process.env.NODE_ENV === 'development') {
        const defaultUrl = 'https://wvjhemqwcawxhgqdblij.supabase.co'
        const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2amhlbXF3Y2F3eGhncWRibGlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTYyMjgsImV4cCI6MjA2NTU3MjIyOH0.TUYIDy1BqzuL-_7ZZKmqG1OKzxTChRacR5WCvj0Ly3s'
        console.warn('[Supabase Client] Usando valores padrão em desenvolvimento')
        supabaseInstance = createClient(defaultUrl, defaultKey)
      } else {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórias')
      }
    } else {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey)
    }
  }
  return supabaseInstance
}

/**
 * Get or create the Supabase admin client instance
 * This should only be used in server-side code
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('[Supabase Admin] Variáveis de ambiente não encontradas:', {
        NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceRoleKey
      })
      throw new Error('NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias para o cliente admin')
    }

    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }
  return supabaseAdminInstance
}