// @ts-ignore - util.js is a JavaScript file
import { SERVER_URL } from '../utils/util';

// API Configuration
// Use relative paths to leverage Vite proxy in development
const API_BASE_URL = '/api';
// Scraper microservice for RFP/tender ingestion
const SCRAPER_API_BASE_URL = import.meta.env.VITE_SCRAPER_API_BASE_URL || 'http://localhost:5002/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    // Get token from localStorage on initialization
    this.token = localStorage.getItem('kmrl_token');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    try {
      const data = await response.json();
      
      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.clearToken();
          // Don't redirect automatically, let components handle it
          throw new Error('Authentication required');
        }
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid response from server');
      }
      throw error;
    }
  }

  // Removed unused safeRequest method

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('kmrl_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('kmrl_token');
  }

  // Authentication API
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email, password }),
      });

      const data = await this.handleResponse(response);
      
      if (data.success && data.data.authToken) {
        this.setToken(data.data.authToken);
      }
      
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearToken();
    }
  }

  async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get current user failed:', error);
      return { success: false, error: 'Failed to get user info', data: null };
    }
  }

  async updateProfile(profileData: any) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(profileData),
    });
    return this.handleResponse(response);
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return this.handleResponse(response);
  }

  // Dashboard API
  async getDashboardMetrics() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard-metrics`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Dashboard metrics failed:', error);
      return { 
        success: false, 
        error: 'Failed to load dashboard metrics',
        data: {
          overview: { totalTrains: 0, operationalTrains: 0, systemUptime: 0 },
          performance: { onTimePerformance: 0 }
        }
      };
    }
  }

  async getLiveStatus() {
    try {
      // Using dashboard-metrics endpoint since live-status is not available
      const response = await fetch(`${API_BASE_URL}/dashboard-metrics`, {
        headers: this.getHeaders(),
      });
      const result = await this.handleResponse(response);
      // Transform dashboard metrics to live status format
      return {
        success: true,
        data: {
          activeTrains: result.data?.trains?.operational || 0,
          totalStations: 25,
          systemStatus: 'operational',
          lastUpdate: new Date().toISOString()
        }
      };
    } catch (error) {
      console.warn('Live status failed:', error);
      return { success: false, error: 'Failed to load live status', data: null };
    }
  }

  async getRecentActivities(_limit = 10) {
    try {
      // Using dashboard-metrics endpoint since activities endpoint is not available
      const response = await fetch(`${API_BASE_URL}/dashboard-metrics`, {
        headers: this.getHeaders(),
      });
      await this.handleResponse(response);
      // Generate mock activities based on dashboard data
      const activities = [
        { id: '1', type: 'info', message: 'System health check completed', timestamp: new Date().toISOString() },
        { id: '2', type: 'warning', message: 'Scheduled maintenance reminder', timestamp: new Date(Date.now() - 3600000).toISOString() },
        { id: '3', type: 'success', message: 'Daily compliance report generated', timestamp: new Date(Date.now() - 7200000).toISOString() }
      ];
      return { success: true, data: activities };
    } catch (error) {
      console.warn('Recent activities failed:', error);
      return { success: false, error: 'Failed to load activities', data: [] };
    }
  }

  async getSystemHealth() {
    try {
      // Mock system health data
      return {
        success: true,
        data: {
          overall: 'good',
          uptime: '99.2%',
          services: {
            database: 'operational',
            api: 'operational',
            notifications: 'operational'
          }
        }
      };
    } catch (error) {
      return { success: false, error: 'Failed to load system health', data: null };
    }
  }

  async getEmergencyStatus() {
    try {
      // Mock emergency status data
      return {
        success: true,
        data: {
          level: 'normal',
          activeAlerts: 0,
          emergencyContacts: ['Control Room: +91-484-2333301']
        }
      };
    } catch (error) {
      return { success: false, error: 'Failed to load emergency status', data: null };
    }
  }

  // Fleet Management API
  async getTrains(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters as any).toString();
      const response = await fetch(`${API_BASE_URL}/fleet/trains?${queryParams}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get trains failed:', error);
      return { success: false, error: 'Failed to load trains', data: { trains: [] } };
    }
  }

  async getMaintenanceSchedule(days = 7) {
    try {
      const response = await fetch(`${API_BASE_URL}/fleet/maintenance?days=${days}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Maintenance schedule failed:', error);
      return { success: false, error: 'Failed to load maintenance', data: { trains: [] } };
    }
  }

  async getTrain(identifier: string) {
    const response = await fetch(`${API_BASE_URL}/fleet/trains/${identifier}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateTrain(identifier: string, trainData: any) {
    const response = await fetch(`${API_BASE_URL}/fleet/trains/${identifier}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(trainData),
    });
    return this.handleResponse(response);
  }

  async updateTrainLocation(identifier: string, locationData: any) {
    const response = await fetch(`${API_BASE_URL}/fleet/trains/${identifier}/location`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(locationData),
    });
    return this.handleResponse(response);
  }

  async addTrainAlert(identifier: string, alertData: any) {
    const response = await fetch(`${API_BASE_URL}/fleet/trains/${identifier}/alerts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(alertData),
    });
    return this.handleResponse(response);
  }

  async resolveAlert(identifier: string, alertId: string) {
    const response = await fetch(`${API_BASE_URL}/fleet/trains/${identifier}/alerts/${alertId}/resolve`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async scheduleMaintenanceForTrain(identifier: string, maintenanceData: any) {
    const response = await fetch(`${API_BASE_URL}/fleet/trains/${identifier}/maintenance`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(maintenanceData),
    });
    return this.handleResponse(response);
  }

  // Stations API
  async getStations(filters = {}) {
    const queryParams = new URLSearchParams(filters as any).toString();
    const response = await fetch(`${API_BASE_URL}/stations?${queryParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getStation(identifier: string) {
    const response = await fetch(`${API_BASE_URL}/stations/${identifier}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getRouteOverview() {
    const response = await fetch(`${API_BASE_URL}/stations/route/overview`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getPassengerStatistics() {
    const response = await fetch(`${API_BASE_URL}/stations/stats/passengers`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Users API
  async getUsers(filters = {}) {
    const queryParams = new URLSearchParams(filters as any).toString();
    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async getUser(id: string) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async updateUser(id: string, userData: any) {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async getUserStatistics() {
    const response = await fetch(`${API_BASE_URL}/users/stats/overview`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Projects API
  async getProjects(status?: string) {
    try {
      const queryParams = status ? `?status=${status}` : '';
      const response = await fetch(`${API_BASE_URL}/projects${queryParams}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get projects failed:', error);
      return { success: false, error: 'Failed to load projects', data: [] };
    }
  }

  async getProject(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get project failed:', error);
      return { success: false, error: 'Failed to load project', data: null };
    }
  }

  async createProject(projectData: {
    name: string;
    key: string;
    type?: 'software' | 'business';
    lead?: string;
    description?: string;
    category?: string;
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(projectData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Create project failed:', error);
      return { success: false, error: 'Failed to create project', data: null };
    }
  }

  /**
   * Update Kanban task with matching results or status updates
   */
  async updateKanbanTask(tenderId: string, payload: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/tenders/kanban/${tenderId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Update kanban task failed:', error);
      return { success: false, error: error?.message || 'Failed to update kanban task' };
    }
  }

  async updateProject(id: string, projectData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(projectData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Update project failed:', error);
      return { success: false, error: 'Failed to update project', data: null };
    }
  }

  async deleteProject(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Delete project failed:', error);
      return { success: false, error: 'Failed to delete project', data: null };
    }
  }

  // Project Tasks API
  async getProjectTasks(projectId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get project tasks failed:', error);
      return { success: false, error: 'Failed to load project tasks', data: [] };
    }
  }

  async createProjectTask(projectId: string, taskData: {
    title: string;
    description?: string;
    assignee?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
    labels?: string[];
    storyPoints?: number;
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(taskData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Create project task failed:', error);
      return { success: false, error: 'Failed to create task', data: null };
    }
  }

  async updateProjectTask(projectId: string, taskId: string, taskData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/${taskId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(taskData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Update project task failed:', error);
      return { success: false, error: 'Failed to update task', data: null };
    }
  }

  // Project Calendar API
  async getProjectCalendarEvents(projectId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/calendar`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get project calendar events failed:', error);
      return { success: false, error: 'Failed to load calendar events', data: [] };
    }
  }

  async createProjectCalendarEvent(projectId: string, eventData: {
    title: string;
    description?: string;
    date: string;
    time?: string;
    duration?: string;
    type?: 'meeting' | 'deadline' | 'maintenance' | 'inspection';
    attendees?: string[];
    priority?: 'low' | 'medium' | 'high';
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/calendar`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(eventData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Create project calendar event failed:', error);
      return { success: false, error: 'Failed to create calendar event', data: null };
    }
  }

  // Document Management API
  async getDocuments(filters: Record<string, string> = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) params.append(key, filters[key]);
      });
      
      const response = await fetch(`${API_BASE_URL}/documents?${params.toString()}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get documents failed:', error);
      return { 
        success: false, 
        error: 'Failed to load documents', 
        data: { 
          documents: [], 
          summary: { total: 0, high_priority: 0, pending_compliance: 0, multilingual: 0 } 
        } 
      };
    }
  }

  async uploadDocument(documentData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/upload`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(documentData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Document upload failed:', error);
      return { success: false, error: 'Failed to upload document', data: null };
    }
  }

  async getDocument(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get document failed:', error);
      return { success: false, error: 'Failed to load document', data: null };
    }
  }

  async updateDocument(id: string, documentData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(documentData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Update document failed:', error);
      return { success: false, error: 'Failed to update document', data: null };
    }
  }

  async deleteDocument(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Delete document failed:', error);
      return { success: false, error: 'Failed to delete document', data: null };
    }
  }

  // Knowledge Base API
  async searchKnowledgeBase(query: string, filters: Record<string, string> = {}) {
    try {
      const params = new URLSearchParams({ query, ...filters });
      const response = await fetch(`${API_BASE_URL}/knowledge-base/search?${params.toString()}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Knowledge base search failed:', error);
      return { success: false, error: 'Failed to search knowledge base', data: { results: [], total: 0, suggestions: [] } };
    }
  }

  async getKnowledgeBaseItem(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-base/${id}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get knowledge base item failed:', error);
      return { success: false, error: 'Failed to load knowledge base item', data: null };
    }
  }

  async createKnowledgeBaseItem(itemData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-base`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(itemData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Create knowledge base item failed:', error);
      return { success: false, error: 'Failed to create knowledge base item', data: null };
    }
  }

  async updateKnowledgeBaseItem(id: string, itemData: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-base/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(itemData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Update knowledge base item failed:', error);
      return { success: false, error: 'Failed to update knowledge base item', data: null };
    }
  }

  async voteKnowledgeBaseItem(id: string, helpful: boolean) {
    try {
      const response = await fetch(`${API_BASE_URL}/knowledge-base/${id}/vote`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ helpful }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Vote knowledge base item failed:', error);
      return { success: false, error: 'Failed to vote on item', data: null };
    }
  }

  // Smart Notifications API
  async getSmartNotifications(role?: string, department?: string) {
    try {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (department) params.append('department', department);
      
      const response = await fetch(`${API_BASE_URL}/notifications/smart?${params.toString()}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get smart notifications failed:', error);
      return { 
        success: false, 
        error: 'Failed to load notifications', 
        data: { notifications: [], unread_count: 0, high_priority_count: 0 } 
      };
    }
  }

  async markNotificationAsRead(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Mark notification as read failed:', error);
      return { success: false, error: 'Failed to mark notification as read', data: null };
    }
  }

  async dismissNotification(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/dismiss`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Dismiss notification failed:', error);
      return { success: false, error: 'Failed to dismiss notification', data: null };
    }
  }

  async getNotificationSettings() {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/settings`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get notification settings failed:', error);
      return { success: false, error: 'Failed to load notification settings', data: null };
    }
  }

  async updateNotificationSettings(settings: any) {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/settings`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(settings),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Update notification settings failed:', error);
      return { success: false, error: 'Failed to update notification settings', data: null };
    }
  }

  // AI Processing API
  async getAIProcesses() {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/processes`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get AI processes failed:', error);
      return { success: false, error: 'Failed to load AI processes', data: { processes: [] } };
    }
  }

  async startAIProcess(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/processes/${id}/start`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Start AI process failed:', error);
      return { success: false, error: 'Failed to start AI process', data: null };
    }
  }

  async stopAIProcess(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/processes/${id}/stop`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Stop AI process failed:', error);
      return { success: false, error: 'Failed to stop AI process', data: null };
    }
  }

  // Compliance API
  async getCompliance() {
    try {
      const response = await fetch(`${API_BASE_URL}/compliance`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get compliance data failed:', error);
      return { success: false, error: 'Failed to load compliance data', data: { compliance: [] } };
    }
  }

  // Consultation API
  async startConsultation(title: string, prompt: string) {
    try {
      const response = await fetch(`${SERVER_URL}/consult`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ title, prompt }),
      });
      
      // Log response details for debugging
      console.log('Consultation response status:', response.status);
      
      const data = await this.handleResponse(response);
      return data;
    } catch (error: any) {
      console.error('Start consultation failed:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }

  async consultChat(prompt: string) {
    try {
      const response = await fetch(`${SERVER_URL}/consult-chat`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ prompt }),
      });
      
      console.log('Consult chat response status:', response.status);
      
      const data = await this.handleResponse(response);
      return data;
    } catch (error: any) {
      console.error('Consult chat failed:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }

  // Tender Submissions Kanban API
  async getTenderSubmissionsKanban(tenderId: string) {
    try {
      const response = await fetch(`${SERVER_URL}/tenders/${tenderId}/submissions-kanban`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      console.log('Submissions kanban response status:', response.status);
      
      const data = await this.handleResponse(response);
      return data;
    } catch (error: any) {
      console.error('Get submissions kanban failed:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }

  async updateSubmissionStage(submissionId: string) {
    try {
      const response = await fetch(`${SERVER_URL}/submissions/${submissionId}/update_stage`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      
      console.log('Update stage response status:', response.status);
      
      const data = await this.handleResponse(response);
      return data;
    } catch (error: any) {
      console.error('Update submission stage failed:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }

  // Team Chat API
  async getChannels() {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/channels`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get channels failed:', error);
      return { success: false, error: 'Failed to load channels', data: { channels: [] } };
    }
  }

  async getMessages(channelId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/channels/${channelId}/messages`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Get messages failed:', error);
      return { success: false, error: 'Failed to load messages', data: { messages: [] } };
    }
  }

  async sendMessage(channelId: string, content: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/channels/${channelId}/messages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.warn('Send message failed:', error);
      return { success: false, error: 'Failed to send message', data: null };
    }
  }

  // Scraper RFPs
  async getScraperRfps(params?: { daysBack?: number }) {
    try {
      const response = await fetch(`${API_BASE_URL}/scraped_rfps`, {
        headers: this.getHeaders(),
      });
      const data = await this.handleResponse(response);
      return data; // Already has { success, data, count }
    } catch (error: any) {
      console.error('Get scraped RFPs failed:', error);
      return { success: false, error: error?.message || 'Failed to fetch scraped RFPs', data: [] };
    }
  }

  async generateRequirementsCsv(rfpId: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/scraped_rfps/${rfpId}/generate_csv`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return await this.handleResponse(response);
    } catch (error: any) {
      console.error('Generate CSV failed:', error);
      throw error;
    }
  }

  async downloadRequirementsCsv(rfpId: number, filename: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/scraped_rfps/${rfpId}/download_csv`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to download CSV');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error: any) {
      console.error('Download CSV failed:', error);
      throw error;
    }
  }

  // ============================================================================
  // TENDER GAME API
  // ============================================================================

  /**
   * 1. Start Scraping
   * Initiates the background scraping process to find new tenders
   */
  async startScraping() {
    try {
      const response = await fetch(`${API_BASE_URL}/tenders/scrape`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Start scraping failed:', error);
      return { success: false, error: error?.message || 'Failed to start scraping', data: null };
    }
  }

  /**
   * 2. Add Tender
   * Uploads a new tender PDF file along with its metadata
   */
  async addTender(formData: FormData) {
    try {
      const headers: Record<string, string> = {};
      if (this.token) {
        headers.Authorization = `Bearer ${this.token}`;
      }
      // Don't set Content-Type for FormData - browser will set it with boundary

      const response = await fetch(`${API_BASE_URL}/tenders/add`, {
        method: 'POST',
        headers,
        body: formData,
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Add tender failed:', error);
      return { success: false, error: error?.message || 'Failed to add tender', data: null };
    }
  }

  /**
   * 3. Get All Tenders
   * Retrieves a summary list of all tenders stored in the system
   */
  async getAllTenders() {
    try {
      const response = await fetch(`${SERVER_URL}/tenders`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Get tenders failed:', error);
      return [];
    }
  }

  /**
   * Get Scraped Documents
   * Retrieves all scraped tender documents for Documents page
   */
  async getScrapedDocuments() {
    try {
      const response = await fetch(`${API_BASE_URL}/tenders/documents`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Get scraped documents failed:', error);
      return { success: false, error: error?.message || 'Failed to fetch documents', data: [] };
    }
  }

  /**
   * Get Kanban Tasks
   * Retrieves all scraped tenders as Kanban tasks
   */
  async getKanbanTasks() {
    try {
      const response = await fetch(`${API_BASE_URL}/tenders/kanban/tasks`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Get kanban tasks failed:', error);
      return { success: false, error: error?.message || 'Failed to fetch kanban tasks', tasks: [] };
    }
  }

  /**
   * Clear All Tenders
   * Deletes all scraped tenders from database (for testing)
   */
  async clearAllTenders() {
    try {
      const response = await fetch(`${API_BASE_URL}/tenders/clear`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Clear tenders failed:', error);
      return { success: false, error: error?.message || 'Failed to clear tenders' };
    }
  }

  /**
   * 4. Get Tender Details
   * Retrieves the full detailed JSON object for a specific tender
   */
  async getTenderDetails(tenderId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/tenders/${tenderId}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Get tender details failed:', error);
      return { success: false, error: error?.message || 'Tender not found', data: null };
    }
  }

  /**
   * 5. Get Sales Tenders
   * Retrieves a filtered list of tenders relevant to the Sales Team
   */
  async getSalesTenders() {
    try {
      const response = await fetch(`${API_BASE_URL}/sales/tenders`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Get sales tenders failed:', error);
      return { success: false, error: error?.message || 'Failed to fetch sales tenders', data: [] };
    }
  }

  /**
   * 6. Move to Next Stage
   * Advances the tender to the next sequential stage
   */
  async moveToNextStage(tenderId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/tenders/${tenderId}/stage/next`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Move to next stage failed:', error);
      return { success: false, error: error?.message || 'Failed to move to next stage', data: null };
    }
  }

  /**
   * 7. Update Checklist
   * Updates the checklist items for the current stage
   */
  async updateChecklist(tenderId: string, action: 'toggle' | 'add' | 'delete', params: { index?: number; item?: string }) {
    try {
      const body: any = { action };
      if (params.index !== undefined) {
        body.index = params.index;
      }
      if (params.item) {
        body.item = params.item;
      }

      const response = await fetch(`${API_BASE_URL}/tenders/${tenderId}/checklist`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(body),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Update checklist failed:', error);
      return { success: false, error: error?.message || 'Failed to update checklist', data: null };
    }
  }

  // ============================================================================
  // TENDER GAME FLOW APIs
  // ============================================================================

  /**
   * SKU Management
   */
  async getAllSkus() {
    try {
      const response = await fetch(`${API_BASE_URL}/skus`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Get SKUs failed:', error);
      return { success: false, error: error?.message || 'Failed to fetch SKUs', data: [] };
    }
  }

  async selectSkus(selectedSkus: string[]) {
    try {
      const response = await fetch(`${API_BASE_URL}/skus/select`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ selected_skus: selectedSkus }),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Select SKUs failed:', error);
      return { success: false, error: error?.message || 'Failed to select SKUs', data: null };
    }
  }

  async saveSelectedSkus(skus: any[]) {
    try {
      const response = await fetch(`${API_BASE_URL}/skus/selected`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ skus }),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Save selected SKUs failed:', error);
      return { success: false, error: error?.message || 'Failed to save SKUs', count: 0 };
    }
  }

  async getSelectedSkus() {
    try {
      const response = await fetch(`${API_BASE_URL}/skus/selected`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Get selected SKUs failed:', error);
      return { success: false, error: error?.message || 'Failed to fetch SKUs', skus: [] };
    }
  }

  /**
   * Tender Scraping & Fetching
   */
  async scrapeTenders() {
    try {
      const response = await fetch(`${API_BASE_URL}/tenders/scrape`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Scrape tenders failed:', error);
      return { success: false, error: error?.message || 'Failed to scrape tenders', data: [] };
    }
  }

  async getTendersByPriority() {
    try {
      const response = await fetch(`${API_BASE_URL}/tenders`, {
        headers: this.getHeaders(),
      });
      const data = await this.handleResponse(response);
      
      // Sort by priority: money (descending) and deadline (ascending)
      if (Array.isArray(data.data)) {
        data.data.sort((a: any, b: any) => {
          // First sort by tender value (higher first)
          const aValue = parseFloat(String(a.tender_value || 0).replace(/[^0-9.-]/g, '')) || 0;
          const bValue = parseFloat(String(b.tender_value || 0).replace(/[^0-9.-]/g, '')) || 0;
          
          if (bValue !== aValue) {
            return bValue - aValue;
          }
          
          // Then sort by deadline (sooner first)
          const aDate = new Date(a.bidding_closing_date || '').getTime() || 0;
          const bDate = new Date(b.bidding_closing_date || '').getTime() || 0;
          
          return aDate - bDate;
        });
      }
      
      return data;
    } catch (error: any) {
      console.error('Get tenders failed:', error);
      return { success: false, error: error?.message || 'Failed to fetch tenders', data: [] };
    }
  }

  /**
   * Sales Agents Management
   */
  async getSalesAgents() {
    try {
      const response = await fetch(`${API_BASE_URL}/sales-agents`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Get sales agents failed:', error);
      return { success: false, error: error?.message || 'Failed to fetch sales agents', data: [] };
    }
  }

  async assignTenderToSales(tenderId: string, agentId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/tenders/${tenderId}/assign-to-sales`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ agent_id: agentId }),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Assign tender to sales failed:', error);
      return { success: false, error: error?.message || 'Failed to assign tender', data: null };
    }
  }

  /**
   * Document Generation
   */
  async generateTenderDocument(tenderId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/tenders/${tenderId}/document`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Generate document failed:', error);
      return { success: false, error: error?.message || 'Failed to generate document', data: null };
    }
  }

  async downloadTenderDocumentPdf(tenderId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/tenders/${tenderId}/document/pdf`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tender-response-${tenderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error: any) {
      console.error('Download document PDF failed:', error);
      throw error;
    }
  }

  // --- Tender Management APIs ---

  async getTenderById(id: string) {
    try {
      const response = await fetch(`${SERVER_URL}/tenders/${id}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Get tender by ID failed:', error);
      throw error;
    }
  }

  async createTender(data: any) {
    try {
      const response = await fetch(`${SERVER_URL}/tenders`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Create tender failed:', error);
      throw error;
    }
  }

  async updateTender(id: string, data: any) {
    try {
      const response = await fetch(`${SERVER_URL}/tenders/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Update tender failed:', error);
      throw error;
    }
  }

  async deleteTender(id: string) {
    try {
      const response = await fetch(`${SERVER_URL}/tenders/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Delete tender failed:', error);
      throw error;
    }
  }

  async addTenderAttachment(id: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = this.getHeaders();
    delete headers['Content-Type'];

    try {
      const response = await fetch(`${SERVER_URL}/tenders/${id}/attachments`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Add tender attachment failed:', error);
      throw error;
    }
  }

  async removeTenderAttachment(id: string, filename: string) {
    try {
      const response = await fetch(`${SERVER_URL}/tenders/${id}/attachments/${filename}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Remove tender attachment failed:', error);
      throw error;
    }
  }

  // --- Submission APIs ---

  async createSubmission(tenderId: string, data: any) {
    try {
      const response = await fetch(`${SERVER_URL}/tenders/${tenderId}/submissions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Create submission failed:', error);
      throw error;
    }
  }

  async getTenderSubmissions(tenderId: string) {
    try {
      const response = await fetch(`${SERVER_URL}/tenders/${tenderId}/submissions`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Get tender submissions failed:', error);
      throw error;
    }
  }

  async getSubmissionById(bidId: string) {
    try {
      const response = await fetch(`${SERVER_URL}/submissions/${bidId}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Get submission by ID failed:', error);
      throw error;
    }
  }

  async addSubmissionAttachment(bidId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = this.getHeaders();
    delete headers['Content-Type'];

    try {
      const response = await fetch(`${SERVER_URL}/submissions/${bidId}/attachments`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Add submission attachment failed:', error);
      throw error;
    }
  }

  async updateEvaluation(bidId: string, data: any) {
    try {
      const response = await fetch(`${SERVER_URL}/submissions/${bidId}/evaluation`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Update evaluation failed:', error);
      throw error;
    }
  }

  async getEvaluation(bidId: string) {
    try {
      const response = await fetch(`${SERVER_URL}/submissions/${bidId}/evaluation`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Get evaluation failed:', error);
      throw error;
    }
  }

  async triggerEvaluation(tenderId: string) {
    try {
      const response = await fetch(`${SERVER_URL}/tenders/${tenderId}/evaluate`, {
        method: 'POST',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Trigger evaluation failed:', error);
      throw error;
    }
  }

  // --- Vendor APIs ---

  async getVendor(vendorId: string) {
    try {
      const response = await fetch(`${SERVER_URL}/vendors/${vendorId}`, {
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error: any) {
      console.error('Get vendor failed:', error);
      throw error;
    }
  }

}


// Create a singleton instance
const apiService = new ApiService();
export default apiService;