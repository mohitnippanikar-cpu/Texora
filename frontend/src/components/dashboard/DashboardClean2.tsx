import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight,
  Clock,
  Users,
  Building2
} from 'lucide-react';
import apiService from '../../services/api';
import { Tender } from '../../types';

interface Submission {
  id: string;
  companyName: string;
  submittedDate: string;
  status: 'Under Review' | 'Approved' | 'Rejected';
}

interface ValidationStatus {
  status: 'Pending' | 'Approved' | 'Rejected';
  comments?: string;
  validatedBy?: string;
  validatedDate?: string;
}

interface PublishedTender {
  tender_number: string;
  title: string;
  organization_name?: string;
  bidding_closing_date?: string;
  current_stage: string;
  submissionCount: number;
  status: 'Active' | 'Closed' | 'Draft';
  isPublic: boolean;
  submissions?: Submission[];
  companyValidation?: ValidationStatus;
  financialValidation?: ValidationStatus;
  technicalAssessment?: ValidationStatus;
  legalCompliance?: ValidationStatus;
  complianceMatrix?: { item: string; status: 'Pass' | 'Fail' }[];
  allocatedTo?: string;
}

export const DashboardClean = () => {
  const navigate = useNavigate();
  const [publishedTenders, setPublishedTenders] = useState<PublishedTender[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch tenders from API - only those with stage: 'live'
  useEffect(() => {
    const fetchPublicTenders = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getAllTenders();
        // Ensure data is an array
        const tendersArray = Array.isArray(data) ? data : [];
        // Filter for only live stage tenders and map to PublishedTender format
        const publicTenders: PublishedTender[] = tendersArray
          .filter((tender: Tender) => tender.stage === 'live')
          .map((tender: Tender) => ({
            tender_number: tender.tender_id,
            title: tender.title,
            organization_name: tender.organization_name || 'N/A',
            bidding_closing_date: tender.end_date 
              ? new Date(tender.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) 
              : 'N/A',
            current_stage: 'Open',
            submissionCount: 0, // This would come from submissions API if available
            status: 'Active' as const,
            isPublic: true,
            submissions: [],
            companyValidation: { status: 'Pending' as const },
            financialValidation: { status: 'Pending' as const },
            technicalAssessment: { status: 'Pending' as const },
            legalCompliance: { status: 'Pending' as const },
            complianceMatrix: [],
            allocatedTo: ''
          }));
        setPublishedTenders(publicTenders);
      } catch (error) {
        console.error('Failed to fetch public tenders:', error);
        setPublishedTenders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicTenders();
  }, []);

  const handleTenderClick = (tender: PublishedTender) => {
    navigate(`/dashboard/tender/${tender.tender_number}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white px-8 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Live Tenders</h1>
              <p className="text-white/90">View and manage live tender submissions and validations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Published Tenders List */}
      <div className="px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#06AEA9]"></div>
          </div>
        ) : publishedTenders.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No public tenders available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {publishedTenders.map((tender) => (
              <div 
                key={tender.tender_number}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-white cursor-pointer hover:border-[#06AEA9] hover:bg-gray-50"
                onClick={() => handleTenderClick(tender)}
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-xl mb-4">{tender.title}</h3>
                    <div className="flex items-center gap-8 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-[#06AEA9]" />
                        <span className="font-medium">{tender.tender_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#06AEA9]" />
                        <span>Closes: {tender.bidding_closing_date}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
