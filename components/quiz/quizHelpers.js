// Format timer display
export const formatTime = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Determine if answer is correct
export const isAnswerCorrect = (question, choiceId) => {
  return question && choiceId === question.correct_answer;
};

// Get choice style based on quiz state
export const getChoiceStyle = (choiceId, currentQuestion, answers, isQuizMode) => {
  if (!currentQuestion) return '';
  
  const baseStyle = 'w-full p-5 text-left border-2 rounded-lg transition-all flex justify-between items-center text-lg';
  
  if (isQuizMode && !answers[currentQuestion.id]) {
    return `${baseStyle} bg-white border-[#E5E7EF] hover:bg-gray-100 hover:border-[#D1D5E8]`;
  }
  
  // If we're in show mode or have answered in quiz mode
  if (!isQuizMode || answers[currentQuestion.id]) {
    if (choiceId === answers[currentQuestion.id]) {
      if (isAnswerCorrect(currentQuestion, choiceId)) {
        return `${baseStyle} bg-green-100 border-green-600 hover:bg-green-200 hover:border-green-700`;
      } else {
        return `${baseStyle} bg-red-100 border-red-600 hover:bg-red-200 hover:border-red-700`;
      }
    }
    
    if (choiceId === currentQuestion.correct_answer) {
      return `${baseStyle} bg-green-100 border-green-600 hover:bg-green-200 hover:border-green-700`;
    }
  }
  
  return `${baseStyle} bg-white border-[#E5E7EF] hover:bg-gray-100 hover:border-[#D1D5E8]`;
}; 