import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Signup from '../pages/Signup';
import Login from "../pages/Login";
import Dashboard from '../pages/Dashboard';
import MainDashboard from '../pages/MainDashboard';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, auth } from '../config/firebase';

function Router() {
  const [isuser, setisuser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setisuser(true);
      } else {
        setisuser(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
        <p className="text-emerald-500 font-bold tracking-widest text-xs uppercase">UniRoute Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Ab poora content area full width hoga kyunke sidebar Dashboard page ke andar move ho gaya hai */}
      <div className="min-h-screen bg-[#020202] text-white">
        <main className="w-full min-h-screen">
          <Routes>
            {/* Landing Page */}
            <Route path='/' element={<MainDashboard/>}/>

            {/* Auth Routes */}
            <Route 
              path='/signup' 
              element={isuser ? <Navigate to="/dashboard" /> : <Signup />} 
            />

            <Route 
              path='/login' 
              element={isuser ? <Navigate to="/dashboard" /> : <Login />} 
            />

            {/* Protected Dashboard Route */}
            <Route 
              path='/dashboard' 
              element={isuser ? <Dashboard /> : <Navigate to="/login" />} 
            />

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to={isuser ? "/dashboard" : "/"} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter >
  );
}

export default Router;