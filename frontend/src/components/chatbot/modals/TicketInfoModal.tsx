import React from 'react';
import { X, CreditCard, Smartphone, Ticket, DollarSign, Calendar } from 'lucide-react';

interface TicketInfoModalProps {
  onClose: () => void;
  language?: 'en' | 'ml';
}

const TicketInfoModal: React.FC<TicketInfoModalProps> = ({ onClose, language = 'en' }) => {
  const content = language === 'ml' ? {
    title: 'ടിക്കറ്റ് വിവരങ്ങൾ',
    subtitle: 'നിരക്കും പേയ്മെന്റ് ഓപ്ഷനുകളും',
    paymentOptions: 'പേയ്മെന്റ് ഓപ്ഷനുകൾ',
    kochi1Card: 'കൊച്ചി1 കാർഡ്',
    contactless: 'കോൺടാക്റ്റ്‌ലെസ്',
    mobileApp: 'മൊബൈൽ ആപ്പ്',
    qrCode: 'ക്യുആർ കോഡ്',
    tokenTickets: 'ടോക്കൺ ടിക്കറ്റുകൾ',
    upiWallets: 'യുപിഐ & വാലറ്റുകൾ',
    fareStructure: 'നിരക്ക് ഘടന',
    minimum: 'മിനിമം',
    maximum: 'മാക്സിമം',
    dayPass: 'പ്രതിദിന പാസ്',
    monthlyPass: 'മാസിക പാസ്',
    smartFeatures: 'സ്മാർട്ട് ഫീച്ചറുകൾ',
    autoRecharge: 'ഓട്ടോ റീചാർജ്',
    travelHistory: 'ട്രാവൽ ഹിസ്റ്ററി',
    discountCoupons: 'ഡിസ്കൗണ്ട് കൂപ്പണുകൾ',
    groupBooking: 'ഗ്രൂപ്പ് ബുക്കിംഗ്',
  } : {
    title: 'Ticket Information',
    subtitle: 'Fares and payment options',
    paymentOptions: 'Payment Options',
    kochi1Card: 'Kochi1 Card',
    contactless: 'Contactless',
    mobileApp: 'Mobile App',
    qrCode: 'QR Code',
    tokenTickets: 'Token Tickets',
    upiWallets: 'UPI & Wallets',
    fareStructure: 'Fare Structure',
    minimum: 'Minimum',
    maximum: 'Maximum',
    dayPass: 'Day Pass',
    monthlyPass: 'Monthly Pass',
    smartFeatures: 'Smart Features',
    autoRecharge: 'Auto Recharge',
    travelHistory: 'Travel History',
    discountCoupons: 'Discount Coupons',
    groupBooking: 'Group Booking',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{content.title}</h2>
              <p className="text-purple-100 text-sm">{content.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Payment Options */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 border-b border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                {content.paymentOptions}
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{content.kochi1Card}</div>
                    <div className="text-xs text-gray-600">{content.contactless}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Smartphone className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{content.mobileApp}</div>
                    <div className="text-xs text-gray-600">{content.qrCode}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Ticket className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{content.tokenTickets}</div>
                    <div className="text-xs text-gray-600">Physical tickets</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Smartphone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{content.upiWallets}</div>
                    <div className="text-xs text-gray-600">Digital payments</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fare Structure */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 border-b border-green-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                {content.fareStructure}
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                <div className="text-sm font-medium text-gray-600 mb-2">{content.minimum}</div>
                <div className="text-4xl font-bold text-blue-600 mb-1">₹10</div>
                <div className="text-xs text-gray-600">Up to 2 km</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <div className="text-sm font-medium text-gray-600 mb-2">{content.maximum}</div>
                <div className="text-4xl font-bold text-purple-600 mb-1">₹25</div>
                <div className="text-xs text-gray-600">25+ km</div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
                <div className="text-sm font-medium text-gray-600 mb-2">{content.dayPass}</div>
                <div className="text-4xl font-bold text-orange-600 mb-1">₹80</div>
                <div className="text-xs text-gray-600">Unlimited rides</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                <div className="text-sm font-medium text-gray-600 mb-2">{content.monthlyPass}</div>
                <div className="text-4xl font-bold text-green-600 mb-1">₹1,200</div>
                <div className="text-xs text-gray-600">30 days validity</div>
              </div>
            </div>
          </div>

          {/* Distance-based Fares */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Distance-Based Fares</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {[
                  { distance: '0-2 km', fare: '₹10' },
                  { distance: '2-5 km', fare: '₹15' },
                  { distance: '5-10 km', fare: '₹18' },
                  { distance: '10-15 km', fare: '₹20' },
                  { distance: '15-20 km', fare: '₹22' },
                  { distance: '20+ km', fare: '₹25' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-gray-700">{item.distance}</span>
                    <span className="text-lg font-bold text-blue-600">{item.fare}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Smart Features */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              {content.smartFeatures}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{content.autoRecharge}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{content.travelHistory}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{content.discountCoupons}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-indigo-200">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">{content.groupBooking}</span>
              </div>
            </div>
          </div>

          {/* Discounts Info */}
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <Ticket className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">
                  {language === 'ml' ? 'പ്രത്യേക കിഴിവുകൾ' : 'Special Discounts'}
                </p>
                <p>
                  {language === 'ml' 
                    ? 'വിദ്യാർത്ഥികൾക്ക് 50% കിഴിവ് • സീനിയർ സിറ്റിസൺസിന് 10% കിഴിവ് • സ്മാർട്ട് കാർഡിന് 10% കിഴിവ്'
                    : 'Students: 50% off with ID • Senior Citizens: 10% discount • Smart Card users: 10% cashback'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketInfoModal;


