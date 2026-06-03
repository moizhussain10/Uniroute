import React, { useState } from 'react';
import { FaHome, FaSignOutAlt, FaSearch, FaUserAlt, FaBars, FaTimes, FaClipboardList } from 'react-icons/fa';
import { auth } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

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

  // CHECK: Agar dono mein se koi bhi tab active ho toh isko true manein
  const isDashboardOrFindRideActive = activeTab === 'home' || activeTab === 'findride';

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button 
        className="fixed top-5 left-5 z-[2100] bg-[#9dff50] text-black w-11 h-11 rounded-[12px] flex items-center justify-center text-xl cursor-pointer shadow-[0_0_15px_rgba(157,255,80,0.4)] lg:hidden transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Background Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-[4px] z-[1999] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`fixed left-0 top-0 z-[2000] w-[260px] h-screen bg-[#0f0f0f]/85 backdrop-blur-[20px] border-r border-[#9dff50]/20 flex flex-col p-[30px_20px] transition-transform duration-400 ease-[cubic-bezier(0.77,0,0.175,1)] lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-[50px] pl-2.5">
          <div className="w-2.5 h-2.5 bg-[#9dff50] rounded-full shadow-[0_0_15px_#9dff50]"></div>
          <h3 className="text-xl font-black text-white m-0 tracking-wide uppercase">
            Uni<span className="text-[#9dff50]">Route</span>
          </h3>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-3 flex-1">
          
          {/* Dashboard Tab */}
          <div 
            className={`flex items-center gap-4 px-5 py-3.5 rounded-[14px] text-sm font-bold tracking-wide uppercase transition-all duration-300 cursor-pointer border group ${
              isDashboardOrFindRideActive 
                ? 'bg-[#9dff50]/10 text-[#9dff50] !border-gray-700 shadow-[0_0_20px_rgba(157,255,80,0.1)]' 
                : 'text-white/60 !border-gray-700 hover:bg-[#9dff50]/5 hover:text-[#9dff50] hover:pl-6'
            }`} 
            onClick={() => { setActiveTab('home'); setIsOpen(false); }}
          >
            <FaHome className="text-lg shrink-0" /> <span>Dashboard</span>
          </div>

          {/* Role Specific Tabs */}
          {role === 'driver' ? (
            <div 
              className={`flex items-center gap-4 px-5 py-3.5 rounded-[14px] text-sm font-bold tracking-wide uppercase transition-all duration-300 cursor-pointer border group ${
                activeTab === 'myrides' 
                  ? 'bg-[#9dff50]/10 text-[#9dff50] !border-gray-700 shadow-[0_0_20px_rgba(157,255,80,0.1)]' 
                  : 'text-white/60 !border-gray-700 hover:bg-[#9dff50]/5 hover:text-[#9dff50] hover:pl-6'
              }`} 
              onClick={() => { setActiveTab('myrides'); setIsOpen(false); }}
            >
              <FaClipboardList className="text-lg shrink-0" /> <span>My Rides</span>
            </div>
          ) : (
            /* Find Ride Tab (Passenger) */
            <div 
              className={`flex items-center gap-4 px-5 py-3.5 rounded-[14px] text-sm font-bold tracking-wide uppercase transition-all duration-300 cursor-pointer border group ${
                isDashboardOrFindRideActive 
                  ? 'bg-[#9dff50]/10 text-[#9dff50] !border-gray-700 shadow-[0_0_20px_rgba(157,255,80,0.1)]' 
                  : 'text-white/60 !border-gray-700 hover:bg-[#9dff50]/5 hover:text-[#9dff50] hover:pl-6'
              }`} 
              onClick={() => { setActiveTab('home'); setIsOpen(false); }}
            >
              <FaSearch className="text-lg shrink-0" /> <span>Find Ride</span>
            </div>
          )}

          {/* Profile Tab */}
          <div 
            className={`flex items-center gap-4 px-5 py-3.5 rounded-[14px] text-sm font-bold tracking-wide uppercase transition-all duration-300 cursor-pointer border group ${
              activeTab === 'profile' 
                ? 'bg-[#9dff50]/10 text-[#9dff50] !border-gray-700 shadow-[0_0_20px_rgba(157,255,80,0.1)]' 
                : 'text-white/60 !border-gray-700 hover:bg-[#9dff50]/5 hover:text-[#9dff50] hover:pl-6'
            }`} 
            onClick={() => { setActiveTab('profile'); setIsOpen(false); }}
          >
            <FaUserAlt className="text-lg shrink-0" /> <span>Profile</span>
          </div>

        </nav>

        {/* Footer & Logout Section */}
        <div className="pt-5 border-t border-white/[0.05]">
          <button 
            className="bg-red-500/10 border border-red-500/20 text-[#ff4b4b] p-3 !rounded-2xl w-full flex items-center justify-center gap-2.5 cursor-pointer font-black text-xs tracking-wider uppercase transition-all duration-300 hover:bg-[#ff4b4b] hover:text-white hover:shadow-[0_0_15px_rgba(255,75,75,0.4)]"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="text-base" /> <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;