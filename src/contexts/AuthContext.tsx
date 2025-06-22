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
  sendEmailVerification: () => Promise<void>;
  confirmEmailVerification: (userId: string, secret: string) => Promise<void>;
  resendEmailVerification: () => Promise<void>;
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
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle specific Appwrite errors
      if (error?.code === 401) {
        throw new Error("Invalid email or password");
      } else if (error?.code === 429) {
        throw new Error("Too many attempts. Please try again later");
      } else {
        throw new Error("Login failed. Please try again");
      }
    }
  }

  async function register(email: string, password: string, name: string) {
    try {
      // Validate password strength before sending to server
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long");
      }

      // Create account
      await account.create(ID.unique(), email, password, name);

      // Login after registration
      await login(email, password);

      // Automatically send email verification after successful registration
      try {
        await sendEmailVerification();
        console.log("Verification email sent automatically");
      } catch (verificationError) {
        console.warn("Failed to send verification email:", verificationError);
        // Don't throw here - registration was successful, just verification email failed
      }
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle specific Appwrite errors
      if (error?.code === 409) {
        throw new Error("Email already exists");
      } else if (error?.code === 400) {
        throw new Error("Invalid email or password format");
      } else if (error.message.includes("Password must be")) {
        throw error; // Re-throw our custom validation error
      } else {
        throw new Error("Registration failed. Please try again");
      }
    }
  }

  async function logout() {
    try {
      await account.deleteSession("current");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Force logout locally even if server request fails
      setUser(null);
    }
  }

  async function changePassword(currentPassword: string, newPassword: string) {
    try {
      // Validate new password strength
      if (newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters long");
      }

      if (currentPassword === newPassword) {
        throw new Error("New password must be different from current password");
      }

      // Appwrite handles password verification and hashing
      await account.updatePassword(newPassword, currentPassword);
      await checkUser();
    } catch (error: any) {
      console.error("Password change error:", error);

      // Handle specific Appwrite errors
      if (error?.code === 401) {
        throw new Error("Current password is incorrect");
      } else if (error?.code === 400) {
        throw new Error("Invalid password format");
      } else if (error.message.includes("must be")) {
        throw error; // Re-throw our custom validation errors
      } else {
        throw new Error("Failed to change password");
      }
    }
  }

  async function changeEmail(newEmail: string, password: string) {
    if (!newEmail || !password) {
      throw new Error("Email and password are required");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      throw new Error("Please enter a valid email address");
    }

    try {
      // Appwrite handles password verification
      await account.updateEmail(newEmail, password);
      await checkUser();

      // Send verification email for the new email address
      try {
        await sendEmailVerification();
        console.log("Verification email sent to new address");
      } catch (verificationError) {
        console.warn("Failed to send verification email:", verificationError);
      }
    } catch (error: any) {
      console.error("Email change error:", error);

      // Handle specific Appwrite errors
      if (error?.code === 409) {
        throw new Error("This email is already in use");
      } else if (error?.code === 401) {
        throw new Error("Current password is incorrect");
      } else if (error?.code === 400) {
        throw new Error("Invalid email format");
      } else {
        throw new Error("Failed to update email");
      }
    }
  }

  async function sendEmailVerification() {
    try {
      // The verification URL should point to your app's verification page
      const verificationUrl = `${window.location.origin}/verify-email`;
      await account.createVerification(verificationUrl);
    } catch (error: any) {
      console.error("Send verification error:", error);

      if (error?.code === 401) {
        throw new Error("You must be logged in to send verification email");
      } else if (error?.code === 429) {
        throw new Error(
          "Too many verification emails sent. Please wait before trying again"
        );
      } else {
        throw new Error("Failed to send verification email");
      }
    }
  }

  async function confirmEmailVerification(userId: string, secret: string) {
    try {
      await account.updateVerification(userId, secret);
      await checkUser(); // Refresh user data to get updated verification status
    } catch (error: any) {
      console.error("Email verification error:", error);

      if (error?.code === 401) {
        throw new Error("Invalid or expired verification link");
      } else {
        throw new Error("Email verification failed");
      }
    }
  }

  async function resendEmailVerification() {
    try {
      await sendEmailVerification();
    } catch (error) {
      throw error;
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
    sendEmailVerification,
    confirmEmailVerification,
    resendEmailVerification,
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
