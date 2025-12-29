export interface User {
  _id?: string;
  id?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  employeeId: string;
  department: string;
  designation: string;
  phoneNumber: string;
  shiftPattern: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: string;
  managedDepartments?: string[]; // For managers - departments they oversee
  reportingManager?: string; // For employees - manager's ID
  integrationAccess?: {
    email: boolean;
    whatsapp: boolean;
    regulatoryPortals: boolean;
    iotFeeds: boolean;
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  preferences?: {
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'hi' | 'ml';
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  createdAt?: string;
  updatedAt?: string;
  // Legacy compatibility
  name?: string;
  created_at?: string;
}

export interface Train {
  id: string;
  number: string;
  status: 'service' | 'standby' | 'maintenance';
  healthScore: number;
  mileage: number;
  lastMaintenance: string;
  nextMaintenance: string;
  fitnessExpiry: string;
  jobCardStatus: 'open' | 'closed' | 'pending';
  cleanlinessScore: number;
  branding: string;
  location: string;
}

export interface MaintenanceRecord {
  id: string;
  trainId: string;
  type: string;
  date: string;
  description: string;
  status: 'completed' | 'pending' | 'in-progress';
}

export interface AIRule {
  id: string;
  name: string;
  weight: number;
  enabled: boolean;
  description: string;
}

export interface InductionPlan {
  id: string;
  generatedAt: string;
  trains: TrainAssignment[];
  accuracy: number;
  conflicts: number;
}

export interface TrainAssignment {
  trainId: string;
  assignment: 'service' | 'standby' | 'maintenance';
  reasoning: string;
  priority: number;
}

export interface Report {
  id: string;
  title: string;
  type: 'monthly' | 'weekly' | 'custom';
  generatedAt: string;
  data: any;
}

export interface FleetMetrics {
  totalTrains: number;
  activeTrains: number;
  routeLength: number;
  fleetAvailability: number;
  avgHealthScore: number;
  onTimePerformance: number;
}

export interface InboxMessage {
  id: string;
  subject: string;
  sender: {
    name: string;
    email: string;
    department?: string;
    type: 'government' | 'internal' | 'external';
  };
  recipient: string;
  content: string;
  summary?: string;
  type: 'guideline' | 'policy' | 'announcement' | 'alert' | 'notification' | 'memo';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'safety' | 'operations' | 'projects' | 'compliance' | 'maintenance' | 'hr' | 'finance' | 'general';
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  hasAttachments: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    size: string;
    type: string;
  }>;
  receivedAt: string;
  readAt?: string;
  tags: string[];
  governmentRef?: string;
  expiryDate?: string;
  actionRequired?: boolean;
  actionDeadline?: string;
}

export interface WorkProject {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'tender_open' | 'evaluation' | 'awarded' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  department: string;
  assignedManager: string;
  assignedEmployees: string[];
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
  budget: number;
  vendor?: {
    name: string;
    contact: string;
    email: string;
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    uploadedBy: string;
    uploadedAt: string;
  }>;
  milestones: Array<{
    id: string;
    name: string;
    dueDate: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    assignedTo: string;
  }>;
  meetings: Array<{
    id: string;
    title: string;
    date: string;
    attendees: string[];
    notes?: string;
    actionItems: Array<{
      id: string;
      description: string;
      assignedTo: string;
      dueDate: string;
      status: 'pending' | 'completed';
    }>;
  }>;
  complianceStatus: {
    environmental: boolean;
    safety: boolean;
    legal: boolean;
    lastChecked: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Meeting {
  id: string;
  title: string;
  description: string;
  projectId?: string;
  organizerId: string;
  attendees: Array<{
    userId: string;
    name: string;
    email: string;
    status: 'invited' | 'accepted' | 'declined' | 'tentative';
  }>;
  scheduledDate: string;
  duration: number; // in minutes
  location?: string;
  meetingType: 'in_person' | 'virtual' | 'hybrid';
  agenda: Array<{
    id: string;
    item: string;
    duration: number;
    presenter: string;
  }>;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  aiSuggested: boolean;
  suggestedBy?: string;
  suggestedReason?: string;
  notes?: string;
  actionItems: Array<{
    id: string;
    description: string;
    assignedTo: string;
    dueDate: string;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface VendorFeedback {
  id: string;
  projectId: string;
  vendorId: string;
  sentBy: string;
  subject: string;
  message: string;
  type: 'clarification' | 'revision_request' | 'approval' | 'rejection';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'sent' | 'acknowledged' | 'responded' | 'resolved';
  attachments: Array<{
    id: string;
    name: string;
    size: string;
    type: string;
  }>;
  response?: {
    message: string;
    respondedAt: string;
    attachments?: Array<{
      id: string;
      name: string;
      size: string;
      type: string;
    }>;
  };
  dueDate?: string;
  sentAt: string;
  updatedAt: string;
}

export interface Integration {
  id: string;
  name: string;
  type: 'email' | 'whatsapp' | 'regulatory_portal' | 'iot_feed';
  status: 'active' | 'inactive' | 'error' | 'configuring';
  config: {
    endpoint?: string;
    apiKey?: string;
    username?: string;
    enabled: boolean;
    lastSync?: string;
    syncFrequency?: number; // in minutes
  };
  permissions: string[]; // which roles can access this integration
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// Project Management Types
export interface ProjectContractor {
  name: string;
  contact: string;
  email: string;
}

export interface ProjectBidder {
  name: string;
  bidAmount: number;
  experience: string;
  rating: number;
  proposedTimeline: string;
}

export interface ProjectMilestone {
  name: string;
  status: 'completed' | 'ongoing' | 'pending';
  date?: string;
  expectedDate?: string;
}

export interface ProjectApprovals {
  environmentalClearance: 'approved' | 'pending' | 'under_review' | 'not_required';
  stateGovernment: 'approved' | 'pending' | 'under_review';
  centralGovernment: 'approved' | 'pending' | 'under_review';
  landAcquisition: 'approved' | 'pending' | 'in_progress' | 'not_required';
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  status: 'completed' | 'ongoing' | 'upcoming';
  category: string;
  location: string;
  
  // Common fields
  budget?: number;
  
  // Completed project fields
  startDate?: string;
  endDate?: string;
  actualCost?: number;
  contractor?: ProjectContractor;
  progress?: number;
  beneficiaries?: number;
  keyFeatures?: string[];
  
  // Ongoing project fields
  expectedEndDate?: string;
  spentAmount?: number;
  expectedBeneficiaries?: number;
  currentPhase?: string;
  milestones?: ProjectMilestone[];
  
  // Upcoming project fields
  proposedStartDate?: string;
  expectedDuration?: string;
  estimatedBudget?: number;
  tenderStatus?: string;
  bidders?: ProjectBidder[];
  expectedSavings?: number;
  approvals?: ProjectApprovals;
}

export interface ProjectsSummary {
  total: number;
  completed: number;
  ongoing: number;
  upcoming: number;
}

// Chatbot Types
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'quick_reply' | 'suggestion' | 'component';
  images?: string[];
}

export interface ChatSuggestion {
  id: string;
  text: string;
  action: string;
}

// Financial Search Types
export interface FinancialAllocation {
  id: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  currency: string;
  lastUpdated: Date;
}

export interface FileCitation {
  id: string;
  fileName: string;
  filePath: string;
  pageNumber?: number;
  section?: string;
  excerpt: string;
  lastModified: Date;
  relevanceScore: number;
}

export interface ProjectFinancialData {
  projectId: string;
  projectName: string;
  totalAllocated: number;
  totalSpent: number;
  currency: string;
  allocations: FinancialAllocation[];
  citations: FileCitation[];
  lastUpdated: Date;
}

export interface SearchResults {
  query: string;
  projectData: ProjectFinancialData[];
  totalResults: number;
  searchDuration: number;
  timestamp: Date;
}

// ============================================================================
// TENDER GAME TYPES
// ============================================================================

export interface TenderStageData {
  approved?: boolean;
  approved_at?: string;
  checklist?: Array<{ item: string; checked: boolean }>;
  notes?: string;
  assigned_to?: string;
  [key: string]: any;
}

export interface Tender {
  tender_number: string;
  title: string;
  organization_name?: string;
  bidding_closing_date?: string;
  current_stage: string;
  pdf_path?: string;
  uploaded_at?: string;
  stage1?: TenderStageData;
  stage2?: TenderStageData;
  stage3?: TenderStageData;
  stage4?: TenderStageData;
  stage5?: TenderStageData;
  stage6?: TenderStageData;
  stage7?: TenderStageData;
  stage8?: TenderStageData;
  stage9?: TenderStageData;
  [key: string]: any;
}

export interface TenderSummary {
  id?: string;
  tender_id?: string;
  tender_number: string;
  title: string;
  organization_name?: string;
  bidding_closing_date?: string;
  current_stage: string;
  uploaded_at?: string;
}

export interface SalesTender extends TenderSummary {
  status: 'Pending Action' | 'Approved/In Progress';
}

export interface TenderChecklistItem {
  item: string;
  checked: boolean;
}

export interface AddTenderRequest {
  file: File;
  tender_number: string;
  title?: string;
  organization_name?: string;
  bidding_closing_date?: string;
}

export interface UpdateChecklistRequest {
  action: 'toggle' | 'add' | 'delete';
  index?: number;
  item?: string;
}

// --- New Tender Management Types ---

export interface Tender {
  tender_id: string;
  title: string;
  description: string;
  amount: number;
  earnest_money_deposit: number;
  end_date: string;
  stage: 'draft' | 'live' | 'awarded';
  // Legacy/Optional fields
  status?: string;
  deadline?: string;
  requirements?: string[];
  attachments?: {
    file_name: string;
    url: string;
  }[];
  created_at?: string;
}

export interface Submission {
  bid_id?: string;
  submission_id?: string;
  tender_id: string;
  vendor_id: string;
  vendor_name?: string;
  proposal_text: string;
  price: number;
  total_score?: number;
  individual_scores?: {
    technical_score: number;
    financial_score: number;
    compliance_score?: number;
    legal_score?: number;
    experience_score?: number;
  };
  current_stage?: number;
  status?: string;
  stage?: number; // 0, 1, 2, 3, 4, 5, 6
  submitted_at?: string;
  attachments?: {
    file_name: string;
    url: string;
    uploaded_at: string;
  }[];
  evaluation?: any;
  vendor_details?: Vendor; // Assuming backend might populate this or we fetch separately
}

export interface Vendor {
  vendor_id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  contact_person?: string;
}
