import { useState } from 'react';
import {
  Clock,
  Upload,
  Users,
  Eye,
  Plus,
  X,
  FileText,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { TenderSummary } from '../../types';
import SimpleToast from '../common/SimpleToast';

interface UploadedTender extends TenderSummary {
  submissionCount: number;
  status: 'Active' | 'Closed' | 'Draft';
  isPublic: boolean;
}

interface RFIQuestion {
  id: string;
  questionText: string;
  questionType: 'short-answer' | 'paragraph' | 'number' | 'yes-no' | 'multiple-choice' | 'checkbox' | 'file-upload';
  options?: string[];
  isMandatory: boolean;
}

interface TenderData {
  tenderName: string;
  tenderId: string;
  department: string;
  estimatedCost: string;
  submissionStartDate: string;
  submissionEndDate: string;
  description: string;
  category: string;
  eligibilityCriteria: string;
  termsConditionsFile: File | null;
  additionalDocuments: File[];
  contactPersonName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'draft' | 'published';
}

export default function DataMigrationPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'tender-info' | 'rfi'>('tender-info');
  const [editingTenderId, setEditingTenderId] = useState<string | null>(null);
  const [uploadedTenders, setUploadedTenders] = useState<UploadedTender[]>([
    {
      tender_number: 'TND-2024-002',
      title: 'Signaling System Maintenance',
      organization_name: 'KMRL',
      bidding_closing_date: '2024-11-30',
      current_stage: 'Evaluation',
      submissionCount: 2,
      status: 'Closed',
      isPublic: true
    }
  ]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  const [tenderData, setTenderData] = useState<TenderData>({
    tenderName: '',
    tenderId: `TND-${Date.now().toString().slice(-6)}`,
    department: '',
    estimatedCost: '',
    submissionStartDate: '',
    submissionEndDate: '',
    description: '',
    category: '',
    eligibilityCriteria: '',
    termsConditionsFile: null,
    additionalDocuments: [],
    contactPersonName: '',
    contactEmail: '',
    contactPhone: '',
    status: 'draft'
  });

  const [rfiQuestions, setRfiQuestions] = useState<RFIQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<RFIQuestion>({
    id: '',
    questionText: '',
    questionType: 'short-answer',
    options: [],
    isMandatory: false
  });
  const [showPreview, setShowPreview] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fillDemoData = () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    setTenderData({
      tenderName: 'Railway Track Maintenance Services',
      tenderId: tenderData.tenderId,
      department: 'Operations',
      estimatedCost: '₹ 15,00,000',
      submissionStartDate: today.toISOString().split('T')[0],
      submissionEndDate: nextMonth.toISOString().split('T')[0],
      description: 'Comprehensive maintenance and repair services for railway tracks including inspection, replacement of worn components, and preventive maintenance activities.',
      category: 'Maintenance',
      eligibilityCriteria: 'Minimum 5 years experience in railway maintenance. ISO 9001 certified company. Valid labor licenses.',
      termsConditionsFile: null,
      additionalDocuments: [],
      contactPersonName: 'Rajesh Kumar',
      contactEmail: 'rajesh.kumar@railway.gov.in',
      contactPhone: '+91 98765 43210',
      status: 'draft'
    });
    showToast('Demo data filled successfully', 'success');
  };

  const handleInputChange = (field: keyof TenderData, value: any) => {
    setTenderData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: 'termsConditionsFile' | 'additionalDocuments', files: FileList | null) => {
    if (!files) return;
    
    if (field === 'termsConditionsFile') {
      setTenderData(prev => ({ ...prev, termsConditionsFile: files[0] }));
    } else {
      setTenderData(prev => ({ 
        ...prev, 
        additionalDocuments: [...prev.additionalDocuments, ...Array.from(files)]
      }));
    }
  };

  const removeAdditionalDocument = (index: number) => {
    setTenderData(prev => ({
      ...prev,
      additionalDocuments: prev.additionalDocuments.filter((_, i) => i !== index)
    }));
  };

  const saveDraft = () => {
    localStorage.setItem('tender_draft', JSON.stringify({ ...tenderData, rfiQuestions }));
    showToast('Tender saved as draft', 'success');
  };

  const handleEditTender = (tender: UploadedTender) => {
    setEditingTenderId(tender.tender_number);
    setTenderData({
      tenderName: tender.title,
      tenderId: tender.tender_number,
      department: tender.organization_name,
      estimatedCost: '',
      submissionStartDate: '',
      submissionEndDate: tender.bidding_closing_date,
      description: '',
      category: '',
      eligibilityCriteria: '',
      termsConditionsFile: null,
      additionalDocuments: [],
      contactPersonName: '',
      contactEmail: '',
      contactPhone: '',
      status: 'draft'
    });
    setShowCreateForm(true);
  };

  const publishTender = () => {
    if (!tenderData.tenderName || !tenderData.department || !tenderData.estimatedCost) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    
    if (editingTenderId) {
      // Update existing tender
      setUploadedTenders(uploadedTenders.map(t => 
        t.tender_number === editingTenderId
          ? {
              ...t,
              title: tenderData.tenderName,
              organization_name: tenderData.department,
              bidding_closing_date: tenderData.submissionEndDate
            }
          : t
      ));
      showToast('Tender updated successfully!', 'success');
      setEditingTenderId(null);
    } else {
      // Create new tender
      const newTender: UploadedTender = {
        tender_number: tenderData.tenderId,
        title: tenderData.tenderName,
        organization_name: tenderData.department,
        bidding_closing_date: tenderData.submissionEndDate,
        current_stage: 'Published',
        submissionCount: 0,
        status: 'Active',
        isPublic: true
      };
      
      setUploadedTenders([newTender, ...uploadedTenders]);
      showToast('Tender published successfully!', 'success');
    }
    
    setTenderData(prev => ({ ...prev, status: 'published' }));
    setShowCreateForm(false);
    
    // Reset form
    setTenderData({
      tenderName: '',
      tenderId: `TND-${Date.now().toString().slice(-6)}`,
      department: '',
      estimatedCost: '',
      submissionStartDate: '',
      submissionEndDate: '',
      description: '',
      category: '',
      eligibilityCriteria: '',
      termsConditionsFile: null,
      additionalDocuments: [],
      contactPersonName: '',
      contactEmail: '',
      contactPhone: '',
      status: 'draft'
    });
    setRfiQuestions([]);
    setActiveTab('tender-info');
    
    showToast('Tender published successfully!', 'success');
  };

  const addQuestion = () => {
    if (!currentQuestion.questionText) {
      showToast('Please enter question text', 'error');
      return;
    }

    const newQuestion: RFIQuestion = {
      ...currentQuestion,
      id: `q-${Date.now()}`
    };

    setRfiQuestions(prev => [...prev, newQuestion]);
    setCurrentQuestion({
      id: '',
      questionText: '',
      questionType: 'short-answer',
      options: [],
      isMandatory: false
    });
    showToast('Question added', 'success');
  };

  const removeQuestion = (id: string) => {
    setRfiQuestions(prev => prev.filter(q => q.id !== id));
  };

  const saveRFI = () => {
    localStorage.setItem('tender_draft', JSON.stringify({ ...tenderData, rfiQuestions }));
    showToast('RFI saved successfully', 'success');
  };

  const togglePublicStatus = (tenderNumber: string) => {
    setUploadedTenders(uploadedTenders.map(t => {
      if (t.tender_number === tenderNumber) {
        const newStatus = !t.isPublic;
        showToast(`Tender is now ${newStatus ? 'Public' : 'Private'}`, 'success');
        return { ...t, isPublic: newStatus };
      }
      return t;
    }));
  };

  const categories = ['IT Services', 'Infrastructure', 'Supply', 'Service', 'Consulting', 'Maintenance', 'Other'];
  const departments = ['Procurement', 'Operations', 'Finance', 'IT', 'HR', 'Engineering', 'Administration'];

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white px-8 py-6 shadow-lg">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{editingTenderId ? 'Edit Tender' : 'Create New Tender'}</h1>
                <p className="text-white/90">Fill in tender details and add RFI questions</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fillDemoData}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-2 border border-white/20"
                >
                  <FileText className="w-5 h-5" />
                  Fill Demo Data
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setActiveTab('tender-info');
                    setEditingTenderId(null);
                  }}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Back to List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50">
            <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
              toast.type === 'success' ? 'bg-green-500' :
              toast.type === 'error' ? 'bg-red-500' :
              'bg-blue-500'
            } text-white`}>
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-8 py-6">
          {/* Tabs */}
          <div className="bg-white rounded-t-lg shadow-md border-b">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('tender-info')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'tender-info'
                    ? 'text-[#06AEA9] border-b-4 border-[#06AEA9]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-5 h-5 inline mr-2" />
                Tender Information
              </button>
              <button
                onClick={() => setActiveTab('rfi')}
                className={`px-6 py-4 font-semibold transition-colors ${
                  activeTab === 'rfi'
                    ? 'text-[#06AEA9] border-b-4 border-[#06AEA9]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FileText className="w-5 h-5 inline mr-2" />
                Request for Information (RFI)
                {rfiQuestions.length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-[#06AEA9] text-white text-xs rounded-full">
                    {rfiQuestions.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Tab Content - continuing in next part due to size */}
          <div className="bg-white rounded-b-lg shadow-md p-8">
            {activeTab === 'tender-info' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Tender Information Form</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tender Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tenderData.tenderName}
                      onChange={(e) => handleInputChange('tenderName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                      placeholder="Enter tender name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tender ID</label>
                    <input
                      type="text"
                      value={tenderData.tenderId}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={tenderData.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estimated Cost <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tenderData.estimatedCost}
                      onChange={(e) => handleInputChange('estimatedCost', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                      placeholder="₹ Enter amount"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={tenderData.submissionStartDate}
                      onChange={(e) => handleInputChange('submissionStartDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={tenderData.submissionEndDate}
                      onChange={(e) => handleInputChange('submissionEndDate', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={tenderData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Person <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={tenderData.contactPersonName}
                      onChange={(e) => handleInputChange('contactPersonName', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                      placeholder="Contact person name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={tenderData.contactEmail}
                      onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                      placeholder="email@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={tenderData.contactPhone}
                      onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={tenderData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                      placeholder="Tender description..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Eligibility Criteria
                    </label>
                    <textarea
                      value={tenderData.eligibilityCriteria}
                      onChange={(e) => handleInputChange('eligibilityCriteria', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                      placeholder="Eligibility criteria..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Terms & Conditions
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload('termsConditionsFile', e.target.files)}
                        className="hidden"
                        id="terms-upload"
                      />
                      <label htmlFor="terms-upload" className="cursor-pointer">
                        <span className="text-[#06AEA9] font-semibold">Upload file</span>
                        <span className="text-gray-600"> or drag and drop</span>
                      </label>
                      {tenderData.termsConditionsFile && (
                        <div className="mt-3 text-sm text-gray-700">✓ {tenderData.termsConditionsFile.name}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Additional Documents
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        onChange={(e) => handleFileUpload('additionalDocuments', e.target.files)}
                        className="hidden"
                        id="additional-upload"
                      />
                      <label htmlFor="additional-upload" className="cursor-pointer">
                        <span className="text-[#06AEA9] font-semibold">Upload files</span>
                      </label>
                    </div>
                    {tenderData.additionalDocuments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {tenderData.additionalDocuments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
                            <span className="text-sm">{file.name}</span>
                            <button onClick={() => removeAdditionalDocument(index)} className="text-red-500">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-6 border-t">
                  <button
                    onClick={saveDraft}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold flex items-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Save Draft
                  </button>
                  <button
                    onClick={publishTender}
                    className="px-6 py-3 bg-[#06AEA9] text-white rounded-lg hover:bg-[#028090] font-semibold flex items-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Publish
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'rfi' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Request for Information (RFI)</h2>
                    <p className="text-sm text-gray-600 mt-1">Create questions for vendors</p>
                  </div>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? 'Hide Preview' : 'Preview'}
                  </button>
                </div>

                {!showPreview ? (
                  <>
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Add Question</h3>

                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Question Text <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={currentQuestion.questionText}
                          onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                          placeholder="Enter question..."
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={currentQuestion.questionType}
                            onChange={(e) => setCurrentQuestion({ 
                              ...currentQuestion, 
                              questionType: e.target.value as any,
                              options: ['multiple-choice', 'checkbox'].includes(e.target.value) ? [''] : []
                            })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                          >
                            <option value="short-answer">Short Answer</option>
                            <option value="paragraph">Paragraph</option>
                            <option value="number">Number</option>
                            <option value="yes-no">Yes/No</option>
                            <option value="multiple-choice">Multiple Choice</option>
                            <option value="checkbox">Checkbox</option>
                            <option value="file-upload">File Upload</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Mandatory?</label>
                          <button
                            onClick={() => setCurrentQuestion({ ...currentQuestion, isMandatory: !currentQuestion.isMandatory })}
                            className={`px-6 py-3 rounded-lg font-semibold w-full ${
                              currentQuestion.isMandatory ? 'bg-[#06AEA9] text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {currentQuestion.isMandatory ? 'Yes - Mandatory' : 'No - Optional'}
                          </button>
                        </div>
                      </div>

                      {(['multiple-choice', 'checkbox'].includes(currentQuestion.questionType)) && (
                        <div className="mb-4">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Options</label>
                          {currentQuestion.options?.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(currentQuestion.options || [])];
                                  newOptions[index] = e.target.value;
                                  setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                                placeholder={`Option ${index + 1}`}
                              />
                              <button
                                onClick={() => {
                                  const newOptions = currentQuestion.options?.filter((_, i) => i !== index);
                                  setCurrentQuestion({ ...currentQuestion, options: newOptions });
                                }}
                                className="text-red-500"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => setCurrentQuestion({ 
                              ...currentQuestion, 
                              options: [...(currentQuestion.options || []), ''] 
                            })}
                            className="text-[#06AEA9] font-semibold text-sm flex items-center gap-1"
                          >
                            <Plus className="w-4 h-4" />
                            Add Option
                          </button>
                        </div>
                      )}

                      <button
                        onClick={addQuestion}
                        className="w-full py-3 bg-[#06AEA9] text-white rounded-lg hover:bg-[#028090] font-semibold flex items-center justify-center gap-2"
                      >
                        <Plus className="w-5 h-5" />
                        Add Question
                      </button>
                    </div>

                    {rfiQuestions.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Questions ({rfiQuestions.length})</h3>
                        {rfiQuestions.map((question, index) => (
                          <div key={question.id} className="bg-white border-2 border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-bold">Q{index + 1}.</span>
                                  <span>{question.questionText}</span>
                                  {question.isMandatory && (
                                    <span className="text-red-500 text-xs font-semibold">*Required</span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600">
                                  Type: <span className="font-semibold capitalize">{question.questionType.replace('-', ' ')}</span>
                                </div>
                                {question.options && question.options.length > 0 && (
                                  <div className="mt-2 text-sm text-gray-600">Options: {question.options.join(', ')}</div>
                                )}
                              </div>
                              <button onClick={() => removeQuestion(question.id)} className="text-red-500 p-2">
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end pt-6 border-t">
                      <button
                        onClick={saveRFI}
                        className="px-6 py-3 bg-[#06AEA9] text-white rounded-lg hover:bg-[#028090] font-semibold flex items-center gap-2"
                      >
                        <Save className="w-5 h-5" />
                        Save RFI
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <p className="text-blue-800 font-semibold flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Preview - How vendors will see this
                      </p>
                    </div>

                    <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{tenderData.tenderName || 'Tender Name'}</h2>
                      <p className="text-gray-600 mb-6">Request for Information</p>

                      {rfiQuestions.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p>No questions added</p>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {rfiQuestions.map((question, index) => (
                            <div key={question.id} className="pb-6 border-b last:border-0">
                              <label className="block font-semibold mb-3">
                                {index + 1}. {question.questionText}
                                {question.isMandatory && <span className="text-red-500 ml-1">*</span>}
                              </label>

                              {question.questionType === 'short-answer' && (
                                <input type="text" disabled className="w-full px-4 py-3 border rounded-lg bg-gray-50" placeholder="Answer" />
                              )}
                              {question.questionType === 'paragraph' && (
                                <textarea rows={4} disabled className="w-full px-4 py-3 border rounded-lg bg-gray-50" placeholder="Answer" />
                              )}
                              {question.questionType === 'number' && (
                                <input type="number" disabled className="w-full px-4 py-3 border rounded-lg bg-gray-50" placeholder="Number" />
                              )}
                              {question.questionType === 'yes-no' && (
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2">
                                    <input type="radio" disabled className="w-4 h-4" />
                                    <span>Yes</span>
                                  </label>
                                  <label className="flex items-center gap-2">
                                    <input type="radio" disabled className="w-4 h-4" />
                                    <span>No</span>
                                  </label>
                                </div>
                              )}
                              {question.questionType === 'multiple-choice' && (
                                <div className="space-y-2">
                                  {question.options?.map((option, idx) => (
                                    <label key={idx} className="flex items-center gap-2">
                                      <input type="radio" disabled className="w-4 h-4" />
                                      <span>{option}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                              {question.questionType === 'checkbox' && (
                                <div className="space-y-2">
                                  {question.options?.map((option, idx) => (
                                    <label key={idx} className="flex items-center gap-2">
                                      <input type="checkbox" disabled className="w-4 h-4" />
                                      <span>{option}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                              {question.questionType === 'file-upload' && (
                                <div className="border-2 border-dashed rounded-lg p-6 text-center bg-gray-50">
                                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">Upload file</p>
                                </div>
                              )}
                            </div>
                          ))}
                          <button disabled className="w-full py-3 bg-gray-300 text-gray-600 rounded-lg font-semibold">
                            Submit (Preview Only)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white px-8 py-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Tender Manager</h1>
              <p className="text-white/90">Create and manage tenders with RFI</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-white text-[#06AEA9] rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center gap-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              Create New Tender
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        <div className="space-y-4">
          {uploadedTenders.map((tender) => (
            <div key={tender.tender_number} className="border rounded-lg p-4 hover:shadow-md transition-all bg-white">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{tender.title}</h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      tender.status === 'Active' ? 'bg-green-100 text-green-700' :
                      tender.status === 'Closed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {tender.status}
                    </span>
                    {tender.isPublic && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Public
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm text-gray-600">
                    <div>
                      <p className="text-xs text-gray-500">Tender ID</p>
                      <p className="font-medium">{tender.tender_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Organization</p>
                      <p className="font-medium">{tender.organization_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Closing Date</p>
                      <p className="font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {tender.bidding_closing_date}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Submissions</p>
                      <p className="font-medium flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {tender.submissionCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleEditTender(tender)}
                    className="px-3 py-1.5 text-xs rounded border border-[#06AEA9] text-[#06AEA9] hover:bg-[#06AEA9]/10 transition-colors whitespace-nowrap flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => togglePublicStatus(tender.tender_number)}
                    className={`px-3 py-1.5 text-xs rounded border transition-colors whitespace-nowrap ${
                      tender.isPublic 
                        ? 'border-red-200 text-red-600 hover:bg-red-50' 
                        : 'border-blue-200 text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    {tender.isPublic ? 'Make Private' : 'Make Public'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <SimpleToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
