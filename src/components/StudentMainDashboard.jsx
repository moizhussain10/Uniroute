import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StudentDashboard from './StudentDashboard';
import StudentProfile from './StudentProfile';
import ActiveTrip from './ActiveTrip'; 
import { db, auth } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const StudentMainDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentRide, setCurrentRide] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Logic: 'requests' collection mein status 'accepted' ya 'started' check karo
      const q = query(
        collection(db, "requests"),
        where("passengerId", "==", user.uid),
        where("status", "in", ["accepted", "started"])
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          // Agar driver ne accept kar li hai ya trip start ho gayi hai
          const rideData = snapshot.docs[0].data();
          setCurrentRide({ id: snapshot.docs[0].id, ...rideData });
        } else {
          // Agar ride cancel ho gayi ya khatam ho gayi (status changed/doc deleted)
          setCurrentRide(null);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  // Manual cancel function for Student
  const handleEndTrip = async (rideId) => {
    try {
      const requestRef = doc(db, "requests", rideId);
      await updateDoc(requestRef, {
        status: 'cancelled',
        cancelledBy: 'student',
        endTime: new Date()
      });
      // onSnapshot khud hi currentRide ko null kar dega, 
      // lekin foran UI update ke liye hum yahan bhi kar sakte hain
      setCurrentRide(null);
    } catch (error) {
      console.error("Error cancelling trip:", error);
    }
  };

  return (
    <div className="app-layout" style={{ display: 'flex', backgroundColor: '#000', minHeight: '100vh' }}>
      <Sidebar role="student" activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="dashboard-main-content" style={{ flexGrow: 1, padding: '20px' }}>
        {/* Priority Logic: Active ride hai toh ActiveTrip component dikhao */}
        {currentRide ? (
          <ActiveTrip 
            rideData={currentRide} 
            role="student" 
            onTripEnd={() => handleEndTrip(currentRide.id)} 
          />
        ) : (
          <>
            {activeTab === 'home' && <StudentDashboard />}
            {activeTab === 'profile' && <StudentProfile />}
            {/* Agar koi aur tabs hain toh wo bhi yahan add kar dein */}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentMainDashboard;