import { createContext, useContext, useState, useEffect } from "react";
import { account } from "../lib/appwrite";
import type { Models } from "appwrite";
import { ID } from "appwrite";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  changeEmail: (newEmail: string, password: string) => Promise<void>;
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

  async function changePassword(currentPassword: string, newPassword: string) {
    try {
      await account.updatePassword(newPassword, currentPassword);
      checkUser();
    } catch (error) {
      console.error(error);
    }
  }

  async function changeEmail(newEmail: string, password: string) {
    if (!newEmail || !password) {
      throw new Error("Email and password are required");
    }

    try {
      await account.updateEmail(newEmail, password);
      await checkUser();
    } catch (error: any) {
      console.error("Email change error:", error);

      if (error?.code === 409) {
        throw new Error("This email is already in use");
      } else if (error?.code === 401) {
        throw new Error("Current password is incorrect");
      } else {
        throw new Error("Failed to update email");
      }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    changePassword,
    changeEmail,
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
