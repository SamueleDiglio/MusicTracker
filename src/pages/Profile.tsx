import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BsChevronRight } from "react-icons/bs";
import { BiLogOut } from "react-icons/bi";
import "./Profile.css";

const Profile = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const { user, login, register, logout, changePassword, changeEmail } = useAuth();
  
  // Password change states
  const [currentPasswordForPassword, setCurrentPasswordForPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordChangeVisible, setPasswordChangeVisible] = useState("none");
  const [rotateP, setRotateP] = useState("");
  
  // Email change states
  const [newEmail, setNewEmail] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  const [emailChangeVisible, setEmailChangeVisible] = useState("none");
  const [rotateE, setRotateE] = useState("");
  
  // Loading states for better UX
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

  const Avatar = () => (
    <div className="profile-avatar">
      {user?.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()}
    </div>
  );

  const handlePasswordChangeVisible = () => {
    if (passwordChangeVisible === "none") {
      setPasswordChangeVisible("flex");
      setRotateP("rotate(90deg)");
      setEmailChangeVisible("none");
      setRotateE("none");
    } else {
      setPasswordChangeVisible("none");
      setRotateP("none");
    }
  };

  const handleEmailChangeVisible = () => {
    if (emailChangeVisible === "none") {
      setEmailChangeVisible("flex");
      setRotateE("rotate(90deg)");
      setPasswordChangeVisible("none");
      setRotateP("none");
    } else {
      setEmailChangeVisible("none");
      setRotateE("none");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoggingIn) return; // Prevent double submission
    
    // Password confirmation validation for registration
    if (isRegistering) {
      if (!name.trim()) {
        alert("Please enter a name");
        return;
      }
      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }
    }
    
    setIsLoggingIn(true);
    
    try {
      if (isRegistering) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (error: any) {
      console.error("Auth error:", error);
      alert(error.message || "Authentication failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleChangePassword = async (): Promise<void> => {
    if (!user) {
      alert("You must be logged in to change password");
      return;
    }

    if (!currentPasswordForPassword || !newPassword || !confirmNewPassword) {
      alert("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match");
      return;
    }

    if (isChangingPassword) return; // Prevent double submission
    
    setIsChangingPassword(true);

    try {
      await changePassword(currentPasswordForPassword, newPassword);
      
      // Clear form
      setCurrentPasswordForPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordChangeVisible("none");
      setRotateP("none");
      
      alert("Password changed successfully");
    } catch (error: any) {
      console.error("Password change error:", error);
      alert(error.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = async (): Promise<void> => {
    if (!user) {
      alert("You must be logged in to change email");
      return;
    }

    if (!newEmail || !currentPasswordForEmail) {
      alert("Please fill in both fields");
      return;
    }

    if (isChangingEmail) return; // Prevent double submission
    
    setIsChangingEmail(true);

    try {
      await changeEmail(newEmail, currentPasswordForEmail);
      
      // Clear form
      setNewEmail("");
      setCurrentPasswordForEmail("");
      setEmailChangeVisible("none");
      setRotateE("none");
      
      alert("Email changed successfully");
    } catch (error: any) {
      console.error("Email change error:", error);
      alert(error.message || "Failed to change email");
    } finally {
      setIsChangingEmail(false);
    }
  };

  // Password strength and match indicators
  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return "";
    if (password.length < 8) return "Too short";
    
    let strength = 0;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    if (strength < 2) return "Weak";
    if (strength < 3) return "Medium";
    return "Strong";
  };

  const getPasswordMatch = (password: string, confirmPassword: string) => {
    if (confirmPassword.length === 0) return "";
    if (password === confirmPassword) return "Passwords match";
    return "Passwords do not match";
  };

  if (user) {
    return (
      <div className="page-container profile-page">
        <div className="profile-container">
          <div className="profile-info-container">
            <Avatar />
            <h1 className="subtitle">{user.name}</h1>
            <p>{user.email}</p>
          </div>
          <div className="profile-actions-container">
            <hr />
            <div className="opener" onClick={handleEmailChangeVisible}>
              <h1 className="subtitle">Cambia email</h1>
              <BsChevronRight
                className="arrow"
                style={{ transform: `${rotateE}` }}
              />
            </div>
            {emailChangeVisible === "flex" && (
              <div className="change-block" style={{ display: emailChangeVisible }}>
                <input
                  className="input"
                  type="email"
                  placeholder="Inserisci nuova email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  disabled={isChangingEmail}
                />
                <input
                  className="input"
                  type="password"
                  placeholder="Inserisci password attuale"
                  value={currentPasswordForEmail}
                  onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                  disabled={isChangingEmail}
                />
                <button
                  className="listened-button"
                  onClick={handleChangeEmail}
                  disabled={isChangingEmail}
                >
                  {isChangingEmail ? "Cambiando..." : "Cambia email"}
                </button>
              </div>
            )}
            <hr />
            <div className="opener" onClick={handlePasswordChangeVisible}>
              <h1 className="subtitle">Cambia password</h1>
              <BsChevronRight
                className="arrow"
                style={{ transform: `${rotateP}` }}
              />
            </div>
            {passwordChangeVisible === "flex" && (
              <div className="change-block" style={{ display: passwordChangeVisible }}>
                <input
                  className="input"
                  type="password"
                  placeholder="Inserisci password attuale"
                  value={currentPasswordForPassword}
                  onChange={(e) => setCurrentPasswordForPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
                <input
                  className="input"
                  type="password"
                  placeholder="Inserisci nuova password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
                {newPassword && (
                  <div className={`password-indicator strength-${getPasswordStrength(newPassword).toLowerCase()}`}>
                    Strength: {getPasswordStrength(newPassword)}
                  </div>
                )}
                <input
                  className="input"
                  type="password"
                  placeholder="Conferma nuova password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  disabled={isChangingPassword}
                />
                {confirmNewPassword && (
                  <div className={`password-indicator ${newPassword === confirmNewPassword ? 'match' : 'no-match'}`}>
                    {getPasswordMatch(newPassword, confirmNewPassword)}
                  </div>
                )}
                <button
                  className="listened-button"
                  onClick={handleChangePassword}
                  disabled={isChangingPassword || newPassword !== confirmNewPassword || !newPassword}
                >
                  {isChangingPassword ? "Cambiando..." : "Cambia password"}
                </button>
              </div>
            )}
            <hr />
            <div className="opener destructive" onClick={logout}>
              <h1 className="subtitle">Logout</h1>
              <BiLogOut className="logout-icon" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container profile-page">
      <div className="profile-container padded">
        <h1>{isRegistering ? "Registrati" : "Login"}</h1>
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <input
              placeholder="Username"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={isRegistering}
              className="input"
              disabled={isLoggingIn}
            />
          )}

          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
            disabled={isLoggingIn}
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
            disabled={isLoggingIn}
          />

          {isRegistering && (
            <input
              placeholder="Conferma Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="input"
              disabled={isLoggingIn}
            />
          )}

          {isRegistering && password && (
            <div className={`password-indicator strength-${getPasswordStrength(password).toLowerCase()}`}>
              Strength: {getPasswordStrength(password)}
            </div>
          )}

          {isRegistering && confirmPassword && (
            <div className={`password-indicator ${password === confirmPassword ? 'match' : 'no-match'}`}>
              {getPasswordMatch(password, confirmPassword)}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-button"
            disabled={isLoggingIn || (isRegistering && password !== confirmPassword) || (isRegistering && !password)}
          >
            {isLoggingIn 
              ? (isRegistering ? "Registrando..." : "Logging in...") 
              : (isRegistering ? "Registrati" : "Login")
            }
          </button>
        </form>
        <h1 className="or">oppure</h1>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="auth-button"
          disabled={isLoggingIn}
        >
          {isRegistering
            ? "Hai già un account? Login"
            : "Non hai un account? Registrati"}
        </button>
      </div>
    </div>
  );
};

export default Profile;