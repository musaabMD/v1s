"use client";

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Pin, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const QuestionDemo = ({ questions: propQuestions = [] }) => {
  // Use provided questions or fallback to empty array
  const [questions, setQuestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const questionsPerPage = 10;

  // Update questions when props change
  useEffect(() => {
    if (propQuestions && propQuestions.length > 0) {
      setQuestions(propQuestions);
    } else {
      // If no questions are provided, component will show empty state
      setQuestions([]);
    }
  }, [propQuestions]);

  // Calculate current page questions
  const currentQuestions = questions.slice(
    currentPage * questionsPerPage,
    (currentPage + 1) * questionsPerPage
  );

  // Handle answer selection and update Airtable
  const handleAnswerSelect = async (questionId, choiceId) => {
    // Find the question
    const question = questions.find(q => q.id === questionId);
    const isCorrect = choiceId === question.correctAnswer;
    
    // Calculate new correct/incorrect counts
    const newCorrectCount = isCorrect ? (question.correct + 1) : question.correct;
    const newIncorrectCount = isCorrect ? question.incorrect : (question.incorrect + 1);
    
    // Update local state first for immediate feedback
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { 
          ...q, 
          answered: choiceId,
          explanationVisible: true,
          correct: newCorrectCount,
          incorrect: newIncorrectCount
        };
      }
      return q;
    }));
    
    // Update Airtable
    try {
      console.log(`Sending data to Airtable for answer update:`, {
        correct: newCorrectCount,
        incorrect: newIncorrectCount
      });
      
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correct: newCorrectCount,
          incorrect: newIncorrectCount
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update answer stats in Airtable');
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } else {
        console.log('Successfully updated answer stats in Airtable');
      }
    } catch (error) {
      console.error('Error updating answer stats:', error);
    }
  };

  // Toggle pin status and update in Airtable
  const togglePin = async (questionId) => {
    // Find the question
    const question = questions.find(q => q.id === questionId);
    const newPinnedStatus = !question.pinned;
    
    // Update local state first
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, pinned: newPinnedStatus };
      }
      return q;
    }));
    
    // Update Airtable
    try {
      console.log(`Sending data to Airtable for pin update:`, {
        flagged: newPinnedStatus
      });
      
      const response = await fetch(`/api/questions/${questionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flagged: newPinnedStatus
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to update pin status in Airtable');
        const errorData = await response.json();
        console.error('Error details:', errorData);
      } else {
        console.log('Successfully updated pin status in Airtable');
      }
    } catch (error) {
      console.error('Error updating pin status:', error);
    }
  };

  // Toggle explanation visibility
  const toggleExplanation = (questionId) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, explanationVisible: !q.explanationVisible };
      }
      return q;
    }));
  };

  // If no questions are available, show empty state
  if (questions.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center p-8 text-gray-500">
          No questions available. Try adjusting your filters or check your Airtable data.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 gap-4">
        {/* Main question area */}
        <div>
          {currentQuestions.map((question) => (
            <Card key={question.id} className="mb-8">
              <CardHeader className="flex justify-between items-start mb-2">
                <div className="flex gap-2">
                  <Badge>{question.subject}</Badge>
                  <Badge>{question.source}</Badge>
                </div>
                <Button variant="ghost" onClick={() => togglePin(question.id)}>
                  <Pin className={question.pinned ? "fill-current" : ""} size={24} />
                </Button>
              </CardHeader>

              <CardContent>
                {/* Question stats */}
                <div className="text-sm text-gray-600 mb-3">
                  Answered correctly {question.correct} times and incorrectly {question.incorrect} times
                </div>
                
                {/* Question text - made 2x larger and black */}
                <h2 className="text-2xl font-medium mb-6 text-black"> 
                  <span className="text-gray-500 mr-2">Q{question.qid || ''}.</span>
                  {question.question}
                </h2>
                
                {question.questionImage && question.questionImage.length > 0 ? (
                  <div className="mb-4">
                    <img 
                      src={question.questionImage[0].url} 
                      alt="Question Image" 
                      className="w-full rounded"
                    />
                  </div>
                ) : (
                  <div className="bg-gray-200 h-48 w-full flex items-center justify-center rounded mb-4">
                    <span className="text-gray-500 text-sm">No Question Image</span>
                  </div>
                )}
                
                <div className="space-y-2">
                  {question.choices && question.choices.map((choice) => (
                    <Button
                      key={choice.id}
                      onClick={() => handleAnswerSelect(question.id, choice.id)}
                      className={`w-full text-left justify-start ${
                        question.answered === choice.id
                          ? question.correctAnswer === choice.id
                            ? "bg-green-100 hover:bg-green-200 text-green-800"
                            : "bg-red-100 hover:bg-red-200 text-red-800"
                          : ""
                      }`}
                      variant="outline"
                    >
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        {choice.id}
                      </span>
                      <span>{choice.text}</span>
                      
                      {question.answered === choice.id && (
                        <span className="ml-auto">
                          {question.correctAnswer === choice.id ? (
                            <Check className="text-green-500" size={18} />
                          ) : (
                            <X className="text-red-500" size={18} />
                          )}
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>

              {question.answered && (
                <CardFooter className={`mt-2 ${
                  question.answered === question.correctAnswer
                    ? "bg-green-50 text-green-800"
                    : "bg-red-50 text-red-800"
                }`}>
                  <div className="flex w-full justify-between items-center">
                    <span>
                      {question.answered === question.correctAnswer
                        ? "Correct!" 
                        : `Incorrect. The correct answer is ${question.correctAnswer}.`}
                      {/* Show stats in explanation */}
                      <span className="ml-2 text-sm">
                        (Answered correctly {question.correct} times and incorrectly {question.incorrect} times)
                      </span>
                    </span>
                    <Button variant="link" onClick={() => toggleExplanation(question.id)}>
                      {question.explanationVisible ? (
                        <span className="flex items-center">Hide explanation <ChevronUp size={16} className="ml-1" /></span>
                      ) : (
                        <span className="flex items-center">View explanation <ChevronDown size={16} className="ml-1" /></span>
                      )}
                    </Button>
                  </div>
                </CardFooter>
              )}

              {question.explanationVisible && question.answered && (
                <CardContent className="mt-4">
                  <h3 className="font-bold text-lg mb-3">Explanation</h3>
                  <p className="text-gray-700 mb-4">
                    {question.explanation}
                  </p>
                  
                  {question.explanationImage && question.explanationImage.length > 0 ? (
                    <img 
                      src={question.explanationImage[0].url} 
                      alt="Explanation Image" 
                      className="w-full rounded"
                    />
                  ) : (
                    <div className="bg-gray-200 h-48 w-full flex items-center justify-center rounded">
                      <span className="text-gray-500 text-sm">No Explanation Image</span>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
          
          {questions.length > questionsPerPage && (
            <div className="flex justify-between items-center mt-6">
              <Button
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
                className="flex items-center"
              >
                <ChevronLeft size={16} className="mr-1" />
                Previous
              </Button>
              <Button
                onClick={() => setCurrentPage(Math.min(currentPage + 1, Math.ceil(questions.length / questionsPerPage) - 1))}
                disabled={currentPage === Math.ceil(questions.length / questionsPerPage) - 1}
                className="flex items-center"
              >
                Next
                <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDemo;