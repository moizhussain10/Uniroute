import React from 'react';
import Signupform from "../components/Signupform";
import { auth, db } from '../config/firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore"; // Yeh dono imports zaroori hain
import { useNavigate } from 'react-router-dom';

function Signup() {
  let navigate = useNavigate();

  const registeruser = async (values) => {
    try {
      // 1. Pehle Auth mein user create karo
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // 2. Phir Firestore mein "users" collection mein data save karo
      // Hum 'doc' use karenge aur ID wahi rakhenge jo Auth ki 'uid' hai
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: values.email,
        role: values.role, // 'student' ya 'driver'
        createdAt: new Date(),
        isVerified: false // Future use ke liye (ID Card verification)
      });

      console.log("User registered & Role saved in Firestore!");
      navigate("/login");
      
    } catch (error) {
      console.error("Error signing up:", error.message);
      alert(error.message);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <Signupform registeruser={registeruser} />
    </div>
  );
}

export default Signup;