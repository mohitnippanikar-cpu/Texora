import React from 'react';
import { X, MapPin, Wifi, Accessibility, Camera, ParkingCircle, Bus } from 'lucide-react';

interface StationInfoModalProps {
  onClose: () => void;
  language?: 'en' | 'ml';
}

const StationInfoModal: React.FC<StationInfoModalProps> = ({ onClose, language = 'en' }) => {
  const content = language === 'ml' ? {
    title: 'സ്റ്റേഷൻ വിവരങ്ങൾ',
    subtitle: 'സ്റ്റേഷൻ ശൃംഖലയും സൗകര്യങ്ങളും',
    totalStations: 'മൊത്തം സ്റ്റേഷനുകൾ',
    majorStations: 'പ്രധാന സ്റ്റേഷനുകൾ',
    facilities: 'സൗകര്യങ്ങൾ',
    mainTerminal: 'മെയിൻ ടെർമിനൽ',
    shoppingHub: 'ഷോപ്പിംഗ് ഹബ്',
    businessDistrict: 'ബിസിനസ് ഡിസ്ട്രിക്റ്റ്',
    educationHub: 'എജ്യുക്കേഷൻ ഹബ്',
    wheelchairAccess: 'വീൽചെയർ ആക്സസ്',
    digitalDisplays: 'ഡിജിറ്റൽ ഡിസ്പ്ലേകൾ',
    cctvSurveillance: 'സിസിടിവി നിരീക്ഷണം',
    cleanRestrooms: 'ക്ലീൻ ടോയ്ലറ്റുകൾ',
    parkingAvailable: 'പാർക്കിംഗ് സൗകര്യം',
    feederBus: 'ഫീഡർ ബസ്',
  } : {
    title: 'Station Information',
    subtitle: 'Network and facilities',
    totalStations: 'Total Stations',
    majorStations: 'Major Stations',
    facilities: 'Facilities',
    mainTerminal: 'Main Terminal',
    shoppingHub: 'Shopping Hub',
    businessDistrict: 'Business District',
    educationHub: 'Education Hub',
    wheelchairAccess: 'Wheelchair Access',
    digitalDisplays: 'Digital Displays',
    cctvSurveillance: 'CCTV Surveillance',
    cleanRestrooms: 'Clean Restrooms',
    parkingAvailable: 'Parking Available',
    feederBus: 'Feeder Bus Service',
  };

  const stations = [
    { 
      name: 'Aluva', 
      name_ml: 'ആലുവ',
      type: content.mainTerminal,
      facilities: ['parking', 'wifi', 'accessibility', 'feeder', 'cctv']
    },
    { 
      name: 'Edappally',
      name_ml: 'എടപ്പള്ളി',
      type: content.shoppingHub,
      facilities: ['wifi', 'accessibility', 'feeder', 'cctv']
    },
    { 
      name: 'MG Road',
      name_ml: 'എംജി റോഡ്',
      type: content.businessDistrict,
      facilities: ['wifi', 'accessibility', 'cctv', 'parking']
    },
    { 
      name: 'Maharaja\'s College',
      name_ml: 'മഹാരാജാസ് കോളേജ്',
      type: content.educationHub,
      facilities: ['wifi', 'accessibility', 'feeder', 'cctv']
    },
  ];

  const facilityIcons: Record<string, any> = {
    parking: <ParkingCircle className="w-4 h-4" />,
    wifi: <Wifi className="w-4 h-4" />,
    accessibility: <Accessibility className="w-4 h-4" />,
    feeder: <Bus className="w-4 h-4" />,
    cctv: <Camera className="w-4 h-4" />,
  };

  const allFacilities = [
    { icon: <Accessibility className="w-5 h-5" />, text: content.wheelchairAccess, color: 'blue' },
    { icon: <Wifi className="w-5 h-5" />, text: content.digitalDisplays, color: 'purple' },
    { icon: <Camera className="w-5 h-5" />, text: content.cctvSurveillance, color: 'red' },
    { icon: <MapPin className="w-5 h-5" />, text: content.cleanRestrooms, color: 'green' },
    { icon: <ParkingCircle className="w-5 h-5" />, text: content.parkingAvailable, color: 'orange' },
    { icon: <Bus className="w-5 h-5" />, text: content.feederBus, color: 'teal' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{content.title}</h2>
              <p className="text-cyan-100 text-sm">{content.subtitle}</p>
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
          {/* Total Stations */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200 text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">{content.totalStations}</div>
            <div className="text-6xl font-bold text-blue-600">22</div>
            <div className="text-sm text-gray-600 mt-2">Aluva to Kaloor</div>
          </div>

          {/* Major Stations */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {content.majorStations}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {stations.map((station, index) => (
                <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">
                        {language === 'ml' ? station.name_ml : station.name}
                      </h4>
                      <p className="text-sm text-gray-600">{station.type}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MapPin className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {station.facilities.map((facility, idx) => (
                      <div key={idx} className="flex items-center gap-1 px-2 py-1 bg-white rounded-md text-gray-700 text-xs border border-gray-200">
                        {facilityIcons[facility]}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Facilities */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{content.facilities}</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
              {allFacilities.map((facility, index) => (
                <div key={index} className={`flex items-center gap-3 p-3 bg-${facility.color}-50 rounded-lg border border-${facility.color}-200`}>
                  <div className={`p-2 bg-${facility.color}-100 rounded-lg text-${facility.color}-600`}>
                    {facility.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{facility.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Network Map Preview */}
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Network Coverage</h3>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <div className="text-center flex-1">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mx-auto mb-2"></div>
                  <div className="font-semibold text-gray-900">Aluva</div>
                  <div className="text-xs text-gray-500">Start</div>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-blue-300 mx-2"></div>
                <div className="text-center flex-1">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mx-auto mb-2"></div>
                  <div className="font-semibold text-gray-900">MG Road</div>
                  <div className="text-xs text-gray-500">Hub</div>
                </div>
                <div className="flex-1 border-t-2 border-dashed border-blue-300 mx-2"></div>
                <div className="text-center flex-1">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mx-auto mb-2"></div>
                  <div className="font-semibold text-gray-900">Kaloor</div>
                  <div className="text-xs text-gray-500">End</div>
                </div>
              </div>
              <div className="text-center mt-4 text-xs text-gray-600">
                25.6 km • 22 Stations • 25 minutes end-to-end
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StationInfoModal;


