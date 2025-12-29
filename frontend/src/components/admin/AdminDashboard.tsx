import { useState, useEffect } from 'react';
import { User, Integration } from '../../types';
import { 
  Users, 
  Settings, 
  Plus, 
  Edit, 
  Trash2, 
  Power, 
  PowerOff,
  Mail,
  MessageCircle,
  Globe,
  Wifi,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Download,
  Upload,
  UserPlus
} from 'lucide-react';
import { wings, getDepartmentsByWing } from '../../utils/organizationData';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'integrations' | 'system'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'admin' | 'manager' | 'employee'>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'employee' as 'admin' | 'manager' | 'employee',
    department: '',
    wing: '',
    designation: '',
    phoneNumber: ''
  });

  // Mock data using organizational structure
  const mockUsers: User[] = [
    {
      id: '1',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@kmrl.co.in',
      role: 'admin',
      employeeId: 'KMRL-ADMIN-001',
      department: 'IT / Systems',
      designation: 'Super Administrator',
      phoneNumber: '+91-9876543210',
      shiftPattern: 'regular',
      permissions: ['all'],
      isActive: true,
      integrationAccess: {
        email: true,
        whatsapp: true,
        regulatoryPortals: true,
        iotFeeds: true
      },
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Spouse',
        phone: '+91-9876543211'
      },
      createdAt: '2025-01-01T00:00:00Z'
    },
    {
      id: '2',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'rajesh.kumar@kmrl.co.in',
      role: 'manager',
      employeeId: 'KMRL-MGR-001',
      department: 'Quality Assurance / Technical Compliance',
      designation: 'Engineering Manager',
      phoneNumber: '+91-9876543212',
      shiftPattern: 'regular',
      permissions: ['project_management', 'team_management'],
      isActive: true,
      managedDepartments: ['Quality Assurance / Technical Compliance', 'Safety & Security'],
      integrationAccess: {
        email: true,
        whatsapp: false,
        regulatoryPortals: true,
        iotFeeds: false
      },
      emergencyContact: {
        name: 'Priya Kumar',
        relationship: 'Wife',
        phone: '+91-9876543213'
      },
      createdAt: '2025-01-15T00:00:00Z'
    },
    {
      id: '3',
      firstName: 'Priya',
      lastName: 'Menon',
      email: 'priya.menon@kmrl.co.in',
      role: 'employee',
      employeeId: 'KMRL-EMP-001',
      department: 'Customer / Passenger Services',
      designation: 'Senior Customer Relations Officer',
      phoneNumber: '+91-9876543214',
      shiftPattern: 'regular',
      permissions: ['document_upload', 'task_management'],
      isActive: true,
      reportingManager: '2',
      integrationAccess: {
        email: true,
        whatsapp: false,
        regulatoryPortals: false,
        iotFeeds: false
      },
      emergencyContact: {
        name: 'Suresh Menon',
        relationship: 'Husband',
        phone: '+91-9876543215'
      },
      createdAt: '2025-02-01T00:00:00Z'
    }
  ];

  const mockIntegrations: Integration[] = [
    {
      id: '1',
      name: 'Email Integration',
      type: 'email',
      status: 'active',
      config: {
        endpoint: 'smtp.kmrl.co.in',
        enabled: true,
        lastSync: '2025-09-30T10:00:00Z',
        syncFrequency: 15
      },
      permissions: ['admin', 'manager'],
      createdBy: '1',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-09-30T10:00:00Z'
    },
    {
      id: '2',
      name: 'WhatsApp Business API',
      type: 'whatsapp',
      status: 'inactive',
      config: {
        apiKey: '****-****-****-****',
        enabled: false,
        lastSync: '2025-09-29T18:00:00Z',
        syncFrequency: 60
      },
      permissions: ['admin'],
      createdBy: '1',
      createdAt: '2025-02-15T00:00:00Z',
      updatedAt: '2025-09-29T18:00:00Z'
    },
    {
      id: '3',
      name: 'Kerala State Portal',
      type: 'regulatory_portal',
      status: 'active',
      config: {
        endpoint: 'https://kerala.gov.in/api',
        username: 'kmrl_user',
        enabled: true,
        lastSync: '2025-09-30T09:30:00Z',
        syncFrequency: 120
      },
      permissions: ['admin', 'manager'],
      createdBy: '1',
      createdAt: '2025-01-20T00:00:00Z',
      updatedAt: '2025-09-30T09:30:00Z'
    },
    {
      id: '4',
      name: 'IoT Sensors Feed',
      type: 'iot_feed',
      status: 'error',
      config: {
        endpoint: 'https://iot.kmrl.co.in/api',
        apiKey: '****-****-****-****',
        enabled: true,
        lastSync: '2025-09-30T08:00:00Z',
        syncFrequency: 5
      },
      permissions: ['admin'],
      createdBy: '1',
      createdAt: '2025-03-01T00:00:00Z',
      updatedAt: '2025-09-30T08:00:00Z'
    }
  ];

  useEffect(() => {
    setUsers(mockUsers);
    setIntegrations(mockIntegrations);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const toggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const toggleIntegrationStatus = (integrationId: string) => {
    setIntegrations(prev => prev.map(integration => 
      integration.id === integrationId 
        ? { 
            ...integration, 
            status: integration.status === 'active' ? 'inactive' : 'active',
            config: { 
              ...integration.config, 
              enabled: integration.status !== 'active' 
            }
          } 
        : integration
    ));
  };

  const handleAddUser = () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.department) {
      alert('Please fill in all required fields');
      return;
    }

    const user: User = {
      id: (users.length + 1).toString(),
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      employeeId: `KMRL-${newUser.role.toUpperCase()}-${String(users.length + 1).padStart(3, '0')}`,
      department: newUser.department,
      designation: newUser.designation,
      phoneNumber: newUser.phoneNumber,
      shiftPattern: 'regular',
      permissions: newUser.role === 'admin' ? ['all'] : ['document_upload'],
      isActive: true,
      integrationAccess: {
        email: true,
        whatsapp: false,
        regulatoryPortals: newUser.role !== 'employee',
        iotFeeds: newUser.role === 'admin'
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: ''
      },
      createdAt: new Date().toISOString()
    };

    setUsers(prev => [...prev, user]);
    setNewUser({
      firstName: '',
      lastName: '',
      email: '',
      role: 'employee',
      department: '',
      wing: '',
      designation: '',
      phoneNumber: ''
    });
    setShowAddUserModal(false);
  };

  const handleWingChange = (wingId: string) => {
    setNewUser(prev => ({ 
      ...prev, 
      wing: wingId, 
      department: '' // Reset department when wing changes
    }));
  };

  const getAvailableDepartments = () => {
    if (!newUser.wing) return [];
    return getDepartmentsByWing(newUser.wing);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'inactive': return <XCircle className="h-5 w-5 text-gray-400" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <XCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-5 w-5 text-blue-500" />;
      case 'whatsapp': return <MessageCircle className="h-5 w-5 text-green-500" />;
      case 'regulatory_portal': return <Globe className="h-5 w-5 text-purple-500" />;
      case 'iot_feed': return <Wifi className="h-5 w-5 text-orange-500" />;
      default: return <Settings className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">👑 Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">User & Integration Management</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </button>
            <button
              onClick={() => alert('Create Integration feature coming soon')}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-white text-sm font-medium rounded-lg hover:bg-secondary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Integration
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {[
              { key: 'users', label: 'User Management', icon: Users },
              { key: 'integrations', label: 'Integration Control', icon: Settings },
              { key: 'system', label: 'System Settings', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'users' && (
          <div className="p-6">
            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
              </div>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role & Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Integrations
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-medium text-primary">
                                  {user.firstName[0]}{user.lastName[0]}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                              <div className="text-xs text-gray-400">{user.employeeId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin' ? 'bg-primary/10 text-primary' :
                              user.role === 'manager' ? 'bg-secondary/10 text-secondary' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">{user.department}</div>
                          <div className="text-xs text-gray-400">{user.designation}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {user.integrationAccess?.email && (
                              <div title="Email Access">
                                <Mail className="h-4 w-4 text-blue-500" />
                              </div>
                            )}
                            {user.integrationAccess?.whatsapp && (
                              <div title="WhatsApp Access">
                                <MessageCircle className="h-4 w-4 text-green-500" />
                              </div>
                            )}
                            {user.integrationAccess?.regulatoryPortals && (
                              <div title="Regulatory Portal Access">
                                <Globe className="h-4 w-4 text-purple-500" />
                              </div>
                            )}
                            {user.integrationAccess?.iotFeeds && (
                              <div title="IoT Feed Access">
                                <Wifi className="h-4 w-4 text-orange-500" />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => toggleUserStatus(user.id!)}
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {user.isActive ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                            {user.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button className="text-primary hover:text-primary/80 transition-colors">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {integrations.map((integration) => {
                const Icon = getIntegrationIcon(integration.type);
                const StatusIcon = getStatusIcon(integration.status);
                
                return (
                  <div key={integration.id} className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {Icon}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{integration.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{integration.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {StatusIcon}
                        <button
                          onClick={() => toggleIntegrationStatus(integration.id)}
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            integration.status === 'active'
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {integration.status === 'active' ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status:</span>
                        <span className={`font-medium capitalize ${
                          integration.status === 'active' ? 'text-green-600' :
                          integration.status === 'error' ? 'text-red-600' :
                          'text-gray-600'
                        }`}>
                          {integration.status}
                        </span>
                      </div>
                      
                      {integration.config.lastSync && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Last Sync:</span>
                          <span className="text-gray-900">{formatDate(integration.config.lastSync)}</span>
                        </div>
                      )}
                      
                      {integration.config.syncFrequency && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Sync Frequency:</span>
                          <span className="text-gray-900">{integration.config.syncFrequency} minutes</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Permissions:</span>
                        <span className="text-gray-900">{integration.permissions.join(', ')}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1 text-sm text-primary hover:bg-primary/5 rounded transition-colors">
                          <Edit className="h-4 w-4" />
                          Configure
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1 text-sm text-secondary hover:bg-secondary/5 rounded transition-colors">
                          <Download className="h-4 w-4" />
                          Export Logs
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="p-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Backup & Restore</h3>
                    <p className="text-sm text-gray-500">Manage system backups and data restore</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors">
                      <Download className="h-4 w-4" />
                      Backup
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-white text-sm rounded-lg hover:bg-secondary/90 transition-colors">
                      <Upload className="h-4 w-4" />
                      Restore
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">System Logs</h3>
                    <p className="text-sm text-gray-500">View and download system activity logs</p>
                  </div>
                  <button className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors">
                    View Logs
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Security Settings</h3>
                    <p className="text-sm text-gray-500">Configure security policies and access controls</p>
                  </div>
                  <button className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                    Configure
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                <button 
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Enter first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Enter last name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="user@kmrl.co.in"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser(prev => ({ ...prev, phoneNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'admin' | 'manager' | 'employee' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wing *</label>
                  <select
                    value={newUser.wing}
                    onChange={(e) => handleWingChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="">Select Wing</option>
                    {wings.map(wing => (
                      <option key={wing.id} value={wing.id}>
                        {wing.icon} {wing.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <select
                    value={newUser.department}
                    onChange={(e) => setNewUser(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    disabled={!newUser.wing}
                  >
                    <option value="">Select Department</option>
                    {getAvailableDepartments().map(dept => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Designation</label>
                  <input
                    type="text"
                    value={newUser.designation}
                    onChange={(e) => setNewUser(prev => ({ ...prev, designation: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    placeholder="Enter job designation"
                  />
                </div>
              </div>
              
              {newUser.wing && (
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h3 className="font-medium text-primary mb-2">Wing Information</h3>
                  <p className="text-sm text-gray-600">
                    {wings.find(w => w.id === newUser.wing)?.description}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddUser}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  Add User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}