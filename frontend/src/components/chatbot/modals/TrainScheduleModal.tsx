import React from 'react';
import { X, Clock, MapPin, Train as TrainIcon } from 'lucide-react';

interface TrainScheduleModalProps {
  onClose: () => void;
  language?: 'en' | 'ml';
}

const TrainScheduleModal: React.FC<TrainScheduleModalProps> = ({ onClose, language = 'en' }) => {
  const schedules = [
    { from: 'Aluva', to: 'Kaloor', time: '25 min', distance: '22 km', firstTrain: '06:00 AM', lastTrain: '10:00 PM' },
    { from: 'Edappally', to: 'MG Road', time: '15 min', distance: '12 km', firstTrain: '06:08 AM', lastTrain: '10:08 PM' },
    { from: 'Maharaja\'s', to: 'Kacheripady', time: '10 min', distance: '8 km', firstTrain: '06:15 AM', lastTrain: '10:15 PM' },
    { from: 'Ernakulam South', to: 'Ernakulam Junction', time: '3 min', distance: '2 km', firstTrain: '06:18 AM', lastTrain: '10:18 PM' },
  ];

  const content = language === 'ml' ? {
    title: 'ട്രെയിൻ സമയക്രമം',
    operatingHours: 'പ്രവർത്തന സമയം',
    peakHours: 'തിരക്കുള്ള സമയം',
    offPeakHours: 'സാധാരണ സമയം',
    frequency: 'ഫ്രീക്വൻസി',
    everyMinutes: 'മിനിറ്റ് വ്യത്യാസത്തിൽ',
    routeGuide: 'യാത്രാ ഗൈഡ്',
    from: 'ആരംഭം',
    to: 'അവസാനം',
    travelTime: 'യാത്രാ സമയം',
    distance: 'ദൂരം',
    firstTrain: 'ആദ്യ ട്രെയിൻ',
    lastTrain: 'അവസാന ട്രെയിൻ',
  } : {
    title: 'Train Schedule',
    operatingHours: 'Operating Hours',
    peakHours: 'Peak Hours',
    offPeakHours: 'Off-Peak Hours',
    frequency: 'Frequency',
    everyMinutes: 'Every',
    routeGuide: 'Route Guide',
    from: 'From',
    to: 'To',
    travelTime: 'Travel Time',
    distance: 'Distance',
    firstTrain: 'First Train',
    lastTrain: 'Last Train',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{content.title}</h2>
              <p className="text-blue-100 text-sm">Real-time schedule information</p>
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
          {/* Operating Hours */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              {content.operatingHours}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{content.firstTrain}</span>
                  <span className="text-2xl font-bold text-blue-600">06:00 AM</span>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">{content.lastTrain}</span>
                  <span className="text-2xl font-bold text-blue-600">10:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Train Frequency */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">{content.frequency}</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4">
                <div className="text-sm font-medium text-green-800 mb-1">{content.peakHours}</div>
                <div className="text-xs text-green-600 mb-2">06:30-09:30 AM, 05:30-08:30 PM</div>
                <div className="text-2xl font-bold text-green-700">{content.everyMinutes} 4 min</div>
              </div>
              <div className="border-l-4 border-blue-500 bg-blue-50 rounded-lg p-4">
                <div className="text-sm font-medium text-blue-800 mb-1">{content.offPeakHours}</div>
                <div className="text-xs text-blue-600 mb-2">All other times</div>
                <div className="text-2xl font-bold text-blue-700">{content.everyMinutes} 8 min</div>
              </div>
            </div>
          </div>

          {/* Route Guide */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                {content.routeGuide}
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {schedules.map((schedule, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <TrainIcon className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{schedule.from}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-semibold text-gray-900">{schedule.to}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">{schedule.time}</div>
                        <div className="text-xs text-gray-500">{schedule.distance}</div>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-600 border-t border-gray-200 pt-2">
                      <div className="flex-1">
                        <span className="font-medium">{content.firstTrain}:</span> {schedule.firstTrain}
                      </div>
                      <div className="flex-1 text-right">
                        <span className="font-medium">{content.lastTrain}:</span> {schedule.lastTrain}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Tracking Info */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">📱 Real-Time Updates</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Download KMRL Official App for live train tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Visit www.kochimetro.org for schedule updates</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>SMS alerts available: Text 'TRAIN' to 9656606060</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainScheduleModal;


