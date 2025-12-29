import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatSuggestion, SearchResults } from '../../types';
import { useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { FinancialSearchService } from '../../services/financialSearchService';
import SearchResultsModal from './modals/SearchResultsModal';
import {
  TrainScheduleInline,
  FleetStatusInline,
  ProjectUpdatesInline,
  StationInfoInline,
  SystemHealthInline,
  EmergencyProtocolsInline,
  TicketInfoInline,
  FileSearchResultInline,
  FinancialSearchInline
} from './InlineComponents';

// Speech Recognition type declarations
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'ml'>('en');
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();

  // Handle consultation data from ConsultOS
  useEffect(() => {
    const state = location.state as any;
    if (state?.consultationData) {
      console.log('Consultation started:', state);
      
      // Add initial consultation message
      const consultationMessage: ChatMessage = {
        id: Date.now().toString(),
        text: `**Consultation Started: ${state.title}**\n\n${state.prompt}\n\n---\n\n${JSON.stringify(state.consultationData, null, 2)}`,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, consultationMessage]);
      
      // Clear the state to prevent re-adding on re-render
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Auto-resize textarea function
  const autoResizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  };

  // Initialize welcome message and update when language changes
  useEffect(() => {
    const welcomeMessage = preferredLanguage === 'ml' 
      ? "ഹലോ! ഞാൻ നിങ്ങളുടെ കെഎംആർഎൽ സഹായിയാണ്. ട്രെയിൻ സമയക്രമം, പദ്ധതി വിവരങ്ങൾ, ഫ്ലീറ്റ് സ്ഥിതി, അടിയന്തിര പ്രോട്ടോക്കോളുകൾ എന്നിവയിൽ എനിക്ക് സഹായിക്കാൻ കഴിയും. ഇന്ന് എങ്ങനെ സഹായിക്കാം?"
      : "Hello! I'm your KMRL Assistant powered by AI. I can help you with train schedules, project information, fleet status, emergency protocols, and more. How can I assist you today?";
    
    setMessages([{
      id: '1',
      text: welcomeMessage,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }]);
  }, [preferredLanguage]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = preferredLanguage === 'ml' ? 'ml-IN' : 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = () => {
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setSpeechRecognition(recognition);
    }
  }, [preferredLanguage]);

  // Handle URL parameters for automatic actions
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const action = searchParams.get('action');
    
    if (action === 'search_finances') {
      // Wait for the welcome message to be set, then trigger financial search
      setTimeout(() => {
        const financialQuery = preferredLanguage === 'ml'
          ? 'കൊച്ചിയിലെ മെട്രോ എ2 എക്സ്റ്റൻഷൻ പ്രോജക്ടിന് അനുവദിച്ച മൊത്തം ധനസഹായം എത്രയാണ്?'
          : 'What is the total finance allocated for the project Metro A2 extension project in kochi?';
        
        // Add user message
        const userMessage = {
          id: Date.now().toString(),
          text: financialQuery,
          isUser: true,
          timestamp: new Date(),
          type: 'text' as const
        };
        setMessages(prev => [...prev, userMessage]);
        
        // Add typing indicator
        setIsTyping(true);
        
        // Generate response after delay
        setTimeout(async () => {
          try {
            const response = await generateResponse(financialQuery);
            const botMessage = {
              id: (Date.now() + 1).toString(),
              text: response.text,
              isUser: false,
              timestamp: new Date(),
              type: 'text' as const,
              images: response.images
            };
            setMessages(prev => [...prev, botMessage]);
            setIsTyping(false);
          } catch (error) {
            console.error('Error generating response:', error);
            setIsTyping(false);
          }
        }, 1000);
      }, 1000);
    }
  }, [location.search, preferredLanguage]);

  const quickSuggestions: ChatSuggestion[] = [
    { id: '1', text: 'File Search', action: 'fileSearch' },
    { id: '2', text: 'Financial Search', action: 'search_finances' },
    { id: '3', text: 'Train Schedule', action: 'schedule' },
    { id: '4', text: 'Fleet Status', action: 'fleet' },
    { id: '5', text: 'Project Updates', action: 'projects' },
    { id: '6', text: 'System Health', action: 'health' },
    { id: '7', text: 'Emergency Protocols', action: 'emergency' },
    { id: '8', text: 'Station Information', action: 'stations' },
    { id: '9', text: 'ട്രെയിൻ സമയം', action: 'schedule' },
    { id: '10', text: 'സ്റ്റേഷൻ വിവരങ്ങൾ', action: 'stations' },
    { id: '11', text: 'ടിക്കറ്റ് വിവരങ്ങൾ', action: 'ticket' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Reset textarea height when input is cleared
  useEffect(() => {
    if (!inputValue && textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
  }, [inputValue]);

  const generateResponse = async (userMessage: string): Promise<{ text: string; images?: string[] }> => {
    const message = userMessage.toLowerCase();
    
    // Check for financial queries first
    if (message.includes('finance') || message.includes('budget') || message.includes('allocation') || 
        message.includes('cost') || message.includes('spending') || message.includes('metro a2') ||
        (message.includes('total') && (message.includes('allocated') || message.includes('project')))) {
      
      try {
        const results = await FinancialSearchService.searchFinancialData(userMessage);
        setSearchResults(results);
        
        const project = results.projectData[0];
        const totalAllocatedCrores = project.totalAllocated / 100000000;
        const totalSpentCrores = project.totalSpent / 100000000;
        const spentPercentage = (project.totalSpent / project.totalAllocated) * 100;
        
        // Add a financial search inline component to the chat with search results
        setTimeout(() => {
          const searchMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            text: JSON.stringify({
              action: 'search_finances',
              searchResults: {
                projectName: project.projectName,
                totalAllocated: project.totalAllocated,
                totalSpent: project.totalSpent,
                fileCount: results.totalResults,
                completionPercentage: spentPercentage
              }
            }),
            isUser: false,
            timestamp: new Date(),
            type: 'component'
          };
          setMessages(prev => [...prev, searchMessage]);
        }, 500);
        
        const text = preferredLanguage === 'ml' 
          ? `# 💰 സാമ്പത്തിക വിവരങ്ങൾ

## 📊 ${project.projectName}

| വിവരങ്ങൾ | തുക | സ്റ്റാറ്റസ് |
|---------|-----|--------|
| മൊത്തം അനുവദിച്ചത് | ₹${totalAllocatedCrores.toFixed(0)} കോടി | 📈 അനുമോദിതം |
| ചെലവഴിച്ചത് | ₹${totalSpentCrores.toFixed(0)} കോടി | 💚 ${spentPercentage.toFixed(1)}% |
| ബാക്കി | ₹${((project.totalAllocated - project.totalSpent) / 100000000).toFixed(0)} കോടി | 📋 ലഭ്യം |

## 📑 സ്രോതസ്സുകൾ
${results.totalResults} ഫൈലുകൾ സ്കാൻ ചെയ്തു. വിശദമായ വിശകലനത്തിനും ഉറവിട ഉദ്ധരണികൾക്കും താഴെയുള്ള "വിശദാംശങ്ങൾ കാണുക" ക്ലിക്ക് ചെയ്യുക.`
          : `# 💰 Financial Information

## 📊 ${project.projectName}

| Details | Amount | Status |
|---------|--------|--------|
| Total Allocated | ₹${totalAllocatedCrores.toFixed(0)} Cr | 📈 Approved |
| Amount Spent | ₹${totalSpentCrores.toFixed(0)} Cr | 💚 ${spentPercentage.toFixed(1)}% |
| Remaining | ₹${((project.totalAllocated - project.totalSpent) / 100000000).toFixed(0)} Cr | 📋 Available |

## 📑 Sources
Searched through ${results.totalResults} financial documents. Click "View Details" below for comprehensive breakdown with source citations.`;
        
        return { text };
      } catch (error) {
        const text = preferredLanguage === 'ml'
          ? "സാമ്പത്തിക ഡാറ്റ തിരയുമ്പോൾ ഒരു പ്രശ്നം നേരിട്ടു. ദയവായി വീണ്ടും ശ്രമിക്കുക അല്ലെങ്കിൽ പ്രശ്നം തുടരുകയാണെങ്കിൽ സപ്പോർട്ടിനെ ബന്ധപ്പെടുക."
          : "I encountered an issue while searching for financial data. Please try again or contact support if the problem persists.";
        return { text };
      }
    }
    
    // Predefined multimodal responses for demo
    if (message.includes('fleet') || message.includes('status') || message.includes('സ്ഥിതി')) {
      const text = preferredLanguage === 'ml' 
        ? `# 🚇 നിലവിലെ ഫ്ലീറ്റ് സ്ഥിതി

## � സ്ഥിതിവിവരക്കണക്കുകൾ

| മെട്രിക് | മൂല്യം | സ്റ്റാറ്റസ് |
|---------|-------|--------|
| പ്രവർത്തനത്തിലുള്ള ട്രെയിനുകൾ | 18/20 | ✅ മികച്ചത് |
| അറ്റകുറ്റപ്പണിയിൽ | 2 | � ഷെഡ്യൂൾഡ് |
| മൊത്തം ലഭ്യത | 94.2% | 💚 ലക്ഷ്യത്തിനു മുകളിൽ |
| ആരോഗ്യ സ്കോർ | 92% | 💚 മികച്ചത് |

## 🚅 ട്രെയിൻ വിശദാംശങ്ങൾ

### ✅ പ്രവർത്തന സ്ഥിതി
- **സമയക്രമം**: എല്ലാ ട്രെയിനുകളും സമയനിഷ്ഠയോടെ
- **സുരക്ഷാ സംവിധാനങ്ങൾ**: 100% പ്രവർത്തനക്ഷമം
- **പാസഞ്ചർ കപ്പാസിറ്റി**: 975 പേർ/ട്രെയിൻ
- **എനർജി എഫിഷ്യൻസി**: 95% ഒപ്റ്റിമൽ

### 🔧 അറ്റകുറ്റപ്പണി വിവരങ്ങൾ
- **റൂട്ടീൻ മെയിന്റനൻസ്**: ട്രെയിൻ #07, #14
- **പ്രതീക്ഷിത പൂർത്തിയാകൽ**: നാളെ 06:00 AM
- **ബാക്കപ്പ് ട്രെയിനുകൾ**: സ്റ്റാൻഡ്‌ബൈയിൽ ലഭ്യം`
        : `# 🚇 Current Fleet Status

## � Key Metrics Dashboard

| Metric | Value | Status |
|--------|-------|--------|
| Operational Trains | 18/20 | ✅ Excellent |
| Under Maintenance | 2 | 🔧 Scheduled |
| Overall Availability | 94.2% | 💚 Above Target |
| Health Score | 92% | 💚 Excellent |

## 🚅 Train Details

### ✅ Operational Status
- **Schedule Performance**: All trains running on time
- **Safety Systems**: 100% functional across fleet
- **Passenger Capacity**: 975 persons per train
- **Energy Efficiency**: 95% optimal performance
- **Signal Systems**: 98.5% uptime

### 🔧 Maintenance Information
- **Routine Maintenance**: Train #07, #14
- **Expected Completion**: Tomorrow 06:00 AM
- **Backup Trains**: Available on standby
- **Next Scheduled**: Weekly maintenance cycle

### 📈 Performance Indicators
- **Network Uptime**: 99.7%
- **Power Systems**: 99.2% operational
- **Communication**: 97.8% optimal`;

      const images = [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      ];
      
      return { text, images };
    }

    if (message.includes('project') || message.includes('പദ്ധതി')) {
      const text = preferredLanguage === 'ml' 
        ? `# 🚧 പ്രോജക്ട് സ്ഥിതിവിവരം

## ✅ പൂർത്തിയായ പദ്ധതികൾ

### 🎯 ഘട്ടം 1 - പൂർണ്ണമായും പ്രവർത്തനക്ഷമം
- **22 സ്റ്റേഷനുകൾ** പൂർണ്ണമായും പ്രവർത്തിക്കുന്നു
- **ആലുവ മുതൽ കലൂർ** വരെ പൂർണ്ണ കണക്റ്റിവിറ്റി
- **99.5%** ഓൺ-ടൈം പെർഫോമൻസ്

### ♿ ആക്സസിബിലിറ്റി മെച്ചപ്പെടുത്തൽ
- എല്ലാ സ്റ്റേഷനുകളിലും **വീൽചെയർ ആക്സസ്**
- **ബ്രെയിലി സൈനേജ്** ഇൻസ്റ്റാൾ ചെയ്തു
- **ഓഡിയോ അനൗൺസ്മെന്റ്** സിസ്റ്റം

## 🔄 നടന്നുകൊണ്ടിരിക്കുന്ന പദ്ധതികൾ

### 🚇 ഘട്ടം 2 വിപുലീകരണം
- **പുരോഗതി**: 35% പൂർത്തിയായി
- **ടൈംലൈൻ**: 2026 ഡിസംബർ വരെ
- **പുതിയ സ്റ്റേഷനുകൾ**: 12 അധിക സ്റ്റേഷനുകൾ

### 💳 സ്മാർട്ട് ടിക്കറ്റിംഗ് സിസ്റ്റം
- **പുരോഗതി**: 75% പൂർത്തിയായി
- **ഫീച്ചറുകൾ**: UPI, മൊബൈൽ വാലറ്റ്, QR കോഡ്
- **ലോഞ്ച്**: 2025 നവംബർ

## 🔜 വരാനിരിക്കുന്ന പദ്ധതികൾ

### 🌱 സുസ്ഥിര ഇനിഷ്യേറ്റീവുകൾ
- **സോളാർ എനർജി**: സ്റ്റേഷൻ റൂഫ്‌ടോപ്പുകൾ
- **ഇലക്ട്രിക് ബസ് ഇന്റഗ്രേഷൻ**
- **കാർബൺ ന്യൂട്രൽ** ലക്ഷ്യം 2030

### 🤖 AI & സ്മാർട്ട് ഇൻഫ്രാസ്ട്രക്ചർ
- **പ്രെഡിക്റ്റീവ് മെയിന്റനൻസ്**
- **ഇന്റലിജന്റ് ട്രാഫിക് മാനേജ്മെന്റ്**
- **റിയൽ-ടൈം പാസഞ്ചർ ഇൻഫോ സിസ്റ്റം**`
        : `# 🚧 Project Status Dashboard

## ✅ Completed Projects

### 🎯 Phase 1 - Fully Operational
- **22 Stations** fully operational
- **Aluva to Kaloor** complete connectivity  
- **99.5%** on-time performance achieved
- **₹5,180 Crore** investment completed

### ♿ Accessibility Enhancement Initiative
- **Universal Design** implemented across network
- **Braille Signage** installed at all stations
- **Audio Announcement** systems active
- **Tactile Path Indicators** for visually impaired

## 🔄 Ongoing Projects

### 🚇 Phase 2 Network Extension
- **Progress**: 35% completed
- **Timeline**: December 2026 completion
- **New Stations**: 12 additional stations planned
- **Route**: Extension to Kakkanad & InfoPark
- **Budget**: ₹1,957 Crore allocated

### 💳 Smart Ticketing System Upgrade
- **Progress**: 75% completed  
- **Features**: UPI, Mobile Wallets, QR Codes
- **Launch**: November 2025
- **Benefits**: Contactless payments, faster boarding

### 🔧 Fleet Modernization Program
- **Progress**: 60% completed
- **Scope**: Advanced CBTC systems
- **Timeline**: Q2 2026

## 🔜 Upcoming Projects

### 🌱 Sustainability Initiatives
- **Solar Energy**: Rooftop installations (50MW target)
- **Electric Bus Integration**: Feeder service expansion
- **Carbon Neutral Goal**: Targeting 2030
- **Rainwater Harvesting**: All stations equipped

### 🤖 AI & Smart Infrastructure
- **Predictive Maintenance**: IoT sensor deployment
- **Intelligent Traffic Management**: ML-based optimization
- **Real-time Passenger Info**: Dynamic route planning
- **Digital Twin**: Virtual network modeling`;

      const images = [
        'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      ];
      
      return { text, images };
    }

    if (message.includes('schedule') || message.includes('time') || message.includes('സമയം')) {
      const text = preferredLanguage === 'ml' 
        ? `# 🕒 ട്രെയിൻ സമയക്രമം

## � സേവന സമയം

| വിശദാംശം | സമയം |
|---------|-------|
| **ആദ്യ ട്രെയിൻ** | 🌅 06:00 AM |
| **അവസാന ട്രെയിൻ** | 🌙 10:00 PM |
| **മൊത്തം സേവന സമയം** | ⏰ 16 മണിക്കൂർ |

## 🚅 ട്രെയിൻ ഫ്രീക്വൻസി

### ⚡ പീക്ക് അവേഴ്സ് (തിരക്കുള്ള സമയം)
- **സമയം**: 06:30-09:30 AM, 05:30-08:30 PM
- **ഫ്രീക്വൻസി**: **ഓരോ 4 മിനിറ്റിലും**
- **കപ്പാസിറ്റി**: 95% ലോഡ് ഫാക്ടർ

### 🚇 ഓഫ്-പീക്ക് അവേഴ്സ്
- **സമയം**: മറ്റെല്ലാ സമയങ്ങളിലും
- **ഫ്രീക്വൻസി**: **ഓരോ 8 മിനിറ്റിലും**
- **കപ്പാസിറ്റി**: 60% ശരാശരി ലോഡ്

## 🗺️ യാത്രാ സമയം ഗൈഡ്

### 📍 പ്രധാന റൂട്ടുകൾ

| ആരംഭം | അവസാനം | യാത്രാ സമയം | ദൂരം |
|-------|---------|------------|-------|
| ആലുവ | കലൂർ | 25 മിനിറ്റ് | 22 കിമി |
| എടപ്പള്ളി | എംജി റോഡ് | 15 മിനിറ്റ് | 12 കിമി |
| മഹാരാജാസ് | കച്ചേരിപ്പടി | 10 മിനിറ്റ് | 8 കിമി |
| എറണാകുളം സൗത്ത് | എറണാകുളം ജങ്ഷൻ | 3 മിനിറ്റ് | 2 കിമി |

## 📱 റിയൽ-ടൈം അപ്ഡേറ്റുകൾ

### 🔔 ലൈവ് ട്രാക്കിംഗ്
- **KMRL ഒഫീഷ്യൽ ആപ്പ്** വഴി
- **വെബ്സൈറ്റ്**: www.kochimetro.org
- **SMS അലർട്ടുകൾ**: 9656606060

### ⚠️ സേവന അലർട്ടുകൾ
- **പ്ലാൻഡ് മെയിന്റനൻസ്** അറിയിപ്പുകൾ
- **എമർജൻസി അപ്ഡേറ്റുകൾ**
- **വെതർ റിലേറ്റഡ് അഡ്ജസ്റ്റ്മെന്റുകൾ**`
        : `# 🕒 Train Schedule Guide

## � Service Operations

| Detail | Timing |
|--------|--------|
| **First Train** | 🌅 06:00 AM |
| **Last Train** | 🌙 10:00 PM |
| **Total Service Hours** | ⏰ 16 Hours Daily |
| **Days of Operation** | 🗓️ 365 Days/Year |

## 🚅 Train Frequency

### ⚡ Peak Hours (High Demand)
- **Timing**: 06:30-09:30 AM, 05:30-08:30 PM
- **Frequency**: **Every 4 minutes**
- **Capacity**: 95% load factor
- **Trains per Hour**: 15 trains

### 🚇 Off-Peak Hours  
- **Timing**: All other operating hours
- **Frequency**: **Every 8 minutes**
- **Capacity**: 60% average load
- **Trains per Hour**: 7-8 trains

## 🗺️ Journey Time Guide

### 📍 Major Route Segments

| From | To | Travel Time | Distance |
|------|----|-----------|---------|
| Aluva | Kaloor | 25 minutes | 22 km |
| Edappally | MG Road | 15 minutes | 12 km |
| Maharaja's | Kacheripady | 10 minutes | 8 km |
| Ernakulam South | Ernakulam Junction | 3 minutes | 2 km |

### 🎯 Popular Destinations
- **Airport to City Center**: 45 minutes (via feeder)
- **IT Parks**: Direct connectivity via Phase 2
- **Shopping Malls**: Lulu, Oberon covered

## 📱 Real-Time Information

### 🔔 Live Tracking Available
- **KMRL Official App**: Download from Play Store/App Store
- **Website**: www.kochimetro.org
- **SMS Alerts**: Text 'TRAIN' to 9656606060
- **Station Displays**: LED boards at all platforms

### ⚠️ Service Alerts & Updates
- **Planned Maintenance**: Advance notifications
- **Emergency Updates**: Immediate alerts
- **Weather Adjustments**: Monsoon protocols
- **Special Events**: Modified schedules`;

      const images = [
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      ];
      
      return { text, images };
    }

    if (message.includes('station') || message.includes('സ്റ്റേഷൻ')) {
      const text = preferredLanguage === 'ml' 
        ? `**സ്റ്റേഷൻ ശൃംഖല:**

🚉 **മൊത്തം സ്റ്റേഷനുകൾ:** 22

**പ്രധാന സ്റ്റേഷനുകൾ:**
🏢 **ആലുവ** - മെയിൻ ടെർമിനൽ
🏪 **ഇടപ്പള്ളി** - ഷോപ്പിംഗ് ഹബ്
🏛️ **എംജി റോഡ്** - ബിസിനസ് ഡിസ്ട്രിക്റ്റ്
🎓 **മഹാരാജാസ് കോളേജ്** - എജ്യുക്കേഷൻ ഹബ്

**സൗകര്യങ്ങൾ:**
• വീൽചെയർ ആക്സസ്
• ഡിജിറ്റൽ ഡിസ്പ്ലേകൾ
• CCTV നിരീക്ഷണം
• ക്ലീൻ ടോയ്ലറ്റുകൾ`
        : `**Station Network:**

🚉 **Total Stations:** 22

**Major Stations:**
🏢 **Aluva** - Main Terminal & Interchange
🏪 **Edappally** - Shopping Hub
🏛️ **MG Road** - Business District
🎓 **Maharaja's College** - Education Hub

**Facilities:**
• Wheelchair accessibility
• Digital information displays
• CCTV surveillance
• Clean restroom facilities
• Parking & feeder bus connectivity`;

      const images = [
        'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      ];
      
      return { text, images };
    }

    if (message.includes('ticket') || message.includes('fare') || message.includes('ടിക്കറ്റ്')) {
      const text = preferredLanguage === 'ml' 
        ? `**ടിക്കറ്റിംഗ് സിസ്റ്റം:**

💳 **പേയ്മെന്റ് ഓപ്ഷനുകൾ:**
• കൊച്ചി1 കാർഡ് (കോൺടാക്റ്റ്‌ലെസ്)
• മൊബൈൽ ആപ്പ് (ക്യുആർ കോഡ്)
• ടോക്കൺ ടിക്കറ്റുകൾ

💰 **നിരക്ക് ഘടന:**
• മിനിമം: ₹10 (2 കിലോമീറ്റർ വരെ)
• മാക്സിമം: ₹25 (25+ കിലോമീറ്റർ)
• പ്രതിദിന പാസ്: ₹80
• മാസിക പാസ്: ₹1,200

🎯 **സ്മാർട്ട് ഫീച്ചറുകൾ:**
• ഓട്ടോ റീചാർജ്
• ട്രാവൽ ഹിസ്റ്ററി
• ഡിസ്കൗണ്ട് കൂപ്പണുകൾ`
        : `**Ticketing System:**

💳 **Payment Options:**
• Kochi1 Card (Contactless)
• Mobile App (QR Code)
• Token Tickets
• UPI & Digital Wallets

💰 **Fare Structure:**
• Minimum: ₹10 (up to 2 km)
• Maximum: ₹25 (25+ km)
• Day Pass: ₹80
• Monthly Pass: ₹1,200

🎯 **Smart Features:**
• Auto-recharge facility
• Travel history tracking
• Discount coupons & offers
• Group booking discounts`;

      const images = [
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      ];
      
      return { text, images };
    }

    if (message.includes('emergency') || message.includes('alert') || message.includes('അടിയന്തിര')) {
      const text = preferredLanguage === 'ml' 
        ? `**അടിയന്തിര പ്രോട്ടോക്കോൾ:**

🚨 **24/7 സേവനങ്ങൾ:**
• കൺട്രോൾ റൂം: 0484-2341234
• അടിയന്തിര ബട്ടൺ എല്ലാ ട്രെയിനുകളിലും
• CCTV മോണിറ്ററിംഗ്

🏥 **സുരക്ഷാ സൗകര്യങ്ങൾ:**
• ഫസ്റ്റ് എയ്ഡ് കിറ്റ്
• അഗ്നിശമന ഉപകരണങ്ങൾ
• എമർജൻസി എക്സിറ്റുകൾ

⚡ **പവർ ബാക്കപ്പ്:**
• UPS സിസ്റ്റം എല്ലാ സ്റ്റേഷനുകളിലും
• ജനറേറ്റർ ബാക്കപ്പ്`
        : `**Emergency Protocols:**

🚨 **24/7 Emergency Services:**
• Control Room: 0484-2341234
• Emergency buttons in all trains
• CCTV monitoring systems
• Security personnel deployment

🏥 **Safety Features:**
• First aid kits in stations
• Fire safety equipment
• Emergency evacuation routes
• Medical assistance coordination

⚡ **Power Backup:**
• UPS systems in all stations
• Generator backup for critical systems
• Emergency lighting throughout network`;

      const images = [
        'https://images.unsplash.com/photo-1582139329536-e7284fece509?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1504297050568-910d24c426d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      ];
      
      return { text, images };
    }

    if (message.includes('document') || message.includes('report') || message.includes('ഡോക്യുമെന്റ്')) {
      const text = preferredLanguage === 'ml' 
        ? `**പ്രധാന ഡോക്യുമെന്റുകൾ:**

📋 **പ്രവർത്തന റിപ്പോർട്ടുകൾ:**
• മാസിക പ്രകടന റിപ്പോർട്ട്
• വാർഷിക സാമ്പത്തിക പ്രസ്താവന
• സുരക്ഷാ ഓഡിറ്റ് റിപ്പോർട്ട്

📊 **ഡാറ്റ ആൻഡ് അനലിറ്റിക്സ്:**
• പാസഞ്ചർ ട്രാഫിക് ഡാറ്റ
• എനർജി കൺസംപ്ഷൻ റിപ്പോർട്ട്
• പെർഫോമൻസ് മെട്രിക്സ്

🗃️ **നയ ഡോക്യുമെന്റുകൾ:**
• സുരക്ഷാ മാർഗ്ഗനിർദ്ദേശങ്ങൾ
• പാരിസ്ഥിതിക നയം
• കസ്റ്റമർ സർവീസ് സ്റ്റാൻഡേർഡുകൾ`
        : `**Key Documents Available:**

📋 **Operational Reports:**
• Monthly Performance Reports
• Annual Financial Statements
• Safety Audit Reports
• Maintenance Schedules

📊 **Data & Analytics:**
• Passenger Traffic Data
• Energy Consumption Reports
• Performance Metrics Dashboard
• Revenue Analysis

🗃️ **Policy Documents:**
• Safety Guidelines & SOPs
• Environmental Policy
• Customer Service Standards
• Technical Specifications`;

      const images = [
        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
      ];
      
      return { text, images };
    }

    // Default response for unrecognized queries
    const text = preferredLanguage === 'ml' 
      ? `**ഡെമോ മൾട്ടിമോഡൽ RAG ജനറേറ്റർ UI ചാറ്റ്ബോട്**

ഇത് ഒരു ഡെമോൺസ്ട്രേഷൻ മാത്രമാണ്. എനിക്ക് ഇവയെക്കുറിച്ച് സഹായിക്കാൻ കഴിയും:

• **ഫ്ലീറ്റ് സ്റ്റാറ്റസ്** - ട്രെയിൻ വിവരങ്ങൾ
• **പ്രോജക്ട് അപ്ഡേറ്റുകൾ** - നിർമ്മാണ പുരോഗതി
• **ട്രെയിൻ സമയക്രമം** - സേവന സമയം
• **സ്റ്റേഷൻ വിവരങ്ങൾ** - സൗകര്യങ്ങൾ
• **ടിക്കറ്റിംഗ്** - നിരക്കുകൾ & പേയ്മെന്റ്
• **അടിയന്തിര പ്രോട്ടോക്കോൾ** - സുരക്ഷാ വിവരങ്ങൾ
• **ഡോക്യുമെന്റുകൾ** - റിപ്പോർട്ടുകൾ & നയങ്ങൾ

🔧 **മറ്റ് ചോദ്യങ്ങൾക്ക് സെർവർ സ്റ്റാർട്ട് ചെയ്യണം.**`
      : `**Demo Multimodal RAG Generator UI Chatbot**

This is a demonstration interface. I can help you with:

• **Fleet Status** - Train information & health
• **Project Updates** - Construction progress  
• **Train Schedule** - Service timings
• **Station Info** - Facilities & amenities
• **Ticketing** - Fares & payment options
• **Emergency Protocols** - Safety information
• **Documents** - Reports & policies

🔧 **For other queries, we need to start the server.**

Try asking about any of the topics above to see multimodal responses with relevant images and detailed information!`;

    return { text };
  };

  const startListening = () => {
    if (speechRecognition && !isListening && !isTyping) {
      speechRecognition.lang = preferredLanguage === 'ml' ? 'ml-IN' : 'en-US';
      speechRecognition.start();
    }
  };

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      // Demo message for all typed queries
      const demoMessage = preferredLanguage === 'ml'
        ? "ഇത് കെഎംആർഎൽ മെട്രോ റെയിൽ ലിമിറ്റഡിനായി വികസിപ്പിച്ച RAG സിസ്റ്റത്തിന്റെ ഡെമോയാണ്. നേരിട്ടുള്ള അനുഭവം നൽകാൻ, മുകളിൽ 👆 'ക്വിക്ക് ആക്ഷൻസ്' നൽകിയിട്ടുണ്ട്. പൂർണ്ണമായി വികസിപ്പിച്ചാൽ സിസ്റ്റം എങ്ങനെ പ്രവർത്തിക്കുമെന്ന് കാണാൻ അവ പരീക്ഷിക്കുക."
        : "This is a demo of the RAG system developed for KMRL Metro Rail Limited. To give you a hands-on experience, we've provided 'Quick Actions' at the top 👆. Try them out to see how the system will function once fully developed.";
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: demoMessage,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickReply = (suggestion: ChatSuggestion) => {
    // Generate realistic user queries based on action type
    let userMessageText = suggestion.text;
    
    switch (suggestion.action) {
      case 'fileSearch':
        userMessageText = 'I need the engineering drawing from the tender xyz which was drafted on 30th November 2024';
        break;
      case 'search_finances':
        userMessageText = preferredLanguage === 'ml'
          ? 'കൊച്ചിയിലെ മെട്രോ എ2 എക്സ്റ്റൻഷൻ പ്രോജക്ടിന് അനുവദിച്ച മൊത്തം ധനസഹായം എത്രയാണ്?'
          : 'What is the total finance allocated for the project Metro A2 extension project in kochi?';
        break;
      case 'schedule':
        userMessageText = preferredLanguage === 'ml' 
          ? 'ആലുവയിൽ നിന്ന് ആദ്യത്തെ ട്രെയിൻ എപ്പോഴാണ് പുറപ്പെടുന്നത്? തിരക്കുള്ള സമയങ്ങളിൽ ട്രെയിനുകൾ എത്ര സമയത്തിലൊരിക്കലാണ് ലഭ്യമാകുന്നത്?'
          : 'What time does the first train start from Aluva? How frequently do trains run during peak hours?';
        break;
      case 'fleet':
        userMessageText = preferredLanguage === 'ml'
          ? 'നിലവിൽ എത്ര ട്രെയിനുകൾ പ്രവർത്തിക്കുന്നു? ഫ്ലീറ്റിന്റെ മൊത്തത്തിലുള്ള ആരോഗ്യ സ്ഥിതി എന്താണ്?'
          : 'How many trains are currently operational? What is the overall health status of the fleet?';
        break;
      case 'projects':
        userMessageText = preferredLanguage === 'ml'
          ? 'ഫേസ് 2 എക്സ്റ്റൻഷൻ പ്രോജക്ട് എത്രത്തോളം പുരോഗമിച്ചു? നടന്നുകൊണ്ടിരിക്കുന്ന പ്രധാന പദ്ധതികൾ ഏതാണ്?'
          : 'What is the progress on Phase 2 extension project? What are the major ongoing projects?';
        break;
      case 'health':
        userMessageText = preferredLanguage === 'ml'
          ? 'സിസ്റ്റത്തിന്റെ നിലവിലെ ആരോഗ്യ സ്ഥിതി എന്താണ്? എല്ലാ സംവിധാനങ്ങളും ശരിയായി പ്രവർത്തിക്കുന്നുണ്ടോ?'
          : 'What is the current health status of all systems? Are all operations running smoothly?';
        break;
      case 'emergency':
        userMessageText = preferredLanguage === 'ml'
          ? 'അടിയന്തിര സാഹചര്യത്തിൽ ഞാൻ എന്താണ് ചെയ്യേണ്ടത്? ഹെൽപ്‌ലൈൻ നമ്പർ എന്താണ്?'
          : 'What should I do in case of an emergency? What is the helpline number?';
        break;
      case 'stations':
        userMessageText = preferredLanguage === 'ml'
          ? 'എംജി റോഡ് സ്റ്റേഷനിൽ എന്തൊക്കെ സൗകര്യങ്ങളാണ് ലഭ്യമായത്? മൊത്തം എത്ര സ്റ്റേഷനുകളാണുള്ളത്?'
          : 'What facilities are available at MG Road station? How many stations are there in total?';
        break;
      case 'ticket':
        userMessageText = preferredLanguage === 'ml'
          ? 'ആലുവ മുതൽ എറണാകുളം വരെയുള്ള ടിക്കറ്റ് നിരക്ക് എത്രയാണ്? മാസിക പാസിന് എത്രയാണ് ചിലവ്?'
          : 'What is the ticket fare from Aluva to Ernakulam? How much does a monthly pass cost?';
        break;
      default:
        // Keep original text for any unknown action
        break;
    }

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: userMessageText,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Special delay for file search to make it feel realistic (3-4 seconds)
    const delay = suggestion.action === 'fileSearch' ? 3500 : 500;

    // After delay, show the component message
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: suggestion.action, // Store action type in text field
        isUser: false,
        timestamp: new Date(),
        type: 'component' // Mark as component type
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, delay);
  };

  const SendIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );

  const BotIcon = ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  // Render inline component based on action type
  const renderInlineComponent = (actionData: string) => {
    const componentProps = { language: preferredLanguage };
    
    try {
      // Try to parse as JSON first (for components with data)
      const parsed = JSON.parse(actionData);
      if (parsed.action === 'search_finances') {
        return <FinancialSearchInline 
          searchResults={parsed.searchResults}
        />;
      }
    } catch {
      // Fall back to simple string-based matching
      switch (actionData) {
        case 'schedule':
          return <TrainScheduleInline {...componentProps} />;
        case 'fleet':
          return <FleetStatusInline {...componentProps} />;
        case 'projects':
          return <ProjectUpdatesInline {...componentProps} />;
        case 'health':
          return <SystemHealthInline {...componentProps} />;
        case 'emergency':
          return <EmergencyProtocolsInline {...componentProps} />;
        case 'stations':
          return <StationInfoInline {...componentProps} />;
        case 'ticket':
          return <TicketInfoInline {...componentProps} />;
        case 'fileSearch':
          return <FileSearchResultInline {...componentProps} />;
        case 'search_finances':
          return <FinancialSearchInline 
            searchResults={searchResults ? {
              projectName: searchResults.projectData[0].projectName,
              totalAllocated: searchResults.projectData[0].totalAllocated,
              totalSpent: searchResults.projectData[0].totalSpent,
              fileCount: searchResults.totalResults,
              completionPercentage: (searchResults.projectData[0].totalSpent / searchResults.projectData[0].totalAllocated) * 100
            } : undefined}
          />;
        default:
          return null;
      }
    }
    
    return null;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <BotIcon className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">KMRL Assistant</h1>
            <p className="text-sm text-gray-500">AI-powered support for all your metro queries</p>
          </div>
        </div>
      </div>

      {/* Quick Suggestions */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">Quick Actions:</p>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Language:</span>
            <button
              onClick={() => setPreferredLanguage('en')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                preferredLanguage === 'en'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setPreferredLanguage('ml')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                preferredLanguage === 'ml'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              മലയാളം
            </button>
            {/* Debug: Test API button */}
            <button
              onClick={async () => {
                console.log('Testing Gemini API...');
                try {
                  const result = await generateResponse('test');
                  console.log('API Test Success:', result);
                  alert('API working! Check console for details.');
                } catch (error) {
                  console.error('API Test Failed:', error);
                  alert('API test failed. Check console for details.');
                }
              }}
              className="px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              title="Test Gemini API Connection"
            >
              🔧
            </button>
            {/* Debug: Test Financial Search button */}
            <button
              onClick={async () => {
                console.log('Testing Financial Search...');
                const userMessage: ChatMessage = {
                  id: Date.now().toString(),
                  text: 'What is the total finance allocated for the project Metro A2 extension project in kochi?',
                  isUser: true,
                  timestamp: new Date()
                };
                
                setMessages(prev => [...prev, userMessage]);
                
                // Add the financial search component message with correct format
                const componentMessage: ChatMessage = {
                  id: (Date.now() + 1).toString(),
                  text: JSON.stringify({
                    action: 'search_finances',
                    searchResults: {
                      projectName: 'Metro A2 Extension Project',
                      totalAllocated: 245000000000, // 2450 crores in paisa
                      totalSpent: 85600000000, // 856 crores in paisa
                      fileCount: 15,
                      completionPercentage: 35
                    }
                  }),
                  isUser: false,
                  timestamp: new Date(),
                  type: 'component'
                };
                
                setMessages(prev => [...prev, componentMessage]);
                console.log('Financial search component added:', componentMessage);
              }}
              className="px-2 py-1 text-xs bg-teal-100 text-teal-600 rounded hover:bg-teal-200"
              title="Test Financial Search Component"
            >
              💰
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickSuggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleQuickReply(suggestion)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-full text-gray-700 bg-white hover:bg-primary hover:text-white hover:border-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              {suggestion.text}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4" style={{ paddingBottom: '120px' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-3xl ${message.isUser ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
              <div className="flex-shrink-0">
                {message.isUser ? (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">U</span>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <BotIcon className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
              <div className={`flex-1 ${message.isUser ? 'mr-3' : 'ml-3'}`}>
                {message.type === 'component' && !message.isUser ? (
                  // Render inline component
                  <div className="max-w-4xl">
                    {renderInlineComponent(message.text)}
                    <p className="text-xs text-gray-500 mt-2 text-left">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ) : (
                  <>
                    <div
                      className={`px-4 py-3 rounded-lg ${
                        message.isUser
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <div className="text-sm leading-relaxed prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            // Custom styling for markdown elements
                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold mb-2 text-gray-900" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-base font-bold mb-2 text-gray-800" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-sm font-bold mb-1 text-gray-700" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                            li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                            em: ({ node, ...props }) => <em className="italic" {...props} />,
                            code: ({ node, ...props }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono" {...props} />,
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      </div>
                      
                      {/* Render images if available */}
                      {message.images && message.images.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {message.images.map((imageUrl, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={imageUrl}
                                alt={`Related to ${message.text.slice(0, 50)}...`}
                                className="w-full max-w-sm rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                                onClick={() => window.open(imageUrl, '_blank')}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <p className={`text-xs text-gray-500 mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex max-w-3xl items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <BotIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg rounded-bl-sm shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 fixed bottom-0 left-0 right-0 z-20 md:left-72">
        <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex space-x-3 max-w-full">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                autoResizeTextarea();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              onInput={autoResizeTextarea}
              placeholder={preferredLanguage === 'ml' 
                ? "ഇംഗ്ലീഷിലോ മലയാളത്തിലോ നിങ്ങളുടെ സന്ദേശം ടൈപ്പ് ചെയ്യുക... (പുതിയ ലൈനിനായി Shift+Enter അമർത്തുക)"
                : "Type your message in English or Malayalam... (Press Shift+Enter for new line)"
              }
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm min-h-[48px]"
              rows={1}
              disabled={isTyping}
              lang="en,ml"
              dir="auto"
              style={{
                fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans", "Noto Sans Malayalam", Arial, sans-serif',
                lineHeight: '1.5',
                maxHeight: '200px',
                overflowY: inputValue.split('\n').length > 8 ? 'auto' : 'hidden'
              }}
            />
            {/* Speech-to-text button */}
            {speechRecognition && (
              <button
                type="button"
                onClick={startListening}
                disabled={isListening || isTyping}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors ${
                  isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'bg-gray-100 text-gray-600 hover:bg-primary hover:text-white'
                } disabled:opacity-50`}
                title={isListening ? 'Listening...' : 'Click to speak'}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <SendIcon className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Search Results Modal */}
      <SearchResultsModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        searchResults={searchResults}
      />
    </div>
  );
};

export default ChatbotPage;