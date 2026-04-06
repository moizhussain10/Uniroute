import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'
import Signup from '../pages/Signup'
import Login from "../pages/Login"
import Dashboard from '../pages/Dashboard'
import Sidebar from '../components/Sidebar'
import { useEffect, useState } from 'react'
import { onAuthStateChanged, auth, db } from '../config/firebase'
import { doc, getDoc } from 'firebase/firestore'
import DriverProfile from '../components/DriverProfile'
// 1. StudentProfile ko yahan import karein
import StudentProfile from '../components/StudentProfile' 

function Router() {
  const [isuser, setisuser] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setisuser(true);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserRole(docSnap.data().role);
        }
      } else {
        setisuser(false);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-vh-100 d-flex justify-content-center align-items-center">Loading UniRoute...</div>;

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

        {/* Sidebar Section */}
        {isuser && (
          <div style={{ width: '280px' }}>
            <Sidebar role={userRole} />
          </div>
        )}

        {/* Main Content Area */}
        <div style={{
          flex: 1,
          backgroundColor: '#f8f9fa',
          minHeight: '100vh',
          padding: '20px'
        }}>
          <Routes>
            <Route path='/' element={isuser ? <Navigate to="/dashboard" /> : <Signup />} />
            <Route path='/login' element={isuser ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path='/dashboard' element={isuser ? <Dashboard /> : <Navigate to="/login" />} />
            
            {/* 2. Yahan logic lagayein: Agar role 'driver' hai toh DriverProfile, warna StudentProfile */}
            <Route 
              path='/profile' 
              element={
                isuser ? (
                  userRole === 'driver' ? <DriverProfile /> : <StudentProfile />
                ) : (
                  <Navigate to="/login" />
                )
              } 
            />
          </Routes>
        </div>

      </div>
    </BrowserRouter>
  );
}

export default Router;