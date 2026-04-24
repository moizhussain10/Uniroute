import React from 'react'
import { signInWithEmailAndPassword, auth } from '../config/firebase'
import Loginform from "../components/Loginform"
import { useNavigate } from 'react-router-dom';

function Login() {
  let navigate = useNavigate()

  const signinuser = (values) => {
    signInWithEmailAndPassword(auth, values.email, values.password)
      .then((userCredential) => {
        navigate("/dashboard")
      })
      .catch((error) => {
        console.error("Login Error:", error.message);
        alert("Invalid email or password!");
      });
  }

  return (
    <Loginform loginUser={signinuser}/>
  );
}

export default Login;