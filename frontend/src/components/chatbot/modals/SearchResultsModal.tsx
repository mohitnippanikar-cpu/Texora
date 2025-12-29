import React, { useState } from 'react';
import { X, FileText, ExternalLink, Calendar, TrendingUp, DollarSign, Download } from 'lucide-react';
import { SearchResults, ProjectFinancialData, FileCitation } from '../../../types';

interface SearchResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  searchResults: SearchResults | null;
}

const SearchResultsModal: React.FC<SearchResultsModalProps> = ({
  isOpen,
  onClose,
  searchResults
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'details' | 'citations'>('summary');

  if (!isOpen || !searchResults) return null;

  const project = searchResults.projectData[0];
  const totalAllocatedCrores = project.totalAllocated / 100000000;
  const totalSpentCrores = project.totalSpent / 100000000;
  const remainingCrores = (project.totalAllocated - project.totalSpent) / 100000000;
  const spentPercentage = (project.totalSpent / project.totalAllocated) * 100;

  const FinancialSummaryTable = ({ project }: { project: ProjectFinancialData }) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-[#028090] to-[#06aea9] text-white">
            <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Category</th>
            <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Allocated</th>
            <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Spent</th>
            <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Remaining</th>
            <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Progress</th>
          </tr>
        </thead>
        <tbody>
          {project.allocations.map((allocation, index) => {
            const allocatedCrores = allocation.allocatedAmount / 100000000;
            const spentCrores = allocation.spentAmount / 100000000;
            const remainingCrores = allocation.remainingAmount / 100000000;
            const progress = (allocation.spentAmount / allocation.allocatedAmount) * 100;
            
            return (
              <tr key={allocation.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="border border-gray-300 px-4 py-3 font-medium">{allocation.category}</td>
                <td className="border border-gray-300 px-4 py-3 text-right">₹{allocatedCrores.toFixed(2)} Cr</td>
                <td className="border border-gray-300 px-4 py-3 text-right text-green-600 font-medium">₹{spentCrores.toFixed(2)} Cr</td>
                <td className="border border-gray-300 px-4 py-3 text-right text-blue-600">₹{remainingCrores.toFixed(2)} Cr</td>
                <td className="border border-gray-300 px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full">
                      <div 
                        className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{progress.toFixed(1)}%</span>
                  </div>
                </td>
              </tr>
            );
          })}
          <tr className="bg-gradient-to-r from-blue-50 to-blue-100 font-bold">
            <td className="border border-gray-300 px-4 py-3">Total Project Cost</td>
            <td className="border border-gray-300 px-4 py-3 text-right">₹{totalAllocatedCrores.toFixed(2)} Cr</td>
            <td className="border border-gray-300 px-4 py-3 text-right text-green-600">₹{totalSpentCrores.toFixed(2)} Cr</td>
            <td className="border border-gray-300 px-4 py-3 text-right text-blue-600">₹{remainingCrores.toFixed(2)} Cr</td>
            <td className="border border-gray-300 px-4 py-3 text-right">
              <div className="flex items-center justify-end gap-2">
                <div className="w-20 h-2 bg-gray-200 rounded-full">
                  <div 
                    className="h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${spentPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{spentPercentage.toFixed(1)}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  const CitationCard = ({ citation }: { citation: FileCitation }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 text-sm">{citation.fileName}</h4>
            <p className="text-xs text-gray-600">
              {citation.section}
              {citation.pageNumber && ` • Page ${citation.pageNumber}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {(citation.relevanceScore * 100).toFixed(0)}% match
          </span>
          <button className="text-gray-400 hover:text-blue-600 transition-colors">
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <blockquote className="text-sm text-gray-700 bg-gray-50 border-l-4 border-blue-500 pl-4 py-2 rounded-r">
        "{citation.excerpt}"
      </blockquote>
      
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Modified: {citation.lastModified.toLocaleDateString()}
        </div>
        <span>{citation.filePath}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col m-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#028090] to-[#06aea9] text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Financial Search Results</h2>
              <p className="text-blue-100 text-sm">
                Query: "{searchResults.query}" • {searchResults.totalResults} files found • 
                Search completed in {searchResults.searchDuration}ms
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Project Overview Cards */}
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b">
          <h3 className="text-xl font-bold text-gray-900 mb-3">{project.projectName}</h3>
          
          {/* Descriptive Summary Text */}
          <div className="mb-4 p-4 bg-white rounded-lg border border-blue-200">
            <p className="text-gray-700 leading-relaxed">
              The {project.projectName} represents one of KMRL's most significant infrastructure investments. 
              With a total allocation of ₹{totalAllocatedCrores.toFixed(0)} crores, this project encompasses comprehensive 
              metro extension from Palarivattom to Tripunithura. Currently, ₹{totalSpentCrores.toFixed(0)} crores 
              ({spentPercentage.toFixed(1)}%) has been utilized across various categories including civil construction, 
              electrical systems, rolling stock procurement, and land acquisition. The project demonstrates strong 
              financial management with transparent allocation across multiple contractors and systematic progress tracking 
              through comprehensive documentation and regular audits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">Total Allocated</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">₹{totalAllocatedCrores.toFixed(0)} Cr</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Amount Spent</span>
              </div>
              <p className="text-2xl font-bold text-green-600">₹{totalSpentCrores.toFixed(0)} Cr</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-orange-200">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-gray-600">Remaining</span>
              </div>
              <p className="text-2xl font-bold text-orange-600">₹{remainingCrores.toFixed(0)} Cr</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">Progress</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{spentPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex px-6">
            {[
              { id: 'summary', label: 'Financial Summary', icon: DollarSign },
              { id: 'details', label: 'Detailed Breakdown', icon: TrendingUp },
              { id: 'citations', label: `Source Files (${searchResults.totalResults})`, icon: FileText }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === id
                    ? 'border-[#028090] text-[#028090]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'summary' && (
            <div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Project Financial Overview</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    This comprehensive financial analysis covers the {project.projectName}, spanning from initial budget 
                    allocation through current expenditure tracking. The project demonstrates systematic financial management 
                    with clear categorization across civil works (₹1,680 Cr), electrical & signaling systems (₹485 Cr), 
                    rolling stock procurement (₹285 Cr), land acquisition (₹420 Cr), and project management activities (₹150 Cr). 
                    Financial data has been consolidated from multiple authoritative sources including budget documents, 
                    annual reports, status updates, and contractual agreements to provide accurate real-time insights.
                  </p>
                </div>
              </div>
              
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Allocation Summary</h4>
              <FinancialSummaryTable project={project} />
              
              {/* Related Financial Documents */}
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Key Source Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">Metro_A2_Budget_2024.pdf</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Primary budget allocation document</p>
                    <p className="text-xs text-gray-500">Contains detailed Phase 2 budget breakdown, government approvals, and sector-wise allocation for the ₹2,450 crore project including construction, land acquisition, and infrastructure development costs.</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">KMRL_Annual_Financial_Report_2024.xlsx</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Annual financial performance report</p>
                    <p className="text-xs text-gray-500">Comprehensive financial utilization data showing ₹856 crores expenditure with detailed project-wise distribution, remaining balances, and 35% completion status as of latest reporting period.</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">Project_Status_Report_Q3_2024.docx</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Quarterly progress and financial status</p>
                    <p className="text-xs text-gray-500">Detailed funding sources breakdown including Central Government grant (₹1,225 Cr), State Government contribution (₹857 Cr), and KMRL internal funds (₹368 Cr) allocation.</p>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-gray-900">Construction_Contract_Details_2024.pdf</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Contractor agreements and costs</p>
                    <p className="text-xs text-gray-500">Major contract allocations including L&T Construction (₹1,680 Cr for civil works), Siemens India (₹485 Cr for electrical & signaling), and Alstom Transport (₹285 Cr for rolling stock).</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'details' && (
            <div>
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Detailed Financial Breakdown</h4>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    This detailed breakdown provides category-wise financial allocation and utilization for the Metro A2 Extension Project. 
                    Each category represents a major component of the metro infrastructure development, with specific contractor assignments 
                    and milestone-based payment schedules. The data reflects real-time financial tracking with regular updates from 
                    project management systems and contractor progress reports.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {project.allocations.map((allocation) => {
                  const progress = (allocation.spentAmount / allocation.allocatedAmount) * 100;
                  
                  // Define related documents for each category
                  const getRelatedDocs = (category: string) => {
                    switch (category) {
                      case 'Civil Construction':
                        return ['Construction_Contract_Details_2024.pdf', 'Metro_A2_Budget_2024.pdf'];
                      case 'Electrical & Signaling':
                        return ['Construction_Contract_Details_2024.pdf', 'Technical_Specifications_2024.pdf'];
                      case 'Rolling Stock':
                        return ['Rolling_Stock_Procurement_2024.pdf', 'KMRL_Annual_Financial_Report_2024.xlsx'];
                      case 'Land Acquisition':
                        return ['Land_Acquisition_Costs_Metro_A2.pdf', 'Project_Status_Report_Q3_2024.docx'];
                      default:
                        return ['KMRL_Annual_Financial_Report_2024.xlsx'];
                    }
                  };
                  
                  return (
                    <div key={allocation.id} className="bg-white rounded-lg border border-gray-200 p-4">
                      <h5 className="font-semibold text-gray-900 mb-3">{allocation.category}</h5>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Allocated:</span>
                          <span className="font-medium">₹{(allocation.allocatedAmount / 100000000).toFixed(2)} Cr</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Spent:</span>
                          <span className="font-medium text-green-600">₹{(allocation.spentAmount / 100000000).toFixed(2)} Cr</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Remaining:</span>
                          <span className="font-medium text-blue-600">₹{(allocation.remainingAmount / 100000000).toFixed(2)} Cr</span>
                        </div>
                        <div className="mt-3">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress:</span>
                            <span className="font-medium">{progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-3 bg-gray-200 rounded-full">
                            <div 
                              className="h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        {/* Related Documents for this category */}
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <h6 className="text-xs font-medium text-gray-700 mb-2">Related Documents:</h6>
                          <div className="space-y-1">
                            {getRelatedDocs(allocation.category).map((doc, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                <span className="text-xs text-gray-600">{doc}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-xs text-gray-500 mt-2">
                          Last updated: {allocation.lastUpdated.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'citations' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Source Documents</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Financial data compiled from {project.citations.length} official documents including budget allocations, 
                    annual reports, project status updates, and contractual agreements. Each document has been analyzed 
                    for relevance and accuracy to ensure comprehensive financial transparency.
                  </p>
                </div>
                <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  <Download className="w-4 h-4" />
                  Export Citations
                </button>
              </div>
              
              {/* Document Categories */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h5 className="font-medium text-green-800 mb-1">Budget Documents</h5>
                  <p className="text-sm text-green-700">Official budget allocations and approvals</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="font-medium text-blue-800 mb-1">Financial Reports</h5>
                  <p className="text-sm text-blue-700">Annual and quarterly financial statements</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <h5 className="font-medium text-orange-800 mb-1">Contract Documents</h5>
                  <p className="text-sm text-orange-700">Vendor agreements and cost breakdowns</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {project.citations.map((citation) => (
                  <CitationCard key={citation.id} citation={citation} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <p>Last updated: {project.lastUpdated.toLocaleDateString()} at {project.lastUpdated.toLocaleTimeString()}</p>
            <p>Data sourced from {searchResults.totalResults} financial documents</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultsModal;