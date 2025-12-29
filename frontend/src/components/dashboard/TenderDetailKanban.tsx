import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Building2,
  DollarSign,
  FileText,
  Mail,
  Phone,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Eye,
  ArrowRight,
  Package
} from 'lucide-react';
import { DocumentViewerModal } from '../modals/DocumentViewerModal';
import apiService from '../../services/api';
import { Tender, Submission } from '../../types';

interface VendorSubmission {
  id: string;
  vendorName: string;
  bidAmount: string;
  contactName: string;
  email: string;
  phone: string;
  documentsCount: number;
  currentStage: string;
  submissionDateTime: string;
  cardStatusLabel: 'In Evaluation' | 'Pending' | 'Completed' | 'Under Review' | 'Rejected';
  evalScore?: number;
  stageNumber?: number;
}

interface KanbanStage {
  id: string;
  name: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  order: number;
  description: string;
}

interface TenderDetail {
  tender_number: string;
  title: string;
  organization_name: string;
  bidding_closing_date: string;
  current_stage: string;
  submissionCount: number;
  status: 'Active' | 'Closed' | 'Draft';
  stages: KanbanStage[];
  submissions: VendorSubmission[];
}

export const TenderDetailKanban = () => {
  const navigate = useNavigate();
  const { tenderId } = useParams();
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [submissions, setSubmissions] = useState<VendorSubmission[]>([]);
  const [tenderData, setTenderData] = useState<TenderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!tenderId) return;
      setIsLoading(true);
      try {
        // Fetch tender details
        const tender = await apiService.getTenderById(tenderId);
        
        // Fetch submissions from kanban endpoint
        const kanbanData = await apiService.getTenderSubmissionsKanban(tenderId);
        console.log('Kanban data:', kanbanData);

        // Map submissions from kanban format
        const mappedSubmissions: VendorSubmission[] = [];
        
        // Process each stage (2, 3, 4, 5)
        Object.entries(kanbanData).forEach(([stageNum, submissions]: [string, any]) => {
          const stage = parseInt(stageNum);
          let stageId = 'rfi';
          if (stage === 3) stageId = 'technical';
          if (stage === 4) stageId = 'financial';
          if (stage >= 5) stageId = 'review';

          if (Array.isArray(submissions)) {
            submissions.forEach((sub: any) => {
              mappedSubmissions.push({
                id: sub.bid_id,
                vendorName: sub.bidder_name || 'Unknown Vendor',
                bidAmount: `₹${sub.bid_amount?.toLocaleString('en-IN') || '0'}`,
                contactName: sub.bidder_contact || 'N/A',
                email: sub.bidder_email || 'N/A',
                phone: sub.bidder_phone || 'N/A',
                documentsCount: 0,
                currentStage: stageId,
                submissionDateTime: sub.submission_date ? new Date(sub.submission_date).toLocaleString() : 'N/A',
                cardStatusLabel: 'In Evaluation',
                evalScore: sub.eval_score,
                stageNumber: stage
              });
            });
          }
        });

        setSubmissions(mappedSubmissions);

        setTenderData({
          tender_number: tender.tender_id,
          title: tender.title,
          organization_name: 'Kochi Metro Rail Limited (KMRL)',
          bidding_closing_date: tender.end_date ? new Date(tender.end_date).toLocaleDateString() : 'N/A',
          current_stage: 'Active',
          submissionCount: mappedSubmissions.length,
          status: tender.stage === 'live' ? 'Active' : 'Closed',
          stages: [
            { 
              id: 'rfi', 
              name: 'RFI', 
              status: 'Pending', 
              order: 1,
              description: 'Request for Information'
            },
            { 
              id: 'technical', 
              name: 'Technical', 
              status: 'Pending', 
              order: 2,
              description: 'Technical Evaluation'
            },
            { 
              id: 'financial', 
              name: 'Financial', 
              status: 'Pending', 
              order: 3,
              description: 'Financial Evaluation'
            },
            { 
              id: 'review', 
              name: 'Review / Legal', 
              status: 'Pending', 
              order: 4,
              description: 'Legal Review'
            }
          ],
          submissions: mappedSubmissions
        });

      } catch (error) {
        console.error('Error fetching tender details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tenderId]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!tenderData) {
    return <div className="flex items-center justify-center h-screen">Tender not found</div>;
  }


  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'In Evaluation':
        return 'bg-[#e0f7f5] text-[#028090] border-[#06AEA9]';
      case 'Under Review':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStageStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'text-green-600 bg-green-50';
      case 'In Progress':
        return 'text-[#028090] bg-[#e0f7f5]';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  const getSubmissionsForStage = (stageId: string) => {
    return submissions.filter(sub => sub.currentStage === stageId);
  };

  const handleDragStart = (e: React.DragEvent, submissionId: string) => {
    e.dataTransfer.setData('submissionId', submissionId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    const submissionId = e.dataTransfer.getData('submissionId');
    
    setSubmissions(prev => 
      prev.map(sub => 
        sub.id === submissionId 
          ? { ...sub, currentStage: targetStageId }
          : sub
      )
    );
  };

  const handleVendorCardClick = (vendorId: string) => {
    navigate(`/vendor/${vendorId}`);
  };

  const handleCardClick = () => {
    navigate(`/rfp-manager/${tenderId}`);
  };

  const openRFPDocument = () => {
    setShowDocumentModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white px-8 py-4 shadow-lg">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-xl font-bold">{tenderData.title}</h1>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border-2 ${
                  tenderData.status === 'Active' 
                    ? 'bg-green-500 text-white border-green-300' 
                    : 'bg-red-500 text-white border-red-300'
                }`}>
                  {tenderData.status}
                </span>
              </div>
              <div className="flex items-center gap-6 text-xs text-white/90">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="font-semibold">ID:</span> {tenderData.tender_number}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {tenderData.organization_name}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-semibold">Closes:</span> {tenderData.bidding_closing_date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span className="font-semibold">{tenderData.submissionCount}</span> Submissions
                </span>
              </div>
            </div>
            <button
              onClick={openRFPDocument}
              className="px-6 py-3 bg-white text-[#06AEA9] rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center gap-2 shadow-md"
            >
              <FileText className="w-5 h-5" />
              View RFP Document
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="px-8 py-4">
        <div className="max-w-[1920px] mx-auto">
          {/* Kanban Columns Container */}
          <div className="grid grid-cols-4 gap-5">
            {tenderData.stages.map((stage) => {
              const stageSubmissions = getSubmissionsForStage(stage.id);
              
              return (
                <div
                  key={stage.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, stage.id)}
                >
                  {/* Column Header */}
                  <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white px-4 py-3 rounded-t-xl">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="font-bold text-sm leading-tight">{stage.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStageStatusColor(stage.status)}`}>
                        {stage.status}
                      </span>
                    </div>
                    <p className="text-xs text-white/80 mb-1.5 leading-snug">{stage.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {stageSubmissions.length} submission{stageSubmissions.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Cards Container */}
                  <div className="p-3 space-y-2.5 h-[650px] overflow-y-auto bg-gray-50 rounded-b-xl"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: '#06AEA9 #f3f4f6'
                    }}
                  >
                    {stageSubmissions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                        <p className="text-xs font-medium">No submissions</p>
                      </div>
                    ) : (
                      stageSubmissions.map((submission) => (
                        <div
                          key={submission.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, submission.id)}
                          onClick={handleCardClick}
                          className="bg-white rounded-lg border border-gray-200 hover:border-[#06AEA9] hover:shadow-md transition-all duration-200 cursor-move group overflow-hidden"
                        >
                          {/* Card Header */}
                          <div className="bg-gradient-to-br from-gray-50 to-white px-3 py-2.5 border-b border-gray-200">
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h4 className="font-bold text-gray-900 text-xs leading-tight group-hover:text-[#06AEA9] transition-colors line-clamp-2">
                                {submission.vendorName}
                              </h4>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold border whitespace-nowrap ${getStatusBadgeColor(submission.cardStatusLabel)}`}>
                                {submission.cardStatusLabel}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[#028090]">
                              <DollarSign className="w-3.5 h-3.5" />
                              <span className="font-bold text-sm">{submission.bidAmount}</span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="px-3 py-2.5 space-y-1.5">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <Users className="w-3 h-3 text-blue-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-500">Contact</p>
                                <p className="text-xs font-semibold text-gray-900 truncate">{submission.contactName}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <Mail className="w-3 h-3 text-green-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-500">Email</p>
                                <p className="text-[10px] font-medium text-gray-700 truncate">{submission.email}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                <Phone className="w-3 h-3 text-purple-600" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-gray-500">Phone</p>
                                <p className="text-[10px] font-medium text-gray-700">{submission.phone}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-2 text-sm pt-1.5 border-t border-gray-100">
                              <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                  <FileText className="w-3 h-3 text-orange-600" />
                                </div>
                                <p className="text-xs font-semibold text-gray-900">{submission.documentsCount} Files</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-sm pt-1">
                              <Clock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <p className="text-[10px] text-gray-500">{submission.submissionDateTime}</p>
                            </div>
                          </div>

                          {/* Card Footer */}
                          <div className="px-3 py-2 bg-gradient-to-br from-[#e0f7f5] to-white border-t border-[#06AEA9]/20">
                            {submission.evalScore !== undefined && (
                              <div className="mb-2 flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-500">Eval Score:</span>
                                <span className="text-xs font-bold text-[#06AEA9]">{submission.evalScore}</span>
                              </div>
                            )}
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                try {
                                  const result = await apiService.updateSubmissionStage(submission.id);
                                  console.log('Stage update result:', result);
                                  
                                  // Refresh the kanban data
                                  const kanbanData = await apiService.getTenderSubmissionsKanban(tenderId!);
                                  const mappedSubmissions: VendorSubmission[] = [];
                                  
                                  Object.entries(kanbanData).forEach(([stageNum, submissions]: [string, any]) => {
                                    const stage = parseInt(stageNum);
                                    let stageId = 'rfi';
                                    if (stage === 3) stageId = 'technical';
                                    if (stage === 4) stageId = 'financial';
                                    if (stage >= 5) stageId = 'review';

                                    if (Array.isArray(submissions)) {
                                      submissions.forEach((sub: any) => {
                                        mappedSubmissions.push({
                                          id: sub.bid_id,
                                          vendorName: sub.bidder_name || 'Unknown Vendor',
                                          bidAmount: `₹${sub.bid_amount?.toLocaleString('en-IN') || '0'}`,
                                          contactName: sub.bidder_contact || 'N/A',
                                          email: sub.bidder_email || 'N/A',
                                          phone: sub.bidder_phone || 'N/A',
                                          documentsCount: 0,
                                          currentStage: stageId,
                                          submissionDateTime: sub.submission_date ? new Date(sub.submission_date).toLocaleString() : 'N/A',
                                          cardStatusLabel: 'In Evaluation',
                                          evalScore: sub.eval_score,
                                          stageNumber: stage
                                        });
                                      });
                                    }
                                  });

                                  setSubmissions(mappedSubmissions);
                                } catch (error) {
                                  console.error('Failed to move submission:', error);
                                }
                              }}
                              disabled={submission.stageNumber === 5}
                              className={`w-full py-1.5 ${
                                submission.stageNumber === 5
                                  ? 'bg-gray-300 cursor-not-allowed'
                                  : 'bg-[#06AEA9] hover:bg-[#05928E]'
                              } text-white rounded transition-colors font-medium text-xs flex items-center justify-center gap-1.5`}
                            >
                              {submission.stageNumber === 5 ? 'Final Stage' : 'Move to Next Stage'}
                              {submission.stageNumber !== 5 && <ArrowRight className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RFP Document Modal */}
      <DocumentViewerModal
        isOpen={showDocumentModal}
        tender={tenderData}
        onClose={() => setShowDocumentModal(false)}
      />
    </div>
  );
};

