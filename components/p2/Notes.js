import React, { useState, useEffect } from 'react';
import { updateFlashcardStatus } from '../lib/airtable';

const QAFlashcards = ({ initialCards = [] }) => {
  const [cards, setCards] = useState(initialCards);
  // State to track which card is expanded
  const [expandedId, setExpandedId] = useState(null);

  // Toggle card expansion
  const toggleCard = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  // Handle spaced repetition buttons
  const handleSpacedRepetition = async (id, status, e) => {
    e.stopPropagation();
    
    try {
      // Update the card status in Airtable
      await updateFlashcardStatus(id, status);
      
      // Update local state to reflect the change
      setCards(cards.map(card => {
        if (card.id === id) {
          if (status === 'good') {
            return { ...card, goodCount: (card.goodCount || 0) + 1 };
          } else {
            return { ...card, againCount: (card.againCount || 0) + 1 };
          }
        }
        return card;
      }));
      
      // Collapse the card after rating
      setExpandedId(null);
    } catch (error) {
      console.error('Error updating card status:', error);
      alert(`Failed to update card status. Please try again.`);
    }
  };

  // Toggle flag on a card
  const toggleFlag = (id, e) => {
    e.stopPropagation();
    setCards(cards.map(card => 
      card.id === id ? {...card, flagged: !card.flagged} : card
    ));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8" style={{backgroundColor: "#FAFAFA"}}>
      <div className="grid gap-4">
        {cards.map(card => (
          <div 
            key={card.id} 
            className={`bg-white rounded-md border border-gray-200 transition-all duration-200 cursor-pointer ${
              expandedId === card.id ? 'border-gray-400' : ''
            }`}
            onClick={() => toggleCard(card.id)}
          >
            <div className="p-3 sm:p-4 md:p-5">
              <div className="flex flex-wrap md:flex-nowrap items-center gap-2 sm:gap-3 md:gap-4">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  {card.number || '?'}
                </div>
                
                <div className="flex-grow min-w-0 order-1 md:order-none">
                  <h3 className="text-base sm:text-lg font-medium text-black truncate">{card.question}</h3>
                </div>
                
                <div className="flex items-center gap-2 ml-auto mt-2 sm:mt-0 w-full md:w-auto order-2 md:order-none">
                  <button 
                    className={`flex-shrink-0 focus:outline-none ${card.flagged ? 'text-red-500' : 'text-gray-300'}`}
                    onClick={(e) => toggleFlag(card.id, e)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={card.flagged ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flag">
                      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                      <line x1="4" x2="4" y1="22" y2="15"/>
                    </svg>
                  </button>
                  
                  <div className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 text-xs sm:text-sm font-medium rounded-full truncate max-w-[120px] sm:max-w-none">
                    {card.subject || 'General'}
                  </div>
                </div>
              </div>
            </div>
            
            {expandedId !== card.id ? (
              <div className="px-3 sm:px-4 md:px-5 pb-3 sm:pb-4">
                <p className="text-xs sm:text-sm text-gray-500">Click to view answer</p>
              </div>
            ) : (
              <div className="px-3 sm:px-4 md:px-5 pb-4 sm:pb-5 pt-2 border-t border-gray-200">
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">{card.answer}</p>
                
                <div className="flex justify-center gap-3 sm:gap-4">
                  <button 
                    className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md bg-white text-black border border-gray-300 hover:bg-gray-50 transition-colors"
                    onClick={(e) => handleSpacedRepetition(card.id, 'again', e)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-repeat">
                      <path d="m17 2 4 4-4 4"/>
                      <path d="M3 11v-1a4 4 0 0 1 4-4h14"/>
                      <path d="m7 22-4-4 4-4"/>
                      <path d="M21 13v1a4 4 0 0 1-4 4H3"/>
                    </svg>
                    <span className="hidden xs:inline">Again</span>
                    {card.againCount > 0 && <span className="ml-1 text-xs bg-red-100 text-red-800 rounded-full px-1.5 py-0.5">{card.againCount}</span>}
                  </button>
                  
                  <button 
                    className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md bg-white text-black border border-gray-300 hover:bg-gray-50 transition-colors"
                    onClick={(e) => handleSpacedRepetition(card.id, 'good', e)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-thumbs-up">
                      <path d="M7 10v12"/>
                      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/>
                    </svg>
                    <span className="hidden xs:inline">Good</span>
                    {card.goodCount > 0 && <span className="ml-1 text-xs bg-green-100 text-green-800 rounded-full px-1.5 py-0.5">{card.goodCount}</span>}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QAFlashcards;