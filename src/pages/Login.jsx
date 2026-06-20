import React from 'react'
import { signInWithEmailAndPassword, auth } from '../config/firebase'
import Loginform from "../components/Loginform"
import { useNavigate } from 'react-router-dom';

// 🔥 WAPAS HOT TOAST IMPORT
import toast, { Toaster } from 'react-hot-toast';

function Login() {
  let navigate = useNavigate()

  const signinuser = (values) => {
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then((userCredential) => {
        // Successful login par flag set karein
        sessionStorage.setItem("showWelcomeToast", "true");
        navigate("/dashboard");
      })
      .catch((error) => {
        console.error("Login Error:", error.message);
        
        // Error par foran clean hot toast show karein
        toast.error("Invalid email or password!", {
          style: { background: '#141414', color: '#ff4b4b', border: '1px solid #333' }
        });
      });
  }

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Loginform loginUser={signinuser}/>
    </>
  );
}

export default Login;