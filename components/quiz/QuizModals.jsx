import React from 'react';
import { X } from 'lucide-react';

const QuizModals = ({
  showFeedback,
  setShowFeedback,
  feedbackData,
  setFeedbackData,
  handleFeedbackSubmit,
  showModeInfo,
  setShowModeInfo,
  showExitInfo,
  setShowExitInfo,
  currentIndex,
  totalQuestions,
  handleExit
}) => {
  const renderFeedback = () => {
    if (!showFeedback) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6 m-4 border-2 border-[#E5E7EF]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Submit Feedback</h3>
            <button
              onClick={() => setShowFeedback(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="typo"
                className="h-4 w-4"
                checked={feedbackData.typo}
                onChange={(e) => setFeedbackData({...feedbackData, typo: e.target.checked})}
              />
              <label htmlFor="typo" className="text-sm">Typo</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="incorrect"
                className="h-4 w-4"
                checked={feedbackData.incorrect}
                onChange={(e) => setFeedbackData({...feedbackData, incorrect: e.target.checked})}
              />
              <label htmlFor="incorrect" className="text-sm">Question is incorrect</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="unclear"
                className="h-4 w-4"
                checked={feedbackData.unclear}
                onChange={(e) => setFeedbackData({...feedbackData, unclear: e.target.checked})}
              />
              <label htmlFor="unclear" className="text-sm">Question is unclear</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="other"
                className="h-4 w-4"
                checked={feedbackData.other}
                onChange={(e) => setFeedbackData({...feedbackData, other: e.target.checked})}
              />
              <label htmlFor="other" className="text-sm">Other issue</label>
            </div>
          </div>
          <textarea
            placeholder="Describe the issue..."
            className="w-full p-2 border-2 border-[#E5E7EF] rounded-md mt-4 min-h-24"
            value={feedbackData.description}
            onChange={(e) => setFeedbackData({...feedbackData, description: e.target.value})}
          />
          <button
            onClick={handleFeedbackSubmit}
            className="mt-4 w-full bg-[#2463EB] border border-[#3A6FF1] text-white py-2 rounded-md hover:bg-[#1d4ed8] transition-colors"
          >
            Submit Feedback
          </button>
        </div>
      </div>
    );
  };

  const renderModeInfo = () => {
    if (!showModeInfo) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6 m-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Study Modes</h3>
            <button
              onClick={() => setShowModeInfo(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
              <h4 className="font-medium mb-1">Quiz Mode</h4>
              <p className="text-sm">In Quiz Mode, you must select an answer to see if it&apos;s correct. Explanations will appear after answering.</p>
            </div>
            <div className="p-3 bg-green-50 rounded-md border border-green-200">
              <h4 className="font-medium mb-1">Study Mode</h4>
              <p className="text-sm">In Study Mode, correct answers and explanations are shown immediately. Use this to review material you&apos;ve already studied.</p>
            </div>
          </div>
          <button
            onClick={() => setShowModeInfo(false)}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Got it
          </button>
        </div>
      </div>
    );
  };

  const renderExitInfo = () => {
    if (!showExitInfo) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay bg-black bg-opacity-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6 m-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Exit & Resume</h3>
            <button
              onClick={() => setShowExitInfo(false)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mb-4">You&apos;re currently on Question {currentIndex + 1} of {totalQuestions}.</p>
          <p className="text-sm mb-4">
            If you exit now, your progress will be saved. You can resume this quiz later from this question.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowExitInfo(false)}
              className="flex-1 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleExit}
              className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderFeedback()}
      {renderModeInfo()}
      {renderExitInfo()}
    </>
  );
};

export default QuizModals; 