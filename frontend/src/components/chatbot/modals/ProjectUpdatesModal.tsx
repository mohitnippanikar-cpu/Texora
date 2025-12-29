import React from 'react';
import { X, Briefcase, CheckCircle, Clock, Calendar, DollarSign, Users } from 'lucide-react';

interface ProjectUpdatesModalProps {
  onClose: () => void;
  language?: 'en' | 'ml';
}

const ProjectUpdatesModal: React.FC<ProjectUpdatesModalProps> = ({ onClose, language = 'en' }) => {
  const content = language === 'ml' ? {
    title: 'പ്രോജക്ട് സ്ഥിതിവിവരം',
    subtitle: 'നിലവിലെ പദ്ധതികളുടെ പുരോഗതി',
    completed: 'പൂർത്തിയായി',
    ongoing: 'നടന്നുകൊണ്ടിരിക്കുന്നു',
    upcoming: 'വരാനിരിക്കുന്നു',
    progress: 'പുരോഗതി',
    budget: 'ബജറ്റ്',
    timeline: 'സമയപരിധി',
    team: 'ടീം',
    members: 'അംഗങ്ങൾ',
  } : {
    title: 'Project Updates',
    subtitle: 'Current project progress',
    completed: 'Completed',
    ongoing: 'Ongoing',
    upcoming: 'Upcoming',
    progress: 'Progress',
    budget: 'Budget',
    timeline: 'Timeline',
    team: 'Team',
    members: 'members',
  };

  const projects = {
    completed: [
      {
        name: language === 'ml' ? 'ഘട്ടം 1 - പൂർണ്ണമായും' : 'Phase 1 - Fully Operational',
        description: language === 'ml' ? '22 സ്റ്റേഷനുകൾ പൂർണമായി' : '22 Stations fully operational',
        icon: <CheckCircle className="w-5 h-5" />
      },
      {
        name: language === 'ml' ? 'ആക്സസിബിലിറ്റി' : 'Accessibility Enhancement',
        description: language === 'ml' ? 'എല്ലാ സ്റ്റേഷനുകളിലും' : 'All stations equipped',
        icon: <CheckCircle className="w-5 h-5" />
      }
    ],
    ongoing: [
      {
        name: language === 'ml' ? 'ഘട്ടം 2 വിപുലീകരണം' : 'Phase 2 Extension',
        progress: 35,
        budget: '₹1,957 Cr',
        timeline: language === 'ml' ? '2026 ഡിസംബർ' : 'Dec 2026',
        team: 12
      },
      {
        name: language === 'ml' ? 'സ്മാർട്ട് ടിക്കറ്റിംഗ്' : 'Smart Ticketing System',
        progress: 75,
        budget: '₹85 Cr',
        timeline: language === 'ml' ? '2025 നവംബർ' : 'Nov 2025',
        team: 8
      }
    ],
    upcoming: [
      {
        name: language === 'ml' ? 'സോളാർ എനർജി' : 'Solar Energy Integration',
        description: language === 'ml' ? '50MW ലക്ഷ്യം' : '50MW target',
        icon: '🌱'
      },
      {
        name: language === 'ml' ? 'AI & സ്മാർട്ട് സിസ്റ്റം' : 'AI & Smart Infrastructure',
        description: language === 'ml' ? 'പ്രെഡിക്റ്റീവ് സിസ്റ്റം' : 'Predictive Systems',
        icon: '🤖'
      }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{content.title}</h2>
              <p className="text-indigo-100 text-sm">{content.subtitle}</p>
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">{content.completed}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{projects.completed.length}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">{content.ongoing}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{projects.ongoing.length}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">{content.upcoming}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{projects.upcoming.length}</div>
            </div>
          </div>

          {/* Completed Projects */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-3 border-b border-green-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                {content.completed}
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {projects.completed.map((project, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="p-2 bg-green-100 rounded-lg text-green-600">
                    {project.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-600">{project.description}</div>
                  </div>
                  <div className="text-green-600 font-bold">✓</div>
                </div>
              ))}
            </div>
          </div>

          {/* Ongoing Projects */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-3 border-b border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                {content.ongoing}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {projects.ongoing.map((project, index) => (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900">{project.name}</h4>
                    <span className="text-lg font-bold text-blue-600">{project.progress}%</span>
                  </div>
                  
                  <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <DollarSign className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{project.budget}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{project.timeline}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{project.team} {content.members}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Projects */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-3 border-b border-purple-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                {content.upcoming}
              </h3>
            </div>
            <div className="p-6 space-y-3">
              {projects.upcoming.map((project, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-3xl">{project.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-600">{project.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectUpdatesModal;


