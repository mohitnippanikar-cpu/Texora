import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, FileText, Eye, EyeOff } from 'lucide-react';
import apiService from '../../services/api';
import SimpleToast from '../common/SimpleToast';

interface TenderFormData {
  title: string;
  estimatedValue: string;
  earnestMoneyDeposit: string;
  closingDate: string;
  description: string;
  publishStatus: 'draft' | 'public';
}

export default function UpdateTender() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<TenderFormData>({
    title: '',
    estimatedValue: '',
    earnestMoneyDeposit: '',
    closingDate: '',
    description: '',
    publishStatus: 'draft'
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load existing tender data based on id
  useEffect(() => {
    const fetchTender = async () => {
      if (!id) return;
      try {
        const tender = await apiService.getTenderById(id);
        setFormData({
          title: tender.title,
          estimatedValue: tender.amount ? String(tender.amount) : '',
          earnestMoneyDeposit: tender.earnest_money_deposit ? String(tender.earnest_money_deposit) : '',
          closingDate: tender.end_date ? new Date(tender.end_date).toISOString().split('T')[0] : '',
          description: tender.description,
          publishStatus: tender.stage === 'live' ? 'public' : 'draft'
        });
      } catch (error) {
        console.error('Failed to fetch tender:', error);
        // navigate('/tender-manager');
      }
    };
    fetchTender();
  }, [id]);

  const handleInputChange = (field: keyof TenderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const amount = parseFloat(formData.estimatedValue.replace(/[₹,\s]/g, '')) || 0;
      const emd = parseFloat(formData.earnestMoneyDeposit.replace(/[₹,\s]/g, '')) || 0;

      const updateData = {
        title: formData.title,
        description: formData.description,
        amount: amount,
        earnest_money_deposit: emd,
        end_date: new Date(formData.closingDate).toISOString(),
        stage: formData.publishStatus === 'public' ? 'live' : 'draft'
      };
      await apiService.updateTender(id, updateData);
      setToast({ message: 'Tender updated successfully!', type: 'success' });
      
      // Redirect after showing toast
      setTimeout(() => {
        navigate('/tender-manager');
      }, 1500);
    } catch (error) {
      console.error('Failed to update tender:', error);
      setToast({ message: 'Failed to update tender. Please try again.', type: 'error' });
    }
  };

  const fillDemoData = () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    setFormData({
      ...formData,
      title: 'Supply & Installation of 33KV XLPE Power Cables for Metro Extension',
      estimatedValue: '1000000',
      earnestMoneyDeposit: '50000',
      closingDate: nextMonth.toISOString().split('T')[0],
      description: 'Construction of new wing'
    });
  };

  const handleStageToggle = () => {
    const newStatus = formData.publishStatus === 'draft' ? 'public' : 'draft';
    setFormData(prev => ({ ...prev, publishStatus: newStatus }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white px-8 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/tender-manager')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Update Tender</h1>
              <p className="text-white/90">Edit tender information</p>
            </div>
            <button
              type="button"
              onClick={fillDemoData}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20 font-semibold"
            >
              Fill Demo Data
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-8 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {/* Basic Information */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#06AEA9]" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tender Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Supply & Installation of 11KV Underground Cables"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06AEA9]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.estimatedValue}
                  onChange={(e) => handleInputChange('estimatedValue', e.target.value)}
                  placeholder="₹ 45,00,000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06AEA9]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Earnest Money Deposit (EMD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.earnestMoneyDeposit}
                  onChange={(e) => handleInputChange('earnestMoneyDeposit', e.target.value)}
                  placeholder="₹ 50,000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06AEA9]"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Closing Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.closingDate}
                  onChange={(e) => handleInputChange('closingDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06AEA9]"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter detailed description of the tender requirements..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06AEA9]"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stage
                </label>
                <button
                  type="button"
                  onClick={handleStageToggle}
                  className={`px-4 py-2 rounded-lg transition-colors border text-sm font-medium flex items-center gap-2 ${
                    formData.publishStatus === 'public'
                      ? 'bg-green-50 hover:bg-green-100 text-green-700 border-green-300'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-300'
                  }`}
                >
                  {formData.publishStatus === 'public' ? (
                    <>
                      <Eye className="w-4 h-4" />
                      Live
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Draft
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/tender-manager')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#06AEA9] text-white rounded-lg hover:bg-[#028090] transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update Tender
            </button>
          </div>
        </form>
      </div>

      {/* Toast Notification */}
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
