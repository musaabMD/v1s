"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/libs/supabase/client";
import { isAnswerCorrect } from './quizHelpers';
import { useQuizState } from './useQuizState';
import { useQuizNavigation } from './useQuizNavigation';
import QuizHeader from './QuizHeader';
import QuizContent from './QuizContent';
import QuizFooter from './QuizFooter';
import QuizSidebar from './QuizSidebar';
import QuizModals from './QuizModals';
import ScoreForPractice from './ScoreForPractice';

const QuizView = ({ examId, subjectId, userData }) => {
  // Core state from custom hook
  const {
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
  } = useQuizState(userData, examId, subjectId);

  // UI state
  const [showFeedback, setShowFeedback] = useState(false);
  const [showModeInfo, setShowModeInfo] = useState(false);
  const [showExitInfo, setShowExitInfo] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showTimer, setShowTimer] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Feedback state
  const [feedbackData, setFeedbackData] = useState({
    questionId: null,
    typo: false,
    incorrect: false,
    unclear: false,
    other: false,
    description: ''
  });

  const supabase = createClient();

  // Navigation from custom hook
  const { goToNext, goToPrevious, handleExit } = useQuizNavigation(
    currentIndex,
    setCurrentIndex,
    questions,
    answers,
    sessionId,
    userData,
    examId,
    examName,
    seconds
  );

  // Timer effect
  useEffect(() => {
    let interval;
    if (showTimer && !isPaused) {
      interval = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showTimer, isPaused]);

  // Handle selecting an answer
  const handleAnswerClick = async (choiceId) => {
    if (!currentQuestion) return;
    
    if (isQuizMode && !answers[currentQuestion.id]) {
      const newAnswers = { ...answers };
      newAnswers[currentQuestion.id] = choiceId;
      setAnswers(newAnswers);
      
      // Save answer to database
      try {
        const isCorrect = isAnswerCorrect(currentQuestion, choiceId);
        
        const { data: existingAnswers, error: checkError } = await supabase
          .from('s_user_answers')
          .select('id')
          .eq('user_id', userData.id)
          .eq('question_id', currentQuestion.id)
          .eq('session_id', sessionId);
          
        if (checkError) throw checkError;
        
        if (existingAnswers && existingAnswers.length > 0) {
          await supabase
            .from('s_user_answers')
            .update({
              selected_answer: choiceId,
              is_correct: isCorrect,
              time_taken: seconds,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingAnswers[0].id);
        } else {
          await supabase
            .from('s_user_answers')
            .insert([{
              user_id: userData.id,
              question_id: currentQuestion.id,
              session_id: sessionId,
              selected_answer: choiceId,
              is_correct: isCorrect,
              time_taken: seconds,
              created_at: new Date().toISOString()
            }]);
        }
        
        // Reset timer for next question
        setSeconds(0);
        
        // Show explanation
        const newShowExplanation = { ...showExplanation };
        newShowExplanation[currentQuestion.id] = true;
        setShowExplanation(newShowExplanation);
      } catch (error) {
        console.error("Error saving answer:", error);
      }
    }
  };

  // Toggle bookmark status
  const toggleBookmark = async () => {
    if (!userData || !currentQuestion) return;
    
    const questionId = currentQuestion.id;
    const isCurrentlyBookmarked = bookmarks[questionId];
    
    try {
      const newBookmarks = { ...bookmarks };
      
      if (isCurrentlyBookmarked) {
        await supabase
          .from('s_user_bookmarks')
          .delete()
          .eq('user_id', userData.id)
          .eq('question_id', questionId);
          
        delete newBookmarks[questionId];
      } else {
        await supabase
          .from('s_user_bookmarks')
          .insert([{
            user_id: userData.id,
            question_id: questionId,
            created_at: new Date().toISOString()
          }]);
          
        newBookmarks[questionId] = true;
      }
      
      setBookmarks(newBookmarks);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  // Update handleExit to show score
  const handleExitAndShowScore = () => {
    setShowScore(true);
    setShowExitInfo(false);
  };

  // Update handleFeedbackSubmit
  const handleFeedbackSubmit = async () => {
    if (!userData || !feedbackData.questionId) return;
    
    try {
      const feedbackTypes = [];
      if (feedbackData.typo) feedbackTypes.push('typo');
      if (feedbackData.incorrect) feedbackTypes.push('incorrect');
      if (feedbackData.unclear) feedbackTypes.push('unclear');
      if (feedbackData.other) feedbackTypes.push('other');
      
      await supabase
        .from('s_user_question_feedback')
        .insert([{
          user_id: userData.id,
          question_id: feedbackData.questionId,
          feedback_type: feedbackTypes.join(','),
          feedback_text: feedbackData.description,
          created_at: new Date().toISOString()
        }]);
        
      setFeedbackData({
        questionId: null,
        typo: false,
        incorrect: false,
        unclear: false,
        other: false,
        description: ''
      });
      
      setShowFeedback(false);
      setFeedbackSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setFeedbackSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  // Show feedback form
  const showFeedbackForm = () => {
    if (!currentQuestion) return;
    
    setFeedbackData({
      ...feedbackData,
      questionId: currentQuestion.id
    });
    
    setShowFeedback(true);
  };

  // Navigate directly to a question
  const navigateToQuestion = (index) => {
    setCurrentIndex(index);
    setSidebarOpen(false);
  };

  // Show score screen if active
  if (showScore) {
    return (
      <ScoreForPractice
        sessionId={sessionId}
        examId={examId}
        examName={examName}
        totalQuestions={questions.length}
        answers={answers}
        questions={questions}
        totalTime={seconds}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-blue-900">Loading questions...</p>
        </div>
      </div>
    );
  }

  // No questions found
  if (!loading && questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-6">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">No Questions Found</h2>
          <p className="text-gray-700 mb-6">There are no questions available for this exam or subject. Please try another exam or contact support.</p>
          <button
            onClick={() => router.push('/dashboard/exams')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Return to Exams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 relative min-h-screen">
      {/* Feedback success message */}
      {feedbackSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Feedback submitted successfully!
        </div>
      )}

      <QuizHeader
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        showTimer={showTimer}
        seconds={seconds}
        userData={userData}
        setSidebarOpen={setSidebarOpen}
        examName={examName}
      />

      <div className="flex min-h-screen">
        <QuizSidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          examName={examName}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          questions={questions}
          bookmarks={bookmarks}
          answers={answers}
          currentIndex={currentIndex}
          navigateToQuestion={navigateToQuestion}
          isAnswerCorrect={isAnswerCorrect}
        />
        
        <div className="flex-1 overflow-y-auto py-8 pb-24">
          <QuizContent
            currentQuestion={currentQuestion}
            isQuizMode={isQuizMode}
            showExplanation={showExplanation}
            answers={answers}
            handleAnswerClick={handleAnswerClick}
          />
        </div>
      </div>

      <QuizFooter
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        goToPrevious={goToPrevious}
        goToNext={goToNext}
        toggleBookmark={toggleBookmark}
        showFeedbackForm={showFeedbackForm}
        currentQuestion={currentQuestion}
        bookmarks={bookmarks}
        toggleQuizMode={() => setIsQuizMode(!isQuizMode)}
        isQuizMode={isQuizMode}
        setShowModeInfo={setShowModeInfo}
        handleExitResume={() => setShowExitInfo(true)}
      />

      <QuizModals
        showFeedback={showFeedback}
        setShowFeedback={setShowFeedback}
        feedbackData={feedbackData}
        setFeedbackData={setFeedbackData}
        handleFeedbackSubmit={handleFeedbackSubmit}
        showModeInfo={showModeInfo}
        setShowModeInfo={setShowModeInfo}
        showExitInfo={showExitInfo}
        setShowExitInfo={setShowExitInfo}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        handleExit={handleExitAndShowScore}
      />
    </div>
  );
};

export default QuizView; 