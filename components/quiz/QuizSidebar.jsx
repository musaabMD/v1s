import React from 'react';
import { X, Pin } from 'lucide-react';

const QuizSidebar = ({
  sidebarOpen,
  setSidebarOpen,
  examName,
  activeFilter,
  setActiveFilter,
  questions,
  bookmarks,
  answers,
  currentIndex,
  navigateToQuestion,
  isAnswerCorrect
}) => {
  const filteredQuestions = () => {
    if (activeFilter === 'all') return questions;
    if (activeFilter === 'bookmarked') {
      return questions.filter(q => bookmarks[q.id]);
    }
    if (activeFilter === 'unanswered') {
      return questions.filter(q => !answers[q.id]);
    }
    return questions;
  };

  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r-2 border-[#E5E7EF] transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b-2 border-[#E5E7EF]">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#2463EB]">{examName}</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`text-left px-3 py-2 rounded-md ${activeFilter === 'all' ? 'bg-blue-100 text-[#2463EB]' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              All Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveFilter('bookmarked')}
              className={`text-left px-3 py-2 rounded-md ${activeFilter === 'bookmarked' ? 'bg-blue-100 text-[#2463EB]' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Bookmarked ({Object.values(bookmarks).filter(Boolean).length})
            </button>
            <button
              onClick={() => setActiveFilter('unanswered')}
              className={`text-left px-3 py-2 rounded-md ${activeFilter === 'unanswered' ? 'bg-blue-100 text-[#2463EB]' : 'text-gray-700 hover:bg-gray-100'}`}
            >
              Unanswered ({questions.length - Object.keys(answers).length})
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto max-h-full">
          <div className="grid grid-cols-5 gap-2">
            {filteredQuestions().map((q, idx) => {
              const questionIndex = questions.findIndex(question => question.id === q.id);
              const isCurrentQuestion = currentIndex === questionIndex;
              const isAnswered = !!answers[q.id];
              const isBookmarked = !!bookmarks[q.id];
              
              let bgColor = 'bg-white border-2 border-[#E5E7EF]';
              
              if (isCurrentQuestion) {
                bgColor = 'bg-[#2463EB] text-white border-2 border-[#3A6FF1]';
              } else if (isAnswered) {
                bgColor = isAnswerCorrect(q, answers[q.id])
                  ? 'bg-green-100 text-green-800 border-2 border-green-300'
                  : 'bg-red-100 text-red-800 border-2 border-red-300';
              }
              
              return (
                <button
                  key={q.id}
                  onClick={() => navigateToQuestion(questionIndex)}
                  className={`relative ${bgColor} rounded-md flex items-center justify-center h-10 hover:opacity-80 transition-opacity`}
                >
                  <span>{questionIndex + 1}</span>
                  {isBookmarked && (
                    <span className="absolute -top-1 -right-1">
                      <Pin size={10} className="text-[#2463EB] fill-[#2463EB]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default QuizSidebar; 