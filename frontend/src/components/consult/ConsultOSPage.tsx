import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowUp,
  Sparkles,
  Brain,
  Loader2
} from 'lucide-react';
import apiService from '../../services/api';

export default function ConsultOSPage() {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [useDeepSearch, setUseDeepSearch] = useState(false);
  const [useReason, setUseReason] = useState(false);

  const demoConsultations = [
    'Railway Track Maintenance Equipment Procurement for 250km broad gauge track',
    'Hospital ICU Equipment & Medical Gas Pipeline System for 50-bed setup',
    'Smart Traffic Management System for 120 intersections',
    'Industrial Wastewater Treatment Plant - 5 MLD Capacity',
    'Airport Runway LED Lighting & Navigation Aids for 3200m runway',
    'University Campus Wi-Fi 6 Network Infrastructure covering 150-acre',
    'Metro Station HVAC & Fire Fighting Systems for 3 underground stations',
    'Solar Rooftop Power Plant - 2 MW Grid Connected installation',
    'Bridge Structural Health Monitoring System for 8 highway bridges',
    'Data Center Tier-III Infrastructure Setup for 500 rack capacity',
  ];

  const handleStartConsultation = async () => {
    if (!prompt.trim()) return;

    setIsStarting(true);
    
    try {
      const title = prompt.substring(0, 100);
      console.log('Starting consultation with:', { title, prompt });
      const response = await apiService.startConsultation(title, prompt);
      
      console.log('Consultation API response:', response);
      
      if (response && response.success !== false) {
        const consultationId = `consult-${Date.now()}`;
        
        // Parse the answer field if it's a JSON string
        let parsedData = response.data || response;
        try {
          if (response.answer && typeof response.answer === 'string') {
            parsedData = JSON.parse(response.answer);
            console.log('Parsed answer field:', parsedData);
          } else if (response.data?.answer && typeof response.data.answer === 'string') {
            parsedData = JSON.parse(response.data.answer);
            console.log('Parsed data.answer field:', parsedData);
          }
        } catch (error) {
          console.error('Error parsing answer field:', error);
          parsedData = response.data || response;
        }
        
        const consultationData = {
          consultationData: parsedData,
          title: title,
          prompt: prompt,
          fromAPI: true,
          timestamp: Date.now()
        };
        localStorage.setItem('currentConsultation', JSON.stringify(consultationData));
        console.log('Stored consultation in localStorage:', consultationData);
        
        navigate(`/consult-os/${consultationId}`, {
          state: consultationData
        });
      } else {
        const errorMsg = response?.error || response?.message || 'Unknown error occurred';
        console.error('API returned error:', errorMsg);
        alert('Failed to start consultation: ' + errorMsg);
        setIsStarting(false);
      }
    } catch (error: any) {
      console.error('Error starting consultation:', error);
      const errorMsg = error?.message || error?.toString() || 'Network error or server unavailable';
      alert('Failed to start consultation: ' + errorMsg);
      setIsStarting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleStartConsultation();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl">
        {/* Main Content */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-12">
            What can I help with?
          </h1>

          {/* Input Box */}
          <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              rows={1}
              className="w-full px-5 py-4 text-base text-gray-900 placeholder-gray-400 bg-transparent border-none outline-none resize-none rounded-2xl"
              style={{ minHeight: '56px', maxHeight: '200px' }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = '56px';
                target.style.height = Math.min(target.scrollHeight, 200) + 'px';
              }}
            />
            
            {/* Bottom Bar */}
            <div className="flex items-center justify-between px-5 pb-3 pt-1">
              <div className="flex items-center gap-2">
                {/* Deep Search Toggle */}
                <button
                  onClick={() => setUseDeepSearch(!useDeepSearch)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    useDeepSearch
                      ? 'bg-[#06AEA9] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Deep Search
                </button>

                {/* Reason Toggle */}
                <button
                  onClick={() => setUseReason(!useReason)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    useReason
                      ? 'bg-[#06AEA9] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  Reason
                </button>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleStartConsultation}
                disabled={!prompt.trim() || isStarting}
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-900 shadow-sm"
              >
                {isStarting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Demo Examples */}
        <div className="mt-8 space-y-2">
          <p className="text-xs text-gray-500 text-center mb-3">Try these examples:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {demoConsultations.slice(0, 4).map((demo, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(demo)}
                className="text-left px-4 py-3 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-[#06AEA9] hover:shadow-sm transition-all"
              >
                {demo}
              </button>
            ))}
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500 leading-relaxed max-w-2xl mx-auto">
            AI can make mistakes. Please double-check responses.<br />
            Responses will use another model until your limit resets after 6:35 PM.
          </p>
        </div>
      </div>
    </div>
  );
}
