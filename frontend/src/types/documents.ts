// Document Management System Types and Constants

export const DOCUMENT_CATEGORIES = {
  SAFETY: 'safety',
  PROCUREMENT: 'procurement',
  REGULATORY: 'regulatory',
  MAINTENANCE: 'maintenance',
  HR: 'hr',
  ENGINEERING: 'engineering',
  FINANCE: 'finance',
  OPERATIONS: 'operations'
} as const;

export const DOCUMENT_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
} as const;

export const DOCUMENT_SOURCES = {
  EMAIL: 'email',
  MAXIMO: 'maximo',
  SHAREPOINT: 'sharepoint',
  WHATSAPP: 'whatsapp',
  SCAN: 'scan',
  CLOUD: 'cloud'
} as const;

export const DOCUMENT_LANGUAGES = {
  ENGLISH: 'english',
  MALAYALAM: 'malayalam',
  BILINGUAL: 'bilingual'
} as const;

export const DEPARTMENT_TYPES = {
  OPERATIONS: 'operations',
  MAINTENANCE: 'maintenance',
  SAFETY: 'safety',
  FINANCE: 'finance',
  ENGINEERING: 'engineering',
  PROCUREMENT: 'procurement',
  HR: 'hr',
  IT: 'it',
  LEGAL: 'legal',
  ENVIRONMENT: 'environment',
  ADMINISTRATION: 'administration'
} as const;

export const COMPLIANCE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue'
} as const;

export const NOTIFICATION_TYPES = {
  COMPLIANCE_DEADLINE: 'compliance_deadline',
  CROSS_DEPARTMENT_ALERT: 'cross_department_alert',
  KNOWLEDGE_UPDATE: 'knowledge_update',
  DOCUMENT_EXPIRY: 'document_expiry',
  URGENT_ACTION_REQUIRED: 'urgent_action_required'
} as const;

// Type definitions
export type DocumentCategory = typeof DOCUMENT_CATEGORIES[keyof typeof DOCUMENT_CATEGORIES];
export type DocumentPriority = typeof DOCUMENT_PRIORITIES[keyof typeof DOCUMENT_PRIORITIES];
export type DocumentSource = typeof DOCUMENT_SOURCES[keyof typeof DOCUMENT_SOURCES];
export type DocumentLanguage = typeof DOCUMENT_LANGUAGES[keyof typeof DOCUMENT_LANGUAGES];
export type DepartmentType = typeof DEPARTMENT_TYPES[keyof typeof DEPARTMENT_TYPES];
export type ComplianceStatus = typeof COMPLIANCE_STATUS[keyof typeof COMPLIANCE_STATUS];
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

export interface DocumentAttachment {
  name: string;
  size: string;
  type?: string;
  url?: string;
}

export interface DocumentCompliance {
  authority: string;
  deadline: string;
  status: ComplianceStatus;
  notes?: string;
}

export interface DocumentVendor {
  name: string;
  amount: number;
  poNumber: string;
  contact?: string;
  email?: string;
}

export interface Document {
  _id: string;
  title: string;
  title_ml?: string;
  category: DocumentCategory;
  department: string;
  language: DocumentLanguage;
  priority: DocumentPriority;
  source: DocumentSource;
  uploadedDate: string;
  summary: string;
  summary_ml?: string;
  content?: string;
  actionItems?: string[];
  departments: string[];
  compliance?: DocumentCompliance;
  attachments?: DocumentAttachment[];
  vendor?: DocumentVendor;
  tags?: string[];
  created_by?: string;
  last_updated?: string;
  version?: number;
  status?: 'draft' | 'published' | 'archived';
}

export interface DocumentSummary {
  total: number;
  high_priority: number;
  pending_compliance: number;
  multilingual: number;
  by_category?: Record<DocumentCategory, number>;
  by_department?: Record<string, number>;
  recent_uploads?: number;
}

export interface KnowledgeBaseItem {
  _id: string;
  title: string;
  title_ml?: string;
  content: string;
  department: string;
  tags: string[];
  created_by: string;
  last_updated: string;
  views: number;
  helpful_votes: number;
  category: 'technical_guide' | 'process_guide' | 'safety_protocol' | 'policy_document';
  language?: DocumentLanguage;
  attachments?: DocumentAttachment[];
}

export interface SmartNotification {
  _id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: DocumentPriority;
  department?: string;
  departments?: string[];
  deadline?: string;
  action_url?: string;
  created: string;
  read?: boolean;
  dismissed?: boolean;
}

export interface DocumentFilter {
  category?: DocumentCategory;
  department?: string;
  language?: DocumentLanguage;
  priority?: DocumentPriority;
  source?: DocumentSource;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
  tags?: string[];
  compliance_status?: ComplianceStatus;
}

export interface UploadDocumentRequest {
  title: string;
  title_ml?: string;
  category: DocumentCategory;
  department: string;
  language: DocumentLanguage;
  priority: DocumentPriority;
  source: DocumentSource;
  summary?: string;
  summary_ml?: string;
  file: File | string;
  tags?: string[];
}

export interface UploadDocumentResponse {
  success: boolean;
  data: {
    document_id: string;
    processed: boolean;
    summary: string;
    summary_ml?: string;
    action_items: string[];
    departments_tagged: string[];
    priority: DocumentPriority;
    language_detected: DocumentLanguage;
  };
  error?: string;
}

// Category metadata with icons and descriptions
export const CATEGORY_METADATA = {
  [DOCUMENT_CATEGORIES.SAFETY]: {
    icon: '🛡️',
    name: 'Safety',
    name_ml: 'സുരക്ഷ',
    description: 'Safety circulars, protocols, and incident reports',
    color: 'red'
  },
  [DOCUMENT_CATEGORIES.PROCUREMENT]: {
    icon: '🛒',
    name: 'Procurement',
    name_ml: 'സംഭരണം',
    description: 'Purchase orders, vendor documents, and contracts',
    color: 'blue'
  },
  [DOCUMENT_CATEGORIES.REGULATORY]: {
    icon: '📋',
    name: 'Regulatory',
    name_ml: 'നിയന്ത്രണം',
    description: 'Government directives and compliance documents',
    color: 'purple'
  },
  [DOCUMENT_CATEGORIES.MAINTENANCE]: {
    icon: '🔧',
    name: 'Maintenance',
    name_ml: 'അറ്റകുറ്റപ്പണി',
    description: 'Maintenance schedules, reports, and procedures',
    color: 'orange'
  },
  [DOCUMENT_CATEGORIES.FINANCE]: {
    icon: '💰',
    name: 'Finance',
    name_ml: 'ധനകാര്യം',
    description: 'Invoices, budget documents, and financial reports',
    color: 'green'
  },
  [DOCUMENT_CATEGORIES.ENGINEERING]: {
    icon: '⚙️',
    name: 'Engineering',
    name_ml: 'എൻജിനീയറിംഗ്',
    description: 'Technical drawings, specifications, and studies',
    color: 'indigo'
  },
  [DOCUMENT_CATEGORIES.OPERATIONS]: {
    icon: '🚇',
    name: 'Operations',
    name_ml: 'പ്രവർത്തനങ്ങൾ',
    description: 'Operational procedures and performance reports',
    color: 'emerald'
  },
  [DOCUMENT_CATEGORIES.HR]: {
    icon: '👥',
    name: 'Human Resources',
    name_ml: 'മാനവ വിഭവശേഷി',
    description: 'HR policies, training materials, and personnel documents',
    color: 'pink'
  }
} as const;

// Priority metadata
export const PRIORITY_METADATA = {
  [DOCUMENT_PRIORITIES.HIGH]: {
    name: 'High Priority',
    name_ml: 'ഉയർന്ന മുൻഗണന',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200'
  },
  [DOCUMENT_PRIORITIES.MEDIUM]: {
    name: 'Medium Priority',
    name_ml: 'ഇടത്തരം മുൻഗണന',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200'
  },
  [DOCUMENT_PRIORITIES.LOW]: {
    name: 'Low Priority',
    name_ml: 'കുറഞ്ഞ മുൻഗണന',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200'
  }
} as const;

// Common action items by category
export const COMMON_ACTION_ITEMS = {
  [DOCUMENT_CATEGORIES.SAFETY]: [
    'Conduct safety briefing',
    'Update safety procedures',
    'Schedule safety inspection',
    'Notify all departments',
    'Create incident report'
  ],
  [DOCUMENT_CATEGORIES.PROCUREMENT]: [
    'Verify vendor credentials',
    'Check delivery schedule',
    'Process payment approval',
    'Update inventory records',
    'Quality inspection required'
  ],
  [DOCUMENT_CATEGORIES.REGULATORY]: [
    'Submit compliance report',
    'Schedule regulatory meeting',
    'Update standard procedures',
    'Notify regulatory authority',
    'Implement new guidelines'
  ],
  [DOCUMENT_CATEGORIES.MAINTENANCE]: [
    'Schedule maintenance activity',
    'Order spare parts',
    'Update maintenance records',
    'Coordinate with operations',
    'Generate work orders'
  ]
} as const;

export default {
  DOCUMENT_CATEGORIES,
  DOCUMENT_PRIORITIES,
  DOCUMENT_SOURCES,
  DOCUMENT_LANGUAGES,
  DEPARTMENT_TYPES,
  COMPLIANCE_STATUS,
  NOTIFICATION_TYPES,
  CATEGORY_METADATA,
  PRIORITY_METADATA,
  COMMON_ACTION_ITEMS
};