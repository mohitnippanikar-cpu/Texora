import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Building2, Clock, Eye, Check, Search, Filter, ArrowUpDown, X, Award, Plus, Edit } from 'lucide-react';
import apiService from '../../services/api';
import { Tender } from '../../types';

interface RFPSubmission {
  id: string;
  rfpNumber: string;
  title: string;
  description: string;
  standard: string;
  estimatedValue: string;
  earnestMoneyDeposit: string;
  endDate: string;
  status: 'draft' | 'publish' | 'awarded';
  stages: {
    draft: { completed: boolean };
    publish: { completed: boolean };
    awarded: { completed: boolean };
  };
}

const RFPManager = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'value' | 'status' | 'vendor'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [rfps, setRfps] = useState<RFPSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch RFP submissions data
  useEffect(() => {
    const fetchTenders = async () => {
      setIsLoading(true);
      try {
        const data = await apiService.getAllTenders();
        // Map API data to RFPSubmission format
        const mappedRfps: RFPSubmission[] = data.map((tender: Tender) => ({
          id: tender.tender_id,
          rfpNumber: tender.tender_id,
          title: tender.title,
          description: tender.description,
          standard: 'N/A', // Not in API
          estimatedValue: tender.amount ? `₹ ${tender.amount.toLocaleString()}` : 'N/A',
          earnestMoneyDeposit: tender.earnest_money_deposit ? `₹ ${tender.earnest_money_deposit.toLocaleString()}` : 'N/A',
          endDate: tender.end_date ? new Date(tender.end_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A',
          status: tender.stage === 'live' ? 'publish' : (tender.stage === 'awarded' ? 'awarded' : 'draft'),
          stages: {
            draft: { completed: true },
            publish: { completed: tender.stage === 'live' || tender.stage === 'awarded' },
            awarded: { completed: tender.stage === 'awarded' }
          }
        }));
        setRfps(mappedRfps);
      } catch (error) {
        console.error('Failed to fetch tenders:', error);
        // Fallback to sample data if needed, or just empty
        setRfps([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenders();
  }, []);

  const handleRFPClick = (rfp: RFPSubmission) => {
    navigate(`/tender-manager/${rfp.id}`, { state: { rfp } });
  };

  // Filter and sort RFPs
  const filteredAndSortedRFPs = useMemo(() => {
    let filtered = [...rfps];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (rfp) =>
          rfp.title.toLowerCase().includes(query) ||
          rfp.description.toLowerCase().includes(query) ||
          rfp.rfpNumber.toLowerCase().includes(query) ||
          rfp.standard.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((rfp) => rfp.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = a.rfpNumber.localeCompare(b.rfpNumber);
          break;
        case 'value':
          const clean = (val: string) => {
            const num = parseFloat(val.replace(/[₹,\s]/g, ''));
            return Number.isNaN(num) ? 0 : num;
          };
          comparison = clean(a.estimatedValue) - clean(b.estimatedValue);
          break;
        case 'status':
          const statusOrder = ['draft', 'publish', 'awarded'];
          comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
          break;
        case 'vendor':
          comparison = a.description.localeCompare(b.description);
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [rfps, searchQuery, statusFilter, sortBy, sortOrder]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'publish': return 'bg-blue-100 text-blue-700';
      case 'awarded': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'publish': return 'Published';
      case 'awarded': return 'Awarded';
      default: return status;
    }
  };

  const Stepper = ({ rfp }: { rfp: RFPSubmission }) => {
    const steps = [
      { 
        label: 'Draft', 
        number: 1,
        completed: rfp.stages.draft.completed
      },
      { 
        label: 'Publish', 
        number: 2,
        completed: rfp.stages.publish.completed
      },
      { 
        label: 'Awarded', 
        number: 3,
        completed: rfp.stages.awarded.completed
      }
    ];

    return (
      <div className="flex items-center gap-1.5">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`px-2 py-1 rounded-md flex items-center justify-center text-xs font-semibold transition-all ${
              step.completed 
                ? 'bg-primary text-white' 
                : 'bg-white border border-gray-300 text-gray-500'
            }`}>
              {step.completed ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : step.label}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-6 h-px mx-0.5 ${
                steps[index + 1].completed ? 'bg-primary' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white px-8 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">Tender Manager</h1>
              <p className="text-white/90">Track submitted RFPs and their evaluation stages</p>
            </div>
            <button
              onClick={() => navigate('/tender-manager/create')}
              className="px-6 py-3 bg-white text-[#06AEA9] rounded-lg hover:bg-gray-100 transition-colors font-semibold flex items-center gap-2 shadow-md"
            >
              <Plus className="w-5 h-5" />
              Create Tender
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Filters and Sort */}
        <div className="mb-4 space-y-3">
          {/* Search Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by RFP number, title, vendor, or standard..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06AEA9] text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filters and Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06AEA9] text-sm"
              >
                <option value="all">All Stages</option>
                <option value="draft">Draft</option>
                <option value="publish">Published</option>
                <option value="awarded">Awarded</option>
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'value' | 'status' | 'vendor')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06AEA9] text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="value">Sort by Value</option>
                <option value="status">Sort by Stage</option>
                <option value="vendor">Sort by Vendor</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
            >
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>

            {/* Active Filters Count */}
            {(searchQuery || statusFilter !== 'all') && (
              <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
                <span>Showing {filteredAndSortedRFPs.length} of {rfps.length} RFPs</span>
                {(searchQuery || statusFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('all');
                    }}
                    className="text-primary hover:text-primary/80 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear filters
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-8 text-center">
            <div className="animate-pulse text-sm text-gray-600">Loading RFP submissions...</div>
          </div>
        ) : filteredAndSortedRFPs.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-8 text-center">
            <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1.5">No RFP submissions found</h3>
            <p className="text-xs text-gray-500 mb-3">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'No RFP submissions available'}
            </p>
            {(searchQuery || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-3 py-1.5 bg-[#06AEA9] text-white rounded-lg hover:bg-[#028090] transition-colors text-xs"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredAndSortedRFPs.map((rfp) => (
              <div 
                key={rfp.id}
                onClick={() => handleRFPClick(rfp)}
                className="bg-white rounded-lg border border-gray-300 hover:border-[#06AEA9] hover:shadow-md transition-all cursor-pointer p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* RFP Number and Title */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-mono rounded">{rfp.rfpNumber}</span>
                      <h3 className="text-base font-semibold text-gray-900">{rfp.title}</h3>
                    </div>
                    
                    {/* Description */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-600">{rfp.description}</p>
                    </div>
                    
                    {/* Key Info */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Estimated Value</p>
                        <p className="text-sm font-semibold text-gray-900">{rfp.estimatedValue}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Earnest Money Deposit</p>
                        <p className="text-sm font-semibold text-gray-900">{rfp.earnestMoneyDeposit}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">End Date</p>
                        <p className="text-sm font-semibold text-gray-900">{rfp.endDate}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Current Stage</p>
                        <p className="text-sm font-semibold text-gray-900">{getStatusText(rfp.status)}</p>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <span className="text-xs text-gray-600">Progress</span>
                      <Stepper rfp={rfp} />
                    </div>
                  </div>
                  
                  {/* Status Badge and Edit Button */}
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(rfp.status)} border`}>
                      {getStatusText(rfp.status)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tender-manager/update/${rfp.id}`);
                      }}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                      title="Edit tender"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RFPManager;

