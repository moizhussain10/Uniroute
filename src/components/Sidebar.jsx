import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaCar, FaSearch, FaUserAlt, FaBars, FaTimes } from 'react-icons/fa';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import './Sidebar.css';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error("Logout error: ", error);
    }
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <>
      {/* Mobile Hamburger Toggle */}
      <div className="hamburger-btn d-md-none" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Dark Overlay for Mobile */}
      {isOpen && <div className="sidebar-overlay d-md-none" onClick={() => setIsOpen(false)}></div>}

      <div className={`sidebar-container ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <h3 className="fw-bold m-0">Uni<span style={{color: '#007bff'}}>Route</span></h3>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`} onClick={() => setIsOpen(false)}>
            <FaHome className="nav-icon" /> <span>Dashboard</span>
          </Link>
          
          {role === 'driver' ? (
            <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`} onClick={() => setIsOpen(false)}>
              <FaCar className="nav-icon" /> <span>Offer Ride</span>
            </Link>
          ) : (
            <Link to="/find-ride" className={`nav-item ${isActive('/find-ride')}`} onClick={() => setIsOpen(false)}>
              <FaSearch className="nav-icon" /> <span>Find Ride</span>
            </Link>
          )}

          <Link to="/profile" className={`nav-item ${isActive('/profile')}`} onClick={() => setIsOpen(false)}>
            <FaUserAlt className="nav-icon" /> <span>Profile</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn w-100" onClick={handleLogout}>
            <FaSignOutAlt className="nav-icon" /> Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;