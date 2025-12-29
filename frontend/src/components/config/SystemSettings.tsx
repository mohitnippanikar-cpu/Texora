import React, { useState } from 'react';
import { Save, RefreshCw, Database, Clock } from 'lucide-react';

export function SystemSettings() {
  const [settings, setSettings] = useState({
    autoRefreshInterval: 30,
    dataRetention: 90,
    maxConcurrentPlans: 3,
    enableAutoBackup: true,
    backupFrequency: 24,
    debugMode: false,
    apiTimeout: 30,
    maxFileSize: 10,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    // In a real app, this would save to the backend
    alert('Settings saved successfully!');
  };

  const resetToDefaults = () => {
    setSettings({
      autoRefreshInterval: 30,
      dataRetention: 90,
      maxConcurrentPlans: 3,
      enableAutoBackup: true,
      backupFrequency: 24,
      debugMode: false,
      apiTimeout: 30,
      maxFileSize: 10,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
          <p className="text-sm text-gray-600 mt-1">Configure system-wide preferences and operational parameters</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={resetToDefaults}
            className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </button>
          <button
            onClick={saveSettings}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <RefreshCw className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="text-lg font-medium text-gray-900">Data Refresh</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Auto Refresh Interval (seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={settings.autoRefreshInterval}
                  onChange={(e) => handleSettingChange('autoRefreshInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">How often to refresh fleet data automatically</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Timeout (seconds)
                </label>
                <input
                  type="number"
                  min="10"
                  max="120"
                  value={settings.apiTimeout}
                  onChange={(e) => handleSettingChange('apiTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum time to wait for API responses</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Clock className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="text-lg font-medium text-gray-900">Planning</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Concurrent Plans
                </label>
                <select
                  value={settings.maxConcurrentPlans}
                  onChange={(e) => handleSettingChange('maxConcurrentPlans', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>1 plan</option>
                  <option value={2}>2 plans</option>
                  <option value={3}>3 plans</option>
                  <option value={5}>5 plans</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Maximum number of plans that can be generated simultaneously</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Upload File Size (MB)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.maxFileSize}
                  onChange={(e) => handleSettingChange('maxFileSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum size for CSV data uploads</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <Database className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="text-lg font-medium text-gray-900">Data Management</h4>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Retention Period (days)
                </label>
                <input
                  type="number"
                  min="30"
                  max="365"
                  value={settings.dataRetention}
                  onChange={(e) => handleSettingChange('dataRetention', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">How long to keep historical data</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Enable Auto Backup</label>
                  <p className="text-xs text-gray-500">Automatically backup system data</p>
                </div>
                <button
                  onClick={() => handleSettingChange('enableAutoBackup', !settings.enableAutoBackup)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.enableAutoBackup ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.enableAutoBackup ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.enableAutoBackup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Frequency (hours)
                  </label>
                  <select
                    value={settings.backupFrequency}
                    onChange={(e) => handleSettingChange('backupFrequency', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={6}>Every 6 hours</option>
                    <option value={12}>Every 12 hours</option>
                    <option value={24}>Daily</option>
                    <option value={168}>Weekly</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Advanced</h4>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900">Debug Mode</label>
                  <p className="text-xs text-gray-500">Enable detailed logging for troubleshooting</p>
                </div>
                <button
                  onClick={() => handleSettingChange('debugMode', !settings.debugMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    settings.debugMode ? 'bg-yellow-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.debugMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {settings.debugMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> Debug mode may impact performance and generate large log files.
                    Only enable when troubleshooting issues.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}