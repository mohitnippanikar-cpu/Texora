import React from 'react';
import { X, Train, Activity, Wrench, Shield, TrendingUp, Zap } from 'lucide-react';

interface FleetStatusModalProps {
  onClose: () => void;
  language?: 'en' | 'ml';
}

const FleetStatusModal: React.FC<FleetStatusModalProps> = ({ onClose, language = 'en' }) => {
  const content = language === 'ml' ? {
    title: 'ഫ്ലീറ്റ് സ്ഥിതി',
    subtitle: 'തത്സമയ ട്രെയിൻ വിവരങ്ങൾ',
    operational: 'പ്രവർത്തനത്തിൽ',
    maintenance: 'അറ്റകുറ്റപ്പണി',
    availability: 'ലഭ്യത',
    healthScore: 'ആരോഗ്യ സ്കോർ',
    performance: 'പ്രകടനം',
    excellent: 'മികച്ചത്',
    scheduled: 'ഷെഡ്യൂൾഡ്',
    aboveTarget: 'ലക്ഷ്യത്തിനു മുകളിൽ',
    operational_status: 'പ്രവർത്തന സ്ഥിതി',
    onTime: 'സമയനിഷ്ഠ',
    safetySystem: 'സുരക്ഷാ സംവിധാനങ്ങൾ',
    functional: 'പ്രവർത്തനക്ഷമം',
    capacity: 'ശേഷി',
    personsPerTrain: 'പേർ/ട്രെയിൻ',
    efficiency: 'കാര്യക്ഷമത',
    optimal: 'ഒപ്റ്റിമൽ',
    maintenance_info: 'അറ്റകുറ്റപ്പണി വിവരങ്ങൾ',
    routineMaintenance: 'പതിവ് അറ്റകുറ്റപ്പണി',
    expectedCompletion: 'പ്രതീക്ഷിക്കുന്ന പൂർത്തീകരണം',
    tomorrow: 'നാളെ',
    backupTrains: 'ബാക്കപ്പ് ട്രെയിനുകൾ',
    available: 'ലഭ്യമാണ്',
  } : {
    title: 'Fleet Status',
    subtitle: 'Real-time train information',
    operational: 'Operational',
    maintenance: 'Maintenance',
    availability: 'Availability',
    healthScore: 'Health Score',
    performance: 'Performance',
    excellent: 'Excellent',
    scheduled: 'Scheduled',
    aboveTarget: 'Above Target',
    operational_status: 'Operational Status',
    onTime: 'All trains on schedule',
    safetySystem: 'Safety Systems',
    functional: '100% Functional',
    capacity: 'Passenger Capacity',
    personsPerTrain: 'persons/train',
    efficiency: 'Energy Efficiency',
    optimal: '95% Optimal',
    maintenance_info: 'Maintenance Information',
    routineMaintenance: 'Routine Maintenance',
    expectedCompletion: 'Expected Completion',
    tomorrow: 'Tomorrow',
    backupTrains: 'Backup Trains',
    available: 'Available on standby',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Train className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{content.title}</h2>
              <p className="text-emerald-100 text-sm">{content.subtitle}</p>
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
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Train className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  {content.excellent}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-600 mb-1">{content.operational}</div>
              <div className="text-3xl font-bold text-gray-900">18/20</div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Wrench className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                  {content.scheduled}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-600 mb-1">{content.maintenance}</div>
              <div className="text-3xl font-bold text-gray-900">2</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Activity className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  {content.aboveTarget}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-600 mb-1">{content.availability}</div>
              <div className="text-3xl font-bold text-gray-900">94.2%</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  {content.excellent}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-600 mb-1">{content.healthScore}</div>
              <div className="text-3xl font-bold text-gray-900">92%</div>
            </div>
          </div>

          {/* Operational Status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                {content.operational_status}
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-gray-700">Schedule Performance</span>
                <span className="text-lg font-bold text-green-700">✓ {content.onTime}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-medium text-gray-700">{content.safetySystem}</span>
                <span className="text-lg font-bold text-green-700">{content.functional}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-gray-700">{content.capacity}</span>
                <span className="text-lg font-bold text-blue-700">975 {content.personsPerTrain}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-sm font-medium text-gray-700">{content.efficiency}</span>
                <span className="text-lg font-bold text-purple-700">{content.optimal}</span>
              </div>
            </div>
          </div>

          {/* Visual Fleet Status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Live Fleet Visualization</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-5 gap-3">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      i < 18 ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                      'bg-gradient-to-br from-orange-500 to-amber-600'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded"></div>
                  <span className="text-gray-700 font-medium">{content.operational}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-amber-600 rounded"></div>
                  <span className="text-gray-700 font-medium">{content.maintenance}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Info */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-orange-600" />
              {content.maintenance_info}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm font-medium text-gray-700">{content.routineMaintenance}</span>
                <span className="text-sm font-semibold text-orange-700">Train #07, #14</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm font-medium text-gray-700">{content.expectedCompletion}</span>
                <span className="text-sm font-semibold text-orange-700">{content.tomorrow} 06:00 AM</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                <span className="text-sm font-medium text-gray-700">{content.backupTrains}</span>
                <span className="text-sm font-semibold text-green-700">✓ {content.available}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FleetStatusModal;


