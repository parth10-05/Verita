import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaHeart } from 'react-icons/fa';
// import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">Verita</h3>
            <p className="footer-description">
              A minimal Q&A platform for collaborative learning and knowledge sharing.
            </p>
            <div className="footer-social">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaGithub />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaTwitter />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaLinkedin />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/ask">Ask Question</Link></li>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#help">Help Center</a></li>
              <li><a href="#guidelines">Community Guidelines</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">About</h4>
            <ul className="footer-links">
              <li><a href="#about">About Verita</a></li>
              <li><a href="#team">Our Team</a></li>
              <li><a href="#contact">Contact Us</a></li>
              <li><a href="#careers">Careers</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>
              © {currentYear} Verita. Made with <FaHeart className="heart-icon" /> for the developer community.
            </p>
          </div>
          <div className="footer-version">
            <span>Version 1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
