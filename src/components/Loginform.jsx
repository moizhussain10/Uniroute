import React from "react";
import { Link } from "react-router-dom";
import "./Loginform.css"; // Nayi CSS file import karein

const Loginform = ({ loginUser }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    // Original Logic unchanged
    loginUser({ email, password });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        
        {/* Header Section */}
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Login to your UniRoute account</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="login-group">
            <label>Email Address</label>
            <input 
              type="email" 
              name="email" 
              placeholder="name@aptech.edu.pk" 
              required 
              className="login-input" 
            />
          </div>

          {/* Password Field */}
          <div className="login-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••" 
              required 
              className="login-input" 
            />
            <div className="login-forgot">
              <Link to="/forgot-password">Forgot?</Link>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="login-btn">
            LOGIN NOW
          </button>
        </form>

        {/* Footer Section */}
        <div className="login-footer">
          New to UniRoute?{" "}
          <Link to="/signup">Create Account</Link>
        </div>
      </div>
    </div>
  );
};

export default Loginform;