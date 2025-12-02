import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/Navbar.css";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8001/api"}/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data) setUsername(data.username);
        })
        .catch(() => { });
    }
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const isHome = location.pathname === "/";
  const isActive = (path) => location.pathname === path ? "active" : "";

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""} ${isHome && !scrolled ? "transparent" : "solid"}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          LinkRead
        </Link>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${mobileMenuOpen ? "open" : ""}`}></span>
        </button>

        <div className={`navbar-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <Link
            to="/"
            className={`nav-link ${isActive("/")}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>

          {token ? (
            <>
              <Link
                to="/create"
                className={`nav-link ${isActive("/create")}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Create Post
              </Link>
              <Link
                to="/profile"
                className={`nav-link ${isActive("/profile")}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {username || "Profile"}
              </Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="nav-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`nav-link ${isActive("/login")}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm nav-cta"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
