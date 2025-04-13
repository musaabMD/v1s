import { useState, useEffect, createContext, useContext } from 'react';
import supabase from '../supabase-client';

// Create a context for authentication
const AuthContext = createContext(null);

/**
 * AuthProvider component to wrap your application
 * Provides authentication state and methods
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  
  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      try {
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        // Set the user if there's a session
        if (session?.user) {
          setUser(session.user);
          
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          setProfile(profileData || null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error.message);
        setAuthError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    // Call the initialization function
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          
          // Fetch user profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          setProfile(profileData || null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }
      }
    );
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Sign in with email and password
  const signIn = async (email, password) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      setAuthError(error.message);
      return { data: null, error };
    }
  };
  
  // Sign up with email and password
  const signUp = async (email, password, metadata = {}) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      
      // Create a profile for the new user
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            full_name: metadata.full_name || '',
            avatar_url: metadata.avatar_url || '',
          });
          
        if (profileError) throw profileError;
      }
      
      return { data, error: null };
    } catch (error) {
      setAuthError(error.message);
      return { data: null, error };
    }
  };
  
  // Sign out
  const signOut = async () => {
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      setAuthError(error.message);
      return { error };
    }
  };
  
  // Reset password
  const resetPassword = async (email) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      setAuthError(error.message);
      return { data: null, error };
    }
  };
  
  // Update profile
  const updateProfile = async (profileData) => {
    setAuthError(null);
    try {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id)
        .select();
      
      if (error) throw error;
      
      setProfile(data[0] || null);
      return { data: data[0], error: null };
    } catch (error) {
      setAuthError(error.message);
      return { data: null, error };
    }
  };
  
  // Auth context value
  const value = {
    user,
    profile,
    loading,
    authError,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default useAuth;