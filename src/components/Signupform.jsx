import React, { useState } from "react";
import { Link } from "react-router-dom";

const Signupform = ({ registeruser }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.target);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      role: formData.get("role"),
    };

    if (!data.name || !data.email || !data.phone) {
      alert("Please fill all fields");
      setLoading(false);
      return;
    }

    await registeruser(data);
    setLoading(false);
  };

  return (
    <div 
      className="min-h-screen w-full flex justify-center items-center p-4 md:p-8 bg-cover bg-center bg-no-repeat font-sans selection:bg-[#9dff50] selection:text-black"
      style={{
        backgroundImage: `linear-gradient(rgba(30, 24, 24, 0.9), rgba(0, 0, 0, 0.9)), url('https://static.vecteezy.com/system/resources/thumbnails/053/733/164/small/perfect-close-up-of-a-modern-car-showcasing-its-intricate-design-photo.jpg')`
      }}
    >
      {/* RESPONSIVE FIX: Removed inline style width, added Tailwind responsive width control */}
      <div className="w-full sm:w-[450px] md:w-[400px] text-left px-2 sm:px-0 sm:bg-transparent sm:backdrop-blur-none">
        
        {/* Header Section */}
        <div className="text-center mb-8 md:mb-10">
          <h2 className="text-white text-2xl md:text-[28px] font-bold mb-2 tracking-tight">
            Create Account Now
          </h2>
          <p className="text-[#666666] text-xs md:text-sm">
            Join UniRoute and start managing your rides!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
          {/* Full Name */}
          <div className="flex flex-col">
            <label className="block text-white text-xs md:text-sm font-medium mb-2 ml-1">
              Full Name
            </label>
            <input 
              type="text" 
              name="name" 
              placeholder="Enter your full name" 
              required 
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3.5 md:px-5 md:py-4 text-white text-sm outline-none focus:border-[#9dff50] transition-colors duration-300" 
            />
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="block text-white text-xs md:text-sm font-medium mb-2 ml-1">
              Email
            </label>
            <input 
              type="email" 
              name="email" 
              placeholder="Email Address" 
              required 
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3.5 md:px-5 md:py-4 text-white text-sm outline-none focus:border-[#9dff50] transition-colors duration-300" 
            />
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label className="block text-white text-xs md:text-sm font-medium mb-2 ml-1">
              Password
            </label>
            <input 
              type="password" 
              name="password" 
              placeholder="Password (Min 6 chars)" 
              minLength={6} 
              required 
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3.5 md:px-5 md:py-4 text-white text-sm outline-none focus:border-[#9dff50] transition-colors duration-300" 
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col">
            <label className="block text-white text-xs md:text-sm font-medium mb-2 ml-1">
              Phone Number
            </label>
            <input 
              type="tel" 
              name="phone" 
              placeholder="03xx xxxxxxx" 
              pattern="[0-9]{11}" 
              title="Please enter a valid 11-digit phone number"
              required 
              className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3.5 md:px-5 md:py-4 text-white text-sm outline-none focus:border-[#9dff50] transition-colors duration-300" 
            />
          </div>

          {/* Role Dropdown */}
          <div className="flex flex-col">
            <label className="block text-white text-xs md:text-sm font-medium mb-2 ml-1">
              I want to:
            </label>
            <div className="relative">
              <select 
                name="role" 
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3.5 md:px-5 md:py-4 text-white text-sm outline-none focus:border-[#9dff50] transition-colors duration-300 appearance-none cursor-pointer"
                required
              >
                <option value="student">Passenger</option>
                <option value="driver">Driver</option>
              </select>
              {/* Dropdown custom arrow tag to keep layout uniform across browsers */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start gap-2.5 my-4 text-[13px] text-[#666666] leading-tight">
            <input 
              type="checkbox" 
              required 
              className="accent-[#e5ff00] mt-0.5 h-4 w-4 cursor-pointer"
            />
            <span>
              I agree to <span className="text-[#e5ff00] font-bold cursor-pointer hover:underline">Terms</span> and <span className="text-[#e5ff00] font-bold cursor-pointer hover:underline">Privacy Policy</span>.
            </span>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#9dff50] text-black border-none !rounded-2xl py-3.5 md:py-4 text-base md:text-sm font-extrabold cursor-pointer mt-2 active:scale-[0.98] transition-all duration-200 shadow-md hover:bg-[#b2ff70] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center mt-6 md:mt-7 text-[#666666] text-xs md:text-sm">
          Already Have An Account? <Link to="/login" className="text-white font-bold !no-underline ml-1.5 !hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signupform;