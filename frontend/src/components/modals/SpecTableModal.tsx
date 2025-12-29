import { X, Download } from 'lucide-react';

interface SpecTableModalProps {
  isOpen: boolean;
  tender: any;
  onClose: () => void;
}

export function SpecTableModal({ isOpen, tender, onClose }: SpecTableModalProps) {
  if (!isOpen || !tender) return null;

  const handleDownloadCSV = () => {
    if (!tender.sku_details || !Array.isArray(tender.sku_details)) return;

    // Create CSV content
    const headers = ['Item Name', 'SKU Code', 'Quantity', 'Unit', 'Estimated Value', 'Specification'];
    const rows = tender.sku_details.map((sku: any) => [
      sku.itemName || '',
      sku.skuCode || '',
      sku.quantity || '',
      sku.unit || '',
      sku.estimatedValue || '',
      sku.specification || ''
    ]);

    const csvContent = [
      [tender.tender_number, tender.title].join(' - '),
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(','))
    ].join('\n');

    // Download CSV
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
    link.download = `${tender.tender_number}_specs.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const skuDetails = tender.sku_details || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Specifications - {tender.title}</h2>
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
          {skuDetails.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No specifications found for this tender</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Item Name</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">SKU Code</th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-900">Quantity</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Unit</th>
                    <th className="px-4 py-3 text-right font-semibold text-gray-900">Est. Value</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-900">Specification</th>
                  </tr>
                </thead>
                <tbody>
                  {skuDetails.map((sku: any, index: number) => (
                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">{sku.itemName}</td>
                      <td className="px-4 py-3 text-gray-700 text-xs">{sku.skuCode}</td>
                      <td className="px-4 py-3 text-center text-gray-700">{sku.quantity}</td>
                      <td className="px-4 py-3 text-gray-700">{sku.unit}</td>
                      <td className="px-4 py-3 text-right text-gray-900 font-semibold">
                        ₹ {parseFloat(sku.estimatedValue).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs max-w-xs">
                        <details>
                          <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                            View Details
                          </summary>
                          <p className="mt-2 bg-gray-50 p-2 rounded text-gray-700">{sku.specification}</p>
                        </details>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="mt-6 grid grid-cols-4 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 mb-1">TOTAL ITEMS</p>
                  <p className="text-2xl font-bold text-blue-900">{skuDetails.length}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs text-green-600 mb-1">TOTAL QUANTITY</p>
                  <p className="text-2xl font-bold text-green-900">
                    {skuDetails.reduce((sum: number, sku: any) => sum + (parseInt(sku.quantity) || 0), 0)}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-600 mb-1">TOTAL VALUE</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ₹ {skuDetails.reduce((sum: number, sku: any) => sum + (parseFloat(sku.estimatedValue) || 0), 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 mb-1">TENDER VALUE</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹ {tender.value ? parseFloat(tender.value).toLocaleString('en-IN') : 'N/A'}
                  </p>
                </div>
              </div>
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
            onClick={handleDownloadCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
}
