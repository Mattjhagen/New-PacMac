import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const next = searchParams.get('next') ?? '/'
  const error = searchParams.get('error')

  console.log('Auth callback received:', { code: !!code, state, origin, next, error })

  // Handle GitHub OAuth callback
  if (state && state.match(/^\d+$/)) {
    // This is a GitHub OAuth callback (state is a timestamp)
    if (error) {
      console.error('GitHub OAuth error:', error)
      return NextResponse.redirect(`${origin}?error=${encodeURIComponent(error)}`)
    }

    if (!code) {
      console.error('No authorization code received from GitHub')
      return NextResponse.redirect(`${origin}?error=no_code`)
    }

    try {
      // Exchange code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          state,
        }),
      })

      const tokenData = await tokenResponse.json()

      if (tokenData.error) {
        console.error('GitHub token exchange error:', tokenData.error)
        return NextResponse.redirect(`${origin}?error=${encodeURIComponent(tokenData.error)}`)
      }

      const accessToken = tokenData.access_token

      // Get user information from GitHub
      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!userResponse.ok) {
        console.error('Failed to fetch user information from GitHub')
        return NextResponse.redirect(`${origin}?error=user_fetch_failed`)
      }

      const userData = await userResponse.json()

      // Get user email (if not public)
      let email = userData.email
      if (!email) {
        try {
          const emailResponse = await fetch('https://api.github.com/user/emails', {
            headers: {
              'Authorization': `token ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          })

          if (emailResponse.ok) {
            const emails = await emailResponse.json()
            const primaryEmail = emails.find((email: { primary: boolean }) => email.primary)
            if (primaryEmail) {
              email = primaryEmail.email
            }
          }
        } catch (error) {
          console.error('Error fetching user email:', error)
        }
      }

      // Format user data
      const user = {
        id: userData.id.toString(),
        name: userData.name || userData.login,
        email: email || `${userData.login}@users.noreply.github.com`,
        login: userData.login,
        avatar: userData.avatar_url,
        location: userData.location,
        bio: userData.bio,
        public_repos: userData.public_repos,
        followers: userData.followers,
        following: userData.following,
        created_at: userData.created_at,
        updated_at: userData.updated_at,
      }

      // Redirect with success data
      const successData = {
        type: 'GITHUB_AUTH_SUCCESS',
        user: JSON.stringify(user),
        token: accessToken
      }

      const params = new URLSearchParams(successData)
      return NextResponse.redirect(`${origin}?${params.toString()}`)

    } catch (error) {
      console.error('GitHub OAuth processing error:', error)
      return NextResponse.redirect(`${origin}?error=processing_failed`)
    }
  }

  // Handle Supabase auth callback (existing logic)
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
    console.log('Auth exchange result:', { error: error?.message, user: !!data?.user })
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    } else {
      console.error('Auth exchange error:', error)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
