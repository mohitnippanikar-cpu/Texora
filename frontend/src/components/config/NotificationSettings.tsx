import React, { useState } from 'react';
import { Bell, Mail, Smartphone, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export function NotificationSettings() {
  const [settings, setSettings] = useState({
    email: {
      enabled: true,
      address: 'user@metro.com',
      planGenerated: true,
      maintenanceAlerts: true,
      systemUpdates: false,
      weeklyReports: true,
    },
    push: {
      enabled: false,
      planGenerated: false,
      maintenanceAlerts: true,
      criticalAlerts: true,
      systemStatus: false,
    },
    inApp: {
      enabled: true,
      planGenerated: true,
      maintenanceAlerts: true,
      systemUpdates: true,
      achievements: true,
    },
  });

  const handleToggle = (category: string, key: string) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: !prev[category as keyof typeof prev][key as keyof typeof prev[keyof typeof prev]],
      },
    }));
  };

  const saveSettings = () => {
    alert('Notification settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
          <p className="text-sm text-gray-600 mt-1">Configure how and when you receive notifications</p>
        </div>
        
        <button
          onClick={saveSettings}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Notifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Mail className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Email</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Enable Email</span>
              <button
                onClick={() => handleToggle('email', 'enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.email.enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.email.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.email.enabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={settings.email.address}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      email: { ...prev.email, address: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-3">
                  {[
                    { key: 'planGenerated', label: 'Plan Generated', icon: CheckCircle },
                    { key: 'maintenanceAlerts', label: 'Maintenance Alerts', icon: AlertTriangle },
                    { key: 'systemUpdates', label: 'System Updates', icon: Info },
                    { key: 'weeklyReports', label: 'Weekly Reports', icon: Mail },
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-700">{label}</span>
                      </div>
                      <button
                        onClick={() => handleToggle('email', key)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          settings.email[key as keyof typeof settings.email] ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            settings.email[key as keyof typeof settings.email] ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Smartphone className="h-5 w-5 text-green-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Push</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Enable Push</span>
              <button
                onClick={() => handleToggle('push', 'enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.push.enabled ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.push.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {!settings.push.enabled && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-sm text-gray-600">
                  Enable push notifications to receive real-time alerts on your mobile device.
                </p>
              </div>
            )}

            {settings.push.enabled && (
              <div className="space-y-3">
                {[
                  { key: 'planGenerated', label: 'Plan Generated', icon: CheckCircle },
                  { key: 'maintenanceAlerts', label: 'Maintenance Alerts', icon: AlertTriangle },
                  { key: 'criticalAlerts', label: 'Critical Alerts', icon: AlertTriangle },
                  { key: 'systemStatus', label: 'System Status', icon: Info },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                    <button
                      onClick={() => handleToggle('push', key)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        settings.push[key as keyof typeof settings.push] ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          settings.push[key as keyof typeof settings.push] ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* In-App Notifications */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-purple-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">In-App</h4>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">Enable In-App</span>
              <button
                onClick={() => handleToggle('inApp', 'enabled')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.inApp.enabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.inApp.enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.inApp.enabled && (
              <div className="space-y-3">
                {[
                  { key: 'planGenerated', label: 'Plan Generated', icon: CheckCircle },
                  { key: 'maintenanceAlerts', label: 'Maintenance Alerts', icon: AlertTriangle },
                  { key: 'systemUpdates', label: 'System Updates', icon: Info },
                  { key: 'achievements', label: 'Achievements', icon: CheckCircle },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Icon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                    <button
                      onClick={() => handleToggle('inApp', key)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        settings.inApp[key as keyof typeof settings.inApp] ? 'bg-purple-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          settings.inApp[key as keyof typeof settings.inApp] ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Notification Tips</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Email notifications are best for detailed reports and summaries</li>
              <li>• Push notifications provide real-time alerts for critical events</li>
              <li>• In-app notifications keep you informed while using the system</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}