import { useState } from 'react';
import { Users, Plus, Edit, Trash2, Building2, TrendingUp, UserPlus } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  department: string;
}

export const ERPSystemPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: 'EMP-001', name: 'Rajesh Kumar', department: 'Engineering' },
    { id: 'EMP-002', name: 'Priya Sharma', department: 'Finance' },
    { id: 'EMP-003', name: 'Amit Patel', department: 'Operations' },
    { id: 'EMP-004', name: 'Neha Singh', department: 'Human Resources' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    department: ''
  });

  const departments = ['Engineering', 'Finance', 'Operations', 'Human Resources', 'Marketing', 'Sales', 'IT'];

  const handleSaveEmployee = () => {
    if (!newEmployee.name || !newEmployee.department) {
      alert('Please fill in all fields');
      return;
    }

    if (editingId) {
      setEmployees(prev => prev.map(emp => 
        emp.id === editingId ? { ...emp, ...newEmployee } : emp
      ));
    } else {
      const newId = `EMP-${String(employees.length + 1).padStart(3, '0')}`;
      setEmployees(prev => [...prev, { id: newId, ...newEmployee }]);
    }

    setShowAddModal(false);
    setEditingId(null);
    setNewEmployee({ name: '', department: '' });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
    }
  };

  const handleAddDemoData = () => {
    const demoEmployees = [
      { id: `EMP-${String(employees.length + 1).padStart(3, '0')}`, name: 'Vikram Desai', department: 'Engineering' },
      { id: `EMP-${String(employees.length + 2).padStart(3, '0')}`, name: 'Anjali Gupta', department: 'Marketing' },
      { id: `EMP-${String(employees.length + 3).padStart(3, '0')}`, name: 'Suresh Reddy', department: 'Operations' },
      { id: `EMP-${String(employees.length + 4).padStart(3, '0')}`, name: 'Divya Menon', department: 'Finance' },
      { id: `EMP-${String(employees.length + 5).padStart(3, '0')}`, name: 'Karan Singh', department: 'Sales' }
    ];
    setEmployees(prev => [...prev, ...demoEmployees]);
  };

  const getDepartmentStats = () => {
    const stats = employees.reduce((acc, emp) => {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  };

  const departmentStats = getDepartmentStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#06AEA9] to-[#028090] text-white px-8 py-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">ERP System</h1>
              <p className="text-white/90">Manage employee information</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddDemoData}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/20"
              >
                <UserPlus className="w-5 h-5" />
                Add Demo Data
              </button>
              <button
                onClick={() => { setEditingId(null); setShowAddModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#06AEA9] rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Employee
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-[#06AEA9]">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Total Employees</p>
              <Users className="w-5 h-5 text-[#06AEA9]" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Departments</p>
              <Building2 className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{Object.keys(departmentStats).length}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Largest Dept</p>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-xl font-bold text-gray-900">
              {Object.keys(departmentStats).length > 0 
                ? Object.entries(departmentStats).sort(([,a], [,b]) => b - a)[0][0] 
                : 'N/A'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-600 text-sm">Active Status</p>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <p className="text-2xl font-bold text-green-600">All Active</p>
          </div>
        </div>

        {/* Department Distribution */}
        {Object.keys(departmentStats).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Department Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(departmentStats).map(([dept, count]) => (
                <div key={dept} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 mb-1">{dept}</p>
                  <p className="text-2xl font-bold text-[#06AEA9]">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Employees Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-[#06AEA9]" />
              Employee List ({employees.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 uppercase text-xs tracking-wider">Employee ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 uppercase text-xs tracking-wider">Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 uppercase text-xs tracking-wider">Department</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-900 uppercase text-xs tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#06AEA9]/10 text-[#06AEA9]">
                        {employee.id}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-900 font-medium">{employee.name}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {employee.department}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setEditingId(employee.id);
                            setNewEmployee({ name: employee.name, department: employee.department });
                            setShowAddModal(true);
                          }}
                          className="p-2 text-[#06AEA9] hover:bg-[#06AEA9]/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="text-lg font-medium">No employees found</p>
                      <p className="text-sm mt-1">Click "Add Employee" or "Add Demo Data" to get started</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add/Edit Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Employee' : 'Add New Employee'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Name *
                </label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  value={newEmployee.department}
                  onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#06AEA9] focus:border-transparent"
                >
                  <option value="">Select department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingId(null);
                  setNewEmployee({ name: '', department: '' });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEmployee}
                className="px-4 py-2 bg-[#06AEA9] text-white rounded-lg hover:bg-[#028090] transition-colors"
              >
                {editingId ? 'Save Changes' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
