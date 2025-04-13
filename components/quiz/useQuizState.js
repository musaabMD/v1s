import { useState, useEffect } from 'react';
import { createClient } from "@/libs/supabase/client";

export const useQuizState = (userData, examId, subjectId) => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [bookmarks, setBookmarks] = useState({});
  const [showExplanation, setShowExplanation] = useState({});
  const [isQuizMode, setIsQuizMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [examName, setExamName] = useState('');
  const [subjectName, setSubjectName] = useState('');

  const supabase = createClient();

  // Get current question safely
  const currentQuestion = questions.length > 0 && currentIndex < questions.length 
    ? questions[currentIndex] 
    : null;

  // Load data on component mount
  useEffect(() => {
    if (!userData) return;
    
    const loadInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadExamInfo(),
          loadSubjectInfo(),
          loadQuestions(),
          loadUserBookmarks(),
          loadUserAnswers(),
          createPracticeSession()
        ]);
      } catch (error) {
        console.error("Error loading initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [userData, examId, subjectId]);

  // Load exam info
  const loadExamInfo = async () => {
    if (!examId) return;
    
    try {
      const { data, error } = await supabase
        .from('s_exams')
        .select('name, description')
        .eq('id', examId)
        .single();
        
      if (error) throw error;
      if (data) {
        setExamName(data.name);
      }
    } catch (error) {
      console.error("Error loading exam info:", error);
    }
  };

  // Load subject info
  const loadSubjectInfo = async () => {
    if (!subjectId) return;
    
    try {
      const { data, error } = await supabase
        .from('s_practice_subjects')
        .select('name, description')
        .eq('id', subjectId)
        .single();
        
      if (error) throw error;
      if (data) {
        setSubjectName(data.name);
      }
    } catch (error) {
      console.error("Error loading subject info:", error);
    }
  };

  // Load questions
  const loadQuestions = async () => {
    try {
      // First get all questions for this subject
      const { data: questionsData, error: questionsError } = await supabase
        .from('s_practice_questions')
        .select(`
          id,
          question_text,
          explanation,
          rationale,
          subject_id,
          exam_id
        `)
        .eq('subject_id', subjectId);

      if (questionsError) throw questionsError;

      // Get all answers for these questions
      const { data: answersData, error: answersError } = await supabase
        .from('s_practice_answers')
        .select('*')
        .in('question_id', questionsData.map(q => q.id))
        .order('id');

      if (answersError) throw answersError;

      // Format questions with their answers
      const formattedQuestions = questionsData.map(question => {
        const questionAnswers = answersData.filter(a => a.question_id === question.id);
        
        // Ensure we have answers for this question
        if (questionAnswers.length === 0) {
          console.warn(`No answers found for question ${question.id}`);
          return null;
        }

        // Find the correct answer
        const correctAnswer = questionAnswers.find(a => a.is_correct);
        if (!correctAnswer) {
          console.warn(`No correct answer found for question ${question.id}`);
          return null;
        }

        // Get the index of the correct answer (0-based)
        const correctIndex = questionAnswers.indexOf(correctAnswer);

        return {
          id: question.id,
          question_text: question.question_text,
          rationale: question.explanation || question.rationale,
          correct_answer: String.fromCharCode(97 + correctIndex), // 'a', 'b', 'c', etc.
          options: questionAnswers.map(a => a.answer_text),
          ...questionAnswers.reduce((acc, answer, index) => {
            acc[`option_${String.fromCharCode(97 + index)}`] = answer.answer_text;
            return acc;
          }, {})
        };
      }).filter(q => q !== null); // Remove any questions without answers

      // Shuffle questions for practice
      const shuffledQuestions = [...formattedQuestions].sort(() => Math.random() - 0.5);
      setQuestions(shuffledQuestions);
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  // Load user bookmarks
  const loadUserBookmarks = async () => {
    if (!userData) return;
    
    try {
      const { data, error } = await supabase
        .from('s_user_bookmarks')
        .select('question_id')
        .eq('user_id', userData.id);
        
      if (error) throw error;
      
      const bookmarksMap = {};
      data.forEach(item => {
        bookmarksMap[item.question_id] = true;
      });
      
      setBookmarks(bookmarksMap);
    } catch (error) {
      console.error("Error loading bookmarks:", error);
    }
  };

  // Load user answers
  const loadUserAnswers = async () => {
    if (!userData) return;
    
    try {
      const { data, error } = await supabase
        .from('s_user_answers')
        .select('question_id, selected_answer, is_correct')
        .eq('user_id', userData.id);
        
      if (error) throw error;
      
      const answersMap = {};
      data.forEach(item => {
        answersMap[item.question_id] = item.selected_answer;
      });
      
      setAnswers(answersMap);
      
      // Also set explanations to show for answered questions
      const explanationsMap = {};
      data.forEach(item => {
        explanationsMap[item.question_id] = true;
      });
      
      setShowExplanation(explanationsMap);
    } catch (error) {
      console.error("Error loading user answers:", error);
    }
  };

  // Create practice session
  const createPracticeSession = async () => {
    if (!userData || sessionStarted) return;
    
    try {
      // Get the exam_id from the subject if not provided
      let targetExamId = examId;
      if (!targetExamId && subjectId) {
        const { data: subjectData } = await supabase
          .from('s_practice_subjects')
          .select('exam_id')
          .eq('id', subjectId)
          .single();
        
        if (subjectData) {
          targetExamId = subjectData.exam_id;
        }
      }

      const { data, error } = await supabase
        .from('s_practice_sessions')
        .insert([{
          user_id: userData.id,
          subject_id: subjectId,
          exam_id: targetExamId,
          start_time: new Date().toISOString(),
          status: 'in_progress'
        }])
        .select();
        
      if (error) {
        console.error("Error creating practice session:", error);
        return;
      }
      
      if (data && data.length > 0) {
        setSessionId(data[0].id);
        setSessionStarted(true);
      }
    } catch (error) {
      console.error("Exception in practice session creation:", error);
    }
  };

  return {
    questions,
    currentQuestion,
    currentIndex,
    setCurrentIndex,
    answers,
    setAnswers,
    bookmarks,
    setBookmarks,
    showExplanation,
    setShowExplanation,
    isQuizMode,
    setIsQuizMode,
    loading,
    sessionId,
    examName,
    subjectName
  };
}; 