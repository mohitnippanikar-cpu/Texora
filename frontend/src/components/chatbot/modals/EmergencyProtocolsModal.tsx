import React from 'react';
import { X, AlertTriangle, Phone, Shield, Zap, Heart, MapPin } from 'lucide-react';

interface EmergencyProtocolsModalProps {
  onClose: () => void;
  language?: 'en' | 'ml';
}

const EmergencyProtocolsModal: React.FC<EmergencyProtocolsModalProps> = ({ onClose, language = 'en' }) => {
  const content = language === 'ml' ? {
    title: 'അടിയന്തിര പ്രോട്ടോക്കോളുകൾ',
    subtitle: 'സുരക്ഷാ വിവരങ്ങളും എമർജൻസി കോൺടാക്റ്റുകളും',
    emergencyContacts: 'അടിയന്തിര കോൺടാക്റ്റുകൾ',
    controlRoom: 'കൺട്രോൾ റൂം',
    helpline: 'ഹെൽപ്‌ലൈൻ',
    available24x7: '24/7 ലഭ്യമാണ്',
    safetyFeatures: 'സുരക്ഷാ സൗകര്യങ്ങൾ',
    emergencyButton: 'അടിയന്തിര ബട്ടൺ',
    inAllTrains: 'എല്ലാ ട്രെയിനുകളിലും',
    cctvMonitoring: 'സിസിടിവി മോണിറ്ററിംഗ്',
    allStations: 'എല്ലാ സ്റ്റേഷനുകളിലും',
    firstAidKit: 'ഫസ്റ്റ് എയ്ഡ് കിറ്റ്',
    available: 'ലഭ്യമാണ്',
    fireSafety: 'അഗ്നി സുരക്ഷ',
    equipment: 'ഉപകരണങ്ങൾ',
    emergencyExits: 'എമർജൻസി എക്സിറ്റുകൾ',
    clearlyMarked: 'വ്യക്തമായി അടയാളപ്പെടുത്തിയത്',
    medicalAssistance: 'മെഡിക്കൽ സഹായം',
    coordination: 'കോർഡിനേഷൻ',
    powerBackup: 'പവർ ബാക്കപ്പ്',
    upsSystem: 'യുപിഎസ് സിസ്റ്റം',
    allStationsEquipped: 'എല്ലാ സ്റ്റേഷനുകളിലും',
    whatToDo: 'അടിയന്തിര സാഹചര്യത്തിൽ എന്ത് ചെയ്യണം',
  } : {
    title: 'Emergency Protocols',
    subtitle: 'Safety information and emergency contacts',
    emergencyContacts: 'Emergency Contacts',
    controlRoom: 'Control Room',
    helpline: 'Helpline',
    available24x7: 'Available 24/7',
    safetyFeatures: 'Safety Features',
    emergencyButton: 'Emergency Button',
    inAllTrains: 'In all trains',
    cctvMonitoring: 'CCTV Monitoring',
    allStations: 'All stations',
    firstAidKit: 'First Aid Kit',
    available: 'Available',
    fireSafety: 'Fire Safety',
    equipment: 'Equipment',
    emergencyExits: 'Emergency Exits',
    clearlyMarked: 'Clearly marked',
    medicalAssistance: 'Medical Assistance',
    coordination: 'Coordination',
    powerBackup: 'Power Backup',
    upsSystem: 'UPS System',
    allStationsEquipped: 'All stations equipped',
    whatToDo: 'What to Do in an Emergency',
  };

  const emergencySteps = language === 'ml' ? [
    'ശാന്തത പാലിക്കുക',
    'അടുത്തുള്ള എമർജൻസി ബട്ടൺ അമർത്തുക',
    'സ്റ്റാഫ് നിർദ്ദേശങ്ങൾ പിന്തുടരുക',
    'അടുത്തുള്ള എക്സിറ്റിലേക്ക് പോകുക',
    'കൺട്രോൾ റൂമിനെ വിളിക്കുക',
  ] : [
    'Stay calm and alert',
    'Press nearest emergency button',
    'Follow staff instructions',
    'Move to nearest exit if instructed',
    'Call control room if needed',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-600 to-orange-600 text-white p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{content.title}</h2>
              <p className="text-red-100 text-sm">{content.subtitle}</p>
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
          {/* Emergency Contacts */}
          <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-300 overflow-hidden">
            <div className="bg-red-600 text-white px-6 py-3">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Phone className="w-5 h-5" />
                {content.emergencyContacts}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">{content.controlRoom}</div>
                    <div className="text-3xl font-bold text-red-600">0484-2341234</div>
                    <div className="text-xs text-gray-500 mt-1">{content.available24x7}</div>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <Phone className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-orange-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-600 mb-1">{content.helpline}</div>
                    <div className="text-3xl font-bold text-orange-600">1800-425-5225</div>
                    <div className="text-xs text-gray-500 mt-1">{content.available24x7}</div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Phone className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Features */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                {content.safetyFeatures}
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{content.emergencyButton}</div>
                    <div className="text-xs text-gray-600">{content.inAllTrains}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{content.cctvMonitoring}</div>
                    <div className="text-xs text-gray-600">{content.allStations}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Heart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{content.firstAidKit}</div>
                    <div className="text-xs text-gray-600">{content.available}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-4 border border-orange-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{content.fireSafety}</div>
                    <div className="text-xs text-gray-600">{content.equipment}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{content.emergencyExits}</div>
                    <div className="text-xs text-gray-600">{content.clearlyMarked}</div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-green-50 rounded-lg p-4 border border-teal-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Zap className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{content.powerBackup}</div>
                    <div className="text-xs text-gray-600">{content.allStationsEquipped}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What to Do */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-300">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              {content.whatToDo}
            </h3>
            <div className="space-y-3">
              {emergencySteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-yellow-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <span className="text-gray-900 font-medium">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Important Notice */}
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">
                  {language === 'ml' ? 'പ്രധാന അറിയിപ്പ്' : 'Important Notice'}
                </p>
                <p>
                  {language === 'ml' 
                    ? 'യഥാർത്ഥ അടിയന്തിര സാഹചര്യങ്ങളിൽ മാത്രം എമർജൻസി സംവിധാനങ്ങൾ ഉപയോഗിക്കുക. തെറ്റായ അലാറങ്ങൾക്ക് പിഴ ചുമത്തും.'
                    : 'Use emergency systems only in genuine emergencies. False alarms may result in penalties.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyProtocolsModal;


