import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')

  console.log('Supabase auth callback received:', { code: !!code, origin, next, error })

  if (error) {
    console.error('Supabase OAuth error:', error)
    return NextResponse.redirect(`${origin}?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key',
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('Supabase auth exchange result:', { error: error?.message, user: !!data?.user })
    
    if (!error && data?.user) {
      // Redirect to home page with success
      return NextResponse.redirect(`${origin}?auth=success`)
    } else {
      console.error('Supabase auth exchange error:', error)
      return NextResponse.redirect(`${origin}?error=auth_failed`)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}?error=no_code`)
}
