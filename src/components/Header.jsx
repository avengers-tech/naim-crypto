import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CryptoState } from "../CryptoContext";
import { useAuth } from "../context/AuthContext";
import { FaMoon, FaSun, FaBriefcase, FaSignInAlt, FaSignOutAlt, FaUser } from "react-icons/fa";
import VirtualWallet from "./VirtualWallet";
import AuthModal from "./AuthModal";

function Header() {
  const { currency, setCurrency, theme, setTheme } = CryptoState();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header>
      <nav className="nav">
        <a onClick={() => navigate(`/`)} className="logo">
          Crypto Hub
        </a>
        <div className="right_side">
          <VirtualWallet compact />
          <button 
            className="portfolio_btn" 
            onClick={() => navigate('/portfolio')}
            title="View Portfolio"
          >
            <FaBriefcase />
          </button>
          <button className="theme_toggle" onClick={toggleTheme}>
            {theme === "light" ? <FaMoon /> : <FaSun />}
          </button>
          <select
            className="currency_select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value={"INR"}>INR</option>
            <option value={"USD"}>USD</option>
            <option value={"NGN"}>NGN</option>
          </select>
          
          {user ? (
            <div className="auth-buttons">
              <span className="user-email" title={user.email}>
                <FaUser /> {user.email?.split('@')[0]}
              </span>
              <button 
                className="auth_btn logout_btn" 
                onClick={handleLogout}
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          ) : (
            <button 
              className="auth_btn login_btn" 
              onClick={() => setIsAuthModalOpen(true)}
              title="Login / Sign Up"
            >
              <FaSignInAlt /> Login
            </button>
          )}
        </div>
      </nav>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
}

export default Header;
