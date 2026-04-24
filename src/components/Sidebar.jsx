import React, { useState } from 'react';
import { FaHome, FaSignOutAlt, FaCar, FaSearch, FaUserAlt, FaBars, FaTimes, FaClipboardList } from 'react-icons/fa';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ role, activeTab, setActiveTab }) => {
  const navigate = useNavigate();
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

  return (
    <>
      <div className="hamburger-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>

      {isOpen && <div className="sidebar-overlay d-md-none" onClick={() => setIsOpen(false)}></div>}

      <div className={`sidebar-container ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <h3 className="fw-bold m-0">Uni<span style={{ color: '#9dff50' }}>Route</span></h3>
        </div>

        <nav className="sidebar-nav">
          {/* Dashboard Tab */}
          <div 
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('home'); setIsOpen(false); }}
            style={{ cursor: 'pointer' }}
          >
            <FaHome className="nav-icon" /> <span>Dashboard</span>
          </div>

          {/* Role Specific Tabs */}
          {role === 'driver' ? (
            <>
              {/* NAYA TAB: My Rides */}
              <div 
                className={`nav-item ${activeTab === 'myrides' ? 'active' : ''}`} 
                onClick={() => { setActiveTab('myrides'); setIsOpen(false); }}
                style={{ cursor: 'pointer' }}
              >
                <FaClipboardList className="nav-icon" /> <span>My Rides</span>
              </div>
            </>
          ) : (
            <div 
              className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} 
              onClick={() => { setActiveTab('home'); setIsOpen(false); }}
              style={{ cursor: 'pointer' }}
            >
              <FaSearch className="nav-icon" /> <span>Find Ride</span>
            </div>
          )}

          {/* Profile Tab */}
          <div 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} 
            onClick={() => { setActiveTab('profile'); setIsOpen(false); }}
            style={{ cursor: 'pointer' }}
          >
            <FaUserAlt className="nav-icon" /> <span>Profile</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn-neon" onClick={handleLogout}>
            <FaSignOutAlt className="nav-icon" /> <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 