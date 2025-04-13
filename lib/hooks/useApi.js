import { useState } from 'react';
import api from '../api';

/**
 * Generic API hook for managing API requests
 * @returns {Object} API state and methods
 */
export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Execute an API request
   * @param {Function} apiMethod - API method to call
   * @param {Array} params - Parameters to pass to the API method
   * @returns {Promise<Object>} - API response
   */
  const execute = async (apiMethod, ...params) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiMethod(...params);
      
      if (response.error) {
        throw response.error;
      }
      
      setData(response.data);
      return { data: response.data, error: null };
    } catch (err) {
      console.error('API Error:', err.message);
      setError(err.message || 'An unexpected error occurred');
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset the API state
   */
  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return {
    api,
    loading,
    error,
    data,
    execute,
    reset
  };
}

/**
 * Create a custom hook for a specific API module
 * @param {Object} apiModule - API module to create hook for
 * @returns {Function} - Custom hook for the API module
 */
export function createApiHook(apiModule) {
  return function() {
    const { loading, error, data, execute, reset } = useApi();

    // Create wrapped methods for each method in the API module
    const methods = {};
    for (const [methodName, method] of Object.entries(apiModule)) {
      methods[methodName] = (...params) => execute(method, ...params);
    }

    return {
      loading,
      error,
      data,
      reset,
      ...methods
    };
  };
}

// Create hooks for common API modules
export const useProfiles = createApiHook(api.Profiles);
export const useExams = createApiHook(api.Exams);
export const useSubjects = createApiHook(api.Subjects);
export const usePracticeQuestions = createApiHook(api.PracticeQuestions);
export const usePracticeSessions = createApiHook(api.PracticeSessions);
export const useUserProgress = createApiHook(api.UserProgress);
export const useUserAnswers = createApiHook(api.UserAnswers);
export const useUserStudyConfig = createApiHook(api.UserStudyConfig);
export const usePayments = createApiHook(api.Payments);
export const useLessons = createApiHook(api.Lessons);
export const useNotifications = createApiHook(api.Notifications);

export default useApi;