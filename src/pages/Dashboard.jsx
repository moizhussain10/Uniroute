import React, { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import DriverMainDashboard from '../components/DriverMainDashboard'; // New Component
import StudentMainDashboard from '../components/StudentMainDashboard'; // New Component

function Dashboard() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role); // Fetching role from Firestore
        }
      }
      setLoading(false);
    };
    fetchUserRole();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#020202] d-flex justify-content-center align-items-center">
      <div className="neon-text-main animate-pulse">Loading UniRoute...</div>
    </div>
  );

  // Sirf role base par component return karega
  return (
    <>
      {role === 'driver' ? (
        <DriverMainDashboard />
      ) : (
        <StudentMainDashboard />
      )}
    </>
  );
}

export default Dashboard;