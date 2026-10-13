import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { apiClient } from "../../infrastructure/apiClient";
import { tokenStorage } from "../../infrastructure/tokenStorage";
import type { User } from "../../domain/model/User";

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USE_MOCK = false;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!tokenStorage.hasTokens()) {
      setIsLoading(false);
      return;
    }

    if (USE_MOCK) {
      const stored = localStorage.getItem("smoothmanage_mock_user");
      if (stored) {
        setUser(JSON.parse(stored));
      }
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await apiClient.get<User>("/v1/auth/me");
      setUser(data);
    } catch {
      tokenStorage.clearTokens();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, _password: string) => {
    if (USE_MOCK) {
      const mockUser: User = {
        id: 1,
        email,
        displayName: email.split("@")[0],
        emailVerified: true,
      };
      tokenStorage.setTokens("mock-access-token", "mock-refresh-token");
      localStorage.setItem("smoothmanage_mock_user", JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }

    const { data } = await apiClient.post<AuthResponse>("/v1/auth/login", {
      email,
      password: _password,
    });
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const register = async (email: string, _password: string, displayName: string) => {
    if (USE_MOCK) {
      const mockUser: User = {
        id: 1,
        email,
        displayName,
        emailVerified: false,
      };
      tokenStorage.setTokens("mock-access-token", "mock-refresh-token");
      localStorage.setItem("smoothmanage_mock_user", JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }

    const { data } = await apiClient.post<AuthResponse>("/v1/auth/register", {
      email,
      password: _password,
      displayName,
    });
    tokenStorage.setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
  };

  const logout = async () => {
    if (USE_MOCK) {
      tokenStorage.clearTokens();
      localStorage.removeItem("smoothmanage_mock_user");
      setUser(null);
      return;
    }

    try {
      await apiClient.post("/v1/auth/logout");
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}