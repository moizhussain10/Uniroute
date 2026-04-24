import React from 'react';
import Signupform from "../components/Signupform";
import { auth, db } from '../config/firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; // serverTimestamp better hai
import { useNavigate } from 'react-router-dom';

function Signup() {
  let navigate = useNavigate();

  const registeruser = async (values) => {
    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      console.log("Auth created: ", user.uid);

      // 2. Save Additional Info in Firestore
      // Hum 'await' yahan isliye kar rahe hain taake database mein save hone se pehle navigate na ho
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: values.name, 
        email: values.email,
        phone: values.phone,
        role: values.role,
        createdAt: serverTimestamp(), // Best practice
        isVerified: false,
        vehicleName: values.role === "driver" ? "" : null, // Driver ke liye default fields
        vehicleNumber: values.role === "driver" ? "" : null
      });

      console.log("Firestore data saved successfully!");
      alert("Registration Successful!");
      navigate("/login");
      
    } catch (error) {
      console.error("Signup Error:", error.code, error.message);
      // Agar error "permission-denied" hai toh Firebase Rules check karein
      alert(error.message);
    }
  };

  return (
    <Signupform registeruser={registeruser} />
  );
}

export default Signup;