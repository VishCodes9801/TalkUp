import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface Profile {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const [AuthContext, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const queryClient = useQueryClient();

  // Check initial session
  const sessionQuery = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
        return null;
      }
      return session;
    },
  });

  // Get user profile
  const profileQuery = useQuery({
    queryKey: ["profile", sessionQuery.data?.user?.id],
    queryFn: async () => {
      if (!sessionQuery.data?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionQuery.data.user.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating one...');
          const user = sessionQuery.data.user;
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Failed to create profile:', createError);
            return null;
          }
          
          return newProfile as Profile;
        }
        
        return null;
      }
      
      return data as Profile;
    },
    enabled: !!sessionQuery.data?.user?.id,
  });

  useEffect(() => {
    const session = sessionQuery.data;
    const profile = profileQuery.data;
    
    if (session?.user && profile) {
      const user: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        createdAt: profile.created_at,
      };
      
      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } else if (sessionQuery.data === null) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, [sessionQuery.data, profileQuery.data]);

  // Listen to auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, refreshing queries');
          queryClient.invalidateQueries({ queryKey: ['session'] });
          queryClient.invalidateQueries({ queryKey: ['profile'] });
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state');
          queryClient.clear();
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) {
        console.error("Sign in error:", error);
        
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link before signing in.');
        } else {
          throw new Error(error.message);
        }
      }
      
      if (!data.user) {
        throw new Error("Authentication failed. Please try again.");
      }
      
      console.log('Sign in successful for user:', data.user.id);
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<void> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      });
      
      if (error) {
        console.error("Sign up error:", error);
        
        // Provide user-friendly error messages
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long.');
        } else {
          throw new Error(error.message);
        }
      }
      
      if (!data.user) {
        throw new Error("Account creation failed. Please try again.");
      }
      
      console.log('Sign up successful for user:', data.user.id);
      
      // Create profile in the profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email: email.trim().toLowerCase(),
          name: name.trim(),
        });
      
      if (profileError) {
        console.error("Profile creation error:", profileError);
        // Don't throw here as the user account was created successfully
        // The profile will be created on next sign in if needed
        console.warn('Profile creation failed, but user account was created');
      }
      
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Sign out error:", error);
        throw new Error(error.message);
      }
      
      // The auth state will be updated via the onAuthStateChange listener
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const updateProfile = async (updates: { name?: string; email?: string }): Promise<void> => {
    try {
      if (!authState.user) {
        throw new Error("No user to update");
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', authState.user.id);
      
      if (error) {
        console.error("Update profile error:", error);
        throw new Error(error.message);
      }
      
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    updateProfile,
  };
});
