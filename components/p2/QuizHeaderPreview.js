"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Pin, XCircle, Book, Filter, FileText, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const QuizHeaderPreview = ({ examName = "Part 2", onFiltersChange, totalQuestions = 0 }) => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [sources, setSources] = useState([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [subject, setSubject] = useState([]);
  const [source, setSource] = useState("all"); // Using "all" instead of empty string
  const [review, setReview] = useState("review_all");
  
  // Review options remain static
  const reviewOptions = [
    { label: "Review All", value: "review_all", icon: Book },
    { label: "Review Pinned", value: "review_pinned", icon: Pin },
    { label: "Review Incorrect", value: "review_incorrect", icon: XCircle }
  ];

  // Fetch filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        // Fetch subjects and sources from our API
        const response = await fetch('/api/filters');
        if (!response.ok) {
          throw new Error('Failed to fetch filter options');
        }
        const data = await response.json();
        
        // Set the filter options
        if (data.subjects) setSubjects(data.subjects);
        if (data.sources) setSources(data.sources);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    
    fetchFilterOptions();
  }, []); // Empty dependency array ensures this only runs once

  // Notify parent when filters change - properly memoized to avoid infinite loops
  useEffect(() => {
    const notifyFilterChange = () => {
      if (onFiltersChange) {
        onFiltersChange({
          searchTerm,
          subject,
          source: source === "all" ? "" : source, // Convert "all" to empty string for API
          review
        });
      }
    };
    
    // Use a timeout to debounce the filter changes
    const timerId = setTimeout(notifyFilterChange, 300);
    
    // Cleanup timeout on component unmount or before next effect run
    return () => clearTimeout(timerId);
  }, [searchTerm, subject, source, review, onFiltersChange]);

  const Logo = ({ examName = '' }) => (
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="w-7 h-7 md:w-8 md:h-8 bg-green-600 rounded-lg flex items-center justify-center">
          <span className="text-lg md:text-xl font-bold text-white">P</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-600 ml-2">{examName}</span>
    </div>
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSourceChange = (value) => {
    setSource(value);
  };

  const handleReviewChange = (value) => {
    setReview(value);
  };

  const handleSubjectToggle = (subjectValue) => {
    setSubject(prevSubjects => {
      if (prevSubjects.includes(subjectValue)) {
        return prevSubjects.filter(s => s !== subjectValue);
      } else {
        return [...prevSubjects, subjectValue];
      }
    });
  };

  const clearSubjects = () => {
    setSubject([]);
  };

  const renderSearchBar = (isMobile = false) => (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
      <Input
        type="text"
        placeholder="Search questions..."
        className={`w-full pl-10 pr-4 py-2 rounded-lg bg-white border-gray-200 ${isMobile ? 'text-sm' : ''}`}
        value={searchTerm}
        onChange={handleSearchChange}
      />
    </div>
  );

  const renderFilters = (isMobile = false) => {
    // Get display text for subject filter
    let subjectDisplayText = "All Subjects";
    if (Array.isArray(subject) && subject.length > 0) {
      if (subject.length === 1) {
        subjectDisplayText = subjects.find(s => s.value === subject[0])?.label || "Subject";
      } else {
        subjectDisplayText = `${subject.length} selected`;
      }
    }

    // Get display text for source
    const sourceDisplayText = source === "all" 
      ? "All Sources" 
      : sources.find(s => s.value === source)?.label || "All Sources";

    // Get display and icon for review
    const selectedReview = reviewOptions.find(o => o.value === review) || reviewOptions[0];
    const ReviewIcon = selectedReview.icon;

    return (
      <div className={`flex gap-2 ${isMobile ? 'w-full flex-col' : ''}`}>
        {/* Simple custom dropdown for Subject */}
        <div className="relative">
          <button 
            onClick={() => setShowSubjectDropdown(!showSubjectDropdown)}
            className={`${isMobile ? 'w-full' : 'w-40'} h-9 text-sm flex items-center px-3 bg-white border border-gray-300 rounded-md`}
          >
            <Book className="w-4 h-4 mr-1.5" />
            <span className="flex-1 text-left">{subjectDisplayText}</span>
          </button>
          
          {/* Subject Dropdown Content */}
          {showSubjectDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              <div className="p-2">
                {Array.isArray(subject) && subject.length > 0 && (
                  <div className="flex items-center justify-between mb-2 p-2 bg-gray-100 rounded">
                    <div>{subjectDisplayText}</div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); clearSubjects(); }}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                
                {subjects.map(item => (
                  <div 
                    key={item.value} 
                    className="flex items-center p-1.5 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={(e) => { e.stopPropagation(); handleSubjectToggle(item.value); }}
                  >
                    <div className="flex-1">{item.label}</div>
                    {Array.isArray(subject) && subject.includes(item.value) && (
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Simple custom dropdown for Source */}
        <div className="relative">
          <button 
            onClick={() => setShowSourceDropdown(!showSourceDropdown)}
            className={`${isMobile ? 'w-full' : 'w-40'} h-9 text-sm flex items-center px-3 bg-white border border-gray-300 rounded-md`}
          >
            <FileText className="w-4 h-4 mr-1.5" />
            <span className="flex-1 text-left">{sourceDisplayText}</span>
          </button>
          
          {/* Source Dropdown Content */}
          {showSourceDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              <div 
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => { handleSourceChange("all"); setShowSourceDropdown(false); }}
              >
                All Sources
              </div>
              {sources.map(item => (
                <div 
                  key={item.value} 
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => { handleSourceChange(item.value); setShowSourceDropdown(false); }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Simple custom dropdown for Review */}
        <div className="relative">
          <button 
            onClick={() => setShowReviewDropdown(!showReviewDropdown)}
            className={`${isMobile ? 'w-full' : 'w-40'} h-9 text-sm flex items-center px-3 bg-white border border-gray-300 rounded-md`}
          >
            <ReviewIcon className="w-4 h-4 mr-1.5" />
            <span className="flex-1 text-left">{selectedReview.label}</span>
          </button>
          
          {/* Review Dropdown Content */}
          {showReviewDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              {reviewOptions.map(item => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.value} 
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => { handleReviewChange(item.value); setShowReviewDropdown(false); }}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // State for custom dropdowns
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showReviewDropdown, setShowReviewDropdown] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSubjectDropdown(false);
      setShowSourceDropdown(false);
      setShowReviewDropdown(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full bg-white shadow-md">
      <div className="flex items-center justify-between px-2 md:px-4 py-2 md:py-4 bg-white border-b">
        <div className="flex items-center gap-2">
          <button
            className="hover:bg-gray-100 p-1.5 rounded-full transition-colors"
            onClick={() => window.location.href = '/'}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Logo examName={examName} />
        </div>
      </div>

      <div className="px-2 md:px-4 py-2 md:py-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="block md:hidden">
            <div className="flex items-center gap-2 mb-3">
              {renderSearchBar(true)}
              <button 
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="flex-shrink-0 p-2 bg-white rounded-lg border border-gray-200"
              >
                <Filter className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {showMobileFilters && (
              <div className="space-y-3 mt-2 p-3 bg-white rounded-lg border border-gray-200">
                {renderFilters(true)}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {renderFilters()}
            {renderSearchBar()}
          </div>

          <div className="mt-2 text-right text-xs text-gray-600">
            {totalQuestions} question{totalQuestions !== 1 && 's'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizHeaderPreview;