import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import apiService from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string, role: User['role']) => Promise<boolean>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved login on mount
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('kmrl_token');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log('✅ Auto-login successful from localStorage');
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('kmrl_token');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Login attempt:', email);
    setIsLoading(true);
    
    try {
      // Demo credentials - simple admin login
      const demoEmail = import.meta.env.VITE_DEMO_EMAIL || 'admin@demo.com';
      const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || 'demo123';
      
      if (email === demoEmail && password === demoPassword) {
        console.log('✅ Demo login successful');
        const demoUser: User = {
          _id: 'admin-user-123',
          firstName: 'Demo',
          lastName: 'Admin',
          fullName: 'Demo Admin',
          email: 'admin@demo.com',
          role: 'admin',
          employeeId: 'DEMO001',
          department: 'Administration',
          designation: 'System Administrator',
          phoneNumber: '+91-9999999999',
          shiftPattern: 'day',
          permissions: ['read', 'write', 'admin', 'data_ingestion', 'user_management'],
          isActive: true,
          managedDepartments: ['Administration', 'Operations', 'Management', 'Technical'],
          integrationAccess: {
            email: true,
            whatsapp: true,
            iotFeeds: true,
            regulatoryPortals: true
          },
          emergencyContact: {
            name: 'Emergency Contact',
            relationship: 'Organization',
            phone: '+91-8888888888'
          },
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setUser(demoUser);
        localStorage.setItem('user', JSON.stringify(demoUser));
        localStorage.setItem('kmrl_token', 'demo-token-123');
        
        setIsLoading(false);
        return true;
      }

      // Try backend authentication (optional)
      try {
      const response = await apiService.login(email, password);
      console.log('📡 Login API Response:', response);
      
      if (response.success) {
        console.log('✅ Login successful, setting user:', response.data.user);
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
          // Sockets disabled per requirement; rely on UI animations/mocks
        
        setIsLoading(false);
        return true;
        }
      } catch (apiError) {
        console.log('Backend authentication not available, using demo credentials');
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (email: string, _password: string, name: string, role: User['role']): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Mock successful registration since register endpoint might not be public
      const mockUser: User = {
        _id: Date.now().toString(),
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        fullName: name,
        email: email,
        role: role,
        employeeId: `KMRL${String(Date.now()).slice(-4)}`,
        department: role === 'admin' ? 'Administration' : 
                   role === 'manager' ? 'Management' : 
                   role === 'employee' ? 'Operations' : 'General',
        designation: role.charAt(0).toUpperCase() + role.slice(1),
        phoneNumber: '9876543210',
        shiftPattern: 'day',
        permissions: [],
        isActive: true,
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Family',
          phone: '9876543211'
        },
        createdAt: new Date().toISOString(),
        // Legacy compatibility
        id: Date.now().toString(),
        name: name,
        created_at: new Date().toISOString()
      };
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    // Call API logout
    apiService.logout();
    
    // Clear local state
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('kmrl_token');
  };

  const value = {
    user,
    login,
    logout,
    register,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}