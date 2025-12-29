import React from 'react';
import { X, Activity, Zap, Wifi, Shield, TrendingUp, CheckCircle } from 'lucide-react';

interface SystemHealthModalProps {
  onClose: () => void;
  language?: 'en' | 'ml';
}

const SystemHealthModal: React.FC<SystemHealthModalProps> = ({ onClose, language = 'en' }) => {
  const content = language === 'ml' ? {
    title: 'സിസ്റ്റം ആരോഗ്യം',
    subtitle: 'തത്സമയ സിസ്റ്റം സ്ഥിതി',
    networkUptime: 'നെറ്റ്‌വർക്ക് അപ്ടൈം',
    powerSystems: 'പവർ സിസ്റ്റമുകൾ',
    communication: 'കമ്മ്യൂണിക്കേഷൻ',
    securitySystems: 'സെക്യൂരിറ്റി സിസ്റ്റമുകൾ',
    operational: 'പ്രവർത്തനക്ഷമം',
    excellent: 'മികച്ചത്',
    good: 'നല്ലത്',
    status: 'സ്ഥിതി',
    allSystemsOperational: 'എല്ലാ സിസ്റ്റമുകളും പ്രവർത്തിക്കുന്നു',
  } : {
    title: 'System Health',
    subtitle: 'Real-time system status',
    networkUptime: 'Network Uptime',
    powerSystems: 'Power Systems',
    communication: 'Communication',
    securitySystems: 'Security Systems',
    operational: 'Operational',
    excellent: 'Excellent',
    good: 'Good',
    status: 'Status',
    allSystemsOperational: 'All Systems Operational',
  };

  const systems = [
    { 
      name: content.networkUptime, 
      value: 99.7, 
      status: content.excellent, 
      icon: <Activity className="w-5 h-5" />,
      color: 'green'
    },
    { 
      name: content.powerSystems, 
      value: 99.2, 
      status: content.operational, 
      icon: <Zap className="w-5 h-5" />,
      color: 'blue'
    },
    { 
      name: content.communication, 
      value: 97.8, 
      status: content.good, 
      icon: <Wifi className="w-5 h-5" />,
      color: 'purple'
    },
    { 
      name: content.securitySystems, 
      value: 100, 
      status: content.excellent, 
      icon: <Shield className="w-5 h-5" />,
      color: 'teal'
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      green: 'from-green-500 to-emerald-600',
      blue: 'from-blue-500 to-cyan-600',
      purple: 'from-purple-500 to-pink-600',
      teal: 'from-teal-500 to-cyan-600',
    };
    return colors[color] || colors.green;
  };

  const getBgColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'from-green-50 to-emerald-50',
      blue: 'from-blue-50 to-cyan-50',
      purple: 'from-purple-50 to-pink-50',
      teal: 'from-teal-50 to-cyan-50',
    };
    return colors[color] || colors.green;
  };

  const getBorderColor = (color: string) => {
    const colors: Record<string, string> = {
      green: 'border-green-200',
      blue: 'border-blue-200',
      purple: 'border-purple-200',
      teal: 'border-teal-200',
    };
    return colors[color] || colors.green;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{content.title}</h2>
              <p className="text-green-100 text-sm">{content.subtitle}</p>
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
          {/* Overall Status */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <h3 className="text-2xl font-bold text-gray-900">{content.allSystemsOperational}</h3>
            </div>
            <p className="text-green-700 font-medium">Last checked: {new Date().toLocaleTimeString()}</p>
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systems.map((system, index) => (
              <div key={index} className={`bg-gradient-to-br ${getBgColor(system.color)} rounded-xl p-6 border ${getBorderColor(system.color)} shadow-sm`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${getColorClasses(system.color)} rounded-lg text-white`}>
                    {system.icon}
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 bg-white rounded-full text-gray-700 border border-gray-200">
                    {system.status}
                  </span>
                </div>
                
                <h4 className="text-sm font-semibold text-gray-700 mb-2">{system.name}</h4>
                <div className="text-4xl font-bold text-gray-900 mb-3">{system.value}%</div>
                
                {/* Progress Bar */}
                <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-gray-200">
                  <div 
                    className={`bg-gradient-to-r ${getColorClasses(system.color)} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${system.value}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Status */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                System Performance
              </h3>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900">Train Operations</span>
                </div>
                <span className="text-green-700 font-bold">✓ Normal</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900">Signal Systems</span>
                </div>
                <span className="text-green-700 font-bold">✓ Active</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900">Ticketing Systems</span>
                </div>
                <span className="text-green-700 font-bold">✓ Online</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900">CCTV Surveillance</span>
                </div>
                <span className="text-green-700 font-bold">✓ Monitoring</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-900">Backup Systems</span>
                </div>
                <span className="text-blue-700 font-bold">✓ Standby</span>
              </div>
            </div>
          </div>

          {/* Last 7 Days Performance */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">7-Day Performance Trend</h3>
            </div>
            <div className="p-6">
              <div className="flex items-end justify-between h-32 gap-2">
                {[99.8, 99.5, 99.7, 99.6, 99.9, 99.7, 99.7].map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-lg transition-all duration-500 hover:from-green-600 hover:to-emerald-500" 
                      style={{ height: `${value}%` }}
                    ></div>
                    <span className="text-xs text-gray-600 font-medium">{value}%</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-xs text-gray-500">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <span key={index} className="flex-1 text-center">{day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealthModal;


