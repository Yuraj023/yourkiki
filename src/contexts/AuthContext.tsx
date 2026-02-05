import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from '@supabase/supabase-js'
import { authService, UserProfile } from '@/services/authService'
import { supabase } from '@/lib/supabaseClient'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  emailNotConfirmed: boolean
  signUpWithOtp: (email: string, name?: string) => Promise<{ error: Error | null }>
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>
  signInWithEmailAndPassword: (email: string, password: string) => Promise<{ user: User | null; error: Error | null }>
  verifyOtp: (email: string, token: string) => Promise<{ user: User | null; error: Error | null }>
  signOut: () => Promise<{ error: Error | null }>
  updateProfile: (profile: Partial<UserProfile>) => Promise<{ profile: UserProfile | null; error: Error | null }>
  refreshUser: () => Promise<void>
  updatePassword: (password: string) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
        
        if (currentUser) {
          // Check if email is confirmed
          if (!currentUser.email_confirmed_at) {
            setEmailNotConfirmed(true)
          }
          
          // Fetch user profile with retry logic
          let retries = 3;
          while (retries > 0) {
            try {
              const { profile: userProfile, error } = await authService.getUserProfile(currentUser.id)
              if (!error && userProfile) {
                setProfile(userProfile)
                break
              }
              if (error && error.message && error.message.includes('relation "profiles" does not exist')) {
                // Table might not be ready yet, wait a bit
                await new Promise(resolve => setTimeout(resolve, 1000))
                retries--
                continue
              }
              break
            } catch (err) {
              break
            }
          }
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          setUser(session?.user || null)
          setEmailNotConfirmed(false)
          
          if (session?.user) {
            // Check if email is confirmed
            if (!session.user.email_confirmed_at) {
              setEmailNotConfirmed(true)
            }
            
            // Fetch user profile when user signs in
            // Add a small delay to ensure the database trigger has time to create the profile
            setTimeout(async () => {
              try {
                const { profile: userProfile, error } = await authService.getUserProfile(session.user.id)
                if (!error) {
                  setProfile(userProfile)
                }
              } catch (err) {
              }
            }, 1500)
          } else {
            setProfile(null)
          }
        } catch (error) {
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const refreshUser = async () => {
    try {
      const { user: refreshedUser, error } = await authService.refreshUser()
      if (!error && refreshedUser) {
        setUser(refreshedUser)
        // Check if email is now confirmed
        if (refreshedUser.email_confirmed_at) {
          setEmailNotConfirmed(false)
        }
      }
    } catch (error) {
    }
  }

  const signUpWithOtp = async (email: string, name?: string) => {
    try {
      // Set the pending name for signup
      if (name) {
        authService.setPendingName(name);
      }
      
      const { error } = await authService.signUpWithOtp(email)
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signInWithOtp = async (email: string) => {
    try {
      const { error } = await authService.signInWithOtp(email)
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const verifyOtp = async (email: string, token: string) => {
    try {
      const result = await authService.verifyOtp(email, token)
      if (result.user) {
        setUser(result.user)
        setEmailNotConfirmed(false)
        
        // Check if we have a pending name to update
        const pendingName = authService.getPendingName();
        if (pendingName && result.user.id) {
          // Update the user's profile with the name
          try {
            const { profile: userProfile, error } = await authService.updateUserProfile(result.user!.id, { name: pendingName })
            if (!error) {
              setProfile(userProfile)
            }
            // Clear the pending name
            authService.clearPendingName()
          } catch (err) {
          }
        } else {
          // Fetch user profile
          try {
            const { profile: userProfile, error } = await authService.getUserProfile(result.user!.id)
            if (!error) {
              setProfile(userProfile)
            }
          } catch (err) {
          }
        }
      }
      return result
    } catch (error) {
      return { user: null, error: error as Error }
    }
  }

  const signOut = async () => {
    try {
      const result = await authService.signOut()
      if (!result.error) {
        setUser(null)
        setProfile(null)
        setEmailNotConfirmed(false)
      }
      return result
    } catch (error) {
      return { error: error as Error }
    }
  }

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) {
      return { profile: null, error: new Error('No user found') }
    }
    
    try {
      const result = await authService.updateUserProfile(user.id, profileData)
      if (result.profile) {
        setProfile(result.profile)
      }
      return result
    } catch (error) {
      return { profile: null, error: error as Error }
    }
  }

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    try {
      const result = await authService.signInWithEmailAndPassword(email, password)
      if (result.user) {
        setUser(result.user)
        setEmailNotConfirmed(false)
        
        // Fetch user profile with a small delay to ensure it exists
        setTimeout(async () => {
          try {
            const { profile: userProfile, error } = await authService.getUserProfile(result.user!.id)
            if (!error) {
              setProfile(userProfile)
            }
          } catch (err) {
          }
        }, 1500)
      }
      return result
    } catch (error) {
      return { user: null, error: error as Error }
    }
  }

  const updatePassword = async (password: string) => {
    try {
      const { error } = await authService.updatePassword(password)
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Show a loading state while initializing auth
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        emailNotConfirmed,
        signUpWithOtp,
        signInWithOtp,
        signInWithEmailAndPassword,
        verifyOtp,
        signOut,
        updateProfile,
        refreshUser,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}