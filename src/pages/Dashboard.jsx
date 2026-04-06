import React, { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import DriverDashboard from '../components/DriverDashboard';
import StudentDashboard from '../components/StudentDashboard';

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
          setRole(docSnap.data().role);
        }
      }
      setLoading(false);
    };
    fetchUserRole();
  }, []);

  if (loading) return <div className="text-center mt-5 neon-text-blue">Loading UniRoute...</div>;

  return (
    <div className="bg-gradient-dark min-vh-100 p-4">
      {role === 'driver' ? <DriverDashboard /> : <StudentDashboard />}
    </div>
  );
}

export default Dashboard;