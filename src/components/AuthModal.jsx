import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaTimes, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import "../styles/AuthModal.css";

function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const { login, signup, error } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");

    if (!isLogin && password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      onClose();
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setLocalError("");
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>
          <FaTimes />
        </button>
        
        <h2>{isLogin ? "Login" : "Sign Up"}</h2>
        
        {(localError || error) && (
          <div className="auth-error">
            {localError || error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <FaEnvelope className="auth-input-icon" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <FaLock className="auth-input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="auth-input-group">
              <FaLock className="auth-input-icon" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button type="submit" className="auth-submit-btn">
            {isLogin ? "Login" : "Sign Up"}
          </button>
        </form>

        <p className="auth-toggle">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span onClick={toggleMode}>
            {isLogin ? "Sign Up" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
