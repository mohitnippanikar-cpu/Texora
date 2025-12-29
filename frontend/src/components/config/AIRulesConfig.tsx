import React, { useState } from 'react';
import { AIRule } from '../../types';
import { Plus, Trash2, ToggleLeft, ToggleRight, Save } from 'lucide-react';

export function AIRulesConfig() {
  const [rules, setRules] = useState<AIRule[]>([
    {
      id: '1',
      name: 'Fitness Certificate Priority',
      weight: 90,
      enabled: true,
      description: 'Prioritize trains with expiring fitness certificates',
    },
    {
      id: '2',
      name: 'Health Score Threshold',
      weight: 80,
      enabled: true,
      description: 'Send trains with low health scores to maintenance',
    },
    {
      id: '3',
      name: 'Scheduled Maintenance',
      weight: 70,
      enabled: true,
      description: 'Honor pre-scheduled maintenance windows',
    },
    {
      id: '4',
      name: 'Job Card Status',
      weight: 85,
      enabled: true,
      description: 'Prioritize trains with open job cards',
    },
    {
      id: '5',
      name: 'Mileage Threshold',
      weight: 60,
      enabled: false,
      description: 'Consider high mileage trains for maintenance',
    },
    {
      id: '6',
      name: 'Cleanliness Score',
      weight: 40,
      enabled: true,
      description: 'Factor in cleanliness scores for assignments',
    },
  ]);

  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', weight: 50, description: '' });

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  const updateWeight = (id: string, weight: number) => {
    setRules(rules.map(rule => 
      rule.id === id ? { ...rule, weight } : rule
    ));
  };

  const deleteRule = (id: string) => {
    setRules(rules.filter(rule => rule.id !== id));
  };

  const addRule = () => {
    if (newRule.name.trim()) {
      const rule: AIRule = {
        id: Date.now().toString(),
        name: newRule.name,
        weight: newRule.weight,
        enabled: true,
        description: newRule.description,
      };
      setRules([...rules, rule]);
      setNewRule({ name: '', weight: 50, description: '' });
      setShowAddRule(false);
    }
  };

  const saveRules = () => {
    // In a real app, this would save to the backend
    alert('Rules saved successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Decision Rules</h3>
          <p className="text-sm text-gray-600 mt-1">Configure the AI's decision-making logic and priority weights</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddRule(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </button>
          <button
            onClick={saveRules}
            className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {showAddRule && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Add New Rule</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
              <input
                type="text"
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="Enter rule name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight</label>
              <input
                type="number"
                min="0"
                max="100"
                value={newRule.weight}
                onChange={(e) => setNewRule({ ...newRule, weight: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newRule.description}
              onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
              placeholder="Describe what this rule does..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
            />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setShowAddRule(false)}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={addRule}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Rule
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {rules.map((rule) => (
          <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className="mr-3"
                  >
                    {rule.enabled ? (
                      <ToggleRight className="h-6 w-6 text-blue-600" />
                    ) : (
                      <ToggleLeft className="h-6 w-6 text-gray-400" />
                    )}
                  </button>
                  <h4 className={`text-lg font-medium ${rule.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                    {rule.name}
                  </h4>
                </div>
                <p className={`text-sm mb-4 ${rule.enabled ? 'text-gray-600' : 'text-gray-400'}`}>
                  {rule.description}
                </p>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1 max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority Weight: {rule.weight}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={rule.weight}
                      onChange={(e) => updateWeight(rule.id, parseInt(e.target.value))}
                      disabled={!rule.enabled}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => deleteRule(rule.id)}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Rule Priority Summary</h4>
        <div className="space-y-2">
          {rules
            .filter(rule => rule.enabled)
            .sort((a, b) => b.weight - a.weight)
            .slice(0, 3)
            .map((rule, index) => (
            <div key={rule.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white mr-3 ${
                  index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                }`}>
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-gray-900">{rule.name}</span>
              </div>
              <span className="text-sm text-gray-600">{rule.weight}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}