import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useUserExams } from './useUserExams';

// Create an Application context
const AppContext = createContext(null);

/**
 * AppProvider component to wrap your application
 * Combines multiple contexts and application state
 */
export function AppProvider({ children }) {
  const auth = useAuth();
  const userExams = useUserExams();
  const [appLoading, setAppLoading] = useState(true);
  const [globalError, setGlobalError] = useState(null);
  
  // Initialize application state
  useEffect(() => {
    const initializeApp = async () => {
      setAppLoading(true);
      setGlobalError(null);

      try {
        // Add any additional initialization here
        // For example, fetching app settings, etc.
      } catch (error) {
        console.error('Error initializing app:', error.message);
        setGlobalError(error.message);
      } finally {
        setAppLoading(false);
      }
    };

    // Only initialize the app when auth loading is complete
    if (!auth.loading) {
      initializeApp();
    }
  }, [auth.loading]);

  // Global error handler
  const handleError = (error) => {
    console.error('Application error:', error);
    setGlobalError(error.message || 'An unexpected error occurred');
  };

  // Clear global error
  const clearError = () => {
    setGlobalError(null);
  };

  // App context value
  const value = {
    // Auth
    ...auth,
    
    // User Exams
    ...userExams,
    
    // App state
    appLoading,
    globalError,
    
    // App methods
    handleError,
    clearError,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * Custom hook to use app context
 * @returns {Object} App context value
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default useApp;