'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string, userData?: Record<string, unknown>) => Promise<{ error: AuthError | null }>
  signInWithOAuth: (provider: 'google' | 'github' | 'apple') => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  updateProfile: (updates: { firstName?: string; lastName?: string; location?: { city: string; state: string } }) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if we have valid Supabase credentials
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    console.log('AuthContext: Checking Supabase credentials', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseAnonKey,
      url: supabaseUrl?.substring(0, 30) + '...',
      key: supabaseAnonKey?.substring(0, 20) + '...'
    })
    
    // If no valid credentials, assume user is not authenticated
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://placeholder.supabase.co' || supabaseAnonKey === 'placeholder-key') {
      console.log('No valid Supabase credentials, assuming user is not authenticated')
      setUser(null)
      setSession(null)
      setLoading(false)
      return
    }

    // Additional check for production environment
    if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
      console.log('Running on Render, checking if auth is properly configured...')
      // If we're on Render and auth is disabled, handle gracefully
      try {
        fetch('/api/auth/session')
          .then(response => response.json())
          .then(data => {
            if (data.message === 'Auth temporarily disabled') {
              console.log('Auth is disabled on server, setting loading to false')
              setUser(null)
              setSession(null)
              setLoading(false)
              return
            }
          })
          .catch(() => {
            // If API call fails, continue with normal auth flow
            console.log('Auth API call failed, continuing with normal flow')
          })
      } catch (error) {
        console.log('Error checking auth status:', error)
      }
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...')
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error getting session:', error)
        } else {
          console.log('AuthContext: Session result', { 
            hasSession: !!session, 
            hasUser: !!session?.user,
            userEmail: session?.user?.email 
          })
          setSession(session)
          setUser(session?.user ?? null)
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error)
        setUser(null)
        setSession(null)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed', { 
          event, 
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email 
        })
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error }
  }

  const signUp = async (email: string, password: string, userData?: Record<string, unknown>) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { error }
  }

  const signInWithOAuth = async (provider: 'google' | 'github' | 'apple') => {
    console.log('Starting OAuth with provider:', provider)
    console.log('Redirect URL will be:', `${window.location.origin}/auth/callback`)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('OAuth error:', error)
    }
    
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateProfile = async (updates: { firstName?: string; lastName?: string; location?: { city: string; state: string } }) => {
    const { error } = await supabase.auth.updateUser({
      data: updates
    })
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
    updateProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
