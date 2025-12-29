import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import apiService from '../../services/api';
import {
  ArrowLeft,
  Brain,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  Target,
  DollarSign,
  Users,
  Send,
  Loader2,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface IntelligenceSection {
  id: string;
  title: string;
  icon: any;
  content: string[];
  isExpanded: boolean;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SmartQuestion {
  id: string;
  question: string;
  isAnswered: boolean;
  answer?: string;
}

interface ConsultationData {
  status: 'scheduled' | 'completed';
  itemsRequired: string;
  outputText: string;
}

export default function FullConsultationPage() {
  const { tenderId } = useParams<{ tenderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Get data from navigation state if available
  const locationState = location.state as any;
  
  // Try to get title from location state or localStorage
  const getTenderName = () => {
    if (locationState?.title) {
      return locationState.title;
    }
    const storedData = localStorage.getItem('currentConsultation');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        return parsed.title || 'Supply & Installation of 11KV Underground Cables for Metro Phase-II';
      } catch (error) {
        console.error('Error parsing title from localStorage:', error);
      }
    }
    return 'Supply & Installation of 11KV Underground Cables for Metro Phase-II';
  };
  
  const [tenderName] = useState(getTenderName());
  const [tenderDomain] = useState('Metro Infrastructure');
  
  const [consultationData, setConsultationData] = useState<ConsultationData>({
    status: 'scheduled',
    itemsRequired: '',
    outputText: ''
  });
  
  // Parse consultation data from API if available
  const parseConsultationData = () => {
    // First, try to get data from location state
    let apiData = locationState?.consultationData;
    let fromAPI = locationState?.fromAPI;
    
    // If not in location state, check localStorage
    if (!apiData || !fromAPI) {
      const storedData = localStorage.getItem('currentConsultation');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          apiData = parsed.consultationData;
          fromAPI = parsed.fromAPI;
          console.log('Retrieved consultation data from localStorage:', parsed);
        } catch (error) {
          console.error('Error parsing localStorage consultation data:', error);
        }
      }
    }
    
    if (fromAPI && apiData) {
      console.log('Parsing API consultation data:', apiData);
      
      // Handle status object format: [{status, consultant_role, scope, available_information}]
      if (Array.isArray(apiData) && apiData.length > 0 && apiData[0].status) {
        const statusInfo = apiData[0];
        console.log('Status info detected:', statusInfo);
        // Return null to use default sections, but update the initial message
        return null;
      }
      
      // Handle the new response format which is directly an array of {title, content} objects
      if (Array.isArray(apiData)) {
        return apiData.map((section: any, index: number) => {
          // Assign icons based on title or index
          let icon = Users; // default icon
          const titleLower = (section.title || '').toLowerCase();
          
          if (titleLower.includes('requirement') || titleLower.includes('overview')) {
            icon = Target;
          } else if (titleLower.includes('problem') || titleLower.includes('risk') || titleLower.includes('understanding')) {
            icon = AlertTriangle;
          } else if (titleLower.includes('technical') || titleLower.includes('guidance') || titleLower.includes('specification')) {
            icon = CheckCircle2;
          } else if (titleLower.includes('pricing') || titleLower.includes('cost') || titleLower.includes('market')) {
            icon = DollarSign;
          } else if (titleLower.includes('consultant') || titleLower.includes('vendor') || titleLower.includes('intelligence')) {
            icon = Users;
          }
          
          return {
            id: section.title?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') || `section-${index}`,
            title: section.title || 'Untitled Section',
            icon: icon,
            isExpanded: index < 2, // First two sections expanded by default
            content: Array.isArray(section.content) ? section.content : []
          };
        });
      }
      
      // If data has a sections property (legacy format)
      if (apiData.sections && Array.isArray(apiData.sections)) {
        return apiData.sections.map((section: any, index: number) => {
          let icon = Users;
          const titleLower = (section.title || '').toLowerCase();
          
          if (titleLower.includes('requirement') || titleLower.includes('overview')) {
            icon = Target;
          } else if (titleLower.includes('problem') || titleLower.includes('risk')) {
            icon = AlertTriangle;
          } else if (titleLower.includes('technical') || titleLower.includes('guidance')) {
            icon = CheckCircle2;
          } else if (titleLower.includes('pricing') || titleLower.includes('cost')) {
            icon = DollarSign;
          } else if (titleLower.includes('consultant') || titleLower.includes('vendor')) {
            icon = Users;
          }
          
          return {
            id: section.title?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and') || `section-${index}`,
            title: section.title || 'Untitled Section',
            icon: icon,
            isExpanded: index < 2,
            content: Array.isArray(section.content) ? section.content : []
          };
        });
      }
    }
    
    // Return default data if no API data available
    return null;
  };
  
  const apiSections = parseConsultationData();
  
  const [intelligenceSections, setIntelligenceSections] = useState<IntelligenceSection[]>(apiSections || [
    {
      id: 'overview',
      title: 'Requirement Domain Overview',
      icon: Target,
      isExpanded: true,
      content: [
        '**Project Scope:** Design, Supply, Installation, Commissioning, and Maintenance of a Tier-III compliant On-Premise High-Performance Data Center (HPDC) for an educational institution.',
        '**Data Volume & Growth:** Baseline capacity of 100 TB usable storage to accommodate an annual accumulation of 20 TB, with a scalable architecture to support 5-year growth projections (approx. 200 TB+).',
        '**Core Objectives:** Maximum redundancy (N+N), ultra-low latency networking, high energy efficiency (PUE < 1.5), and seamless integration with heterogeneous academic/research technologies.',
        '**Vendor Preference:** Strong mandate for \'Make in India\' (Class-I Local Suppliers) for server/compute infrastructure, ensuring compliance with DPIIT Public Procurement Orders.',
        '**Service Level:** Premium Enterprise Support with <2 hour response time and 24x7 onsite availability.'
      ]
    },
    {
      id: 'problems',
      title: 'Problem Understanding',
      icon: AlertTriangle,
      isExpanded: true,
      content: [
        '**Scalability Challenge:** The accumulation of 20 TB/year implies heavy research data, multimedia content, or VDI logs. The architecture must support \'Scale-Out\' storage (adding nodes) rather than just \'Scale-Up\' to prevent performance bottlenecks.',
        '**Latency Sensitivity:** Academic environments often run HPC (High-Performance Computing) workloads or VDI (Virtual Desktop Infrastructure). High latency will degrade user experience. This necessitates a Spine-Leaf network topology with 25G/100G throughput.',
        '**Resilience Requirement:** \'Most backup\' implies a need for a robust Business Continuity Plan (BCP). This requires local snapshots, local backup appliances, and an off-site Disaster Recovery (DR) strategy (Cloud or secondary campus).',
        '**Sovereignty & Support:** The requirement for Indian OEMs and fast contact efficacy addresses supply chain risks and ensures that support escalation does not get routed through global call centers, minimizing downtime resolution.'
      ]
    },
    {
      id: 'technical',
      title: 'Technical Guidance',
      icon: CheckCircle2,
      isExpanded: false,
      content: [
        '**Data Center Standards:** Design must adhere to TIA-942 Rated-3 (Tier III) standards, ensuring Concurrent Maintainability (99.982% uptime).',
        '**Compute Infrastructure (Indian OEM Mandate):** Specs: Rack-mount servers, Dual Intel Xeon Scalable (Gold/Platinum) or AMD EPYC processors, minimum 512GB RAM per node. Preferred OEMs: Netweb Technologies, ESDS, or Global OEMs with confirmed manufacturing plants in India (Dell India, Cisco India) qualifying as Class-I suppliers.',
        '**Storage Architecture - Primary:** All-Flash NVMe Storage Array for low latency (IOPS > 300,000) for active workloads.',
        '**Storage Architecture - Secondary:** Object Storage (S3 compatible) for the 20TB/year archival data with deduplication and compression ratios of at least 3:1.',
        '**Storage Architecture - Backup:** Disk-to-Disk-to-Tape (LTO-9) or Immutable Cloud Backup to protect against ransomware.',
        '**Networking - Core:** 100GbE Spine switches.',
        '**Networking - Access:** 10/25GbE Leaf switches with SDN (Software Defined Networking) capabilities for integration flexibility.',
        '**Power & Cooling - UPS:** Modular UPS with N+N redundancy and Li-Ion batteries for faster recharge and longer life.',
        '**Power & Cooling - Cooling:** In-Row Precision Air Conditioning (PAC) with Hot/Cold Aisle Containment to optimize PUE.',
        '**Integration:** Hyper-Converged Infrastructure (HCI) software stack (e.g., VMware vSphere, Nutanix, or OpenStack) to manage compute, storage, and networking from a single dashboard.'
      ]
    },
    {
      id: 'pricing',
      title: 'Market Pricing & Cost Benchmarks',
      icon: DollarSign,
      isExpanded: false,
      content: [
        '**Capital Expenditure (CAPEX) - High-End Compute (Indian OEM):** Premium of 10-15% over grey-market imports but includes better warranty/support.',
        '**Capital Expenditure (CAPEX) - All-Flash Storage:** High initial cost, justified by performance and longevity.',
        '**Capital Expenditure (CAPEX) - Civil/Electrical:** Significant investment in raised flooring, fire suppression (NOVEC 1230), and biometric security.',
        '**Operational Expenditure (OPEX) - AMC:** Post-warranty Annual Maintenance Contracts usually cost 15-20% of hardware CAPEX per year.',
        '**Operational Expenditure (OPEX) - Power:** Efficiency measures (In-row cooling, containment) can reduce power bills by 30% compared to traditional room cooling.',
        '**Budget Strategy:** Since cost is not a primary constraint, allocate 15% of the budget specifically for \'Professional Services\' (implementation, migration, and training) to ensure the \'efficiency\' goal is met.'
      ]
    },
    {
      id: 'consultant',
      title: 'Consultant Intelligence',
      icon: Users,
      isExpanded: false,
      content: [
        '**Evaluation Criteria (QCBS):** Adopt Quality-Cum-Cost Based Selection (70% Technical, 30% Commercial). Give extra weightage to bidders offering Indian Manufactured products (PMI Preference).',
        '**SLA & Penalty Clauses - Response Time:** 15 minutes for Critical Severity (P1), 2 hours onsite arrival.',
        '**SLA & Penalty Clauses - Resolution Time:** 6 hours for hardware replacement.',
        '**SLA & Penalty Clauses - Penalty:** 1% of contract value for every 1% drop below 99.982% uptime, capped at 10%.',
        '**Vendor Qualification:** Bidder must be an ISO 27001 (Security) and ISO 9001 certified entity. The OEM must have a local spare parts depot within 50km of the college or guarantee 4-hour part delivery.',
        '**Risk Mitigation:** Include a clause for \'Escalation Matrix\' requiring direct access to the OEM\'s L3 engineering team, bypassing L1 helpdesk, to satisfy the \'fast contact efficacy\' requirement.',
        '**Future Proofing:** Require the system to support Containerization (Kubernetes) and AI/ML workloads (GPU expansion slots) to handle future academic technologies.'
      ]
    }
  ]);

  const [smartQuestions] = useState<SmartQuestion[]>([
    {
      id: 'q1',
      question: 'What is the total cable length required for this project?',
      isAnswered: false
    },
    {
      id: 'q2',
      question: 'Are there specific cable route alignment drawings available?',
      isAnswered: false
    },
    {
      id: 'q3',
      question: 'What is the expected load current and future expansion plans?',
      isAnswered: false
    },
    {
      id: 'q4',
      question: 'Have soil resistivity tests been conducted along the route?',
      isAnswered: false
    },
    {
      id: 'q5',
      question: 'What are the warranty and AMC requirements post-commissioning?',
      isAnswered: false
    }
  ]);

  // Get initial message based on API data
  const getInitialMessage = () => {
    let apiData = locationState?.consultationData;
    if (!apiData) {
      const storedData = localStorage.getItem('currentConsultation');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          apiData = parsed.consultationData;
        } catch (error) {
          console.error('Error parsing localStorage for initial message:', error);
        }
      }
    }

    // If we have status info from API, show it
    if (Array.isArray(apiData) && apiData.length > 0 && apiData[0].status) {
      const statusInfo = apiData[0];
      let content = `**Status:** ${statusInfo.status}\n\n`;
      
      if (statusInfo.consultant_role) {
        content += `**Consultant Role:** ${statusInfo.consultant_role}\n\n`;
      }
      
      if (statusInfo.scope) {
        content += `**Project Scope:** ${statusInfo.scope}\n\n`;
      }
      
      if (statusInfo.available_information && Array.isArray(statusInfo.available_information)) {
        content += `**Available Information:**\n`;
        statusInfo.available_information.forEach((info: string) => {
          content += `✓ ${info}\n`;
        });
      }
      
      content += `\n\nI'm ready to assist you with this tender. Feel free to ask any questions!`;
      return content;
    }

    // Default message
    return `Hello! I'm your AI Tender Consultant. I've analyzed the tender "${tenderName}" and prepared comprehensive domain intelligence on the left panel.\n\nI can help you with:\n✓ Understanding technical specifications\n✓ Risk assessment and mitigation strategies\n✓ Cost benchmarking and price analysis\n✓ Vendor qualification criteria\n✓ Compliance and standard requirements\n\nFeel free to ask any questions about this tender!`;
  };

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: getInitialMessage(),
      timestamp: new Date()
    }
  ]);

  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleSection = (sectionId: string) => {
    setIntelligenceSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, isExpanded: !section.isExpanded }
          : section
      )
    );
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsTyping(true);

    try {
      // Call the consult-chat API
      console.log('Sending message to consult-chat:', currentInput);
      const response = await apiService.consultChat(currentInput);
      
      console.log('Consult chat API response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'null');
      
      // Extract response content
      let responseContent = 'I apologize, but I could not generate a response at this time.';
      
      if (response && response.success !== false) {
        // Handle the specific structure: { answer: "[{\"response\": \"...\" or \"answer\": \"...\"}]" }
        try {
          // First, check if response.answer is a JSON string that needs parsing
          if (response.answer && typeof response.answer === 'string') {
            console.log('Parsing response.answer as JSON string');
            const parsed = JSON.parse(response.answer);
            console.log('Parsed answer:', parsed);
            
            if (Array.isArray(parsed) && parsed.length > 0) {
              const firstItem = parsed[0];
              console.log('First item in parsed array:', firstItem);
              
              // Check for various possible response fields
              if (firstItem.response) {
                responseContent = firstItem.response;
              } else if (firstItem.answer) {
                responseContent = firstItem.answer;
              } else if (firstItem.content) {
                responseContent = firstItem.content;
              } else if (firstItem.text) {
                responseContent = firstItem.text;
              } else if (firstItem.message) {
                responseContent = firstItem.message;
              } else {
                // If it's a status object, convert it to readable text
                console.log('Converting status object to text');
                let statusText = '';
                Object.entries(firstItem).forEach(([key, value]) => {
                  if (Array.isArray(value)) {
                    statusText += `**${key}:**\n`;
                    value.forEach((item: any) => {
                      statusText += `• ${item}\n`;
                    });
                    statusText += '\n';
                  } else {
                    statusText += `**${key}:** ${value}\n`;
                  }
                });
                if (statusText) {
                  responseContent = statusText;
                }
              }
            } else if (typeof parsed === 'string') {
              responseContent = parsed;
            }
          } else if (response.data?.answer && typeof response.data.answer === 'string') {
            console.log('Parsing response.data.answer as JSON string');
            const parsed = JSON.parse(response.data.answer);
            console.log('Parsed data.answer:', parsed);
            
            if (Array.isArray(parsed) && parsed.length > 0) {
              const firstItem = parsed[0];
              if (firstItem.response) {
                responseContent = firstItem.response;
              } else if (firstItem.answer) {
                responseContent = firstItem.answer;
              } else if (firstItem.content) {
                responseContent = firstItem.content;
              } else if (firstItem.text) {
                responseContent = firstItem.text;
              }
            }
          } else if (response.data?.response) {
            responseContent = response.data.response;
          } else if (response.response) {
            responseContent = response.response;
          } else if (response.data?.content) {
            responseContent = response.data.content;
          } else if (response.content) {
            responseContent = response.content;
          } else if (typeof response.data === 'string') {
            responseContent = response.data;
          } else if (typeof response === 'string') {
            responseContent = response;
          } else {
            console.warn('Could not find response content in any expected field');
            console.warn('Full response object:', JSON.stringify(response, null, 2));
          }
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          console.error('Parse error details:', parseError);
          // Fallback to other response structures
          if (response.data?.response) {
            responseContent = response.data.response;
          } else if (response.response) {
            responseContent = response.response;
          } else if (typeof response === 'string') {
            responseContent = response;
          }
        }
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Update intelligence sections based on user query keywords
      const lowerInput = currentInput.toLowerCase();
      if (lowerInput.includes('cost') || lowerInput.includes('price') || lowerInput.includes('pricing')) {
        setIntelligenceSections(prev =>
          prev.map(section =>
            section.id === 'pricing' || section.id === 'market-pricing-&-cost-benchmarks' 
              ? { ...section, isExpanded: true } : section
          )
        );
      } else if (lowerInput.includes('sla') || lowerInput.includes('penalty') || lowerInput.includes('vendor')) {
        setIntelligenceSections(prev =>
          prev.map(section =>
            section.id === 'consultant' || section.id === 'consultant-intelligence'
              ? { ...section, isExpanded: true } : section
          )
        );
      } else if (lowerInput.includes('technical') || lowerInput.includes('specification')) {
        setIntelligenceSections(prev =>
          prev.map(section =>
            section.id === 'technical' || section.id === 'technical-guidance'
              ? { ...section, isExpanded: true } : section
          )
        );
      }
    } catch (error: any) {
      console.error('Error in consult chat:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I apologize, but I encountered an error: ${error.message || 'Unable to connect to the consultation service'}. Please try again.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header - Fixed */}
      <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white px-6 py-4 shadow-lg flex-shrink-0 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/consult-os')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">{tenderName}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
            <Brain className="h-5 w-5" />
            <span className="font-semibold">AI Consultation Active</span>
          </div>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT PANEL - Intelligence & Analysis */}
        <div className="w-[45%] bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-[#06AEA9]/20 to-[#028090]/20 rounded-lg">
                <Brain className="h-6 w-6 text-[#06AEA9]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Domain Intelligence</h2>
                <p className="text-sm text-gray-600">AI-generated insights and analysis</p>
              </div>
            </div>

            {/* Intelligence Sections */}
            <div className="space-y-4">{
              intelligenceSections.map((section) => (
                <div
                  key={section.id}
                  className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm"
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#06AEA9]/10 to-[#028090]/10 rounded-lg">
                        <section.icon className="h-5 w-5 text-[#06AEA9]" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-left">{section.title}</h3>
                    </div>
                    {section.isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  {section.isExpanded && (
                    <div className="px-6 pb-6 space-y-3">
                      {section.content.map((item, idx) => {
                        // Check if item starts with ** (bold heading)
                        if (item.startsWith('**')) {
                          const parts = item.split(':**');
                          if (parts.length === 2) {
                            const heading = parts[0].replace(/\*\*/g, '').trim();
                            const content = parts[1].trim();
                            return (
                              <div key={idx} className="mb-3">
                                <h4 className="font-semibold text-[#06AEA9] text-sm mb-1">
                                  {heading}
                                </h4>
                                <p className="text-sm text-gray-700 leading-relaxed pl-4">
                                  {content}
                                </p>
                              </div>
                            );
                          }
                        }
                        
                        // Regular content with bullet point
                        return (
                          <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <div className="h-1.5 w-1.5 rounded-full bg-[#06AEA9] mt-2 flex-shrink-0" />
                            <span className="leading-relaxed">{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - AI Consultant Chatbot */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Chat Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-[#06AEA9]/20 to-[#028090]/20 rounded-lg">
                <Brain className="h-5 w-5 text-[#06AEA9]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">AI Tender Consultant</h3>
                <p className="text-xs text-gray-600">Ask questions to get deeper insights</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="text-sm leading-relaxed mb-2">{children}</p>,
                          ul: ({ children }) => <ul className="text-sm list-disc list-inside mb-2 space-y-1">{children}</ul>,
                          ol: ({ children }) => <ol className="text-sm list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                          li: ({ children }) => <li className="text-sm">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-[#06AEA9]">{children}</strong>,
                          h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                          code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{children}</code>,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <span
                    className={`text-xs mt-2 block ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#06AEA9]" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="bg-white border-t border-gray-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about technical specs, costs, risks, vendors, or any tender details..."
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#06AEA9] focus:outline-none resize-none"
                />
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isTyping}
                className="px-6 py-3 bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white rounded-xl hover:from-[#028090] hover:to-[#025f6a] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 h-[52px]"
              >
                <Send className="h-5 w-5" />
                <span className="font-semibold">Send</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
