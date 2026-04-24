import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import DriverDashboard from './DriverDashboard';
import DriverProfile from './DriverProfile';
import MyRides from './MyRides';
import ActiveTrip from './ActiveTrip'; 
import { db, auth } from '../config/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

const DriverMainDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [currentRide, setCurrentRide] = useState(null);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      // Listener: Sirf 'accepted' status wali ride ko dekho
      const q = query(
        collection(db, "requests"),
        where("driverId", "==", user.uid),
        where("status", "==", "accepted")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          // Agar ride mil gayi toh state update karo
          const rideData = snapshot.docs[0].data();
          setCurrentRide({ id: snapshot.docs[0].id, ...rideData });
        } else {
          // Agar status change ho gaya (e.g. cancelled) ya ride delete ho gayi, toh null kardo
          setCurrentRide(null);
        }
      });

      return () => unsubscribe();
    }
  }, []);

  // Manual cancel handle karne ke liye (agar listener delay kare)
  const handleEndTrip = async (rideId) => {
    try {
      const requestRef = doc(db, "requests", rideId);
      await updateDoc(requestRef, {
        status: 'cancelled', // Ya 'completed' jo bhi aap chahein
        endTime: new Date()
      });
      setCurrentRide(null); // Local state foran null kar dein
    } catch (error) {
      console.error("Error ending trip:", error);
    }
  };

  return (
    <div className="app-layout" style={{ display: 'flex', backgroundColor: '#000', minHeight: '100vh' }}>
      <Sidebar role="driver" activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="dashboard-main-content" style={{ flexGrow: 1, padding: '20px' }}>
        {currentRide ? (
          /* ActiveTrip ko handleEndTrip pass karein */
          <ActiveTrip 
            rideData={currentRide} 
            role="driver" 
            onTripEnd={() => handleEndTrip(currentRide.id)} 
          />
        ) : (
          <>
            {activeTab === 'home' && <DriverDashboard />}
            {activeTab === 'myrides' && <MyRides />}
            {activeTab === 'profile' && <DriverProfile />}
          </>
        )}
      </div>
    </div>
  );
};

export default DriverMainDashboard;