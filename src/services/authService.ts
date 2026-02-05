import { supabase } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'

// User profile type
export interface UserProfile {
  id: string
  name: string | null
  email: string | null
  phone?: string | null
  bio?: string | null
  avatar_url?: string | null
  created_at?: string
  updated_at?: string
}

// Store name temporarily during signup
let pendingName: string | null = null;

// Authentication service
export const authService = {
  // Set pending name for signup
  setPendingName(name: string) {
    pendingName = name;
  },

  // Get pending name
  getPendingName() {
    return pendingName;
  },

  // Clear pending name
  clearPendingName() {
    pendingName = null;
  },

  // Sign up a new user with OTP
  async signUpWithOtp(email: string): Promise<{ error: Error | null }> {
    try {
      // Use signInWithOtp with shouldCreateUser: true to create user and send OTP
      // This avoids the confirmation email and sends OTP directly
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            full_name: pendingName || '',
          }
        }
      });

      if (error) throw error;
      return { error: null }
    } catch (error: any) {
      return { error: error as Error }
    }
  },

  // Sign in existing user with OTP
  async signInWithOtp(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false // Don't create user if they don't exist
        }
      })

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error: error as Error }
    }
  },

  // Verify OTP token
  async verifyOtp(email: string, token: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      // Validate inputs before sending to Supabase
      if (!email || !token) {
        throw new Error('Email and OTP token are required')
      }
      
      if (token.length !== 6) {
        throw new Error('OTP token must be exactly 6 digits')
      }
      
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email'
      })

      if (error) throw error
      return { user: data.user, error: null }
    } catch (error: any) {
      console.error('OTP verification error:', error)
      return { user: null, error: error as Error }
    }
  },

  // Update user password
  async updatePassword(password: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      })

      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error: error as Error }
    }
  },

  // Sign in with email and password
  async signInWithEmailAndPassword(email: string, password: string): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error
      return { user: data.user, error: null }
    } catch (error: any) {
      return { user: null, error: error as Error }
    }
  },

  // Sign out the current user
  async signOut(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  },

  // Get the current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    } catch (error) {
      return null
    }
  },

  // Update user profile - robust version
  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      // Prepare update data
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };
      
      // Add fields if they exist
      if (profile.name !== undefined) updateData.name = profile.name;
      if (profile.email !== undefined) updateData.email = profile.email;
      if (profile.phone !== undefined) updateData.phone = profile.phone;
      if (profile.bio !== undefined) updateData.bio = profile.bio;
      if (profile.avatar_url !== undefined) updateData.avatar_url = profile.avatar_url;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
        .select()

      if (error) {
        throw error;
      }
      
      return { profile: data?.[0] || null, error: null }
    } catch (error) {
      return { profile: null, error: error as Error }
    }
  },

  // Get user profile
  async getUserProfile(userId: string): Promise<{ profile: UserProfile | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        // If profile doesn't exist, return null without error
        if (error.code === 'PGRST116') { // No rows returned
          return { profile: null, error: null }
        }
        throw error
      }
      
      return { profile: data, error: null }
    } catch (error) {
      return { profile: null, error: error as Error }
    }
  },

  // Delete user account and all associated data
  async deleteAccount(userId: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Delete user account - this will cascade delete all related data due to foreign key constraints
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Account deletion error:', error);
      return { success: false, error: error as Error };
    }
  },

  // Listen for auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  },
  
  // Refresh user session to get latest email confirmation status
  async refreshUser(): Promise<{ user: User | null; error: Error | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return { user, error: null }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  }
}