import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface MatchedSku {
  tender_requirement: string;
  matched_sku: string;
  match_score: number;
  sku_product: string;
  specifications_match: string;
}

interface MatchingResultsModalProps {
  task?: any;
  isOpen?: boolean;
  tenderId?: string;
  tenderTitle?: string;
  organization?: string;
  matchScore?: number;
  matchedItems?: MatchedSku[];
  onClose: () => void;
}

export function MatchingResultsModal({
  task,
  isOpen = true,
  tenderId,
  tenderTitle,
  organization,
  matchScore,
  matchedItems,
  onClose
}: MatchingResultsModalProps) {
  // Extract data from task if provided (for Kanban integration)
  const finalMatchScore = matchScore ?? (task?.match_score || 0);
  const finalMatchedItems = (matchedItems ?? (task?.matched_items || [])) as MatchedSku[];
  const finalTenderTitle = tenderTitle ?? (task?.title || 'Unknown Tender');
  const finalOrganization = organization ?? (task?.description?.split('\n')[0] || 'Unknown Organization');
  const finalTenderId = tenderId ?? (task?._id || 'N/A');

  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-900';
    if (score >= 60) return 'bg-blue-100 text-blue-900';
    if (score >= 40) return 'bg-yellow-100 text-yellow-900';
    return 'bg-red-100 text-red-900';
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-gray-900">SKU Matching Results</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${getScoreBadgeColor(finalMatchScore)}`}>
                {finalMatchScore}% Match
              </div>
            </div>
            <p className="text-sm text-gray-600">{finalTenderTitle}</p>
            <p className="text-xs text-gray-500">{finalOrganization}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {finalMatchedItems.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No matching SKUs found for this tender</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-600 mb-1">TOTAL REQUIREMENTS</p>
                  <p className="text-2xl font-bold text-blue-900">{finalMatchedItems.length}</p>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-600 mb-1">HIGH MATCH (≥60%)</p>
                  <p className="text-2xl font-bold text-green-900">
                    {finalMatchedItems.filter(m => m.match_score >= 60).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-purple-600 mb-1">OVERALL MATCH</p>
                  <p className="text-2xl font-bold text-purple-900">{finalMatchScore}%</p>
                </div>
              </div>

              {/* Matching Table */}
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Tender Requirement</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Matched SKU</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">SKU Product</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900">Match %</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Specifications</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalMatchedItems.map((item, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-900 font-medium">{item.tender_requirement}</td>
                        <td className="px-4 py-3 text-gray-700">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
                            {item.matched_sku}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{item.sku_product}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {item.match_score >= 60 ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-yellow-600" />
                            )}
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(item.match_score)}`}>
                              {item.match_score}%
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-xs">
                          <details className="cursor-pointer">
                            <summary className="text-blue-600 hover:text-blue-700">View</summary>
                            <div className="mt-2 p-2 bg-gray-100 rounded text-gray-700">
                              {item.specifications_match}
                            </div>
                          </details>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Match Quality Assessment */}
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-2">Match Quality Assessment</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-gray-700">
                      <strong>{finalMatchedItems.filter(m => m.match_score >= 80).length}</strong> Excellent matches (≥80%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-gray-700">
                      <strong>{finalMatchedItems.filter(m => m.match_score >= 60 && m.match_score < 80).length}</strong> Good matches (60-80%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-gray-700">
                      <strong>{finalMatchedItems.filter(m => m.match_score >= 40 && m.match_score < 60).length}</strong> Fair matches (40-60%)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Review in RFP Manager
          </button>
        </div>
      </div>
    </div>
  );
}
