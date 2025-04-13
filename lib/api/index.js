import core from './core';
import * as modules from './modules';

/**
 * Main API export
 * This file combines core functionality and table-specific modules
 */

// Re-export the core functions
export const API = {
  ...core,
};

// Re-export all modules
export const {
  Profiles,
  Exams,
  Subjects,
  PracticeQuestions,
  PracticeSessions,
  UserExams,
  UserProgress,
  UserAnswers,
  UserStudyConfig,
  Payments,
  Lessons,
  Notifications
} = modules;

// Export additional helper functions
export const auth = {
  /**
   * Get the current authenticated user
   * @returns {Promise<{user, error}>} - Current user or error
   */
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      console.error('Error getting current user:', error.message);
      return { user: null, error };
    }
  },

  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<{session, user, error}>} - Auth result
   */
  signIn: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      return { 
        session: data?.session || null, 
        user: data?.user || null, 
        error 
      };
    } catch (error) {
      console.error('Error during sign in:', error.message);
      return { session: null, user: null, error };
    }
  },

  /**
   * Sign up with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {Object} metadata - Additional user metadata
   * @returns {Promise<{session, user, error}>} - Auth result
   */
  signUp: async (email, password, metadata = {}) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      return { 
        session: data?.session || null, 
        user: data?.user || null, 
        error 
      };
    } catch (error) {
      console.error('Error during sign up:', error.message);
      return { session: null, user: null, error };
    }
  },

  /**
   * Sign out the current user
   * @returns {Promise<{error}>} - Sign out result
   */
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('Error during sign out:', error.message);
      return { error };
    }
  },

  /**
   * Reset password
   * @param {string} email - User email
   * @returns {Promise<{data, error}>} - Password reset result
   */
  resetPassword: async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
      return { data, error };
    } catch (error) {
      console.error('Error during password reset:', error.message);
      return { data: null, error };
    }
  }
};

// Default export for the entire API
export default {
  ...API,
  ...modules,
  auth
};