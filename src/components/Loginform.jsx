import React from "react";
import { Link } from "react-router-dom";

const Loginform = ({ loginUser }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    
    loginUser({ email, password });
  };

  return (
    <div 
      className="min-h-screen w-full flex justify-center items-center p-5 bg-cover bg-center bg-no-repeat bg-fixed font-sans selection:bg-[#9dff50] selection:text-black"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url('https://static.vecteezy.com/system/resources/thumbnails/053/733/164/small/perfect-close-up-of-a-modern-car-showcasing-its-intricate-design-photo.jpg')`
      }}
    >
      {/* CARD RESPONSIVENESS: 
        - Desktop par: width 100%, max-width 400px, premium glassmorphism glass effect aur borders.
        - Mobile (xs/max-width: 480px) par: background transparent, no blur, no borders, aur clean mobile spacing jaisa aapki media query mein tha.
      */}
      <div className="w-full max-w-[400px] bg-white/[0.03] backdrop-blur-[15px] p-[40px_30px] !rounded-2xl border border-gray shadow-[0_20px_40px_rgba(0,0,0,0.4)] text-left xs:bg-transparent xs:border-none xs:backdrop-blur-none xs:p-[30px_20px]">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <h2 className="text-white text-3xl font-bold mb-2.5 tracking-tight xs:text-2xl">
            Welcome Back
          </h2>
          <p className="text-[#888888] text-sm">
            Login to your UniRoute account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="mb-[25px] relative flex flex-col">
            <label className="block text-white text-sm font-medium mb-2.5 ml-1.5">
              Email Address
            </label>
            <input 
              type="email" 
              name="email" 
              placeholder="name@aptech.edu.pk" 
              required 
              className="w-full bg-[#111111] border border-[#2a2a2a] !rounded-2xl px-5 py-4 text-white text-base md:text-sm outline-none focus:border-[#9dff50] focus:shadow-[0_0_10px_rgba(157, 255, 80, 0.2)] transition-all duration-300" 
            />
          </div>

          {/* Password Field */}
          <div className="mb-[25px] relative flex flex-col">
            <label className="block text-white text-sm font-medium mb-2.5 ml-1.5">
              Password
            </label>
            <input 
              type="password" 
              name="password" 
              placeholder="••••••••" 
              required 
              className="w-full bg-[#111111] border border-[#2a2a2a] !rounded-2xl px-5 py-4 text-white text-base md:text-sm outline-none focus:border-[#9dff50] focus:shadow-[0_0_10px_rgba(157, 255, 80, 0.2)] transition-all duration-300" 
            />
            {/* Forgot Password Link */}
            <div className="text-right mt-2.5 mr-1">
              <Link 
                to="/forgot-password" 
                className="text-white font-bold !no-underline ml-1.5 !hover:underline"
              >
                Forgot?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full bg-[#9dff50] text-black border-none !rounded-[50px] p-4 text-base font-extrabold cursor-pointer mt-[15px] uppercase tracking-[1px] transition-all duration-300 hover:bg-[#8be646] hover:-translate-y-0.5 active:translate-y-0"
          >
            LOGIN NOW
          </button>
        </form>

        {/* Footer Section */}
        <div className="text-center mt-[35px] text-[#666666] text-sm">
          New to UniRoute?{" "}
          <Link to="/signup" className="text-white font-bold !no-underline ml-1.5 !hover:underline">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Loginform;