import React from 'react';
import { Lightbulb } from 'lucide-react';
import { getChoiceStyle } from './quizHelpers';

const QuizContent = ({
  currentQuestion,
  isQuizMode,
  showExplanation,
  answers,
  handleAnswerClick
}) => {
  if (!currentQuestion) return null;

  const renderChoices = () => {
    const choices = ['a', 'b', 'c', 'd'];
    
    return choices.map(choiceId => {
      const optionKey = `option_${choiceId}`;
      if (!currentQuestion[optionKey]) return null;
      
      return (
        <button
          key={choiceId}
          onClick={() => handleAnswerClick(choiceId)}
          disabled={isQuizMode && answers[currentQuestion.id]}
          className={getChoiceStyle(choiceId, currentQuestion, answers, isQuizMode)}
        >
          <div className="flex items-center gap-4">
            <span className="font-medium text-xl text-stone-800 min-w-6 text-center">{choiceId.toUpperCase()}</span>
            <span className="text-lg text-stone-800">{currentQuestion[optionKey]}</span>
          </div>
        </button>
      );
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4">
      {/* Question */}
      <div className="mb-8 p-8 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md rounded-lg">
        <p className="text-xl md:text-2xl font-medium text-blue-900">{currentQuestion.question_text}</p>
      </div>
      
      {/* Answer Choices */}
      <div className="space-y-4 mb-8">
        {renderChoices()}
      </div>
      
      {/* Explanation */}
      {(!isQuizMode || showExplanation[currentQuestion.id]) && currentQuestion.explanation && (
        <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm">
          <h3 className="font-medium text-amber-800 mb-3 text-lg flex items-center">
            <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
            Explanation
          </h3>
          <p className="text-stone-800 text-lg leading-relaxed">{currentQuestion.explanation || currentQuestion.rationale}</p>
        </div>
      )}
    </div>
  );
};

export default QuizContent; 