import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./EmailVerification.css";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<
    "pending" | "success" | "error"
  >("pending");
  const [errorMessage, setErrorMessage] = useState("");
  const [isResending, setIsResending] = useState(false);
  const { user, confirmEmailVerification, resendEmailVerification } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const userId = searchParams.get("userId");
    const secret = searchParams.get("secret");

    if (userId && secret) {
      handleVerification(userId, secret);
    }
  }, [searchParams]);

  const handleVerification = async (userId: string, secret: string) => {
    try {
      setVerificationStatus("pending");
      await confirmEmailVerification(userId, secret);
      setVerificationStatus("success");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (error: any) {
      console.error("Verifica fallita:", error);
      setVerificationStatus("error");
      setErrorMessage(error.message || "Verifica email fallita");
    }
  };

  const handleResendVerification = async () => {
    if (!user) {
      setErrorMessage("Devi essere loggato per reinviare l'email di conferma");
      return;
    }
    setIsResending(true);
    try {
      await resendEmailVerification();
      alert(
        "Email di verifica inviata. Perfavore, controlla la tua casella di posta o lo spam."
      );
    } catch (error: any) {
      console.error("Reinvio fallito:", error);
      setErrorMessage(
        error.message || "Reinvio dell'email di verifica fallito"
      );
    } finally {
      setIsResending(false);
    }
  };

  const renderVerificationStatus = () => {
    switch (verificationStatus) {
      case "pending":
        return (
          <div className="verification-status pending">
            <div className="spinner"></div>
            <h1 className="subtitle">Verifica dell'email...</h1>
            <p>Attendi mentre la tua email viene verificata.</p>
          </div>
        );

      case "success":
        return (
          <div className="verification-status success">
            <h1 className="subtitle">Email verificata con successo!</h1>
            <p>
              La tua email è stata verificata. Stai per essere reindirizzato
              alla Home.
            </p>
            <button onClick={() => navigate("/")} className="listened-button">
              Vai alla Home
            </button>
          </div>
        );

      case "error":
        return (
          <div className="verification-status error">
            <h1 className="subtitle">Verifica fallita</h1>
            <p className="error-message">{errorMessage}</p>
            {user && (
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="listened-button"
              >
                {isResending ? "Invio..." : "Reinvia email di verifica"}
              </button>
            )}
            <button
              onClick={() => navigate("/")}
              className="listened-button"
            >
              Torna alla home
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (
    user &&
    !user.emailVerification &&
    verificationStatus === "pending" &&
    !searchParams.get("userId")
  ) {
    return (
      <div className="verification-page page-container">
        <div className="verification-container">
          <div className="verification-prompt">
            <h1 className="subtitle">Verifica la tua email</h1>
            <p>
              Un'email di verifica è stata inviata a{" "}
              <strong>{user.email}</strong>. Controlla la tua casella di posta e
              apri il link.
            </p>
            <div className="verification-actions">
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="listened-button"
              >
                {isResending ? "Invio..." : "Reinvia email di verifica"}
              </button>
            </div>
            <hr />
            <div className="verification-tips">
              <h1 className="subtitle">Non trovi l'email?</h1>
              <ul>
                <li>Controlla lo spam</li>
                <li>Assicurati che l'email inserita sia corretta</li>
                <li>
                  Attendi qualche minuto: l'email potrebbe impiegare del tempo
                  ad arrivare
                </li>
                <li>Prova a reinviare l'email di verifica</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container verification-page">
      <div className="verification-container">{renderVerificationStatus()}</div>
    </div>
  );
};

export default EmailVerification;
