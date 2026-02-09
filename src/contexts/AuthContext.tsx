import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { loginCompany } from '../api';

export interface AuthUser {
  id: number;
  name: string;
  contact_person: string;
  contact_email: string;
  apiKey: string;
  is_approved: boolean;
  is_active: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedApiKey = localStorage.getItem('apiKey');
    if (storedUser && storedApiKey) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('apiKey');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await loginCompany({ email, password });
    const authUser: AuthUser = {
      id: response.id,
      name: response.name,
      contact_person: response.contact_person,
      contact_email: response.contact_email,
      apiKey: response.api_key,
      is_approved: response.is_approved,
      is_active: response.is_active,
    };
    localStorage.setItem('apiKey', response.api_key);
    localStorage.setItem('user', JSON.stringify(authUser));
    setUser(authUser);
  };

  const logout = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
