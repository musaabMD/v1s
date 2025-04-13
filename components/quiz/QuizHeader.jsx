import React from 'react';
import { Menu, Clock } from 'lucide-react';
import { formatTime } from './quizHelpers';

const QuizHeader = ({
  currentIndex,
  totalQuestions,
  showTimer,
  seconds,
  userData,
  setSidebarOpen,
  examName
}) => {
  return (
    <div className="sticky top-0 z-30 bg-blue-700 text-white p-4 border-b border-blue-800 shadow-md">
      <div className="flex justify-between items-center max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 rounded hover:bg-blue-600"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xl font-bold">Scoorly</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm bg-blue-600 px-2 py-1 rounded">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          {showTimer && (
            <div className="font-mono bg-blue-600 px-2 py-1 rounded flex items-center gap-2">
              <Clock size={16} />
              {formatTime(seconds)}
            </div>
          )}
          <div className="text-sm font-medium">
            {userData?.name || 'User'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizHeader; 