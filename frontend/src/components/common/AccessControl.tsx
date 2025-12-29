import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';

interface AccessControlProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
  requireWriteAccess?: boolean;
  fallback?: React.ReactNode;
}

export function AccessControl({ 
  children, 
  allowedRoles = ['admin', 'manager', 'employee'], 
  requireWriteAccess = false,
  fallback = null 
}: AccessControlProps) {
  const { user } = useAuth();
  
  if (!user) return <>{fallback}</>;
  
  // Check role access
  if (!allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }
  
  // Check write access if required
  if (requireWriteAccess) {
    const hasWriteAccess = checkWriteAccess(user.role);
    if (!hasWriteAccess) {
      return <>{fallback}</>;
    }
  }
  
  return <>{children}</>;
}

// Write access permissions by role
function checkWriteAccess(role: User['role']): boolean {
  switch (role) {
    case 'admin':
      return true; // Admin has write access to everything
    case 'manager':
      return true; // Managers have write access to most features
    case 'employee':
      return false; // Employees typically have read-only access (except documents they create)
    default:
      return false;
  }
}

// Role-based feature flags
export function useFeatureAccess() {
  const { user } = useAuth();
  
  return {
    // Admin-only features
    canManageUsers: user?.role === 'admin',
    canManageIntegrations: user?.role === 'admin',
    canAccessSystemSettings: user?.role === 'admin',
    canAccessDataIngestion: user?.role === 'admin',
    
    // Manager features
    canManageProjects: user?.role === 'admin' || user?.role === 'manager',
    canViewCompliance: user?.role === 'admin' || user?.role === 'manager',
    canAccessAIProcessing: user?.role === 'admin' || user?.role === 'manager',
    canScheduleMeetings: user?.role === 'admin' || user?.role === 'manager',
    canSendVendorFeedback: user?.role === 'admin' || user?.role === 'manager',
    
    // Employee features
    canUploadDocuments: true, // All roles can upload
    canViewAssignedTasks: true, // All roles can view their tasks
    canParticipateInChat: true, // All roles can chat
    
    // Write access by feature
    writeAccess: {
      documents: true, // All can create documents
      projects: user?.role === 'admin' || user?.role === 'manager',
      kanban: true, // All can update their tasks
      compliance: user?.role === 'admin' || user?.role === 'manager',
      settings: user?.role === 'admin'
    }
  };
}

// Component for displaying role-based UI elements
interface RoleBasedUIProps {
  userRole: User['role'];
  adminContent?: React.ReactNode;
  managerContent?: React.ReactNode;
  employeeContent?: React.ReactNode;
  defaultContent?: React.ReactNode;
}

export function RoleBasedUI({ 
  userRole, 
  adminContent, 
  managerContent, 
  employeeContent, 
  defaultContent 
}: RoleBasedUIProps) {
  switch (userRole) {
    case 'admin':
      return <>{adminContent || defaultContent}</>;
    case 'manager':
      return <>{managerContent || defaultContent}</>;
    case 'employee':
      return <>{employeeContent || defaultContent}</>;
    default:
      return <>{defaultContent}</>;
  }
}

// Button wrapper with role-based access
interface AccessControlButtonProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
  requireWriteAccess?: boolean;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function AccessControlButton({ 
  children, 
  allowedRoles = ['admin', 'manager', 'employee'],
  requireWriteAccess = false,
  onClick,
  className = '',
  disabled = false
}: AccessControlButtonProps) {
  const { user } = useAuth();
  
  if (!user || !allowedRoles.includes(user.role)) {
    return null;
  }
  
  if (requireWriteAccess && !checkWriteAccess(user.role)) {
    return null;
  }
  
  return (
    <button 
      onClick={onClick} 
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  );
}