import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { 
  Home,
  Settings,
  Folder,
  Database,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  Activity,
  ArrowRightLeft,
  Compass,
  FileText,
  GitCompare,
  Users,
  Layers,
  PhoneCall
} from 'lucide-react';


export default function LayoutNew() {
  const { user, logout } = useAuth();
  // Role-based permissions (available but not currently used in this simplified version)
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [notificationCount] = useState(3);
  const [runTour, setRunTour] = useState(false);

  // Tour steps
  const tourSteps: Step[] = [
    {
      target: '[data-tour="rfp-manager"]',
      content: 'View and manage all your RFP responses here. Track the progress of each tender through the sales, technical, and pricing agents.',
      disableBeacon: true,
      placement: 'right'
    },
    {
      target: '[data-tour="rfp-manager"]',
      content: 'View and manage all your RFP responses here. Track the progress of each tender through the sales, technical, and pricing agents.',
      placement: 'right'
    },
    {
      target: '[data-tour="dashboard"]',
      content: 'Your dashboard shows the Kanban board with all RFPs organized by their current processing stage.',
      placement: 'right'
    }
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
    }
  };

  // Navigation item interface
  interface NavigationItem {
    name: string;
    href: string;
    icon: any;
    description: string;
    badge?: string | null;
    roles: string[];
    access: { read: boolean; write: boolean };
    subItems?: SubNavigationItem[];
    dataTour?: string;
  }

  interface SubNavigationItem {
    name: string;
    href: string;
    icon: any;
    description: string;
    roles: string[];
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  };

  // Role-based navigation menu with access control and descriptions
  const allNavigationItems: NavigationItem[] = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: Home, 
      description: '',
      badge: null,
      roles: ['admin', 'manager', 'employee'],
      access: { read: true, write: false },
      dataTour: 'dashboard'
    },
     { 
      name: 'Tender Manager', 
      href: '/tender-manager', 
      icon: Folder, 
      description: '',
      badge: null,
      roles: ['admin'],
      access: { read: true, write: true },
      dataTour: 'tender-manager'
    },
    { 
      name: 'Vendors', 
      href: '/vendors', 
      icon: Users, 
      description: '',
      badge: null,
      roles: ['admin'],
      access: { read: true, write: true }
    },
    { 
      name: 'ProcureOS', 
      href: '/procure-os', 
      icon: PhoneCall, 
      description: '',
      badge: null,
      roles: ['admin'],
      access: { read: true, write: true }
    },
    { 
      name: 'ConsultOS', 
      href: '/consult-os', 
      icon: Compass, 
      description: '',
      badge: null,
      roles: ['admin'],
      access: { read: true, write: true }
    },
    { 
      name: 'ERP System', 
      href: '/erp', 
      icon: Layers, 
      description: '',
      badge: null,
      roles: ['admin'],
      access: { read: true, write: true }
    },
  ];

  // Show all navigation items
  const navigation = allNavigationItems;

  const isActive = (href: string) => location.pathname === href;

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isExpanded = (itemName: string) => expandedItems.includes(itemName);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Joyride Tour */}
      <Joyride
        steps={tourSteps}
        run={runTour}
        continuous
        showProgress
        showSkipButton
        callback={handleJoyrideCallback}
        styles={{
          options: {
            primaryColor: '#3558A6',
            zIndex: 10000,
          },
          tooltip: {
            fontSize: 14,
            padding: 20,
          },
          buttonNext: {
            backgroundColor: '#3558A6',
            fontSize: 14,
            padding: '8px 16px',
          },
          buttonBack: {
            color: '#3558A6',
            fontSize: 14,
          },
        }}
        locale={{
          back: 'Back',
          close: 'Close',
          last: 'Finish',
          next: 'Next',
          skip: 'Skip Tour',
        }}
      />

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl border-r border-gray-200">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors hover:bg-gray-100"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 flex flex-col h-full">
            {/* Fixed Logo Section */}
            <div className="flex-shrink-0 px-4 pt-5 pb-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-3">
                  {/* Custom SVG logo representing wires/cables */}
                  <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10">
                    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
                      <rect x="3" y="16" width="30" height="4" rx="2" fill="#3558A6" />
                      <circle cx="6" cy="18" r="3" fill="#FDB813" />
                      <circle cx="30" cy="18" r="3" fill="#FDB813" />
                      <rect x="8" y="13" width="20" height="10" rx="5" fill="#9CA3AF" opacity=".6" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-primary truncate">WirePro</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Navigation Area */}
            <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
              <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                
                if (hasSubItems) {
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={`w-full group flex items-center justify-between px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                          location.pathname.startsWith(item.href)
                            ? 'bg-primary text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                          <div className="text-left">{item.name}</div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {isExpanded(item.name) ? (
                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      {isExpanded(item.name) && item.subItems && (
                        <div className="ml-3 mt-2 space-y-1 border-l-2 border-primary border-opacity-20 pl-3">
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                className={`group flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                                  isActive(subItem.href)
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                                onClick={() => setSidebarOpen(false)}
                              >
                                <SubIcon className="mr-3 h-4 w-4 flex-shrink-0" />
                                {subItem.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              </nav>
            </div>

            {/* Profile Section */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <p className="text-xs text-primary capitalize mt-0.5">{user?.role}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setSidebarOpen(false);
                  }}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white shadow-xl border-r border-gray-200">
          <div className="flex-1 flex flex-col h-full">
            {/* Fixed Logo Section */}
            <div className="flex-shrink-0 px-6 pt-6 pb-4">
              <div className="bg-gray-50 rounded-xl p-4 w-full border border-gray-200">
                <div className="flex items-center space-x-4">
                  <span className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
                    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8">
                      <rect x="3" y="16" width="30" height="4" rx="2" fill="#3558A6" />
                      <circle cx="6" cy="18" r="3" fill="#FDB813" />
                      <circle cx="30" cy="18" r="3" fill="#FDB813" />
                      <rect x="8" y="13" width="20" height="10" rx="5" fill="#9CA3AF" opacity=".6" />
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-primary truncate">WirePro</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Navigation Area */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
              <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const hasSubItems = item.subItems && item.subItems.length > 0;
                
                if (hasSubItems) {
                  return (
                    <div key={item.name}>
                      <button
                        onClick={() => toggleExpanded(item.name)}
                        className={`w-full group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          location.pathname.startsWith(item.href)
                            ? 'bg-primary text-white shadow-lg'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center flex-1 min-w-0">
                          <Icon className="mr-4 h-5 w-5 flex-shrink-0" />
                          <div className="font-medium">{item.name}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {isExpanded(item.name) ? (
                            <ChevronDown className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                      {isExpanded(item.name) && item.subItems && (
                        <div className="ml-4 mt-2 space-y-1 border-l-2 border-primary border-opacity-20 pl-4">
                          {item.subItems.map((subItem) => {
                            const SubIcon = subItem.icon;
                            return (
                              <Link
                                key={subItem.name}
                                to={subItem.href}
                                className={`group flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                                  isActive(subItem.href)
                                    ? 'bg-primary text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                <SubIcon className="mr-3 h-4 w-4 flex-shrink-0" />
                                <div className="font-medium">{subItem.name}</div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    data-tour={item.dataTour}
                    className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-4 h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              </nav>
            </div>

            {/* Tour Button - Above Profile Section */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setRunTour(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
              >
                <Compass className="w-4 h-4" />
                <span>Start Tour</span>
              </button>
            </div>

            {/* Profile Section */}
            <div className="flex-shrink-0 px-6 py-4 bg-white">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  <p className="text-xs text-primary capitalize mt-0.5">{user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-60 flex flex-col flex-1">
        {/* Mobile top navigation */}
        <div className="md:hidden bg-white border-b border-gray-200 px-3 py-2 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-2">
                <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded bg-primary/10">
                  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <rect x="3" y="16" width="30" height="4" rx="2" fill="#3558A6" />
                    <circle cx="6" cy="18" r="3" fill="#FDB813" />
                    <circle cx="30" cy="18" r="3" fill="#FDB813" />
                    <rect x="8" y="13" width="20" height="10" rx="5" fill="#9CA3AF" opacity=".6" />
                  </svg>
                </span>
                <span className="text-sm font-bold text-primary">WirePro</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Mobile notifications */}
              <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>

              {/* Mobile profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center p-1 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-full"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50">
                    <div className="px-4 py-3 text-sm text-gray-900 border-b border-gray-100">
                      <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-gray-500 text-xs mt-1">{user?.email}</p>
                      <p className="text-xs text-blue-600 capitalize mt-1">
                        Role: {user?.role}
                      </p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      Your Profile
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/config"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Settings
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <div className="flex items-center">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign out
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
