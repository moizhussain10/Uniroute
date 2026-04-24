import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Signupform.css";

const Signupform = ({ registeruser }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      role: formData.get("role"),
    };

    // Data verification
    if (!data.name || !data.email || !data.phone) {
      alert("Please fill all fields");
      setLoading(false);
      return;
    }

    await registeruser(data);
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account Now</h2>
          <p>Join UniRoute and start managing your rides!</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Full Name - Pehle rakha hai sequence ke liye */}
          <div className="form-group">
            <label>Full Name</label>
            <input 
              type="text" 
              name="name" 
              placeholder="Enter your full name" 
              required 
              className="auth-input" 
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              required 
              className="auth-input" 
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Password (Min 6 chars)" 
              minLength={6} 
              required 
              className="auth-input" 
            />
          </div>

          {/* NAYA FIELD: Phone Number */}
          <div className="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              placeholder="03xx xxxxxxx" 
              pattern="[0-9]{11}" 
              title="Please enter a valid 11-digit phone number"
              required 
              className="auth-input" 
            />
          </div>

          <div className="form-group">
            <label>I want to:</label>
            <select name="role" className="auth-input" required>
              <option value="student">Passenger</option>
              <option value="driver">Driver</option>
            </select>
          </div>

          <div className="terms-container">
            <input type="checkbox" required />
            <span>
              I agree to <span className="terms-link">Terms</span> and <span className="terms-link">Privacy Policy</span>.
            </span>
          </div>

          <button type="submit" className="btn-neon" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          Already Have An Account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signupform;