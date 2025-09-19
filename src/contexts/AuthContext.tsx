import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, authAPI } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          // First set the user from localStorage to avoid showing "Employee" while API loads
          const localUser = JSON.parse(savedUser);
          setUser(localUser);
          console.log(
            "🔄 AuthContext: Set user from localStorage:",
            localUser.name || localUser.email
          );

          // Add timeout to prevent hanging
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("API timeout")), 5000)
          );

          const response = (await Promise.race([
            authAPI.getCurrentUser(),
            timeoutPromise,
          ])) as any;

          if (response && response.success && response.data) {
            setUser(response.data);
            console.log(
              "✅ AuthContext: Updated user from API:",
              response.data.name || response.data.email
            );
          } else {
            // Token is invalid, clear storage but keep local user for now
            console.warn("Invalid token, but keeping local user");
          }
        } catch (error) {
          // API failed but keep the local user
          console.warn("Auth API failed, using localStorage user:", error);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login({ email, password });
      if (response.success && response.data) {
        const { token, user: userData } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const response = await authAPI.signup(userData);
      if (response.success && response.data) {
        const { token, user: newUser } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(newUser));
        setUser(newUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Signup error:", error);
      return false;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
