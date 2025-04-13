import core from './core';
import { TableNames } from '../database.types';

/**
 * API modules for specific tables
 * Each module provides CRUD operations specific to a table
 */

// Profile related operations
export const Profiles = {
  getAll: (options) => core.getAll(TableNames.PROFILES, options),
  getById: (id, options) => core.getById(TableNames.PROFILES, id, options),
  getByUserId: async (userId, options = {}) => {
    return core.getById(TableNames.PROFILES, userId, options);
  },
  create: (data) => core.create(TableNames.PROFILES, data),
  update: (id, data) => core.update(TableNames.PROFILES, id, data),
  remove: (id) => core.remove(TableNames.PROFILES, id),
  query: () => core.query(TableNames.PROFILES)
};

// Exam related operations
export const Exams = {
  getAll: (options) => core.getAll(TableNames.EXAMS, options),
  getById: (id, options) => core.getById(TableNames.EXAMS, id, options),
  getExamWithSubjects: async (examId) => {
    return core.getById(TableNames.EXAMS, examId, {
      foreignTable: TableNames.SUBJECTS,
      foreignSelect: 'id, name, category, description, total_questions'
    });
  },
  create: (data) => core.create(TableNames.EXAMS, data),
  update: (id, data) => core.update(TableNames.EXAMS, id, data),
  remove: (id) => core.remove(TableNames.EXAMS, id),
  query: () => core.query(TableNames.EXAMS)
};

// Subject related operations
export const Subjects = {
  getAll: (options) => core.getAll(TableNames.SUBJECTS, options),
  getById: (id, options) => core.getById(TableNames.SUBJECTS, id, options),
  getByExamId: async (examId, options = {}) => {
    const queryOptions = {
      ...options,
      filters: [...(options.filters || []), { column: 'exam_id', operator: 'eq', value: examId }]
    };
    return core.getAll(TableNames.SUBJECTS, queryOptions);
  },
  create: (data) => core.create(TableNames.SUBJECTS, data),
  update: (id, data) => core.update(TableNames.SUBJECTS, id, data),
  remove: (id) => core.remove(TableNames.SUBJECTS, id),
  query: () => core.query(TableNames.SUBJECTS)
};

// Practice Questions operations
export const PracticeQuestions = {
  getAll: (options) => core.getAll(TableNames.PRACTICE_QUESTIONS, options),
  getById: (id, options) => core.getById(TableNames.PRACTICE_QUESTIONS, id, options),
  getBySubjectId: async (subjectId, options = {}) => {
    const queryOptions = {
      ...options,
      filters: [...(options.filters || []), { column: 'subject_id', operator: 'eq', value: subjectId }]
    };
    return core.getAll(TableNames.PRACTICE_QUESTIONS, queryOptions);
  },
  create: (data) => core.create(TableNames.PRACTICE_QUESTIONS, data),
  update: (id, data) => core.update(TableNames.PRACTICE_QUESTIONS, id, data),
  remove: (id) => core.remove(TableNames.PRACTICE_QUESTIONS, id),
  query: () => core.query(TableNames.PRACTICE_QUESTIONS)
};

// Practice Sessions operations
export const PracticeSessions = {
  getAll: (options) => core.getAll(TableNames.PRACTICE_SESSIONS, options),
  getById: (id, options) => core.getById(TableNames.PRACTICE_SESSIONS, id, options),
  getByUserId: async (userId, options = {}) => {
    const queryOptions = {
      ...options,
      filters: [...(options.filters || []), { column: 'user_id', operator: 'eq', value: userId }],
      order: options.order || { column: 'created_at', ascending: false }
    };
    return core.getAll(TableNames.PRACTICE_SESSIONS, queryOptions);
  },
  create: (data) => core.create(TableNames.PRACTICE_SESSIONS, data),
  update: (id, data) => core.update(TableNames.PRACTICE_SESSIONS, id, data),
  remove: (id) => core.remove(TableNames.PRACTICE_SESSIONS, id),
  query: () => core.query(TableNames.PRACTICE_SESSIONS)
};

// User Exams operations
export const UserExams = {
  getAll: (options) => core.getAll(TableNames.USER_EXAMS, options),
  getById: (id, options) => core.getById(TableNames.USER_EXAMS, id, options),
  getByUserId: async (userId, options = {}) => {
    const queryOptions = {
      ...options,
      filters: [...(options.filters || []), { column: 'user_id', operator: 'eq', value: userId }]
    };
    return core.getAll(TableNames.USER_EXAMS, queryOptions);
  },
  getUserExamsWithDetails: async (userId) => {
    return core.getAll(TableNames.USER_EXAMS_VIEW, {
      filters: [{ column: 'user_id', operator: 'eq', value: userId }],
      order: { column: 'added_at', ascending: false }
    });
  },
  create: (data) => core.create(TableNames.USER_EXAMS, data),
  update: (id, data) => core.update(TableNames.USER_EXAMS, id, data),
  remove: (id) => core.remove(TableNames.USER_EXAMS, id),
  query: () => core.query(TableNames.USER_EXAMS)
};

// User Progress operations
export const UserProgress = {
  getAll: (options) => core.getAll(TableNames.USER_PROGRESS, options),
  getById: (id, options) => core.getById(TableNames.USER_PROGRESS, id, options),
  getByUserAndExam: async (userId, examId, options = {}) => {
    const queryOptions = {
      ...options,
      filters: [
        { column: 'user_id', operator: 'eq', value: userId },
        { column: 'exam_id', operator: 'eq', value: examId }
      ]
    };
    return core.getAll(TableNames.USER_PROGRESS, queryOptions);
  },
  create: (data) => core.create(TableNames.USER_PROGRESS, data),
  update: (id, data) => core.update(TableNames.USER_PROGRESS, id, data),
  remove: (id) => core.remove(TableNames.USER_PROGRESS, id),
  query: () => core.query(TableNames.USER_PROGRESS)
};

// User Answers operations
export const UserAnswers = {
  getAll: (options) => core.getAll(TableNames.USER_ANSWERS, options),
  getById: (id, options) => core.getById(TableNames.USER_ANSWERS, id, options),
  getBySessionId: async (sessionId, options = {}) => {
    const queryOptions = {
      ...options,
      filters: [...(options.filters || []), { column: 'session_id', operator: 'eq', value: sessionId }],
      order: options.order || { column: 'created_at', ascending: true }
    };
    return core.getAll(TableNames.USER_ANSWERS, queryOptions);
  },
  create: (data) => core.create(TableNames.USER_ANSWERS, data),
  update: (id, data) => core.update(TableNames.USER_ANSWERS, id, data),
  remove: (id) => core.remove(TableNames.USER_ANSWERS, id),
  query: () => core.query(TableNames.USER_ANSWERS)
};

// User Study Config operations
export const UserStudyConfig = {
  getAll: (options) => core.getAll(TableNames.USER_STUDY_CONFIG, options),
  getById: (id, options) => core.getById(TableNames.USER_STUDY_CONFIG, id, options),
  getByUserId: async (userId, options = {}) => {
    const queryOptions = {
      ...options,
      filters: [...(options.filters || []), { column: 'user_id', operator: 'eq', value: userId }]
    };
    const { data, error } = await core.getAll(TableNames.USER_STUDY_CONFIG, queryOptions);
    
    // Return the first config or create a default one if none exists
    if (data && data.length > 0) {
      return { data: data[0], error };
    }
    
    // Create default config if none exists
    const defaultConfig = {
      user_id: userId,
      show_answers: true,
      show_timer: true,
      question_count: 15,
      include_new: true,
      include_answered: true,
      include_flagged: true,
      include_incorrect: true
    };
    
    return core.create(TableNames.USER_STUDY_CONFIG, defaultConfig);
  },
  create: (data) => core.create(TableNames.USER_STUDY_CONFIG, data),
  update: (id, data) => core.update(TableNames.USER_STUDY_CONFIG, id, data),
  remove: (id) => core.remove(TableNames.USER_STUDY_CONFIG, id),
  query: () => core.query(TableNames.USER_STUDY_CONFIG)
};

// Payments operations
export const Payments = {
  getAll: (options) => core.getAll(TableNames.PAYMENTS, options),
  getById: (id, options) => core.getById(TableNames.PAYMENTS, id, options),
  getByUserId: async (userId, options = {}) => {
    const queryOptions = {
      ...options,
      filters: [...(options.filters || []), { column: 'user_id', operator: 'eq', value: userId }],
      order: options.order || { column: 'created_at', ascending: false }
    };
    return core.getAll(TableNames.PAYMENTS, queryOptions);
  },
  create: (data) => core.create(TableNames.PAYMENTS, data),
  update: (id, data) => core.update(TableNames.PAYMENTS, id, data),
  remove: (id) => core.remove(TableNames.PAYMENTS, id),
  query: () => core.query(TableNames.PAYMENTS)
};

// Lessons operations
export const Lessons = {
  getAll: (options) => core.getAll(TableNames.LESSONS, options),
  getById: (id, options) => core.getById(TableNames.LESSONS, id, options),
  getByExamId: async (examId, options = {}) => {
    const queryOptions = {
      ...options,
      filters: [...(options.filters || []), { column: 'exam_id', operator: 'eq', value: examId }],
      order: options.order || { column: 'order_index', ascending: true }
    };
    return core.getAll(TableNames.LESSONS, queryOptions);
  },
  create: (data) => core.create(TableNames.LESSONS, data),
  update: (id, data) => core.update(TableNames.LESSONS, id, data),
  remove: (id) => core.remove(TableNames.LESSONS, id),
  query: () => core.query(TableNames.LESSONS)
};

// Notifications operations
export const Notifications = {
  getAll: (options) => core.getAll(TableNames.NOTIFICATIONS, options),
  getById: (id, options) => core.getById(TableNames.NOTIFICATIONS, id, options),
  getByUserId: async (userId, options = {}) => {
    const queryOptions = {
      ...options,
      filters: [...(options.filters || []), { column: 'user_id', operator: 'eq', value: userId }],
      order: options.order || { column: 'created_at', ascending: false }
    };
    return core.getAll(TableNames.NOTIFICATIONS, queryOptions);
  },
  create: (data) => core.create(TableNames.NOTIFICATIONS, data),
  update: (id, data) => core.update(TableNames.NOTIFICATIONS, id, data),
  markAsRead: async (id) => {
    return core.update(TableNames.NOTIFICATIONS, id, { 
      is_read: true, 
      read_at: new Date().toISOString() 
    });
  },
  remove: (id) => core.remove(TableNames.NOTIFICATIONS, id),
  query: () => core.query(TableNames.NOTIFICATIONS)
};

// Include additional modules for the remaining tables as needed

export default {
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
};