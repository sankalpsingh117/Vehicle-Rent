import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import "./login.css";

const Login = ({ setRole, setIsAuthenticated }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "users" // Default to user role
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('http://localhost:3000/login', formData);
      
      if (response.data.response === "Successful") {
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', formData.role);
        localStorage.setItem('email', formData.email);
        
       
        setRole(formData.role);
        setIsAuthenticated(true);
        
      
        navigate('/home');
      } else {
        setError(response.data || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to continue to Car Rental</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Account Type</label>
            <div className="role-options">
              <label className="role-label">
                <input
                  type="radio"
                  name="role"
                  value="users"
                  checked={formData.role === "users"}
                  onChange={handleChange}
                />
                <span className="role-text">Rent a Car (User)</span>
              </label>
              
              <label className="role-label">
                <input
                  type="radio"
                  name="role"
                  value="owners"
                  checked={formData.role === "owners"}
                  onChange={handleChange}
                />
                <span className="role-text">List my Cars (Owner)</span>
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
