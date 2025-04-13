import React, { useEffect, useState } from 'react';
import { createClient } from "@/libs/supabase/client";
import { CheckCircle2, XCircle, Trophy, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { createExamSlug } from '@/libs/utils';

const ScoreForPractice = ({ 
  sessionId, 
  examId,
  examName,
  totalQuestions,
  answers,
  questions,
  totalTime
}) => {
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    calculateAndSaveScore();
  }, []);

  const calculateAndSaveScore = async () => {
    try {
      setLoading(true);
      
      // Calculate score
      const correctAnswers = Object.entries(answers).filter(([questionId, choice]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        return question && choice === question.correct_answer;
      }).length;

      const scorePercentage = (correctAnswers / totalQuestions) * 100;
      
      // Update practice session
      const { error: sessionError } = await supabase
        .from('s_practice_sessions')
        .update({
          end_time: new Date().toISOString(),
          status: 'completed',
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          total_time_seconds: totalTime,
          duration_seconds: totalTime,
          score: scorePercentage
        })
        .eq('id', sessionId);

      if (sessionError) throw sessionError;

      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Save individual question answers
      const answerPromises = Object.entries(answers).map(async ([questionId, choice]) => {
        const question = questions.find(q => q.id === parseInt(questionId));
        const isCorrect = question && choice === question.correct_answer;
        
        return supabase
          .from('s_user_answers')
          .upsert({
            user_id: user.id,
            question_id: parseInt(questionId),
            exam_id: examId,
            selected_answer: choice,
            is_correct: isCorrect,
            answered_at: new Date().toISOString()
          }, {
            onConflict: 'user_id, question_id'
          });
      });

      await Promise.all(answerPromises);

      // Update user progress
      const { error: progressError } = await supabase
        .from('s_user_progress')
        .upsert({
          user_id: user.id,
          exam_id: examId,
          questions_completed: totalQuestions,
          correct_answers: correctAnswers,
          last_updated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          score: scorePercentage
        }, {
          onConflict: 'user_id, exam_id'
        });

      if (progressError) throw progressError;

      setScore({
        correct: correctAnswers,
        total: totalQuestions,
        percentage: scorePercentage,
        time: totalTime
      });

    } catch (error) {
      console.error('Error saving score:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!score) return null;

  const examSlug = createExamSlug(examId, examName);
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m ${secs}s`;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Practice Complete!</h2>
        <p className="text-gray-600">Here's how you performed in this session</p>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">{score.percentage.toFixed(1)}%</div>
          <div className="text-sm text-blue-700">Overall Score</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-green-600 mb-1">{score.correct}/{score.total}</div>
          <div className="text-sm text-green-700">Questions Correct</div>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-500" />
            <span className="text-gray-700">Time Taken</span>
          </div>
          <span className="font-medium text-gray-900">{formatTime(score.time)}</span>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span className="text-gray-700">Correct Answers</span>
          </div>
          <span className="font-medium text-green-600">{score.correct}</span>
        </div>
        
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-gray-700">Incorrect Answers</span>
          </div>
          <span className="font-medium text-red-600">{score.total - score.correct}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <Link
          href={`/dashboard/exams/${examSlug}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Return to Exam
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
};

export default ScoreForPractice; 