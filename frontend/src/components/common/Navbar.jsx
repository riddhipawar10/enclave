import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

/**
 * Navbar
 *
 * Reusable top navigation bar for the Enclave frontend.
 *
 * IMPORTANT:
 * - Only handles Authentication & Users links (Dashboard, Profile,
 *   Login, Register, Logout).
 * - Does NOT implement Organization Management or RBAC links yet.
 *   Those can be added later (e.g. inside the
 *   `navbar__links--authenticated` section) by Madhura and Riddhi
 *   without needing to restructure this component.
 */
function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  // Controls the mobile menu open/closed state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      closeMenu();
      navigate("/login");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar__container">
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          Enclave
        </Link>

        <button
          type="button"
          className="navbar__toggle"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
          <span className="navbar__toggle-bar" />
        </button>

        <div
          className={`navbar__links ${
            isMenuOpen ? "navbar__links--open" : ""
          }`}
        >
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="navbar__link"
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="navbar__link"
                onClick={closeMenu}
              >
                Profile
              </Link>

              {/* Team extension point:
                  Organization and RBAC links can be added here
                  once those modules are ready. */}

              {user?.name && (
                <span className="navbar__user">Hi, {user.name}</span>
              )}

              <button
                type="button"
                className="navbar__logout"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__link" onClick={closeMenu}>
                Login
              </Link>
              <Link
                to="/register"
                className="navbar__link"
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;