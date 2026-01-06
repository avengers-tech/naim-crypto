import { useNavigate } from "react-router-dom";
import { CryptoState } from "../CryptoContext";
import { FaGithub, FaMoon, FaSun } from "react-icons/fa";

function Header() {
  const { currency, setCurrency, theme, setTheme } = CryptoState();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <header>
      <nav className="nav">
        <a onClick={() => navigate(`/`)} className="logo">
          Crypto Hub
        </a>
        <div className="right_side">
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
        </div>
      </nav>
    </header>
  );
}

export default Header;
