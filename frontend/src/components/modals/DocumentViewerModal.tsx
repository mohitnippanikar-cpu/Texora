import { X, Download } from 'lucide-react';

interface DocumentViewerModalProps {
  isOpen: boolean;
  tender: any;
  onClose: () => void;
}

export function DocumentViewerModal({ isOpen, tender, onClose }: DocumentViewerModalProps) {
  if (!isOpen || !tender) return null;

  const handleDownload = () => {
    // Download PDF from server
    const tenderId = tender.id || tender.tender_id || tender.tender_number;
    const link = document.createElement('a');
    link.href = `/tenders/${tenderId}/pdf`;
    link.download = `${tender.tender_number}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{tender.title}</h2>
            <p className="text-sm text-gray-600 mt-1">{tender.organization_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="bg-gray-100 rounded-lg p-8 text-center min-h-96 flex items-center justify-center flex-col">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-700 mb-4">PDF Document</p>
            <p className="text-sm text-gray-600 mb-6">
              Tender Number: <span className="font-semibold">{tender.tender_number}</span>
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Click the download button below to view the complete PDF document
            </p>
          </div>

          {/* Document Details */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">VALUE</p>
              <p className="text-lg font-semibold text-gray-900">
                {tender.value ? `₹ ${parseFloat(tender.value).toLocaleString('en-IN')}` : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">CLOSING DATE</p>
              <p className="text-lg font-semibold text-gray-900">
                {tender.bidding_closing_date ? new Date(tender.bidding_closing_date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">CATEGORY</p>
              <p className="text-lg font-semibold text-gray-900">{tender.category || 'N/A'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">SOURCE</p>
              <p className="text-lg font-semibold text-gray-900">{tender.source || 'IOC Portal'}</p>
            </div>
          </div>

          {/* Description */}
          {tender.description && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">DESCRIPTION</h3>
              <p className="text-sm text-gray-700 leading-relaxed">{tender.description}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
