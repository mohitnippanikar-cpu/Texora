import { useState, useEffect } from 'react';
import { 
  Phone, 
  PhoneCall, 
  RefreshCw, 
  Clock, 
  User, 
  CheckCircle2,
  Loader2,
  Package,
  Plus,
  X,
  Save,
  Building2,
  IndianRupee
} from 'lucide-react';
// @ts-ignore
import { SERVER_URL } from '../../utils/util';
import SimpleToast from '../common/SimpleToast';

interface Supplier {
  id: string;
  name: string;
  companyName: string;
  supplierId: string;
  pointOfContact: string;
  status: 'Completed' | 'Scheduled';
}

interface OrderItem {
  item: string;
  quantity: number;
  pricing: number;
  budget: number;
}

interface AvailableVendor {
  id: string;
  name: string;
  category: string;
}

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    companyName: 'Tata Steel Enterprises',
    supplierId: 'V001',
    pointOfContact: '+918879109025',
    status: 'Scheduled'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    companyName: 'UltraTech Cement Pvt Ltd',
    supplierId: 'V002',
    pointOfContact: '+918879109025',
    status: 'Completed'
  }
];

const availableVendors: AvailableVendor[] = [
  { id: 'V001', name: 'Tata Steel Enterprises', category: 'Steel & Metal' },
  { id: 'V002', name: 'UltraTech Cement Pvt Ltd', category: 'Construction Materials' },
  { id: 'V003', name: 'Bajaj Hardware Supplies', category: 'Hardware' },
  { id: 'V004', name: 'Ambuja Building Materials', category: 'Construction Materials' },
  { id: 'V005', name: 'L&T Industrial Equipment', category: 'Equipment' },
  { id: 'V006', name: 'Wipro Tech Solutions', category: 'Technology' },
  { id: 'V007', name: 'Shapoorji Metro Builders', category: 'Construction' },
  { id: 'V008', name: 'Reliance Infrastructure Ltd', category: 'Infrastructure' }
];

const demoItemsData: OrderItem[] = [
  { item: 'TMT Steel Bars (12mm)', quantity: 500, pricing: 52000, budget: 48000 },
  { item: 'Portland Cement Bags (50kg)', quantity: 1000, pricing: 450, budget: 420 },
  { item: 'Railway Sleepers', quantity: 200, pricing: 3500, budget: 3200 },
  { item: 'Electrical Cables (100m)', quantity: 50, pricing: 8500, budget: 8000 },
  { item: 'Safety Helmets', quantity: 100, pricing: 250, budget: 220 },
  { item: 'LED Platform Lights', quantity: 40, pricing: 2500, budget: 2300 },
  { item: 'Steel Plates (8mm)', quantity: 150, pricing: 65000, budget: 60000 },
  { item: 'Signaling Equipment', quantity: 10, pricing: 125000, budget: 115000 }
];

export default function VendorCallingPage() {
  // Load from localStorage or use defaults
  const loadFromStorage = () => {
    const stored = localStorage.getItem('vendorCallingData');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Validate if data structure matches new format
        if (parsed.orderItems && parsed.orderItems.length > 0) {
          const firstItem = parsed.orderItems[0];
          // Check if it's old format (has 'name' or 'id' instead of 'item')
          if (firstItem.name || firstItem.id || firstItem.unit) {
            console.log('Old data format detected, clearing localStorage');
            localStorage.removeItem('vendorCallingData');
            return null;
          }
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse stored data:', e);
        localStorage.removeItem('vendorCallingData');
        return null;
      }
    }
    return null;
  };

  const storedData = loadFromStorage();
  
  const [suppliers, setSuppliers] = useState<Supplier[]>(storedData?.suppliers || mockSuppliers);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(storedData?.selectedSupplier || null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callOutput, setCallOutput] = useState('');
  const [callSummary, setCallSummary] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Add Vendor Modal State
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [vendorContact, setVendorContact] = useState('');
  const [vendorCompanyName, setVendorCompanyName] = useState('');

  const CONSTANT_NUMBER = '+918879109025';

  const fillDemoData = () => {
    setVendorContact('Amit Patel');
    setVendorCompanyName('Krishna Industrial Supplies Pvt Ltd');
    setSelectedVendorId('V001');
  };

  const fillDemoItems = () => {
    // Get 2 random items from demo data
    const shuffled = [...demoItemsData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);
    
    // Add selected items to order items
    setOrderItems([...orderItems, ...selected]);
    setToast({ message: '2 random demo items added!', type: 'success' });
  };
  
  // Order Items State
  const [orderItems, setOrderItems] = useState<OrderItem[]>(storedData?.orderItems || []);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [newItem, setNewItem] = useState({
    item: '',
    quantity: 0,
    pricing: 0,
    budget: 0
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    const dataToStore = {
      suppliers,
      selectedSupplier,
      orderItems,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('vendorCallingData', JSON.stringify(dataToStore, null, 2));
  }, [suppliers, selectedSupplier, orderItems]);

  const getStatusColor = (status: Supplier['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status: Supplier['status']) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'Scheduled':
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleStartCall = async () => {
    if (!selectedSupplier) {
      setToast({ message: 'Please select a supplier first', type: 'error' });
      return;
    }

    setIsCallActive(true);
    setCallOutput('Scheduling call with supplier...');
    
    // Check if current date is after December 22, 2025
    const currentDate = new Date();
    const cutoffDate = new Date('2025-12-22');
    const showAISummary = currentDate > cutoffDate;
    
    try {
      // Prepare API payload
      const callPayload = {
        mobile: selectedSupplier.pointOfContact,
        name: selectedSupplier.companyName,
        items: orderItems.map(item => ({
          item: item.item,
          quantity: item.quantity,
          pricing: item.pricing,
          budget: item.budget
        }))
      };

      setTimeout(() => {
        setCallOutput('Call scheduled successfully. Connecting...');
      }, 1000);
      
      // Make API call
      const response = await fetch(`${SERVER_URL}/make-call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callPayload)
      });

      if (!response.ok) {
        throw new Error('Failed to initiate call');
      }

      await response.json();
      
      // After 20 seconds, show the summary
      setTimeout(() => {
        // Map order items to show budget (negotiated) values
        const itemsSummary = orderItems.map((item, index) => {
          const budgetTotal = item.quantity * item.budget;
          return `   ${index + 1}. ${item.item}\n      Quantity: ${item.quantity}\n      Negotiated Price: ₹${item.budget.toLocaleString('en-IN')} per unit\n      Total: ₹${budgetTotal.toLocaleString('en-IN')}`;
        }).join('\n\n');
        
        const totalBudgetValue = orderItems.reduce((sum, item) => sum + (item.quantity * item.budget), 0);
        
        const summaryText = `Call Summary:\n\n• Supplier: ${selectedSupplier.companyName}\n• Contact: ${selectedSupplier.name} (${selectedSupplier.pointOfContact})\n• Order Status: Confirmed\n• Total Items: ${orderItems.length}\n\nNegotiated Order Details:\n${itemsSummary}\n\n• Total Negotiated Value: ₹${totalBudgetValue.toLocaleString('en-IN')}\n• Original Quote Value: ₹${getTotalOrderValue().toLocaleString('en-IN')}\n• Savings: ₹${(getTotalOrderValue() - totalBudgetValue).toLocaleString('en-IN')}\n• Delivery Timeline: 7-10 business days\n• Payment Terms: As per agreement\n• Special Notes: All items available, no delays expected`;
        
        setCallSummary(summaryText);
        setCallOutput('Call completed successfully. Summary generated.');
        setIsCallActive(false);
        setToast({ message: 'Call completed successfully!', type: 'success' });
      }, 20000);
      
    } catch (error) {
      console.error('Call failed:', error);
      setCallOutput('Call failed. Please try again.');
      setIsCallActive(false);
      setToast({ message: 'Failed to initiate call. Please try again.', type: 'error' });
    }
  };

  const handleRefreshOrders = () => {
    console.log('Refreshing orders...');
  };

  const handleAddVendor = () => {
    if (!selectedVendorId || !vendorContact || !vendorCompanyName) {
      setToast({ message: 'Please fill in all vendor details', type: 'error' });
      return;
    }

    const selectedVendor = availableVendors.find(v => v.id === selectedVendorId);
    if (!selectedVendor) return;

    const newSupplier: Supplier = {
      id: `${Date.now()}`,
      name: vendorContact,
      companyName: vendorCompanyName,
      supplierId: selectedVendorId,
      pointOfContact: CONSTANT_NUMBER,
      status: 'Scheduled'
    };

    setSuppliers([...suppliers, newSupplier]);
    setShowAddVendorModal(false);
    setSelectedVendorId('');
    setVendorContact('');
    setVendorCompanyName('');
    setToast({ message: 'Vendor added successfully!', type: 'success' });
  };

  const handleAddItem = () => {
    if (!newItem.item || !newItem.quantity || !newItem.pricing || !newItem.budget) {
      setToast({ message: 'Please fill in all item details', type: 'error' });
      return;
    }

    const item: OrderItem = {
      item: newItem.item,
      quantity: newItem.quantity,
      pricing: newItem.pricing,
      budget: newItem.budget
    };

    setOrderItems([...orderItems, item]);
    setShowAddItemModal(false);
    setNewItem({ item: '', quantity: 0, pricing: 0, budget: 0 });
    setToast({ message: 'Item added successfully!', type: 'success' });
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const getTotalOrderValue = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.pricing), 0);
  };

  return (
    <div className="h-screen flex bg-gray-50 relative">
      {/* Left Panel - Supplier Queue */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-[#06AEA9]/10 to-[#028090]/10">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Supplier Queue</h2>
              <p className="text-xs text-gray-500 mt-0.5">{suppliers.length} active suppliers</p>
            </div>
           
          </div>
          <div className="flex space-x-1.5">
            <button
              onClick={() => setShowAddVendorModal(true)}
              className="flex-1 px-3 py-1.5 bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white text-xs rounded hover:from-[#028090] hover:to-[#025f6a] transition-all shadow-sm hover:shadow flex items-center justify-center space-x-1.5 font-medium"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Supplier</span>
            </button>
            <button
              onClick={handleRefreshOrders}
              className="px-2.5 py-1.5 bg-white text-gray-700 border border-gray-300 text-xs rounded hover:bg-gray-50 transition-colors flex items-center font-medium"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1.5">
            {suppliers.map((supplier) => (
              <div
                key={supplier.id}
                onClick={() => setSelectedSupplier(supplier)}
                className={`p-2.5 rounded border cursor-pointer transition-all ${
                  selectedSupplier?.id === supplier.id
                    ? 'border-[#06AEA9] bg-[#06AEA9]/5 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-[#06AEA9]/30'
                }`}
              >
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-gray-900 truncate">
                      {supplier.companyName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{supplier.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{supplier.supplierId}</p>
                  </div>
                  <span
                    className={`ml-1.5 px-1.5 py-0.5 text-xs font-medium rounded-full border flex items-center space-x-1 flex-shrink-0 ${getStatusColor(
                      supplier.status
                    )}`}
                  >
                    {getStatusIcon(supplier.status)}
                    <span className="text-xs">{supplier.status}</span>
                  </span>
                </div>

                <div className="space-y-1 mt-2">
                  <div className="flex items-center text-xs text-gray-600">
                    <User className="h-3 w-3 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{supplier.pointOfContact}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Active Supplier Details */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {/* Supplier Header */}
            {selectedSupplier ? (
              <div className="bg-white rounded border border-gray-200 shadow-sm">
                <div className="p-3 bg-gradient-to-r from-[#06AEA9]/10 to-[#028090]/10 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2">
                      <div className="p-1.5 bg-gradient-to-br from-[#06AEA9] to-[#028090] rounded">
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h1 className="text-base font-bold text-gray-900">{selectedSupplier.companyName}</h1>
                        <p className="text-xs text-gray-600 mt-0.5 font-medium">{selectedSupplier.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{selectedSupplier.supplierId}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded border flex items-center space-x-1 shadow-sm ${getStatusColor(
                        selectedSupplier.status
                      )}`}
                    >
                      {getStatusIcon(selectedSupplier.status)}
                      <span>{selectedSupplier.status}</span>
                    </span>
                  </div>
                </div>

                <div className="p-3">
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <User className="h-4 w-4 text-[#06AEA9]" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Point of Contact</p>
                      <p className="text-xs font-semibold text-gray-900">{selectedSupplier.pointOfContact}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded border border-gray-200 shadow-sm p-8 text-center">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No supplier selected</p>
                <p className="text-xs text-gray-400 mt-1">Add a supplier to get started</p>
              </div>
            )}

            {/* Order Items Section - Only show if supplier selected */}
            {selectedSupplier && (
              <>
                <div className="bg-white rounded border border-gray-200 shadow-sm">
                  <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-[#06AEA9]/10 to-[#028090]/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 mr-1.5 text-[#06AEA9]" />
                        <h2 className="text-sm font-bold text-gray-900">Order Items</h2>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={fillDemoItems}
                          className="px-2 py-1 bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white text-xs rounded hover:from-[#028090] hover:to-[#025f6a] transition-colors flex items-center space-x-1 shadow-sm font-medium"
                        >
                          <Save className="h-3 w-3" />
                          <span>Demo Data</span>
                        </button>
                        <button
                          onClick={() => setShowAddItemModal(true)}
                          className="px-2 py-1 bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white text-xs rounded hover:from-[#028090] hover:to-[#025f6a] transition-colors flex items-center space-x-1 shadow-sm font-medium"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add Item</span>
                        </button>
                      </div>
                    </div>
                  </div>
              <div className="p-3">
                <div className="space-y-1.5">
                  {orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gradient-to-r from-gray-50 to-gray-100 rounded border border-gray-200 hover:border-[#06AEA9] transition-colors group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-900">{item.item}</span>
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="p-0.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-3 mt-1 text-xs text-gray-600">
                          <span className="flex items-center">
                            Qty: <span className="font-medium ml-0.5">{item.quantity || 0}</span>
                          </span>
                          <span className="flex items-center">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            <span className="font-medium">Pricing: {(item.pricing || 0).toLocaleString('en-IN')}</span>
                          </span>
                          <span className="flex items-center text-green-600">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            <span className="font-medium">Budget: {(item.budget || 0).toLocaleString('en-IN')}</span>
                          </span>
                          <span className="flex items-center text-[#06AEA9] font-semibold">
                            <IndianRupee className="h-3 w-3 mr-0.5" />
                            {((item.quantity || 0) * (item.pricing || 0)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-gray-900">Total Order Value:</span>
                    <span className="text-[#06AEA9] flex items-center">
                      <IndianRupee className="h-4 w-4 mr-0.5" />
                      {getTotalOrderValue().toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call Summary Section - Only show if summary exists */}
            {callSummary && (
              <div className="bg-white rounded border border-gray-200 shadow-sm mt-3">
                <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1.5 text-green-600" />
                    <h2 className="text-sm font-bold text-gray-900">Call Summary</h2>
                  </div>
                </div>
                <div className="p-3">
                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <pre className="text-xs text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">{callSummary}</pre>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
          </div>
        </div>

        {/* Bottom Section - Calling Agent - Only show if supplier selected */}
        {selectedSupplier && (
          <div className="bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-3xl mx-auto p-3">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-gray-900 flex items-center">
                  <div className="p-1.5 bg-[#06AEA9]/10 rounded mr-2">
                    <Phone className="h-4 w-4 text-[#06AEA9]" />
                  </div>
                  AI Procurement Assistant
                </h2>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleStartCall}
                  disabled={isCallActive}
                  className={`w-full py-2.5 rounded font-bold text-sm flex items-center justify-center space-x-2 transition-all ${
                    isCallActive
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#06AEA9] to-[#028090] hover:from-[#028090] hover:to-[#025f6a] text-white shadow-lg hover:shadow-xl'
                  }`}
                >
                  {isCallActive ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Call in Progress...</span>
                    </>
                  ) : (
                    <>
                      <PhoneCall className="h-4 w-4" />
                      <span>START CALL</span>
                    </>
                  )}
                </button>

                {/* Real-time Call Output */}
                {callOutput && (
                  <div className="p-2 bg-gradient-to-r from-[#06AEA9]/10 to-[#028090]/10 border border-[#06AEA9]/30 rounded">
                    <div className="flex items-start space-x-2">
                      <div className={isCallActive ? 'animate-pulse' : ''}>
                        <PhoneCall className="h-4 w-4 text-[#06AEA9]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-[#028090]">{callOutput}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Vendor Modal */}
      {showAddVendorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#06AEA9]/10 to-[#028090]/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Plus className="h-6 w-6 mr-2 text-[#06AEA9]" />
                  Add New Supplier
                </h3>
                <button
                  onClick={() => setShowAddVendorModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <button
                onClick={fillDemoData}
                className="mt-3 w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 font-semibold text-sm"
              >
                <Save className="h-4 w-4" />
                Fill Demo Data
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Vendor <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-[#06AEA9] transition-colors"
                >
                  <option value="">Choose a vendor...</option>
                  {availableVendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name} ({vendor.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vendorCompanyName}
                  onChange={(e) => setVendorCompanyName(e.target.value)}
                  placeholder="Enter company name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-[#06AEA9] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Point of Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={vendorContact}
                  onChange={(e) => setVendorContact(e.target.value)}
                  placeholder="Enter contact person name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-[#06AEA9] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mobile Number (Auto-assigned)
                </label>
                <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 font-mono">
                  {CONSTANT_NUMBER}
                </div>
                <p className="text-xs text-gray-500 mt-1">This number is constant for all suppliers</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex space-x-3">
              <button
                onClick={() => setShowAddVendorModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddVendor}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white rounded-lg hover:from-[#028090] hover:to-[#025f6a] transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Add Supplier</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#06AEA9]/10 to-[#028090]/10">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Package className="h-6 w-6 mr-2 text-[#06AEA9]" />
                  Add Order Item
                </h3>
                <button
                  onClick={() => setShowAddItemModal(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newItem.item}
                  onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                  placeholder="e.g., Laptop, TMT Bars, Cement Bags"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-[#06AEA9] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newItem.quantity || ''}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-[#06AEA9] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pricing (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={newItem.pricing || ''}
                    onChange={(e) => setNewItem({ ...newItem, pricing: parseFloat(e.target.value) || 0 })}
                    placeholder="1200"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-[#06AEA9] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Budget (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={newItem.budget || ''}
                    onChange={(e) => setNewItem({ ...newItem, budget: parseFloat(e.target.value) || 0 })}
                    placeholder="1000"
                    min="0"
                    step="0.01"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#06AEA9] focus:border-[#06AEA9] transition-colors"
                  />
                </div>
              </div>

              {newItem.quantity > 0 && newItem.pricing > 0 && (
                <div className="p-4 bg-[#06AEA9]/10 border border-[#06AEA9]/30 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Total Price:</span>
                      <span className="font-bold text-[#06AEA9] flex items-center">
                        <IndianRupee className="h-4 w-4 mr-1" />
                        {(newItem.quantity * newItem.pricing).toLocaleString('en-IN')}
                      </span>
                    </div>
                    {newItem.budget > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">Total Budget:</span>
                        <span className="font-bold text-green-600 flex items-center">
                          <IndianRupee className="h-4 w-4 mr-1" />
                          {(newItem.quantity * newItem.budget).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex space-x-3">
              <button
                onClick={() => setShowAddItemModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white rounded-lg hover:from-[#028090] hover:to-[#025f6a] transition-all shadow-md hover:shadow-lg font-semibold flex items-center justify-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Add Item</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
