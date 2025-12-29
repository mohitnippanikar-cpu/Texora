import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: User['role'][];
  fallbackPath?: string;
  showUnauthorizedMessage?: boolean;
}

export function RoleProtectedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = '/dashboard',
  showUnauthorizedMessage = false
}: RoleProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    if (showUnauthorizedMessage) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-6">
              Your role ({user.role}) does not have permission to access this section.
            </p>
            <div className="space-y-2">
              <p className="text-sm text-gray-500">
                Required roles: {allowedRoles.join(', ')}
              </p>
              <p className="text-sm text-gray-500">
                Your current role: {user.role}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <>{children}</>;
}

// Role-based permission checker hook
export function useRolePermissions() {
  const { user } = useAuth();
  
  const hasRole = (requiredRoles: User['role'][]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };
  
  const isAdmin = (): boolean => {
    return user?.role === 'admin';
  };
  
  const canAccessDataIngestion = (): boolean => {
    return user?.role === 'admin';
  };
  
  const canManageUsers = (): boolean => {
    return user?.role === 'admin';
  };
  
  const canApproveDocuments = (): boolean => {
    return user?.role === 'admin' || user?.role === 'manager';
  };
  
  const canManageOperations = (): boolean => {
    return user?.role === 'admin' || user?.role === 'manager';
  };
  
  const canViewReports = (): boolean => {
    return user?.role === 'admin' || user?.role === 'manager';
  };
  
  const getAccessibleRoutes = (): string[] => {
    if (!user) return [];
    
    const baseRoutes = ['/dashboard', '/documents', '/inbox', '/collaboration', '/team', '/kanban'];
    
    switch (user.role) {
      case 'admin':
        return [
          ...baseRoutes,
          '/admin',
          '/data-ingestion',
          '/config',
          '/ai-processing',
          '/compliance',
          '/projects'
        ];
      case 'manager':
        return [
          ...baseRoutes,
          '/ai-processing',
          '/compliance',
          '/projects'
        ];
      case 'employee':
        return baseRoutes;
      default:
        return baseRoutes;
    }
  };
  
  return {
    user,
    hasRole,
    isAdmin,
    canAccessDataIngestion,
    canManageUsers,
    canApproveDocuments,
    canManageOperations,
    canViewReports,
    getAccessibleRoutes
  };
}

// Component-level permission wrapper
interface PermissionWrapperProps {
  children: React.ReactNode;
  requiredRoles: User['role'][];
  fallback?: React.ReactNode;
}

export function PermissionWrapper({ children, requiredRoles, fallback = null }: PermissionWrapperProps) {
  const { hasRole } = useRolePermissions();
  
  if (!hasRole(requiredRoles)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}