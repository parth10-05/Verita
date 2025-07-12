import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEye, FaEyeSlash, FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) { setError('Name is required'); return false; }
    if (!formData.email.trim()) { setError('Email is required'); return false; }
    if (!formData.email.includes('@')) { setError('Please enter a valid email address'); return false; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters long'); return false; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!validateForm()) { setLoading(false); return; }
    try {
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => { navigate('/'); }, 1000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <motion.div className="auth-container" initial={{ opacity: 0, y: 50, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6 }}>
      <motion.div className="auth-card">
        <motion.div className="auth-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <motion.h1 initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>Join Verita</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }}>Create your account to start asking and answering questions</motion.p>
        </motion.div>
        <motion.form className="auth-form" onSubmit={handleSubmit} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <AnimatePresence>
            {error && <motion.div className="error-message" initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.9 }} transition={{ duration: 0.3 }}>{error}</motion.div>}
            {success && <motion.div className="success-message" initial={{ opacity: 0, y: -10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.9 }} transition={{ duration: 0.3 }}>{success}</motion.div>}
          </AnimatePresence>
          <motion.div className="form-group">
            <label htmlFor="name" className="form-label"><FaUser /> Full Name</label>
            <motion.input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="Enter your full name" required whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)" }} transition={{ duration: 0.2 }} />
          </motion.div>
          <motion.div className="form-group">
            <label htmlFor="email" className="form-label"><FaEnvelope /> Email Address</label>
            <motion.input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="Enter your email" required whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)" }} transition={{ duration: 0.2 }} />
          </motion.div>
          <motion.div className="form-group">
            <label htmlFor="password" className="form-label"><FaLock /> Password</label>
            <motion.div className="password-input-container" whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)" }} transition={{ duration: 0.2 }}>
              <input type={showPassword ? 'text' : 'password'} id="password" name="password" value={formData.password} onChange={handleChange} className="form-input password-input" placeholder="Create a password (min 6 characters)" required />
              <motion.button type="button" className="password-toggle" onClick={togglePasswordVisibility} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.2 }}>{showPassword ? <FaEyeSlash /> : <FaEye />}</motion.button>
            </motion.div>
          </motion.div>
          <motion.div className="form-group">
            <label htmlFor="confirmPassword" className="form-label"><FaLock /> Confirm Password</label>
            <motion.div className="password-input-container" whileFocus={{ scale: 1.02, boxShadow: "0 0 0 3px rgba(102, 126, 234, 0.1)" }} transition={{ duration: 0.2 }}>
              <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-input password-input" placeholder="Confirm your password" required />
              <motion.button type="button" className="password-toggle" onClick={toggleConfirmPasswordVisibility} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.2 }}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</motion.button>
            </motion.div>
          </motion.div>
          <motion.button type="submit" className="btn btn-primary btn-full" disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <AnimatePresence mode="wait">{loading ? (<motion.div key="loading" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }} className="loading-spinner" />) : (<motion.span key="text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>Create Account</motion.span>)}</AnimatePresence>
          </motion.button>
        </motion.form>
        <motion.div className="auth-footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.5 }}>
          <p>Already have an account? <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}><Link to="/login" className="auth-link">Sign in here</Link></motion.span></p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Register;
