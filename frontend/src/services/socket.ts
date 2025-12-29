import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, ((...args: any[]) => void)[]> = new Map();

  connect(token?: string) {
    if (this.socket?.connected) return;

    try {
      this.socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
        auth: token ? { token } : undefined,
        transports: ['websocket', 'polling'],
        timeout: 5000,
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000
      });

      // Connection events
      this.socket.on('connect', () => {
        console.log('✅ Connected to KMRL Backend');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from KMRL Backend:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.warn('🔌 Connection error (non-critical):', error.message || error);
        // Don't throw error, just log it
      });

      // Re-attach existing listeners
      this.listeners.forEach((callbacks, event) => {
        callbacks.forEach(callback => {
          this.socket?.on(event, callback);
        });
      });
    } catch (error) {
      console.warn('Socket initialization failed (non-critical):', error);
      this.socket = null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join role-based room for targeted updates
  joinRole(role: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-role', role);
    }
  }

  // Subscribe to events
  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    this.listeners.get(event)!.push(callback);
    
    if (this.socket?.connected) {
      this.socket.on(event, callback);
    }
  }

  // Unsubscribe from events
  off(event: string, callback?: (...args: any[]) => void) {
    if (callback) {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
    
    if (this.socket?.connected) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }

  // Emit events
  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Fleet-specific methods
  onFleetUpdate(callback: (data: any) => void) {
    this.on('fleet-update', callback);
  }

  onLocationUpdate(callback: (data: any) => void) {
    this.on('location-update', callback);
  }

  onNewAlert(callback: (data: any) => void) {
    this.on('new-alert', callback);
  }

  onAlertResolved(callback: (data: any) => void) {
    this.on('alert-resolved', callback);
  }

  onMaintenanceScheduled(callback: (data: any) => void) {
    this.on('maintenance-scheduled', callback);
  }

  // Send fleet updates
  sendFleetUpdate(data: any) {
    this.emit('fleet-update', data);
  }

  sendSystemAlert(alert: any) {
    this.emit('system-alert', alert);
  }

  get isConnected() {
    return this.socket?.connected || false;
  }
}

// Create singleton instance
const socketService = new SocketService();
export default socketService;