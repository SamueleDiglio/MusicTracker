import { createContext, useContext, useState, useEffect } from "react";
import { account } from "../lib/appwrite";
import type { Models } from "appwrite";
import { ID } from "appwrite";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const currentUser = await account.get();
      setUser(currentUser);
    } catch (error) {
      console.error("Check user error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      await account.createEmailPasswordSession(email, password);
      await checkUser();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async function register(email: string, password: string, name: string) {
    try {
      await account.create(ID.unique(), email, password, name);

      await login(email, password);
    } catch (error: any) {
      console.error(
        "Registration error:",
        error.message,
        error.code,
        error.response
      );
      throw error;
    }
  }

  async function logout() {
    await account.deleteSession("current");
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
