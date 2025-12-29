import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  Building2
} from 'lucide-react';

interface VendorListItem {
  vendorId: string;
  vendorName: string;
  legalEntityType: string;
  status: 'Verified' | 'Pending Verification' | 'Blacklisted' | 'High Risk';
  riskScore: number;
  tendersParticipated: number;
  tendersWon: number;
  lastSubmission: string;
}

export default function VendorsListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock vendors data
  const vendors: VendorListItem[] = [
    {
      vendorId: 'vendor-1',
      vendorName: 'Tech Solutions Pvt Ltd',
      legalEntityType: 'Pvt Ltd',
      status: 'Verified',
      riskScore: 25,
      tendersParticipated: 5,
      tendersWon: 3,
      lastSubmission: '10 Dec 2024'
    },
    {
      vendorId: 'vendor-2',
      vendorName: 'Metro Builders Inc',
      legalEntityType: 'Pvt Ltd',
      status: 'Verified',
      riskScore: 18,
      tendersParticipated: 8,
      tendersWon: 4,
      lastSubmission: '11 Dec 2024'
    },
    {
      vendorId: 'vendor-3',
      vendorName: 'Infrastructure Corp',
      legalEntityType: 'Public Limited',
      status: 'Pending Verification',
      riskScore: 45,
      tendersParticipated: 2,
      tendersWon: 0,
      lastSubmission: '12 Dec 2024'
    },
    {
      vendorId: 'vendor-4',
      vendorName: 'BuildTech Engineers',
      legalEntityType: 'LLP',
      status: 'Verified',
      riskScore: 22,
      tendersParticipated: 6,
      tendersWon: 2,
      lastSubmission: '09 Dec 2024'
    },
    {
      vendorId: 'vendor-5',
      vendorName: 'Smart Infrastructure Ltd',
      legalEntityType: 'Pvt Ltd',
      status: 'High Risk',
      riskScore: 72,
      tendersParticipated: 3,
      tendersWon: 0,
      lastSubmission: '13 Dec 2024'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Pending Verification':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'High Risk':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'Blacklisted':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
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

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white px-8 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Vendor Management</h1>
              <p className="text-white/90 text-sm">Manage and track all registered vendors</p>
            </div>
            <button className="px-5 py-2.5 bg-white text-[#06AEA9] rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#06AEA9] focus:outline-none text-sm"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:border-[#06AEA9] focus:outline-none text-sm bg-white min-w-[200px]"
            >
              <option value="all">All Status</option>
              <option value="Verified">Verified</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="High Risk">High Risk</option>
              <option value="Blacklisted">Blacklisted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vendors List */}
      <div className="px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Risk</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Participated</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Won</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVendors.map((vendor) => (
                  <tr
                    key={vendor.vendorId}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/vendor/${vendor.vendorId}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{vendor.vendorName}</p>
                          <p className="text-xs text-gray-500">{vendor.vendorId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{vendor.legalEntityType}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(vendor.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(vendor.status)}`}>
                          {vendor.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-semibold ${getRiskScoreColor(vendor.riskScore)}`}>
                        {vendor.riskScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-medium text-gray-900">{vendor.tendersParticipated}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-semibold text-green-600">{vendor.tendersWon}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{vendor.lastSubmission}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/vendor/${vendor.vendorId}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#06AEA9] text-white rounded-lg hover:bg-[#028090] transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredVendors.length === 0 && (
              <div className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-600">No vendors found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
