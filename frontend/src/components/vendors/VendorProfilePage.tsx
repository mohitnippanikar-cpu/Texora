import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  FileText,
  Mail,
  Phone,
  MapPin,
  Globe,
  Calendar,
  Shield,
  Award,
  Eye,
  Flag,
  Ban,
  BookmarkPlus,
  Edit,
  ExternalLink,
  Users,
  Clock,
  Network
} from 'lucide-react';

interface VendorData {
  vendorId: string;
  vendorName: string;
  legalEntityType: 'Pvt Ltd' | 'LLP' | 'Proprietorship' | 'MSME' | 'Public Limited';
  status: 'Verified' | 'Pending Verification' | 'Blacklisted' | 'High Risk';
  riskScore: number;
  companyInfo: {
    companyName: string;
    cin: string;
    gstin: string;
    pan: string;
    msmeId: string;
    yearOfIncorporation: number;
    registeredAddress: string;
    website: string;
  };
  primaryContact: {
    name: string;
    designation: string;
    email: string;
    phone: string;
    alternatePhone: string;
    communicationAddress: string;
  };
  documents: {
    category: string;
    files: {
      name: string;
      uploadDate: string;
      size: string;
      type: string;
    }[];
  }[];
  verification: {
    gstValidity: boolean;
    mcaRegistration: boolean;
    courtCaseSearch: 'Clear' | 'Warning' | 'Failed';
    msmeAuthenticity: boolean;
    blacklistRecords: boolean;
  };
  fraudPatterns: {
    sharedDirectors: number;
    sharedAddresses: number;
    sharedCertificates: number;
    flaggedConnections: string[];
  };
  tenderHistory: {
    tenderId: string;
    tenderName: string;
    bidAmount: string;
    result: 'Won' | 'Lost' | 'Disqualified' | 'In Progress';
    stageReached: string;
    submissionDate: string;
  }[];
  performance: {
    onTimeSubmissionRate: number;
    tendersWon: number;
    tendersDisqualified: number;
    complianceIssues: number;
    credibilityScore: number;
    financialReliability: number;
  };
  internalNotes: {
    reviewer: string;
    timestamp: string;
    note: string;
  }[];
}

export default function VendorProfilePage() {
  const { vendorId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'history' | 'compliance'>('overview');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Mock vendor data - in production, fetch from API based on vendorId
  const vendorData: VendorData = {
    vendorId: vendorId || 'VEN-2024-001',
    vendorName: 'Tech Solutions Pvt Ltd',
    legalEntityType: 'Pvt Ltd',
    status: 'Verified',
    riskScore: 25,
    companyInfo: {
      companyName: 'Tech Solutions Private Limited',
      cin: 'U74999KA2018PTC123456',
      gstin: '29AABCT1234A1Z5',
      pan: 'AABCT1234A',
      msmeId: 'UDYAM-KR-06-1234567',
      yearOfIncorporation: 2018,
      registeredAddress: '123, MG Road, Kochi, Kerala - 682001',
      website: 'www.techsolutions.com'
    },
    primaryContact: {
      name: 'Rajesh Kumar',
      designation: 'Business Development Manager',
      email: 'rajesh@techsolutions.com',
      phone: '+91 98765 43210',
      alternatePhone: '+91 98765 43211',
      communicationAddress: '123, MG Road, Kochi, Kerala - 682001'
    },
    documents: [
      {
        category: 'Legal Documents',
        files: [
          { name: 'GST_Certificate.pdf', uploadDate: '10 Dec 2024', size: '2.3 MB', type: 'pdf' },
          { name: 'Incorporation_Certificate.pdf', uploadDate: '10 Dec 2024', size: '1.8 MB', type: 'pdf' },
          { name: 'PAN_Card.pdf', uploadDate: '10 Dec 2024', size: '0.5 MB', type: 'pdf' }
        ]
      },
      {
        category: 'MSME Documents',
        files: [
          { name: 'MSME_Certificate.pdf', uploadDate: '10 Dec 2024', size: '1.2 MB', type: 'pdf' }
        ]
      },
      {
        category: 'Financial Documents',
        files: [
          { name: 'Balance_Sheet_2023.pdf', uploadDate: '10 Dec 2024', size: '3.5 MB', type: 'pdf' },
          { name: 'ITR_2023.pdf', uploadDate: '10 Dec 2024', size: '2.1 MB', type: 'pdf' }
        ]
      },
      {
        category: 'Technical Documents',
        files: [
          { name: 'Technical_Capability_Statement.pdf', uploadDate: '10 Dec 2024', size: '4.2 MB', type: 'pdf' },
          { name: 'Past_Project_List.pdf', uploadDate: '10 Dec 2024', size: '1.5 MB', type: 'pdf' }
        ]
      }
    ],
    verification: {
      gstValidity: true,
      mcaRegistration: true,
      courtCaseSearch: 'Clear',
      msmeAuthenticity: true,
      blacklistRecords: false
    },
    fraudPatterns: {
      sharedDirectors: 0,
      sharedAddresses: 0,
      sharedCertificates: 0,
      flaggedConnections: []
    },
    tenderHistory: [
      {
        tenderId: 'TND-2024-001',
        tenderName: 'Kochi Metro Station Upgrades',
        bidAmount: '₹45,00,000',
        result: 'In Progress',
        stageReached: 'Technical Evaluation',
        submissionDate: '10 Dec 2024'
      },
      {
        tenderId: 'TND-2023-045',
        tenderName: 'Smart City Infrastructure',
        bidAmount: '₹38,50,000',
        result: 'Won',
        stageReached: 'Contract Awarded',
        submissionDate: '15 Nov 2023'
      },
      {
        tenderId: 'TND-2023-032',
        tenderName: 'Metro Rail Signaling System',
        bidAmount: '₹42,00,000',
        result: 'Lost',
        stageReached: 'Financial Evaluation',
        submissionDate: '20 Sep 2023'
      }
    ],
    performance: {
      onTimeSubmissionRate: 95,
      tendersWon: 3,
      tendersDisqualified: 0,
      complianceIssues: 1,
      credibilityScore: 87,
      financialReliability: 92
    },
    internalNotes: [
      {
        reviewer: 'Priya Sharma',
        timestamp: '12 Dec 2024, 3:45 PM',
        note: 'Vendor has excellent track record. Recommended for approval.'
      },
      {
        reviewer: 'Arun Menon',
        timestamp: '11 Dec 2024, 10:20 AM',
        note: 'All documents verified. No red flags found.'
      }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'Pending Verification':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'High Risk':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Blacklisted':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score < 30) return 'text-green-600';
    if (score < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskScoreBgColor = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Won':
        return 'bg-green-100 text-green-700';
      case 'Lost':
        return 'bg-gray-100 text-gray-700';
      case 'Disqualified':
        return 'bg-red-100 text-red-700';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleDownloadReport = () => {
    alert('Vendor report download will be implemented with backend API');
  };

  const handleVerifyVendor = () => {
    alert('Vendor verification workflow will be implemented');
  };

  const handleAddToWatchlist = () => {
    alert('Added to watchlist');
  };

  const handleFlagForAudit = () => {
    alert('Vendor flagged for audit');
  };

  const handleApproveVendor = () => {
    alert('Vendor approved for tender participation');
  };

  const handleBlacklistVendor = () => {
    if (confirm('Are you sure you want to blacklist this vendor?')) {
      alert('Vendor blacklisted');
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      alert('Note will be saved to backend');
      setNewNote('');
      setShowNotesModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white px-8 py-6 shadow-lg">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors mt-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="w-8 h-8" />
                  <h1 className="text-3xl font-bold">{vendorData.vendorName}</h1>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(vendorData.status)}`}>
                    {vendorData.status}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-sm text-white/90">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span className="font-semibold">Vendor ID:</span> {vendorData.vendorId}
                  </span>
                  <span className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    {vendorData.legalEntityType}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Since {vendorData.companyInfo.yearOfIncorporation}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center min-w-[140px]">
                <p className="text-xs text-white/80 mb-1">Risk Score</p>
                <p className={`text-3xl font-bold ${getRiskScoreColor(vendorData.riskScore)}`}>
                  {vendorData.riskScore}/100
                </p>
                <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                  <div
                    className={`${getRiskScoreBgColor(vendorData.riskScore)} h-2 rounded-full transition-all`}
                    style={{ width: `${vendorData.riskScore}%` }}
                  />
                </div>
                <p className="text-xs text-white/70 mt-1">
                  {vendorData.riskScore < 30 ? 'Low Risk' : vendorData.riskScore < 60 ? 'Medium Risk' : 'High Risk'}
                </p>
              </div>
              <button
                onClick={handleVerifyVendor}
                className="px-6 py-3 bg-white text-[#06AEA9] rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Verify Vendor
              </button>
              <button
                onClick={handleDownloadReport}
                className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-colors font-semibold flex items-center gap-2 border border-white/30"
              >
                <Download className="w-5 h-5" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-8">
        <div className="max-w-[1920px] mx-auto">
          <div className="flex gap-6">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'history', label: 'Tender History', icon: Clock },
              { id: 'compliance', label: 'Compliance', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors font-medium ${
                    activeTab === tab.id
                      ? 'border-[#06AEA9] text-[#06AEA9]'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 py-6">
        <div className="max-w-[1920px] mx-auto">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-3 gap-6">
              {/* Left Column - Company & Contact Info */}
              <div className="col-span-2 space-y-6">
                {/* Company Information */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Building2 className="w-6 h-6 text-[#06AEA9]" />
                    Company Information
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Company Name</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{vendorData.companyInfo.companyName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">CIN Number</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{vendorData.companyInfo.cin}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">GSTIN</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{vendorData.companyInfo.gstin}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">PAN</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{vendorData.companyInfo.pan}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">MSME ID</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{vendorData.companyInfo.msmeId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Year of Incorporation</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{vendorData.companyInfo.yearOfIncorporation}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Registered Address</label>
                      <p className="text-base font-semibold text-gray-900 mt-1 flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-1 text-[#06AEA9]" />
                        {vendorData.companyInfo.registeredAddress}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Website</label>
                      <p className="text-base font-semibold text-gray-900 mt-1 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#06AEA9]" />
                        <a href={`https://${vendorData.companyInfo.website}`} target="_blank" rel="noopener noreferrer" className="text-[#06AEA9] hover:underline">
                          {vendorData.companyInfo.website}
                        </a>
                        <ExternalLink className="w-3 h-3" />
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Contact Details */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-6 h-6 text-[#06AEA9]" />
                    Primary Contact Details
                  </h2>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact Person</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{vendorData.primaryContact.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Designation</label>
                      <p className="text-base font-semibold text-gray-900 mt-1">{vendorData.primaryContact.designation}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-base font-semibold text-gray-900 mt-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#06AEA9]" />
                        {vendorData.primaryContact.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-base font-semibold text-gray-900 mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#06AEA9]" />
                        {vendorData.primaryContact.phone}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Alternate Phone</label>
                      <p className="text-base font-semibold text-gray-900 mt-1 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#06AEA9]" />
                        {vendorData.primaryContact.alternatePhone}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm font-medium text-gray-500">Communication Address</label>
                      <p className="text-base font-semibold text-gray-900 mt-1 flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-1 text-[#06AEA9]" />
                        {vendorData.primaryContact.communicationAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance Scorecard */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-6 h-6 text-[#06AEA9]" />
                    Performance Scorecard
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center border border-green-200">
                      <p className="text-3xl font-bold text-green-600">{vendorData.performance.onTimeSubmissionRate}%</p>
                      <p className="text-sm text-gray-600 mt-1">On-Time Submission</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center border border-blue-200">
                      <p className="text-3xl font-bold text-blue-600">{vendorData.performance.tendersWon}</p>
                      <p className="text-sm text-gray-600 mt-1">Tenders Won</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 text-center border border-red-200">
                      <p className="text-3xl font-bold text-red-600">{vendorData.performance.tendersDisqualified}</p>
                      <p className="text-sm text-gray-600 mt-1">Disqualified</p>
                    </div>
                    <div className="bg-gradient-to-br from-[#e0f7f5] to-[#b2e4df] rounded-lg p-4 text-center border border-[#06AEA9]">
                      <p className="text-3xl font-bold text-[#028090]">{vendorData.performance.credibilityScore}</p>
                      <p className="text-sm text-gray-600 mt-1">Credibility Score</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center border border-purple-200">
                      <p className="text-3xl font-bold text-purple-600">{vendorData.performance.financialReliability}</p>
                      <p className="text-sm text-gray-600 mt-1">Financial Reliability</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 text-center border border-orange-200">
                      <p className="text-3xl font-bold text-orange-600">{vendorData.performance.complianceIssues}</p>
                      <p className="text-sm text-gray-600 mt-1">Compliance Issues</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Verification & Fraud Analysis */}
              <div className="space-y-6">
                {/* Compliance & Verification */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-[#06AEA9]" />
                    Verification Status
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">GST Validity</span>
                      {vendorData.verification.gstValidity ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">MCA Registration</span>
                      {vendorData.verification.mcaRegistration ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Court Case Search</span>
                      {vendorData.verification.courtCaseSearch === 'Clear' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : vendorData.verification.courtCaseSearch === 'Warning' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">MSME Authenticity</span>
                      {vendorData.verification.msmeAuthenticity ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Blacklist Records</span>
                      {!vendorData.verification.blacklistRecords ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Fraud Pattern Analysis */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Network className="w-6 h-6 text-[#06AEA9]" />
                    Fraud Pattern Analysis
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Shared Directors</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        vendorData.fraudPatterns.sharedDirectors === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {vendorData.fraudPatterns.sharedDirectors}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Shared Addresses</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        vendorData.fraudPatterns.sharedAddresses === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {vendorData.fraudPatterns.sharedAddresses}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Shared Certificates</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        vendorData.fraudPatterns.sharedCertificates === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {vendorData.fraudPatterns.sharedCertificates}
                      </span>
                    </div>
                    {vendorData.fraudPatterns.flaggedConnections.length === 0 ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-700">No Suspicious Patterns Detected</p>
                      </div>
                    ) : (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <AlertTriangle className="w-6 h-6 text-red-600 mb-2" />
                        <p className="text-sm font-medium text-red-700 mb-2">Flagged Connections:</p>
                        <ul className="text-xs text-red-600 space-y-1">
                          {vendorData.fraudPatterns.flaggedConnections.map((conn, idx) => (
                            <li key={idx}>• {conn}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Internal Notes */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Edit className="w-6 h-6 text-[#06AEA9]" />
                      Internal Notes
                    </h2>
                    <button
                      onClick={() => setShowNotesModal(true)}
                      className="px-3 py-1 bg-[#06AEA9] text-white rounded-lg hover:bg-[#05928E] transition-colors text-sm font-medium"
                    >
                      Add Note
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {vendorData.internalNotes.map((note, idx) => (
                      <div key={idx} className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                        <p className="text-sm text-gray-700 mb-2">{note.note}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="font-medium">{note.reviewer}</span>
                          <span>{note.timestamp}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-6">
              {vendorData.documents.map((category, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">{category.category}</h2>
                  <div className="grid grid-cols-4 gap-4">
                    {category.files.map((file, fileIdx) => (
                      <div
                        key={fileIdx}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-[#06AEA9] hover:shadow-md transition-all cursor-pointer"
                      >
                        <div className="flex flex-col items-center text-center">
                          <FileText className="w-12 h-12 text-[#06AEA9] mb-2" />
                          <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{file.name}</p>
                          <p className="text-xs text-gray-500 mb-1">{file.size}</p>
                          <p className="text-xs text-gray-400 mb-3">{file.uploadDate}</p>
                          <button className="w-full py-2 bg-[#06AEA9] text-white rounded-md hover:bg-[#05928E] transition-colors text-sm font-medium flex items-center justify-center gap-2">
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tender ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Tender Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Bid Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Result</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Stage Reached</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Submission Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vendorData.tenderHistory.map((tender, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{tender.tenderId}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{tender.tenderName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{tender.bidAmount}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getResultColor(tender.result)}`}>
                          {tender.result}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{tender.stageReached}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{tender.submissionDate}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/dashboard/tender/${tender.tenderId}`)}
                          className="text-[#06AEA9] hover:text-[#05928E] font-medium text-sm flex items-center gap-1"
                        >
                          View Details
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'compliance' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Automated Compliance Checks</h2>
                <div className="space-y-4">
                  {Object.entries(vendorData.verification).map(([key, value], idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        {typeof value === 'boolean' ? (
                          value ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600" />
                          )
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            value === 'Clear' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {value}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {typeof value === 'boolean' 
                          ? value 
                            ? 'Verification completed successfully'
                            : 'Verification failed or pending'
                          : `Status: ${value}`
                        }
                      </p>
                      <button className="text-xs text-[#06AEA9] hover:underline mt-1">More Details →</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">AI Risk Assessment Summary</h2>
                <div className="bg-gradient-to-br from-[#e0f7f5] to-white border-2 border-[#06AEA9] rounded-lg p-6 mb-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong className="text-[#028090]">AI Analysis:</strong> This vendor demonstrates a <strong>low to moderate risk profile</strong>. 
                    All primary verification checks have passed successfully. No fraud patterns or suspicious connections detected. 
                    The vendor has a strong track record with {vendorData.performance.tendersWon} tenders won and a 
                    {vendorData.performance.onTimeSubmissionRate}% on-time submission rate. Financial reliability score of 
                    {vendorData.performance.financialReliability}/100 indicates stable operations.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-medium text-green-700">Strengths</span>
                    <span className="text-xs text-green-600">High compliance rate</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-sm font-medium text-blue-700">Opportunities</span>
                    <span className="text-xs text-blue-600">Eligible for fast-track approval</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-sm font-medium text-yellow-700">Watch Points</span>
                    <span className="text-xs text-yellow-600">Monitor certificate expiry dates</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="bg-white border-t-2 border-gray-200 px-8 py-6 sticky bottom-0 shadow-lg">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToWatchlist}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
            >
              <BookmarkPlus className="w-5 h-5" />
              Add to Watchlist
            </button>
            <button
              onClick={handleFlagForAudit}
              className="px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-semibold flex items-center gap-2"
            >
              <Flag className="w-5 h-5" />
              Flag for Audit
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleApproveVendor}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Approve Vendor
            </button>
            <button
              onClick={handleBlacklistVendor}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
            >
              <Ban className="w-5 h-5" />
              Blacklist Vendor
            </button>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowNotesModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Internal Note</h3>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="w-full h-32 p-3 border-2 border-gray-300 rounded-lg focus:border-[#06AEA9] focus:outline-none"
              placeholder="Enter your note here..."
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-[#06AEA9] text-white rounded-lg hover:bg-[#05928E] transition-colors"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
