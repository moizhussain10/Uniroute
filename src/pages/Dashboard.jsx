import React, { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import DriverMainDashboard from '../components/DriverMainDashboard'; 
import StudentMainDashboard from '../components/StudentMainDashboard'; 
// 🔥 TOASTER AND TOAST IMPORTS
import toast, { Toaster } from 'react-hot-toast';

function Dashboard() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Toast effect hamesha top par execute hona chahiye
  useEffect(() => {
    const shouldShowToast = sessionStorage.getItem("showWelcomeToast");

    if (shouldShowToast === "true") {
      toast.success("Welcome Back! 🚀", {
        style: { background: '#141414', color: '#9dff50', border: '1px solid #333' }
      });
      sessionStorage.removeItem("showWelcomeToast");
    }
  }, []);

  // 2. Fetch user role from firestore
  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role); 
        }
      }
      setLoading(false);
    };
    fetchUserRole();
  }, []);

  // 3. Pure Tailwind Dead Center Loading Fix (Bootstrap Cleaned)
  if (loading) return (
    <div className="h-screen w-full bg-[#020202] flex flex-col items-center justify-center m-0 p-0">
      <div className="flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#9dff50]/20 border-t-[#9dff50] rounded-full animate-spin mb-4"></div>
        <p className="text-[#9dff50] font-bold tracking-widest text-xs uppercase animate-pulse">
          UniRoute Loading...
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* 🔥 TOASTER REGISTERED HERE TO ALLOW NOTIFICATIONS OVER DASHBOARDS */}
      <Toaster position="top-right" reverseOrder={false} />
      
      {role === 'driver' ? (
        <DriverMainDashboard />
      ) : (
        <StudentMainDashboard />
      )}
    </>
  );
}

export default Dashboard;