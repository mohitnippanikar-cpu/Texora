// KMRL Organizational Structure Data
// Wings and Departments for Metro Rail Operations

export interface Wing {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

export interface Department {
  id: string;
  name: string;
  wing: string;
  description: string;
  functions: string[];
  headCount: number;
  color: string;
}

export interface OrganizationStats {
  totalEmployees: number;
  totalDepartments: number;
  totalWings: number;
  avgDepartmentSize: number;
  largestDepartment: Department;
  smallestDepartment: Department;
}

export const wings: Wing[] = [
  {
    id: 'operations',
    name: 'Operations',
    description: 'Metro train operations, scheduling, and passenger services',
    color: 'bg-primary',
    icon: '🚇'
  },
  {
    id: 'construction',
    name: 'Construction',
    description: 'Infrastructure development, civil works, and project execution',
    color: 'bg-orange-500',
    icon: '🏗️'
  },
  {
    id: 'consultation',
    name: 'Consultation',
    description: 'Technical advisory, planning, and strategic consultation services',
    color: 'bg-purple-500',
    icon: '💼'
  }
];

export const departments: Department[] = [
  {
    id: 'finance',
    name: 'Finance & Budgeting',
    wing: 'operations',
    description: 'Budget allocation, forecasting, cost control, and auditing',
    functions: ['Budget Planning', 'Cost Control', 'Financial Forecasting', 'Auditing', 'Revenue Management'],
    headCount: 25,
    color: 'bg-green-500'
  },
  {
    id: 'legal',
    name: 'Legal / Contract Management',
    wing: 'consultation',
    description: 'Legal compliance, contract management, dispute resolution',
    functions: ['Contract Review', 'Legal Compliance', 'Dispute Resolution', 'Policy Development', 'Risk Assessment'],
    headCount: 15,
    color: 'bg-indigo-500'
  },
  {
    id: 'procurement',
    name: 'Procurement / Tendering',
    wing: 'construction',
    description: 'Tender creation, evaluation, vendor management, and procurement',
    functions: ['Tender Management', 'Vendor Evaluation', 'Procurement Planning', 'Contract Negotiation', 'Supplier Relations'],
    headCount: 20,
    color: 'bg-yellow-500'
  },
  {
    id: 'quality',
    name: 'Quality Assurance / Technical Compliance',
    wing: 'construction',
    description: 'Technical specifications, safety standards, regulatory compliance',
    functions: ['Quality Control', 'Technical Audits', 'Standards Compliance', 'Testing & Validation', 'Certification'],
    headCount: 30,
    color: 'bg-red-500'
  },
  {
    id: 'safety',
    name: 'Safety & Security',
    wing: 'operations',
    description: 'Risk assessment, safety audits, security compliance',
    functions: ['Safety Audits', 'Risk Assessment', 'Emergency Response', 'Security Management', 'Incident Investigation'],
    headCount: 40,
    color: 'bg-red-600'
  },
  {
    id: 'hr',
    name: 'Human Resources (HR)',
    wing: 'operations',
    description: 'Staffing, training, employee development, and HR management',
    functions: ['Recruitment', 'Training & Development', 'Performance Management', 'Employee Relations', 'Compensation & Benefits'],
    headCount: 18,
    color: 'bg-pink-500'
  },
  {
    id: 'it',
    name: 'IT / Systems',
    wing: 'operations',
    description: 'IT infrastructure, data systems, cybersecurity, and system integration',
    functions: ['System Development', 'Data Management', 'Cybersecurity', 'Network Infrastructure', 'Digital Integration'],
    headCount: 35,
    color: 'bg-blue-600'
  },
  {
    id: 'customer',
    name: 'Customer / Passenger Services',
    wing: 'operations',
    description: 'Passenger assistance, customer support, service quality management',
    functions: ['Customer Support', 'Service Quality', 'Passenger Information', 'Complaint Resolution', 'Accessibility Services'],
    headCount: 50,
    color: 'bg-teal-500'
  }
];

// Helper functions
export const getDepartmentsByWing = (wingId: string): Department[] => {
  return departments.filter(dept => dept.wing === wingId);
};

export const getWingById = (wingId: string): Wing | undefined => {
  return wings.find(wing => wing.id === wingId);
};

export const getDepartmentById = (deptId: string): Department | undefined => {
  return departments.find(dept => dept.id === deptId);
};

export const getTotalHeadCount = (): number => {
  return departments.reduce((total, dept) => total + dept.headCount, 0);
};

export const getHeadCountByWing = (wingId: string): number => {
  return getDepartmentsByWing(wingId).reduce((total, dept) => total + dept.headCount, 0);
};

// Statistical data for dashboard
export const organizationStats: OrganizationStats = {
  totalEmployees: getTotalHeadCount(),
  totalDepartments: departments.length,
  totalWings: wings.length,
  avgDepartmentSize: Math.round(getTotalHeadCount() / departments.length),
  largestDepartment: departments.reduce((prev, current) => 
    (prev.headCount > current.headCount) ? prev : current
  ),
  smallestDepartment: departments.reduce((prev, current) => 
    (prev.headCount < current.headCount) ? prev : current
  )
};

export default {
  wings,
  departments,
  getDepartmentsByWing,
  getWingById,
  getDepartmentById,
  getTotalHeadCount,
  getHeadCountByWing,
  organizationStats
};