import { useEffect } from 'react';
import { createClient } from "@/libs/supabase/client";
import { useRouter } from 'next/navigation';
import { createExamSlug } from '@/libs/utils';

export const useQuizNavigation = (
  currentIndex,
  setCurrentIndex,
  questions,
  answers,
  sessionId,
  userData,
  examId,
  examName,
  seconds
) => {
  const router = useRouter();
  const supabase = createClient();

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        goToPrevious();
      }
      else if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
        goToNext();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, questions.length]);

  const goToNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleExit = async () => {
    // Update practice session status
    if (sessionId) {
      try {
        await supabase
          .from('s_practice_sessions')
          .update({
            end_time: new Date().toISOString(),
            status: 'completed',
            total_questions: questions.length,
            correct_answers: Object.entries(answers).filter(([questionId, choice]) => {
              const question = questions.find(q => q.id === parseInt(questionId));
              return question && choice === question.correct_answer;
            }).length,
            total_time_seconds: seconds,
            duration_seconds: seconds
          })
          .eq('id', sessionId);
      } catch (error) {
        console.error("Error updating session status:", error);
        // Attempt fallback update if status/duration fails
        try {
          await supabase
            .from('s_practice_sessions')
            .update({ 
              end_time: new Date().toISOString(),
              total_questions: questions.length,
              correct_answers: Object.entries(answers).filter(([questionId, choice]) => {
                const question = questions.find(q => q.id === parseInt(questionId));
                return question && choice === question.correct_answer;
              }).length
            })
            .eq('id', sessionId);
        } catch (fallbackError) {
          console.error("Error updating session end time:", fallbackError);
        }
      }
    }
    
    // Calculate and update overall exam progress
    if (userData && examId) {
      try {
        // Fetch all user answers for this exam across all sessions
        const { data: allAnswersData, error: answersError } = await supabase
          .from('s_user_answers')
          .select('question_id, is_correct')
          .eq('user_id', userData.id)
          .in('question_id', questions.map(q => q.id));
          
        if (answersError) throw answersError;
        
        // Calculate unique completed and correct questions
        const completedQuestions = new Set();
        const correctQuestions = new Set();
        
        allAnswersData.forEach(answer => {
          completedQuestions.add(answer.question_id);
          if (answer.is_correct) {
            correctQuestions.add(answer.question_id);
          }
        });
        
        const totalCompleted = completedQuestions.size;
        const totalCorrect = correctQuestions.size;
        
        // Upsert into s_user_progress
        await supabase
          .from('s_user_progress')
          .upsert({
            user_id: userData.id,
            exam_id: examId,
            questions_completed: totalCompleted,
            correct_answers: totalCorrect,
            last_updated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
          }, {
            onConflict: 'user_id, exam_id'
          });
      } catch (error) {
        console.error("Error calculating/updating overall user progress:", error);
      }
    }
    
    // Navigate back to the exam detail page
    if (examId && examName) {
      const examSlug = createExamSlug(examId, examName);
      router.push(`/dashboard/exams/${examSlug}`);
    } else {
      router.push('/dashboard/exams');
    }
  };

  return {
    goToNext,
    goToPrevious,
    handleExit
  };
}; 