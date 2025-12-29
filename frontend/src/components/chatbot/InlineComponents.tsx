import React, { useState } from 'react';
import { 
  Clock, Train, Briefcase, MapPin, Activity, AlertTriangle, 
  Phone, Ticket, CheckCircle, Accessibility, Wifi, Camera, ParkingCircle,
  FileText, Download, Share2, Eye, X, Check, History, User
} from 'lucide-react';

interface ComponentProps {
  language: 'en' | 'ml';
}

export const TrainScheduleInline: React.FC<ComponentProps> = ({ language }) => {
  const content = language === 'ml' ? {
    title: 'ട്രെയിൻ സമയക്രമം',
    firstTrain: 'ആദ്യ ട്രെയിൻ',
    lastTrain: 'അവസാന ട്രെയിൻ',
    peakHours: 'തിരക്കുള്ള സമയം',
    offPeakHours: 'സാധാരണ സമയം',
  } : {
    title: 'Train Schedule',
    firstTrain: 'First Train',
    lastTrain: 'Last Train',
    peakHours: 'Peak Hours',
    offPeakHours: 'Off-Peak Hours',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#028090] to-[#06aea9] text-white p-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Clock className="w-5 h-5" />
          {content.title}
        </h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#e0f7f5] rounded-lg p-3 border border-[#b2e4df]">
            <div className="text-xs font-medium text-slate-600 mb-1">{content.firstTrain}</div>
            <div className="text-2xl font-bold text-[#028090]">06:00 AM</div>
          </div>
          <div className="bg-[#e0f7f5] rounded-lg p-3 border border-[#b2e4df]">
            <div className="text-xs font-medium text-slate-600 mb-1">{content.lastTrain}</div>
            <div className="text-2xl font-bold text-[#028090]">10:00 PM</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <div className="text-xs font-medium text-emerald-800 mb-1">{content.peakHours}</div>
            <div className="text-sm text-emerald-600">06:30-09:30 AM, 05:30-08:30 PM</div>
            <div className="text-lg font-bold text-emerald-700 mt-1">Every 4 minutes</div>
          </div>
          <div className="bg-[#e0f7f5] rounded-lg p-3 border border-[#b2e4df]">
            <div className="text-xs font-medium text-[#025f6a] mb-1">{content.offPeakHours}</div>
            <div className="text-sm text-[#028090]">All other times</div>
            <div className="text-lg font-bold text-[#028090] mt-1">Every 8 minutes</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FleetStatusInline: React.FC<ComponentProps> = ({ language }) => {
  const content = language === 'ml' ? {
    title: 'ഫ്ലീറ്റ് സ്ഥിതി',
    operational: 'പ്രവർത്തനത്തിൽ',
    maintenance: 'അറ്റകുറ്റപ്പണി',
    availability: 'ലഭ്യത',
    healthScore: 'ആരോഗ്യ സ്കോർ',
  } : {
    title: 'Fleet Status',
    operational: 'Operational',
    maintenance: 'Maintenance',
    availability: 'Availability',
    healthScore: 'Health Score',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Train className="w-5 h-5" />
          {content.title}
        </h3>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200">
            <div className="text-xs font-medium text-slate-600 mb-1">{content.operational}</div>
            <div className="text-3xl font-bold text-slate-900">18/20</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-200">
            <div className="text-xs font-medium text-slate-600 mb-1">{content.maintenance}</div>
            <div className="text-3xl font-bold text-slate-900">2</div>
          </div>
          <div className="bg-gradient-to-br from-[#e0f7f5] to-[#b2e4df] rounded-lg p-3 border border-[#7fd8d6]">
            <div className="text-xs font-medium text-slate-600 mb-1">{content.availability}</div>
            <div className="text-3xl font-bold text-slate-900">94.2%</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-3 border border-emerald-200">
            <div className="text-xs font-medium text-slate-600 mb-1">{content.healthScore}</div>
            <div className="text-3xl font-bold text-slate-900">92%</div>
          </div>
        </div>
        <div className="grid grid-cols-10 gap-2">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded flex items-center justify-center text-white font-bold text-xs ${
                i < 18 ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' :
                'bg-gradient-to-br from-orange-500 to-amber-600'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ProjectUpdatesInline: React.FC<ComponentProps> = ({ language }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#028090] to-[#06aea9] text-white p-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          {language === 'ml' ? 'പ്രോജക്ട് സ്ഥിതിവിവരം' : 'Project Updates'}
        </h3>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-gradient-to-br from-[#e0f7f5] to-[#b2e4df] rounded-lg p-4 border border-[#7fd8d6]">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-900">{language === 'ml' ? 'ഘട്ടം 2 വിപുലീകരണം' : 'Phase 2 Extension'}</h4>
            <span className="text-lg font-bold text-[#028090]">35%</span>
          </div>
          <div className="w-full bg-[#b2e4df] rounded-full h-2 mb-3">
            <div className="bg-gradient-to-r from-[#028090] to-[#06aea9] h-2 rounded-full" style={{ width: '35%' }}></div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
            <div><span className="font-medium">Budget:</span> ₹1,957 Cr</div>
            <div><span className="font-medium">Timeline:</span> Dec 2026</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-slate-900">{language === 'ml' ? 'സ്മാർട്ട് ടിക്കറ്റിംഗ്' : 'Smart Ticketing System'}</h4>
            <span className="text-lg font-bold text-emerald-600">75%</span>
          </div>
          <div className="w-full bg-emerald-200 rounded-full h-2 mb-3">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-700">
            <div><span className="font-medium">Budget:</span> ₹85 Cr</div>
            <div><span className="font-medium">Timeline:</span> Nov 2025</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const StationInfoInline: React.FC<ComponentProps> = ({ language }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#028090] to-[#06aea9] text-white p-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          {language === 'ml' ? 'സ്റ്റേഷൻ വിവരങ്ങൾ' : 'Station Information'}
        </h3>
      </div>
      <div className="p-4 space-y-4">
        <div className="bg-gradient-to-br from-[#e0f7f5] to-[#b2e4df] rounded-lg p-4 border border-[#7fd8d6] text-center">
          <div className="text-xs font-medium text-slate-600 mb-1">{language === 'ml' ? 'മൊത്തം സ്റ്റേഷനുകൾ' : 'Total Stations'}</div>
          <div className="text-5xl font-bold text-[#028090]">22</div>
          <div className="text-xs text-slate-600 mt-1">Aluva to Kaloor</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 p-2 bg-[#e0f7f5] rounded-lg border border-[#b2e4df]">
            <div className="text-[#028090]"><Accessibility className="w-4 h-4" /></div>
            <span className="text-xs font-medium text-slate-700">{language === 'ml' ? 'വീൽചെയർ' : 'Wheelchair'}</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="text-emerald-600"><Wifi className="w-4 h-4" /></div>
            <span className="text-xs font-medium text-slate-700">{language === 'ml' ? 'ഡിജിറ്റൽ' : 'Digital'}</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-[#e0f7f5] rounded-lg border border-[#b2e4df]">
            <div className="text-[#025f6a]"><Camera className="w-4 h-4" /></div>
            <span className="text-xs font-medium text-slate-700">{language === 'ml' ? 'സിസിടിവി' : 'CCTV'}</span>
          </div>
          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="text-emerald-600"><ParkingCircle className="w-4 h-4" /></div>
            <span className="text-xs font-medium text-slate-700">{language === 'ml' ? 'പാർക്കിംഗ്' : 'Parking'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SystemHealthInline: React.FC<ComponentProps> = ({ language }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Activity className="w-5 h-5" />
          {language === 'ml' ? 'സിസ്റ്റം ആരോഗ്യം' : 'System Health'}
        </h3>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-4 border-2 border-emerald-300 text-center">
          <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
          <div className="text-lg font-bold text-slate-900">{language === 'ml' ? 'എല്ലാം പ്രവർത്തിക്കുന്നു' : 'All Systems Operational'}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <div className="text-xs font-medium text-slate-600">{language === 'ml' ? 'നെറ്റ്‌വർക്ക്' : 'Network'}</div>
            <div className="text-2xl font-bold text-slate-900">99.7%</div>
          </div>
          <div className="bg-[#e0f7f5] rounded-lg p-3 border border-[#b2e4df]">
            <div className="text-xs font-medium text-slate-600">{language === 'ml' ? 'പവർ' : 'Power'}</div>
            <div className="text-2xl font-bold text-slate-900">99.2%</div>
          </div>
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <div className="text-xs font-medium text-slate-600">{language === 'ml' ? 'കമ്മ്യൂണിക്കേഷൻ' : 'Communication'}</div>
            <div className="text-2xl font-bold text-slate-900">97.8%</div>
          </div>
          <div className="bg-[#e0f7f5] rounded-lg p-3 border border-[#b2e4df]">
            <div className="text-xs font-medium text-slate-600">{language === 'ml' ? 'സെക്യൂരിറ്റി' : 'Security'}</div>
            <div className="text-2xl font-bold text-slate-900">100%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EmergencyProtocolsInline: React.FC<ComponentProps> = ({ language }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white p-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {language === 'ml' ? 'അടിയന്തിര പ്രോട്ടോക്കോളുകൾ' : 'Emergency Protocols'}
        </h3>
      </div>
      <div className="p-4 space-y-3">
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <div className="flex items-center gap-3 mb-2">
            <Phone className="w-5 h-5 text-red-600" />
            <div>
              <div className="text-xs font-medium text-slate-600">{language === 'ml' ? 'കൺട്രോൾ റൂം' : 'Control Room'}</div>
              <div className="text-2xl font-bold text-red-600">0484-2341234</div>
            </div>
          </div>
          <div className="text-xs text-slate-500">{language === 'ml' ? '24/7 ലഭ്യമാണ്' : 'Available 24/7'}</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <Phone className="w-5 h-5 text-orange-600" />
            <div>
              <div className="text-xs font-medium text-slate-600">{language === 'ml' ? 'ഹെൽപ്‌ലൈൻ' : 'Helpline'}</div>
              <div className="text-2xl font-bold text-orange-600">1800-425-5225</div>
            </div>
          </div>
          <div className="text-xs text-slate-500">{language === 'ml' ? '24/7 ലഭ്യമാണ്' : 'Available 24/7'}</div>
        </div>
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded text-xs text-yellow-800">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          {language === 'ml' 
            ? 'യഥാർത്ഥ അടിയന്തിര സാഹചര്യങ്ങളിൽ മാത്രം ഉപയോഗിക്കുക'
            : 'Use only in genuine emergencies'}
        </div>
      </div>
    </div>
  );
};

export const TicketInfoInline: React.FC<ComponentProps> = ({ language }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#028090] to-[#06aea9] text-white p-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Ticket className="w-5 h-5" />
          {language === 'ml' ? 'ടിക്കറ്റ് വിവരങ്ങൾ' : 'Ticket Information'}
        </h3>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#e0f7f5] to-[#b2e4df] rounded-lg p-4 border border-[#7fd8d6]">
            <div className="text-xs font-medium text-slate-600 mb-1">{language === 'ml' ? 'മിനിമം' : 'Minimum'}</div>
            <div className="text-3xl font-bold text-[#028090]">₹10</div>
            <div className="text-xs text-slate-600 mt-1">Up to 2 km</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-200">
            <div className="text-xs font-medium text-slate-600 mb-1">{language === 'ml' ? 'മാക്സിമം' : 'Maximum'}</div>
            <div className="text-3xl font-bold text-emerald-600">₹25</div>
            <div className="text-xs text-slate-600 mt-1">25+ km</div>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { distance: '0-2 km', fare: '₹10' },
            { distance: '2-5 km', fare: '₹15' },
            { distance: '5-10 km', fare: '₹18' },
            { distance: '10+ km', fare: '₹20-25' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
              <span className="font-medium text-slate-700">{item.distance}</span>
              <span className="font-bold text-[#028090]">{item.fare}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FileSearchResultInline: React.FC<ComponentProps> = ({ language }) => {
  const [showViewer, setShowViewer] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [copied, setCopied] = useState(false);

  const fileData = {
    name: 'Engineering_Drawing_Tender_XYZ_30Nov2024.pdf',
    type: 'Engineering Drawing',
    size: '2.4 MB',
    date: '30 November 2024',
    tender: 'Tender XYZ',
    imageUrl: 'https://i.pinimg.com/736x/14/64/04/146404bec435b22cecffb5a36f51daaf.jpg'
  };

  const updateLogs = [
    {
      id: 1,
      action: 'Created',
      user: 'Rajesh Kumar',
      role: 'Senior Engineer',
      timestamp: '30 Nov 2024, 10:15 AM',
      changes: 'Initial draft uploaded'
    },
    {
      id: 2,
      action: 'Modified',
      user: 'Priya Menon',
      role: 'Project Manager',
      timestamp: '30 Nov 2024, 2:45 PM',
      changes: 'Updated technical specifications'
    },
    {
      id: 3,
      action: 'Reviewed',
      user: 'Dr. Anil Varma',
      role: 'Chief Engineer',
      timestamp: '1 Dec 2024, 11:30 AM',
      changes: 'Approved for tender submission'
    },
    {
      id: 4,
      action: 'Modified',
      user: 'Suresh Nair',
      role: 'Design Lead',
      timestamp: '2 Dec 2024, 9:00 AM',
      changes: 'Added safety compliance notes'
    }
  ];

  const handleDownload = () => {
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = fileData.imageUrl;
    link.download = fileData.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = (method: string) => {
    const shareText = `Engineering Drawing - ${fileData.tender} (${fileData.date})`;
    const shareUrl = fileData.imageUrl;

    switch (method) {
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`View the file here: ${shareUrl}`)}`;
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`, '_blank');
        break;
    }
    setShowShareMenu(false);
  };

  const handleView = () => {
    setShowViewer(true);
  };

  const content = language === 'ml' ? {
    title: 'ഫയൽ കണ്ടെത്തി',
    found: 'കണ്ടെത്തിയ ഫയൽ',
    type: 'തരം',
    size: 'വലുപ്പം',
    date: 'തീയതി',
    tender: 'ടെൻഡർ',
    view: 'കാണുക',
    download: 'ഡൗൺലോഡ്',
    share: 'പങ്കിടുക',
    copyLink: 'ലിങ്ക് പകർത്തുക',
    shareEmail: 'ഇമെയിൽ വഴി പങ്കിടുക',
    shareWhatsApp: 'WhatsApp വഴി പങ്കിടുക',
    copied: 'പകർത്തി!',
    close: 'അടയ്ക്കുക',
    pastLogs: 'മുൻ ലോഗുകൾ',
    viewLogs: 'ലോഗുകൾ കാണുക',
    hideLogs: 'ലോഗുകൾ മറയ്ക്കുക',
    updates: 'അപ്ഡേറ്റുകൾ'
  } : {
    title: 'File Found',
    found: 'Found Document',
    type: 'Type',
    size: 'Size',
    date: 'Date',
    tender: 'Tender',
    view: 'View',
    download: 'Download',
    share: 'Share',
    copyLink: 'Copy Link',
    shareEmail: 'Share via Email',
    shareWhatsApp: 'Share via WhatsApp',
    copied: 'Copied!',
    close: 'Close',
    pastLogs: 'Past Logs',
    viewLogs: 'View Logs',
    hideLogs: 'Hide Logs',
    updates: 'updates'
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-[#028090] to-[#06aea9] text-white p-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {content.title}
          </h3>
        </div>
        <div className="p-4">
          {/* File Preview */}
          <div className="bg-gradient-to-br from-[#e0f7f5] to-[#b2e4df] rounded-lg p-4 border border-[#7fd8d6] mb-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-white rounded-lg border-2 border-[#06aea9] overflow-hidden shadow-sm">
                  <img 
                    src={fileData.imageUrl} 
                    alt="Engineering Drawing Thumbnail" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-900 mb-2 text-sm truncate">{fileData.name}</h4>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{content.type}:</span>
                    <span>{fileData.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{content.size}:</span>
                    <span>{fileData.size}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{content.date}:</span>
                    <span>{fileData.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{content.tender}:</span>
                    <span>{fileData.tender}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleView}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#028090] hover:bg-[#025f6a] text-white rounded-lg transition-colors font-medium text-sm"
            >
              <Eye className="w-4 h-4" />
              {content.view}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              {content.download}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#06aea9] hover:bg-[#028090] text-white rounded-lg transition-colors font-medium text-sm"
              >
                <Share2 className="w-4 h-4" />
                {content.share}
              </button>
              
              {/* Share Menu */}
              {showShareMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-10">
                  <button
                    onClick={() => handleShare('copy')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4" />}
                    <span>{copied ? content.copied : content.copyLink}</span>
                  </button>
                  <button
                    onClick={() => handleShare('email')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>📧</span>
                    <span>{content.shareEmail}</span>
                  </button>
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                  >
                    <span>💬</span>
                    <span>{content.shareWhatsApp}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Success Message */}
          <div className="mt-3 text-center text-xs text-emerald-600 font-medium">
            ✓ {content.found}
          </div>

          {/* Past Logs Section */}
          <div className="mt-4 border-t border-slate-200 pt-4">
            <button
              onClick={() => setShowLogs(!showLogs)}
              className="flex items-center justify-between w-full p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#028090]" />
                <span className="text-sm font-semibold text-slate-700">{content.pastLogs}</span>
                <span className="text-xs text-slate-500">({updateLogs.length} {content.updates})</span>
              </div>
              <span className="text-xs text-[#028090] font-medium">
                {showLogs ? content.hideLogs : content.viewLogs}
              </span>
            </button>

            {/* Logs Timeline */}
            {showLogs && (
              <div className="mt-3 space-y-3 max-h-64 overflow-y-auto">
                {updateLogs.map((log) => (
                  <div key={log.id} className="relative pl-6 pb-3 border-l-2 border-slate-200 last:border-l-0">
                    {/* Timeline Dot */}
                    <div className="absolute left-0 top-1 transform -translate-x-[9px]">
                      <div className={`w-4 h-4 rounded-full border-2 border-white ${
                        log.action === 'Created' ? 'bg-emerald-500' :
                        log.action === 'Modified' ? 'bg-[#06aea9]' :
                        log.action === 'Reviewed' ? 'bg-blue-500' :
                        'bg-slate-400'
                      }`}></div>
                    </div>

                    {/* Log Content */}
                    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-slate-500" />
                          <span className="text-sm font-semibold text-slate-900">{log.user}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          log.action === 'Created' ? 'bg-emerald-100 text-emerald-700' :
                          log.action === 'Modified' ? 'bg-[#e0f7f5] text-[#025f6a]' :
                          log.action === 'Reviewed' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {log.action}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mb-1">{log.role}</div>
                      <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.timestamp}
                      </div>
                      <div className="text-xs text-slate-700 bg-slate-50 rounded p-2 border-l-2 border-[#06aea9]">
                        {log.changes}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Screen Viewer */}
      {showViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gray-900 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5" />
                <span className="font-medium text-sm truncate">{fileData.name}</span>
              </div>
              <button
                onClick={() => setShowViewer(false)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Image Viewer */}
            <div className="flex-1 bg-gray-800 rounded-b-lg overflow-auto flex items-center justify-center">
              <img 
                src={fileData.imageUrl} 
                alt="Engineering Drawing" 
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Action Bar */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl px-4 py-2 flex items-center gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                {content.download}
              </button>
              <button
                onClick={() => setShowViewer(false)}
                className="flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {content.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const FinancialSearchInline: React.FC<{ 
  searchResults?: {
    projectName: string;
    totalAllocated: number;
    totalSpent: number;
    fileCount: number;
    completionPercentage: number;
  } 
}> = ({ searchResults }) => {
  
  if (!searchResults) {
    // Use hardcoded data if no search results provided
    searchResults = {
      projectName: 'Kochi Metro Phase 2 Extension',
      totalAllocated: 245000000000, // 2450 crores in paisa
      totalSpent: 85600000000, // 856 crores in paisa
      fileCount: 15,
      completionPercentage: 35.0
    };
  }

  const allocatedCrores = (searchResults.totalAllocated / 100000000).toFixed(0);
  const spentCrores = (searchResults.totalSpent / 100000000).toFixed(0);
  const remainingCrores = ((searchResults.totalAllocated - searchResults.totalSpent) / 100000000).toFixed(0);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-[#028090] to-[#06aea9] text-white p-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Financial Search Results
        </h3>
        <p className="text-blue-100 text-sm mt-1">{searchResults.projectName}</p>
      </div>
      <div className="p-4 space-y-4">
        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-br from-[#e0f7f5] to-[#b2e4df] rounded-lg p-3 border border-[#7fd8d6]">
            <div className="text-xs font-medium text-slate-600 mb-1">Total Allocated</div>
            <div className="text-2xl font-bold text-[#028090]">₹{allocatedCrores}</div>
            <div className="text-xs text-slate-600 mt-1">Crores</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200">
            <div className="text-xs font-medium text-slate-600 mb-1">Amount Spent</div>
            <div className="text-2xl font-bold text-emerald-600">₹{spentCrores}</div>
            <div className="text-xs text-slate-600 mt-1">Crores</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-200">
            <div className="text-xs font-medium text-slate-600 mb-1">Remaining</div>
            <div className="text-2xl font-bold text-orange-600">₹{remainingCrores}</div>
            <div className="text-xs text-slate-600 mt-1">Crores</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
            <div className="text-xs font-medium text-slate-600 mb-1">Completion</div>
            <div className="text-2xl font-bold text-purple-600">{searchResults.completionPercentage.toFixed(1)}%</div>
            <div className="text-xs text-slate-600 mt-1">Progress</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-600">Project Progress</span>
            <span className="font-medium text-slate-900">{searchResults.completionPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="h-2 bg-gradient-to-r from-[#028090] to-[#06aea9] rounded-full transition-all duration-500"
              style={{ width: `${searchResults.completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Source Files */}
        <div className="bg-gradient-to-br from-[#e0f7f5] to-[#b2e4df] rounded-lg p-4 border border-[#7fd8d6]">
          <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#028090]" />
            Source Documents ({searchResults.fileCount} files)
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="font-medium">Metro_A2_Budget_2024.pdf</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="font-medium">KMRL_Annual_Financial_Report_2024.xlsx</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="font-medium">Construction_Contract_Details_2024.pdf</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

