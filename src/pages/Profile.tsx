import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { BsChevronRight } from "react-icons/bs";
import { BiLogOut } from "react-icons/bi";
import "./Profile.css";

const Profile = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const { user, login, register, logout, changePassword, changeEmail } =
    useAuth();
  const [currentPasswordForPassword, setCurrentPasswordForPassword] =
    useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  const [passwordChangeVisible, setPasswordChangeVisible] = useState("none");
  const [emailChangeVisible, setEmailChangeVisible] = useState("none");
  const [rotateE, setRotateE] = useState("");
  const [rotateP, setRotateP] = useState("");

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
    if (passwordChangeVisible == "none") {
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
    if (emailChangeVisible == "none") {
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
    try {
      if (isRegistering) {
        if (!name) {
          alert("Please enter a name");
          return;
        }
        await register(email, password, name);
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (error) {
      console.error("Auth error:", error);
      alert("Authentication failed");
    }
  };

  const handleChangePassword = async (): Promise<void> => {
    if (!user) {
      alert("You must be logged in to change password");
      setCurrentPasswordForPassword("");
      setNewPassword("");
      return;
    }

    if (currentPasswordForPassword !== user.password) {
      alert("Password attuale errata");
      setCurrentPasswordForPassword("");
      setNewPassword("");
      return;
    }

    if (!currentPasswordForPassword || !newPassword) {
      alert("Please fill in both password fields");
      setCurrentPasswordForPassword("");
      setNewPassword("");
      return;
    }

    if (currentPasswordForPassword === newPassword) {
      alert("New password must be different from current password");
      setCurrentPasswordForPassword("");
      setNewPassword("");
      return;
    }

    try {
      await changePassword(currentPasswordForPassword, newPassword);

      setCurrentPasswordForPassword("");
      setNewPassword("");

      window.location.reload();

      alert("Password changed successfully");
    } catch (error) {
      console.error("Password change error:", error);
      alert(
        "Failed to change password. Please check your current password and try again."
      );
    }
  };

  const handleChangeEmail = async (): Promise<void> => {
    if (!user) {
      alert("Devi essere loggato per cambiare email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert("Inserisci un'email valida");
      return;
    }

    if (!currentPasswordForEmail) {
      alert("Inserisci la password attuale");
      return;
    }

    try {
      await changeEmail(newEmail, currentPasswordForEmail);

      setNewEmail("");
      setCurrentPasswordForEmail("");

      alert("Email cambiata con successo");

      window.location.reload();
    } catch (error: any) {
      console.error("Email change error:", error);

      if (error.message === "This email is already in use") {
        alert("Questa email è già in uso");
      } else if (error.message === "Current password is incorrect") {
        alert("Password attuale errata");
      } else {
        alert("Errore nel cambio email");
      }
    }
  };

  if (user) {
    return (
      <>
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
              {emailChangeVisible && (
                <div
                  className="change-block"
                  style={{ display: `${emailChangeVisible}` }}
                >
                  <input
                    className="input"
                    type="text"
                    placeholder="Inserisci nuova email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <input
                    className="input"
                    type="text"
                    placeholder="Inserisci password attuale"
                    value={currentPasswordForEmail}
                    onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                  />
                  <button
                    className="listened-button"
                    onClick={handleChangeEmail}
                  >
                    Cambia email
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
              {passwordChangeVisible && (
                <div
                  className="change-block"
                  style={{ display: `${passwordChangeVisible}` }}
                >
                  <input
                    className="input"
                    type="text"
                    placeholder="Inserisci password attuale"
                    value={currentPasswordForPassword}
                    onChange={(e) =>
                      setCurrentPasswordForPassword(e.target.value)
                    }
                  />
                  <input
                    className="input"
                    type="text"
                    placeholder="Inserisci nuova password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    className="listened-button"
                    onClick={handleChangePassword}
                  >
                    Cambia password
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
      </>
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
            />
          )}

          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />

          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input"
          />

          <button type="submit" className="auth-button">
            {isRegistering ? "Registrati" : "Login"}
          </button>
        </form>
        <h1 className="or">oppure</h1>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="auth-button"
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
