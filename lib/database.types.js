/**
 * Database types for the Supabase project
 * This provides a basic type structure for common tables
 */

// Main data types
export const TableNames = {
    // User related
    PROFILES: 'profiles',
    
    // Exams related
    EXAMS: 's_exams',
    SUBJECTS: 's_subjects',
    LESSONS: 's_lessons',
  
    // Practice related
    PRACTICE_QUESTIONS: 's_practice_questions',
    PRACTICE_ANSWERS: 's_practice_answers',
    PRACTICE_SESSIONS: 's_practice_sessions',
    PRACTICE_SUBJECTS: 's_practice_subjects',
    
    // User activity
    USER_ANSWERS: 's_user_answers',
    USER_BOOKMARKS: 's_user_bookmarks',
    USER_EXAMS: 's_user_exams',
    USER_FEEDBACK: 's_user_feedback',
    USER_LESSON_PROGRESS: 's_user_lesson_progress',
    USER_PROGRESS: 's_user_progress',
    USER_QUESTION_FEEDBACK: 's_user_question_feedback',
    USER_SESSIONS: 's_user_sessions',
    USER_STUDY_CONFIG: 's_user_study_config',
    USER_SUBJECT_PROGRESS: 's_user_subject_progress',
    
    // Misc
    NOTIFICATIONS: 's_notifications',
    PAYMENTS: 's_payments',
    QUOTES: 's_quotes',
    STREAKS: 's_streaks',
    
    // Views
    USER_EXAMS_VIEW: 'user_exams_view'
  };
  
  // Table schemas for reference
  export const TableSchemas = {
    [TableNames.PROFILES]: {
      id: 'uuid',
      full_name: 'text',
      avatar_url: 'text',
      email: 'text',
      updated_at: 'timestamp with time zone',
      created_at: 'timestamp with time zone'
    },
    
    [TableNames.EXAMS]: {
      id: 'integer',
      name: 'character varying',
      description: 'text',
      created_at: 'timestamp with time zone',
      updated_at: 'timestamp with time zone',
      created_by: 'uuid',
      is_free: 'boolean',
      subscription_price: 'numeric',
      lifetime_price: 'numeric',
      stripe_product_id: 'character varying',
      stripe_subscription_price_id: 'character varying',
      stripe_lifetime_price_id: 'character varying',
      demo_available: 'boolean',
      demo_questions_count: 'integer'
    },
    
    // Other schemas can be added as needed
  };
  
  // These are just samples - you can expand these as needed for your application