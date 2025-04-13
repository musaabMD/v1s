'use client';

import React, { useState, useEffect } from 'react';
import { toggleFlashcardFlag } from '../lib/airtable';

const FlashcardClient = ({ initialCards = [] }) => {
  const [cards, setCards] = useState(initialCards);
  const [expandedId, setExpandedId] = useState(null);
  const [loadingIds, setLoadingIds] = useState([]); // Track loading state per card
  const [error, setError] = useState(null);

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
    
    // Add this card ID to loading state
    setLoadingIds(prev => [...prev, id]);
    setError(null);
    
    try {
      // Update card status on the server
      const response = await fetch('/api/update-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update card');
      }
      
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
      
      // Don't collapse the card after rating
      // Removed: setExpandedId(null);
    } catch (error) {
      console.error('Error updating card status:', error);
      setError('Failed to update card. Please try again.');
    } finally {
      // Remove this card ID from loading state
      setLoadingIds(prev => prev.filter(loadingId => loadingId !== id));
    }
  };

  // Toggle flag on a card
  const toggleFlag = async (id, e) => {
    e.stopPropagation();
    
    // Add this card ID to loading state
    setLoadingIds(prev => [...prev, id]);
    setError(null);
    
    try {
      // Call the API endpoint to toggle flag
      const response = await fetch('/api/update-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: 'flag' }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to toggle flag');
      }
      
      // Update local state
      setCards(cards.map(card => 
        card.id === id ? {...card, flagged: !card.flagged} : card
      ));
    } catch (error) {
      console.error('Error toggling flag:', error);
      setError('Failed to toggle flag. Please try again.');
    } finally {
      // Remove this card ID from loading state
      setLoadingIds(prev => prev.filter(loadingId => loadingId !== id));
    }
  };

  // If there are no cards and no error, show message to create cards
  if (cards.length === 0 && !error) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium text-gray-700 mb-2">No flashcards found</h3>
        <p className="text-gray-500 mb-4">You don't have any flashcards yet.</p>
        <p className="text-sm text-gray-400">
          Create flashcards in your Airtable base or check your API settings.
        </p>
      </div>
    );
  }

  // If there's an error fetching cards
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 max-w-4xl mx-auto">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8" style={{backgroundColor: "#FAFAFA"}}>
      {/* Show any global error here */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </span>
        </div>
      )}
      
      <div className="grid gap-4">
        {cards.map(card => (
          <div 
            key={card.id} 
            className={`bg-white rounded-md border border-gray-200 transition-all duration-200 cursor-pointer ${
              expandedId === card.id ? 'border-gray-400 shadow-sm' : ''
            }`}
            onClick={() => toggleCard(card.id)}
          >
            {/* Card is loading indicator - just a subtle top border animation */}
            {loadingIds.includes(card.id) && (
              <div className="h-1 bg-blue-500 rounded-t-md animate-pulse"></div>
            )}
            
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
                    disabled={loadingIds.includes(card.id)}
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
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md bg-white text-black border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    onClick={(e) => handleSpacedRepetition(card.id, 'again', e)}
                    disabled={loadingIds.includes(card.id)}
                  >
                    Again
                    {card.againCount > 0 && <span className="ml-1 text-xs bg-red-100 text-red-800 rounded-full px-1.5 py-0.5">{card.againCount}</span>}
                  </button>
                  
                  <button 
                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-md bg-white text-black border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    onClick={(e) => handleSpacedRepetition(card.id, 'good', e)}
                    disabled={loadingIds.includes(card.id)}
                  >
                    Good
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

export default FlashcardClient;