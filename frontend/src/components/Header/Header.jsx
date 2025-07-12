import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaUser, FaSignOutAlt, FaBars, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
//import './styles/layout.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { unreadCount } = useContext(NotificationContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Function to get user initials
  const getUserInitials = (user) => {
    if (!user) return '';
    const name = user.name || user.username || '';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="header-logo">
          <span className="logo-text">Verita</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="header-search">
          <div className="search-container" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch className="search-icon" style={{ position: 'absolute', left: 12, color: 'var(--text-secondary)', zIndex: 1 }} />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                border: '2px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary-color)';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </form>

        {/* Navigation */}
        <nav className={`header-nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/ask" className="nav-link">Ask Question</Link>
          {user && <Link to="/profile" className="nav-link">Profile</Link>}
          {user && <Link to="/notifications" className="nav-link">Notifications</Link>}
        </nav>

        {/* User Menu */}
        <div className="header-user">
          {/* Dark Mode Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>

          {user ? (
            <>
              {/* Notification Bell */}
              <div className="notification-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  className="notification-btn"
                  onClick={() => setShowNotifications(!showNotifications)}
                  aria-label="Show notifications"
                >
                  <FaBell className="notification-icon" />
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationDropdown />
                )}
              </div>

              {/* User Menu */}
              <div className="user-menu">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="avatar-img"
                    />
                  ) : (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: '#667eea',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 18
                    }}>{getUserInitials(user)}</span>
                  )}
                </div>
                <div className="user-dropdown">
                  <div className="user-info">
                    <span className="user-email">{user.email}</span>
                  </div>
                  <div className="user-actions">
                    <Link to="/profile" className="dropdown-item">
                      <FaUser /> Profile
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item">
                      <FaSignOutAlt /> Logout
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
