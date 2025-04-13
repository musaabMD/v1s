"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/libs/supabase/client";
import QuizView from "@/components/quiz/QuizView";
import NoQuestionsAvailable from "@/components/NoQuestionsAvailable";
import { createExamSlug } from "@/libs/utils";

export default function PracticePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subjectId = searchParams.get('subject');
  
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const supabase = createClient();

  useEffect(() => {
    if (!subjectId) {
      router.push('/dashboard');
      return;
    }

    const loadData = async () => {
      await checkAuth();
      await fetchData();
    };

    loadData();
  }, [subjectId]);

  const checkAuth = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error || !data.user) {
        router.push('/signin');
        return;
      }
      
      // Get user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        // If profile doesn't exist, create it
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User'
            }])
            .select('id, full_name, email')
            .single();
            
          if (!createError && newProfile) {
            setUserData({
              id: data.user.id,
              email: data.user.email,
              name: newProfile.full_name
            });
            return;
          }
        }
        console.error("Profile error:", profileError);
      }
        
      setUserData({
        id: data.user.id,
        email: data.user.email,
        name: profileData?.full_name || data.user.email?.split('@')[0] || 'User'
      });
    } catch (error) {
      console.error("Authentication error:", error);
      router.push('/signin');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Get subject details
      const { data: subjectData, error: subjectError } = await supabase
        .from('s_practice_subjects')
        .select(`
          id,
          name,
          s_exams(id, name),
          s_user_subject_progress!inner(
            completed_questions,
            correct_answers
          )
        `)
        .eq('id', subjectId)
        .single();

      if (subjectError) throw subjectError;
      setSubject(subjectData);
      setExam(subjectData.s_exams);

      // Get questions and answers separately
      const { data: questionsData, error: questionsError } = await supabase
        .from('s_practice_questions')
        .select('*')
        .eq('subject_id', subjectId);

      if (questionsError) throw questionsError;

      // Get all answers for these questions
      const { data: answersData, error: answersError } = await supabase
        .from('s_practice_answers')
        .select('*')
        .in('question_id', questionsData.map(q => q.id));

      if (answersError) throw answersError;

      // Format questions with their answers
      const formattedQuestions = questionsData.map(question => {
        const questionAnswers = answersData.filter(a => a.question_id === question.id);
        const correctAnswer = questionAnswers.find(a => a.is_correct);
        const correctIndex = correctAnswer ? questionAnswers.indexOf(correctAnswer) : 0;

        return {
          id: question.id,
          question_text: question.question_text,
          rationale: question.explanation || question.rationale,
          correct_choice: String.fromCharCode(97 + correctIndex), // 'a', 'b', 'c', etc.
          ...questionAnswers.reduce((acc, answer, index) => {
            acc[`option_${String.fromCharCode(97 + index)}`] = answer.answer_text;
            return acc;
          }, {})
        };
      });
      
      setQuestions(formattedQuestions);
    } catch (error) {
      console.error("Error fetching practice data:", error);
      setError("Failed to load practice data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F8F9FC]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-solid border-[#2463EB] border-r-transparent"></div>
      </div>
    );
  }

  if (error || !subject) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] p-6">
        <div className="max-w-md mx-auto bg-white border-2 border-[#E5E7EF] rounded-xl p-8 shadow-sm">
          <h1 className="text-2xl font-bold mb-4">Subject not found</h1>
          <p className="mb-6 text-gray-600">The subject you're looking for doesn't exist or has been removed.</p>
          <button 
            onClick={() => router.push('/dashboard/exams')}
            className="w-full bg-[#2463EB] border border-[#3A6FF1] text-white rounded-md py-2 px-4 font-medium hover:bg-[#1d4ed8] transition-colors"
          >
            Back to Exams
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    const examSlug = exam ? createExamSlug(exam.id, exam.name) : null;
    
    return (
      <div className="min-h-screen bg-[#F8F9FC]">
        <NoQuestionsAvailable 
          examName={exam?.name}
          examSlug={examSlug}
        />
      </div>
    );
  }

  // Pass all required data to the QuizView component
  return (
    <QuizView 
      questions={questions} 
      examName={exam.name}
      subjectName={subject.name}
      subjectId={subjectId}
      examId={exam.id}
      userData={userData}
    />
  );
} 