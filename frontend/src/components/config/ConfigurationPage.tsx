import { useState } from 'react';
import { AIRulesConfig } from './AIRulesConfig';
import { SystemSettings } from './SystemSettings';
import { NotificationSettings } from './NotificationSettings';
import { AccessControl, RoleBasedUI } from '../common/AccessControl';
import { useAuth } from '../../contexts/AuthContext';
import { Settings, Brain, Bell, Shield, Lock } from 'lucide-react';

export function ConfigurationPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'ai-rules' | 'system' | 'notifications' | 'security'>('ai-rules');

  // Admin-only configuration page
  return (
    <AccessControl 
      allowedRoles={['admin']}
      fallback={
        <div className="text-center py-16">
          <Lock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-500 mb-4">System configuration is restricted to administrators only.</p>
          <p className="text-sm text-gray-400">
            Your current role: <span className="font-medium">{user?.role}</span>
          </p>
        </div>
      }
    >
      <ConfigurationContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </AccessControl>
  );
}

function ConfigurationContent({ 
  activeTab, 
  setActiveTab 
}: { 
  activeTab: string; 
  setActiveTab: (tab: 'ai-rules' | 'system' | 'notifications' | 'security') => void;
}) {
  const tabs = [
    { id: 'ai-rules', label: 'AI Rules', icon: Brain },
    { id: 'system', label: 'System', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
          <p className="text-gray-600 mt-1">Government Portal Settings & System Management</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm">
        <div className="border-b border-gray-300 bg-gray-50">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'ai-rules' | 'system' | 'notifications' | 'security')}
                className={`flex items-center py-4 px-1 border-b-2 font-semibold text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-700 text-blue-800 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-400'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 bg-white">
          {activeTab === 'ai-rules' && <AIRulesConfig />}
          {activeTab === 'system' && <SystemSettings />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Security Settings</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Session Timeout (minutes)</label>
          <input type="number" className="mt-1 block w-32 px-3 py-2 border border-gray-300 rounded-md" defaultValue={30} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Password Policy</label>
          <div className="mt-2 space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300" defaultChecked />
              <span className="ml-2 text-sm text-gray-600">Require uppercase letters</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300" defaultChecked />
              <span className="ml-2 text-sm text-gray-600">Require numbers</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}