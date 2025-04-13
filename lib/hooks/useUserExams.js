// // v1/lib/hooks/useUserExams.js
// 'use client'

// import { useState, useEffect } from 'react'
// import { createClient } from '@/libs/supabase/client'

// export function useUserExams() {
//   const [demos, setDemos] = useState([])
//   const [subscriptions, setSubscriptions] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const supabase = createClient()

//   useEffect(() => {
//     const fetchUserExams = async () => {
//       try {
//         setIsLoading(true)
//         const { data: { user } } = await supabase.auth.getUser()

//         if (!user) {
//           setDemos([])
//           setSubscriptions([])
//           return
//         }

//         // Get user's demo exams
//         const { data: demoExams, error: demoError } = await supabase
//           .from('s_user_exams')
//           .select(`
//             *,
//             s_exams (
//               *,
//               subscription_price,
//               lifetime_price
//             )
//           `)
//           .eq('user_id', user.id)
//           .eq('is_demo', true)
//           .eq('access_type', 'demo')
//           .order('added_at', { ascending: false })

//         if (demoError) throw demoError

//         // Get user's subscribed and lifetime access exams
//         const { data: subscribedExams, error: subError } = await supabase
//           .from('s_user_exams')
//           .select(`
//             *,
//             s_exams (
//               *,
//               subscription_price,
//               lifetime_price
//             )
//           `)
//           .eq('user_id', user.id)
//           .eq('is_paid', true)
//           .in('access_type', ['subscription', 'lifetime'])
//           .order('subscription_start', { ascending: false })

//         if (subError) throw subError

//         // Fetch subjects for all exams
//         const examIds = [...(demoExams || []), ...(subscribedExams || [])].map(exam => exam.exam_id);
        
//         const { data: subjects, error: subjectsError } = await supabase
//           .from('s_practice_subjects')
//           .select('*')
//           .in('exam_id', examIds);
          
//         if (subjectsError) throw subjectsError;
        
//         // Create a map of exam_id -> subjects
//         const subjectsByExam = subjects.reduce((acc, subject) => {
//           if (!acc[subject.exam_id]) {
//             acc[subject.exam_id] = [];
//           }
//           acc[subject.exam_id].push(subject);
//           return acc;
//         }, {});

//         // Count questions for demo exams
//         const demosWithCounts = await Promise.all(
//           (demoExams || []).map(async (demo) => {
//             const examSubjects = subjectsByExam[demo.exam_id] || [];
//             const subjectIds = examSubjects.map(subject => subject.id);
            
//             let count = 0;
//             if (subjectIds.length > 0) {
//               const { count: questionCount, error: countError } = await supabase
//                 .from('s_practice_questions')
//                 .select('id', { count: 'exact', head: true })
//                 .in('subject_id', subjectIds);
                
//               if (!countError) {
//                 count = questionCount || 0;
//               }
//             }

//             // Get user progress for this exam
//             const { data: progress } = await supabase
//               .from('s_user_progress')
//               .select('*')
//               .eq('user_id', user.id)
//               .eq('exam_id', demo.exam_id)
//               .single();

//             return {
//               ...demo,
//               s_exams: {
//                 ...demo.s_exams,
//                 questions_count: count,
//                 subjects: examSubjects,
//                 user_progress: progress || {
//                   questions_completed: 0,
//                   correct_answers: 0
//                 }
//               }
//             }
//           })
//         )

//         // Count questions for subscribed exams
//         const subsWithCounts = await Promise.all(
//           (subscribedExams || []).map(async (sub) => {
//             const examSubjects = subjectsByExam[sub.exam_id] || [];
//             const subjectIds = examSubjects.map(subject => subject.id);
            
//             let count = 0;
//             if (subjectIds.length > 0) {
//               const { count: questionCount, error: countError } = await supabase
//                 .from('s_practice_questions')
//                 .select('id', { count: 'exact', head: true })
//                 .in('subject_id', subjectIds);
                
//               if (!countError) {
//                 count = questionCount || 0;
//               }
//             }

//             // Get user progress for this exam
//             const { data: progress } = await supabase
//               .from('s_user_progress')
//               .select('*')
//               .eq('user_id', user.id)
//               .eq('exam_id', sub.exam_id)
//               .single();

//             // Calculate days left for subscriptions
//             const daysLeft = sub.access_type === 'subscription' && sub.subscription_end ? 
//               Math.ceil((new Date(sub.subscription_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) :
//               null

//             return {
//               ...sub,
//               s_exams: {
//                 ...sub.s_exams,
//                 questions_count: count,
//                 subjects: examSubjects,
//                 user_progress: progress || {
//                   questions_completed: 0,
//                   correct_answers: 0
//                 }
//               },
//               daysLeft
//             }
//           })
//         )

//         setDemos(demosWithCounts)
//         setSubscriptions(subsWithCounts)
//       } catch (error) {
//         console.error('Error fetching user exams:', error)
//         setError(error.message)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchUserExams()
//   }, [supabase])

//   return { demos, subscriptions, isLoading, error }
// }
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { UserExams } from '../api';

/**
 * Hook to fetch and manage user exams
 * @returns {Object} User exams data and methods
 */
export function useUserExams() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch user exams
  const fetchUserExams = async () => {
    if (!user) {
      setExams([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch user exams with exam details from the view
      const { data, error: fetchError } = await UserExams.getUserExamsWithDetails(user.id);
      
      if (fetchError) throw fetchError;
      
      setExams(data || []);
    } catch (err) {
      console.error('Error fetching user exams:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch exams on user change or initial load
  useEffect(() => {
    fetchUserExams();
  }, [user]);
  
  // Add a user exam
  const addUserExam = async (examId, accessType = 'demo') => {
    if (!user) return { success: false, error: new Error('User not authenticated') };
    
    try {
      // Check if exam already exists for user
      const existingExam = exams.find(exam => 
        exam.exam_id.toString() === examId.toString()
      );
      
      if (existingExam) {
        // If it exists but is not active, reactivate it
        if (!existingExam.is_active) {
          const { data, error: updateError } = await UserExams.update(existingExam.id, {
            is_active: true,
            access_type: accessType,
            is_current: true
          });
          
          if (updateError) throw updateError;
          
          // Refresh the exams list
          await fetchUserExams();
          return { success: true, data };
        }
        
        return { success: true, data: existingExam };
      }
      
      // Create new user exam
      const newUserExam = {
        user_id: user.id,
        exam_id: examId,
        is_current: true,
        is_demo: accessType === 'demo',
        access_type: accessType,
        is_active: true
      };
      
      const { data, error: createError } = await UserExams.create(newUserExam);
      
      if (createError) throw createError;
      
      // Refresh the exams list
      await fetchUserExams();
      return { success: true, data };
    } catch (err) {
      console.error('Error adding user exam:', err.message);
      return { success: false, error: err };
    }
  };
  
  // Remove a user exam
  const removeUserExam = async (userExamId) => {
    if (!user) return { success: false, error: new Error('User not authenticated') };
    
    try {
      // Soft delete by setting is_active to false
      const { data, error: updateError } = await UserExams.update(userExamId, {
        is_active: false,
        is_current: false
      });
      
      if (updateError) throw updateError;
      
      // Refresh the exams list
      await fetchUserExams();
      return { success: true, data };
    } catch (err) {
      console.error('Error removing user exam:', err.message);
      return { success: false, error: err };
    }
  };
  
  // Set current exam
  const setCurrentExam = async (userExamId) => {
    if (!user) return { success: false, error: new Error('User not authenticated') };
    
    try {
      // First, unset current flag for all exams
      for (const exam of exams) {
        if (exam.is_current) {
          await UserExams.update(exam.id, { is_current: false });
        }
      }
      
      // Then set current flag for selected exam
      const { data, error: updateError } = await UserExams.update(userExamId, {
        is_current: true
      });
      
      if (updateError) throw updateError;
      
      // Refresh the exams list
      await fetchUserExams();
      return { success: true, data };
    } catch (err) {
      console.error('Error setting current exam:', err.message);
      return { success: false, error: err };
    }
  };
  
  // Get current exam
  const getCurrentExam = () => {
    return exams.find(exam => exam.is_current) || null;
  };
  
  // Check if user has access to a specific exam
  const hasAccessToExam = (examId) => {
    return exams.some(exam => 
      exam.exam_id.toString() === examId.toString() && 
      exam.is_active && 
      (exam.is_paid || exam.is_free || 
        (exam.is_demo && exam.access_type === 'demo'))
    );
  };
  
  return {
    exams,
    loading,
    error,
    fetchUserExams,
    addUserExam,
    removeUserExam,
    setCurrentExam,
    getCurrentExam,
    hasAccessToExam
  };
}

export default useUserExams;