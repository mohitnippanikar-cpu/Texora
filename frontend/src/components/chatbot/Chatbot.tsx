import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatSuggestion, SearchResults } from '../../types';
import { FinancialSearchService } from '../../services/financialSearchService';
import SearchResultsModal from './modals/SearchResultsModal';
import { FinancialSearchInline, FileSearchResultInline } from './InlineComponents';

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: "Hello! I'm your KMRL Assistant. I can help you with train schedules, project information, fleet status, and more. How can I assist you today?",
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickSuggestions: ChatSuggestion[] = [
    { id: '1', text: 'Train Schedule', action: 'schedule' },
    { id: '2', text: 'Fleet Status', action: 'fleet' },
    { id: '3', text: 'Project Updates', action: 'projects' },
    { id: '4', text: 'System Health', action: 'health' },
    { id: '5', text: 'Search Financial Data', action: 'search_finances' },
    { id: '6', text: 'Find Engineering Files', action: 'search_files' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = async (userMessage: string): Promise<string> => {
    // Simple rule-based responses - in production, this would connect to a proper AI service
    const message = userMessage.toLowerCase();
    
    // Check for financial queries
    if (message.includes('finance') || message.includes('budget') || message.includes('allocation') || 
        message.includes('cost') || message.includes('spending') || message.includes('metro a2') ||
        (message.includes('total') && (message.includes('allocated') || message.includes('project')))) {
      
      try {
        const results = await FinancialSearchService.searchFinancialData(userMessage);
        setSearchResults(results);
        
        // Add a financial search inline component to the chat with direct data
        setTimeout(() => {
          const searchMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            text: 'financial_component_with_data',
            isUser: false,
            timestamp: new Date(),
            type: 'component'
          };
          setMessages(prev => [...prev, searchMessage]);
        }, 500);
        
        return `I found financial information about ${results.projectData[0].projectName}. Total allocation: ₹${(results.projectData[0].totalAllocated / 100000000).toFixed(0)} crores, spent: ₹${(results.projectData[0].totalSpent / 100000000).toFixed(0)} crores. Here's the detailed breakdown:`;
      } catch (error) {
        return "I encountered an issue while searching for financial data. Please try again or contact support if the problem persists.";
      }
    }
    
    // Check for file search queries
    if (message.includes('file') || message.includes('document') || message.includes('engineering') || 
        message.includes('drawing') || message.includes('tender') || message.includes('find') ||
        message.includes('search files')) {
      
      // Add a file search component to the chat
      setTimeout(() => {
        const fileMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          text: 'file_search_component',
          isUser: false,
          timestamp: new Date(),
          type: 'component'
        };
        setMessages(prev => [...prev, fileMessage]);
      }, 500);
      
      return "I found an engineering document that matches your search. Here are the details:";
    }
    
    if (message.includes('schedule') || message.includes('time') || message.includes('train')) {
      return "Current metro services run from 6:00 AM to 10:00 PM. Peak frequency is every 4 minutes, and off-peak is every 8 minutes. Would you like specific schedule information for a particular station?";
    }
    
    if (message.includes('fleet') || message.includes('status')) {
      return "Current fleet status: 18 trains operational, 2 under maintenance. Overall fleet availability is 94.2%. All operational trains are running on schedule with an average health score of 92%.";
    }
    
    if (message.includes('project')) {
      return "We currently have 6 major projects: 2 completed (Phase 1, Station Accessibility), 2 ongoing (Phase 2 at 35%, Smart Ticketing at 75%), and 2 upcoming (Phase 3, Solar Integration). Would you like detailed information about any specific project?";
    }
    
    if (message.includes('emergency') || message.includes('alert')) {
      return "For emergencies, call 1800-425-5225. Current system status: OPERATIONAL. No critical alerts. Last system check completed at " + new Date().toLocaleTimeString();
    }
    
    if (message.includes('fare') || message.includes('price')) {
      return "Metro fares range from ₹10 to ₹40 based on distance. Smart cards offer 10% discount. Weekly and monthly passes are available. Students get 50% discount with valid ID.";
    }
    
    if (message.includes('station') || message.includes('route')) {
      return "KMRL operates 25 stations from Aluva to Tripunithura. Popular stations include MG Road, Ernakulam South, and Aluva. All stations are wheelchair accessible with elevator facilities.";
    }
    
    if (message.includes('lost') || message.includes('found')) {
      return "For lost items, visit the customer service desk at any station or call our helpline at 0484-2346-5425. Items are kept for 30 days at the lost property office in Muttom depot.";
    }
    
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
      return "Hello! I'm here to help with all your KMRL queries. You can ask me about train schedules, fares, projects, financial information, or any other metro-related information.";
    }
    
    if (message.includes('thank')) {
      return "You're welcome! Is there anything else I can help you with regarding KMRL services?";
    }
    
    // Default response
    return "I can help you with information about train schedules, fleet status, ongoing projects, fares, station facilities, financial data, and general KMRL services. You can also ask me to search multiple files for specific financial information. Could you please be more specific about what you'd like to know?";
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(async () => {
      const response = await generateResponse(text);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (suggestion: ChatSuggestion) => {
    if (suggestion.action === 'search_finances') {
      handleSendMessage("What is the total finance allocated for the project Metro A2 extension project in kochi?");
    } else if (suggestion.action === 'search_files') {
      handleSendMessage("Find engineering drawing files for tender XYZ");
    } else {
      handleSendMessage(suggestion.text);
    }
  };

  const ChatIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );

  const CloseIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  const SendIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Open chat"
      >
        {isOpen ? (
          <CloseIcon className="h-6 w-6" />
        ) : (
          <ChatIcon className="h-6 w-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 w-96 max-w-[90vw] bg-white rounded-lg shadow-2xl border border-gray-200 max-h-[70vh] flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <ChatIcon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-semibold">KMRL Assistant</h3>
                  <p className="text-xs text-blue-100">Online • Ready to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-blue-100 hover:text-white p-1"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-80 max-h-80">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'component' && !message.isUser ? (
                  <div className="w-full max-w-[85%]">
                    {(() => {
                      // Check if we have searchResults and this is a financial component
                      if (message.text === 'financial_component_with_data' && searchResults) {
                        return (
                          <FinancialSearchInline
                            searchResults={{
                              projectName: searchResults.projectData[0].projectName,
                              totalAllocated: searchResults.projectData[0].totalAllocated,
                              totalSpent: searchResults.projectData[0].totalSpent,
                              fileCount: searchResults.totalResults,
                              completionPercentage: (searchResults.projectData[0].totalSpent / searchResults.projectData[0].totalAllocated) * 100
                            }}
                          />
                        );
                      }
                      
                      // Check for file search component
                      if (message.text === 'file_search_component') {
                        return (
                          <FileSearchResultInline language="en" />
                        );
                      }
                      
                      // If no specific component match, show default text
                      return (
                        <div className="bg-gray-50 rounded-lg p-4 my-2">
                          <div className="text-gray-600">
                            Component not found or data unavailable.
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div
                    className={`max-w-[80%] rounded-lg p-3 text-sm ${
                      message.isUser
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-900 rounded-bl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                    <p className={`text-xs mt-1 ${
                      message.isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg rounded-bl-none p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="p-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-2">Quick questions:</p>
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleQuickReply(suggestion)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full transition-colors duration-200"
                  >
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isTyping}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SendIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Modal */}
      <SearchResultsModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        searchResults={searchResults}
      />
    </>
  );
};

export default Chatbot;