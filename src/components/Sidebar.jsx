import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaCar, FaSearch, FaUserAlt } from 'react-icons/fa';
import { auth } from '../config/firebase'; // Firebase auth import karein
import { signOut } from 'firebase/auth';
import './Sidebar.css';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();

  // Asli logout function yahan hai
  const handleLogout = async () => {
    try {
      await signOut(auth); // Firebase se sign out
      localStorage.clear(); // Safai zaroori hai
      navigate('/login'); // Login page pe wapis
    } catch (error) {
      console.error("Logout error: ", error);
    }
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-logo">
        <h3 className="fw-bold">Uni<span style={{color: '#007bff'}}>Route</span></h3>
      </div>
      
      <nav className="sidebar-nav">
        <Link to="/dashboard" className="nav-item">
          <FaHome className="nav-icon" /> <span>Dashboard</span>
        </Link>
        
        {role === 'driver' ? (
          <Link to="/dashboard" className="nav-item">
            <FaCar className="nav-icon" /> <span>Offer Ride</span>
          </Link>
        ) : (
          <Link to="/find-ride" className="nav-item">
            <FaSearch className="nav-icon" /> <span>Find Ride</span>
          </Link>
        )}

        <Link to="/profile" className="nav-item">
          <FaUserAlt className="nav-icon" /> <span>My Profile</span>
        </Link>
      </nav>

      <div className="sidebar-footer">
        {/* Ab ye button upar wale handleLogout ko trigger karega */}
        <button className="logout-btn w-100" onClick={handleLogout}>
          <FaSignOutAlt className="nav-icon" /> Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;