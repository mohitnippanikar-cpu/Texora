import React from 'react';
import KanbanPage from "./components/kanban/KanbanPage";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LayoutNew from './components/LayoutNew';
import { LoginPageNew } from './components/auth/LoginPage';
import { DashboardClean } from './components/dashboard/DashboardClean2';
import { ConfigurationPage } from './components/config/ConfigurationPage';
import { AdminDashboard } from './components/admin/AdminDashboard';
import ChatbotPage from './components/chatbot/ChatbotPage';
import RFPManager from './components/rfp/RFPManager';
import RFPDetail from './components/rfp/RFPDetail';
import CreateTender from './components/rfp/CreateTender';
import UpdateTender from './components/rfp/UpdateTender';
import { TenderDetailKanban } from './components/dashboard/TenderDetailKanban';
import VendorProfilePage from './components/vendors/VendorProfilePage';
import VendorsListPage from './components/vendors/VendorsListPage';
import VendorCallingPage from './components/vendors/VendorCallingPage';
import ConsultOSPage from './components/consult/ConsultOSPage';
import FullConsultationPage from './components/consult/FullConsultationPage';
import { ERPSystemPage } from './components/erp/ERPSystemPage';
function ProtectedRoute({ children }: { children: React.ReactNode }) {
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
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPageNew />} />
      
      <Route path="/" element={<ProtectedRoute><LayoutNew /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="chatbot" element={<ChatbotPage />} />
        <Route path="chat" element={<ChatbotPage />} />
        <Route path="dashboard" element={<DashboardClean />} />
        <Route path="admin" element={<AdminDashboard />} />
        <Route path="config" element={<ConfigurationPage />} />
        <Route path="tender-manager" element={<RFPManager />} />
        <Route path="tender-manager/create" element={<CreateTender />} />
        <Route path="tender-manager/update/:id" element={<UpdateTender />} />
        <Route path="vendors" element={<VendorsListPage />} />
        <Route path="vendor/:vendorId" element={<VendorProfilePage />} />
        <Route path="procure-os" element={<VendorCallingPage />} />
        <Route path="consult-os" element={<ConsultOSPage />} />
        <Route path="erp" element={<ERPSystemPage />} />
      </Route>
      
      {/* Full-screen consultation page */}
      <Route 
        path="/consult-os/:tenderId" 
        element={
          <ProtectedRoute>
            <FullConsultationPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Full-screen routes without sidebar */}
      <Route 
        path="/dashboard/tender/:tenderId" 
        element={
          <ProtectedRoute>
            <TenderDetailKanban />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/tender-manager/:id" 
        element={
          <ProtectedRoute>
            <RFPDetail />
          </ProtectedRoute>
        } 
      />
      
      {/* Kanban page as a separate full-screen route */}
      <Route 
        path="/kanban" 
        element={
          <ProtectedRoute>
            <KanbanPage />
          </ProtectedRoute>
        } 
      />
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;