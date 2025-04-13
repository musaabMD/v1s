import React from 'react';
import { ChevronLeft, ChevronRight, Pin, Flag } from 'lucide-react';

const QuizFooter = ({
  currentIndex,
  totalQuestions,
  goToPrevious,
  goToNext,
  toggleBookmark,
  showFeedbackForm,
  currentQuestion,
  bookmarks,
  toggleQuizMode,
  isQuizMode,
  setShowModeInfo,
  handleExitResume
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-300 px-4 py-3 shadow-lg">
      <div className="flex justify-between md:justify-center items-center max-w-3xl mx-auto relative">
        {/* Left controls */}
        <div className="flex items-center gap-2 md:absolute md:left-4">
          <button
            onClick={toggleBookmark}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Bookmark question"
            disabled={!currentQuestion}
          >
            <Pin className={`w-5 h-5 ${currentQuestion && bookmarks[currentQuestion.id] ? 'text-blue-500 fill-blue-500' : 'text-stone-500'}`} />
          </button>
          <button
            onClick={showFeedbackForm}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Report issue"
            disabled={!currentQuestion}
          >
            <Flag className="w-5 h-5 text-stone-500" />
          </button>
        </div>
        
        {/* Center navigation */}
        <div className="flex items-center gap-4 bg-gray-100 p-1 rounded-full">
          <button
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className={`p-2 rounded-full ${currentIndex === 0 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-100'}`}
            aria-label="Previous question"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-sm px-2 py-1 bg-blue-600 text-white rounded-full min-w-10 text-center">
            {currentIndex + 1}
          </span>
          <button
            onClick={goToNext}
            disabled={currentIndex === totalQuestions - 1}
            className={`p-2 rounded-full ${currentIndex === totalQuestions - 1 ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-100'}`}
            aria-label="Next question"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        {/* Right controls */}
        <div className="flex items-center gap-2 md:absolute md:right-4">
          <button
            onClick={() => {
              toggleQuizMode();
              setShowModeInfo(true);
            }}
            className="flex items-center gap-1 px-3 py-1 rounded-md border border-blue-600 bg-blue-600 text-white hover:bg-blue-700"
          >
            {isQuizMode ? 'Study' : 'Quiz'}
          </button>
          <button
            onClick={handleExitResume}
            className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizFooter; 