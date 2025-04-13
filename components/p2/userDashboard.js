'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/libs/supabase/client';
import Header from '@/components/Header';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getIdFromSlug } from '@/libs/utils';
import { CheckCircle2, ListChecks, XCircle, Flag } from 'lucide-react';

export default function UserDashboard() {
  const params = useParams();
  const examId = getIdFromSlug(params.slug);
  const [examName, setExamName] = useState('');
  const [subjectPerformance, setSubjectPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    correct: 0,
    incorrect: 0,
    flagged: 0,
    contentCovered: 0
  });
  const supabase = createClient();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Get user profile
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Get exam details
        const { data: examData, error: examError } = await supabase
          .from('s_exams')
          .select('*')
          .eq('id', examId)
          .single();
        if (examError) throw examError;
        setExamName(examData.name);

        // Get user stats
        const { data: answersData, error: answersError } = await supabase
          .from('s_practice_answers')
          .select('is_correct, is_flagged')
          .eq('user_id', user.id)
          .eq('exam_id', examId);
        if (answersError) throw answersError;

        // Calculate stats
        const correct = answersData.filter(a => a.is_correct).length;
        const incorrect = answersData.filter(a => !a.is_correct).length;
        const flagged = answersData.filter(a => a.is_flagged).length;
        const total = answersData.length;

        setStats({
          correct,
          incorrect,
          flagged,
          total
        });

        // Get subjects for this exam
        const { data: subjectsData, error: subjectsError } = await supabase
          .from('s_practice_subjects')
          .select('*')
          .eq('exam_id', examId);
        if (subjectsError) throw subjectsError;

        // Get performance for each subject
        const subjectPerformanceData = await Promise.all(
          subjectsData.map(async (subject) => {
            const { data: subjectAnswers, error: subjectError } = await supabase
              .from('s_practice_answers')
              .select('is_correct')
              .eq('user_id', user.id)
              .eq('exam_id', examId)
              .eq('subject_id', subject.id);
            
            if (subjectError) throw subjectError;

            const totalAnswered = subjectAnswers.length;
            const correctAnswers = subjectAnswers.filter(a => a.is_correct).length;
            const score = totalAnswered > 0 ? (correctAnswers / totalAnswered) * 100 : 0;

            return {
              ...subject,
              score,
              totalAnswered,
              correctAnswers
            };
          })
        );

        setSubjectPerformance(subjectPerformanceData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    if (examId) {
      fetchDashboardData();
    }
  }, [examId, supabase]);

  function getScoreColor(score) {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  }

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
        <div className="flex-1 container mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{examName || 'Exam Dashboard'}</h1>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 mx-auto text-gray-400">
                <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-6">We couldn't load your exam dashboard data. This could be because you haven't started practicing yet, or there might be a temporary issue.</p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
              
              <Link 
                href="/dashboard"
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Return to dashboard
              </Link>
            </div>
            
            {process.env.NODE_ENV !== 'production' && (
              <div className="mt-6 p-4 bg-red-50 rounded-md">
                <p className="text-red-500 text-sm font-mono">{error.toString()}</p>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              {examName || 'Your Exam Dashboard'}
            </h1>
          </div>
        </div>

        {/* Review Questions Section */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Review Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Link href={`/dashboard/exams/${params.slug}/review/correct`} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{stats.correct}</h3>
                    <p className="text-gray-600">Correct</p>
                  </div>
                </div>
              </Link>

              <Link href={`/dashboard/exams/${params.slug}/review/incorrect`} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{stats.incorrect}</h3>
                    <p className="text-gray-600">Incorrect</p>
                  </div>
                </div>
              </Link>

              <Link href={`/dashboard/exams/${params.slug}/review/flagged`} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Flag className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{stats.flagged}</h3>
                    <p className="text-gray-600">Flagged</p>
                  </div>
                </div>
              </Link>

              <Link href={`/dashboard/exams/${params.slug}/review/unanswered`} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <ListChecks className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{stats.total > 0 ? 150 - stats.total : 150}</h3>
                    <p className="text-gray-600">Unanswered</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Subject Performance</h2>
            {subjectPerformance.length > 0 ? (
              <div className="space-y-4">
                {subjectPerformance.map((subject) => (
                  <Link 
                    key={subject.id} 
                    href={`/dashboard/practice?subject=${subject.id}`}
                    className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium text-gray-900">{subject.name}</h3>
                      <span className="text-sm font-medium text-gray-600">
                        {subject.correctAnswers}/{subject.totalAnswered} ({subject.score.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full ${getScoreColor(subject.score)}`} style={{ width: `${subject.score}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No subject performance data available yet. Click on any subject to start practicing!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}