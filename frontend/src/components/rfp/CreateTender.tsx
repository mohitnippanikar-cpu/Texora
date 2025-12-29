import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, FileText, CheckCircle2, FileCheck, Brain, DollarSign, Shield, FileOutput, Send } from 'lucide-react';
import apiService from '../../services/api';
import SimpleToast from '../common/SimpleToast';

interface TenderFormData {
  title: string;
  estimatedValue: string;
  earnestMoneyDeposit: string;
  closingDate: string;
  description: string;
  publishStatus: 'draft' | 'public';
  attachment: File | null;
}

export default function CreateTender() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<TenderFormData>({
    title: '',
    estimatedValue: '',
    earnestMoneyDeposit: '',
    closingDate: '',
    description: '',
    publishStatus: 'draft',
    attachment: null
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleInputChange = (field: keyof TenderFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amount = parseFloat(formData.estimatedValue.replace(/[₹,\s]/g, '')) || 0;
      const emd = parseFloat(formData.earnestMoneyDeposit.replace(/[₹,\s]/g, '')) || 0;
      
      const tenderData = {
        title: formData.title,
        description: formData.description,
        amount: amount,
        earnest_money_deposit: emd,
        end_date: new Date(formData.closingDate).toISOString(),
        stage: formData.publishStatus === 'public' ? 'live' : 'draft',
      };
      
      const response = await apiService.createTender(tenderData);
      
      if (response && response.tender_id && formData.attachment) {
        await apiService.addTenderAttachment(response.tender_id, formData.attachment);
      }

      setToast({ message: 'Tender created successfully!', type: 'success' });
      
      // Redirect after showing toast
      setTimeout(() => {
        navigate('/tender-manager');
      }, 1500);
    } catch (error) {
      console.error('Failed to create tender:', error);
      setToast({ message: 'Failed to create tender. Please try again.', type: 'error' });
    }
  };

  const sampleTenders = [
    {
      title: 'Supply & Installation of 33KV XLPE Power Cables for Metro Extension',
      estimatedValue: '45000000',
      earnestMoneyDeposit: '2250000',
      description: 'Supply, installation and commissioning of 33KV XLPE underground power cables including civil works, jointing kits, and testing equipment for metro rail extension project Phase-II.'
    },
    {
      title: 'Procurement of Rolling Stock - 6 Coach Metro Train Sets',
      estimatedValue: '125000000',
      earnestMoneyDeposit: '6250000',
      description: 'Design, manufacture, supply, testing and commissioning of standard gauge metro train sets with modern signaling systems, CBTC compatibility, and 5-year maintenance contract.'
    },
    {
      title: 'Construction of Elevated Viaduct for Metro Line Extension',
      estimatedValue: '850000000',
      earnestMoneyDeposit: '42500000',
      description: 'Civil construction of 5.2 km elevated viaduct structure including pier foundations, launching girders, u-girders, architectural finishes, and drainage systems compliant with IRS standards.'
    },
    {
      title: 'Supply of Overhead Equipment (OHE) for Electrification',
      estimatedValue: '32000000',
      earnestMoneyDeposit: '1600000',
      description: 'Complete overhead electrification system including catenary wire, contact wire, droppers, insulators, section insulators, and all accessories for 25KV AC single phase system.'
    },
    {
      title: 'Station Finishing Works - Interior & Architectural Services',
      estimatedValue: '18500000',
      earnestMoneyDeposit: '925000',
      description: 'Complete interior finishing, false ceiling, wall cladding, flooring (granite/vitrified tiles), signage, tactile tiles, handrails, and architectural lighting for 3 metro stations.'
    },
    {
      title: 'SCADA & Telecommunication System Integration',
      estimatedValue: '67000000',
      earnestMoneyDeposit: '3350000',
      description: 'Design, supply, installation and commissioning of integrated SCADA system, fiber optic network, radio communication system, CCTV surveillance, and public address system for entire corridor.'
    },
    {
      title: 'Track Works - Ballastless Track System Installation',
      estimatedValue: '42000000',
      earnestMoneyDeposit: '2100000',
      description: 'Supply and installation of ballastless track system including rail fastening system, LWR rails (60E1), rail grinding, welding works, and geometric corrections as per IRS specifications.'
    },
    {
      title: 'AFC System - Automatic Fare Collection Equipment',
      estimatedValue: '28000000',
      earnestMoneyDeposit: '1400000',
      description: 'Design, supply, installation, testing and commissioning of complete AFC system including ticket vending machines, gates, validators, token dispensers, with contactless smart card technology.'
    },
    {
      title: 'Fire Fighting & Safety Equipment for Metro Stations',
      estimatedValue: '15500000',
      earnestMoneyDeposit: '775000',
      description: 'Supply and installation of complete fire safety system including hydrant systems, sprinklers, smoke detectors, fire alarm panels, emergency lighting, PA systems, and firefighting equipment.'
    },
    {
      title: 'Substation Equipment - 33/11KV Traction Substations',
      estimatedValue: '95000000',
      earnestMoneyDeposit: '4750000',
      description: 'Design, engineering, supply, erection, testing and commissioning of 33/11KV outdoor/indoor substations including transformers, switchgear, protection relays, SCADA integration and auxiliary systems.'
    }
  ];

  const fillDemoData = () => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    
    // Pick random tender data
    const randomTender = sampleTenders[Math.floor(Math.random() * sampleTenders.length)];
    
    setFormData({
      ...formData,
      title: randomTender.title,
      estimatedValue: randomTender.estimatedValue,
      earnestMoneyDeposit: randomTender.earnestMoneyDeposit,
      closingDate: nextMonth.toISOString().split('T')[0],
      description: randomTender.description,
      publishStatus: 'draft'
    });
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
              <h1 className="text-3xl font-bold mb-2">Create New Tender</h1>
              <p className="text-white/90">Add a new tender to the system</p>
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
                  Tender Documents (Optional)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#06AEA9] transition-colors">
                  <div className="space-y-1 text-center">
                    <FileOutput className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#06AEA9] hover:text-[#028090] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#06AEA9]"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleInputChange('attachment', e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOCX, XLS up to 10MB
                    </p>
                    {formData.attachment && (
                      <p className="text-sm text-[#06AEA9] font-medium mt-2">
                        Selected: {formData.attachment.name}
                      </p>
                    )}
                  </div>
                </div>
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
              Create Tender
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
