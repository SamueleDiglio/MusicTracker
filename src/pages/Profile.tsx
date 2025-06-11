import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 50%)`;
  };

  const Avatar = ({ name }: { name: string }) => (
    <div
      style={{
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        backgroundColor: getAvatarColor(name),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "1rem",
      }}
    >
      {getInitials(name)}
    </div>
  );

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
        <div className="profile-info-container">
          <Avatar name={user.name} />
          <h1 className="subtitle">{user.name}</h1>
          <p>{user.email}</p>
          <button className="profile-button" onClick={logout}>
            Logout
          </button>
        </div>
        <hr />
        <div className="profile-action">
          <div className="change-password">
            <h1 className="subtitle"> Cambia password</h1>
            <input
              type="text"
              placeholder="Inserisci password attuale"
              value={currentPasswordForPassword}
              onChange={(e) => setCurrentPasswordForPassword(e.target.value)}
            />
            <input
              type="text"
              placeholder="Inserisci nuova password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button className="buttons" onClick={handleChangePassword}>
              Cambia password
            </button>
          </div>
          <hr />
          <div className="change-password">
            <h1 className="subtitle"> Cambia email</h1>
            <input
              type="text"
              placeholder="Inserisci nuova email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <input
              type="text"
              placeholder="Inserisci password attuale"
              value={currentPasswordForEmail}
              onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
            />
            <button className="buttons" onClick={handleChangeEmail}>
              Cambia email
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "2rem" }}>
      <h1>{isRegistering ? "Register" : "Login"}</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {isRegistering && (
          <div>
            <label>
              Name:
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={isRegistering}
                style={{ display: "block", width: "100%", marginTop: "0.5rem" }}
              />
            </label>
          </div>
        )}
        <div>
          <label>
            Email:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ display: "block", width: "100%", marginTop: "0.5rem" }}
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ display: "block", width: "100%", marginTop: "0.5rem" }}
            />
          </label>
        </div>
        <button type="submit" style={{ marginTop: "1rem" }}>
          {isRegistering ? "Register" : "Login"}
        </button>
      </form>
      <button
        onClick={() => setIsRegistering(!isRegistering)}
        style={{ marginTop: "1rem", width: "100%" }}
      >
        {isRegistering
          ? "Already have an account? Login"
          : "Need an account? Register"}
      </button>
    </div>
  );
};

export default Profile;
