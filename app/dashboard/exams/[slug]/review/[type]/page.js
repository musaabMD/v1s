'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/libs/supabase/client';
import { getIdFromSlug } from '@/libs/utils';
import Header from '@/components/Header';
import Link from 'next/link';
import NoQuestionsAvailable from '@/components/NoQuestionsAvailable';

export default function ReviewPage() {
  const params = useParams();
  const examId = getIdFromSlug(params.slug);
  const reviewType = params.type;
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [examName, setExamName] = useState('');
  const [error, setError] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    fetchReviewQuestions();
  }, [examId, reviewType]);

  const fetchReviewQuestions = async () => {
    try {
      setLoading(true);
      
      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get exam name
      const { data: exam } = await supabase
        .from('s_exams')
        .select('name')
        .eq('id', examId)
        .single();
      
      if (exam) {
        setExamName(exam.name);
      }

      // Get questions based on review type
      let query = supabase
        .from('s_practice_answers')
        .select(`
          id,
          question_id,
          is_correct,
          is_flagged,
          s_practice_questions (
            id,
            question_text,
            explanation,
            subject_id,
            s_practice_subjects (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('exam_id', examId);

      switch (reviewType) {
        case 'correct':
          query = query.eq('is_correct', true);
          break;
        case 'incorrect':
          query = query.eq('is_correct', false);
          break;
        case 'flagged':
          query = query.eq('is_flagged', true);
          break;
        case 'unanswered':
          // For unanswered, we need a different approach
          const { data: answeredQuestions } = await supabase
            .from('s_practice_answers')
            .select('question_id')
            .eq('user_id', user.id)
            .eq('exam_id', examId);

          const answeredIds = answeredQuestions?.map(q => q.question_id) || [];

          const { data: unansweredQuestions } = await supabase
            .from('s_practice_questions')
            .select(`
              id,
              question_text,
              explanation,
              subject_id,
              s_practice_subjects (
                name
              )
            `)
            .eq('exam_id', examId)
            .not('id', 'in', `(${answeredIds.join(',')})`);

          setQuestions(unansweredQuestions || []);
          setLoading(false);
          return;
      }

      const { data: reviewQuestions, error: questionsError } = await query;
      
      if (questionsError) throw questionsError;
      
      setQuestions(reviewQuestions || []);
    } catch (error) {
      console.error('Error fetching review questions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Questions</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link
              href={`/dashboard/exams/${params.slug}`}
              className="text-primary hover:underline"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (!questions.length) {
    return (
      <>
        <Header />
        <NoQuestionsAvailable examName={examName} examSlug={params.slug} />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href={`/dashboard/exams/${params.slug}`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              {reviewType.charAt(0).toUpperCase() + reviewType.slice(1)} Questions
            </h1>
          </div>
        </div>

        <div className="grid gap-6">
          {questions.map((item, index) => {
            const question = reviewType === 'unanswered' ? item : item.s_practice_questions;
            return (
              <div key={question.id} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm text-gray-500">Question {index + 1}</span>
                  <span className="text-sm text-gray-500">{question.s_practice_subjects?.name}</span>
                </div>
                <p className="text-lg mb-4">{question.question_text}</p>
                {question.explanation && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <h4 className="font-semibold mb-2">Explanation:</h4>
                    <p>{question.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
} 