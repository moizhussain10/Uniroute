import React from 'react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './MainDashboard.css'
import AOS from 'aos'
import 'aos/dist/aos.css'


function MainDashboard() {
  const [activeTab, setActiveTab] = useState('ride');

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true
    });
  }, []);
  return (
    <div><nav className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center font-black text-black shadow-lg shadow-emerald-500/20">
            UR</div>
          <span className="text-2xl font-bold tracking-tighter"> Uniroute </span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-gray-400">
          <a href="#smarter" className="links hover:text-emerald-400 transition"> RIDE</a>
          <a href="#agile" className="links hover:text-emerald-400 transition">ABOUT</a>
          <a href="#Elevating" className="links hover:text-emerald-400 transition">SAFETY</a>
          <a href="#LOCATION" className="links hover:text-emerald-400 transition">LOCATION</a>
          <a href="#SERVICE" className="links hover:text-emerald-400 transition">SERVICE</a>
        </div>
        <div className="flex items-center gap-6">
          <Link target='_blank' to={'./login'} className=" links text-m font-bold text-gray-300 text-white">Login</Link>
          <Link target='_blank' to={'/signup'}>
          <button
            className=" signup_btn bg-emerald-500 text-black px-7 py-2.5 rounded-full font-bold text-sm btn-glow transition-all">Get
            Started</button></Link>
        </div>
      </div>
    </nav>

      <div className="max-w-7xl mx-auto px-8 pt-32 pb-20">

        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <div data-aos="fade-right">
            <span className="text-emerald-500 font-bold tracking-widest uppercase text-xs">Future of Mobility</span>
            <h1 className="text-7xl font-bold mt-4 leading-tight">Move <span className="text-gradient"
              id="smarter">Smarter</span> <br />With Rooda.</h1>
            <p className="text-gray-400 text-xl mt-6 max-w-lg leading-relaxed">Luxury and precision combined to redefine
              how you navigate the city streets every single day.</p>

            <div className="mt-8 inline-flex p-1.5 bg-white/5 rounded-2xl border border-white/10">
              <button
                className="getrides-btn tab-btn px-8 py-2.5 rounded-full bg-emerald-500 text-black font-bold text-sm">Car
                Rides</button>
              <button
                className="tab-btn px-8 py-2.5 rounded-xl text-gray-400 font-medium text-sm">Vacations</button>
            </div>
            <div className="mt-6 h-12">
              <p id="ride" className="tab-content text-gray-500 text-sm italic">Premium captains and luxury vehicles
                available 24/7 at your command.</p>
              <p id="vac" className="tab-content hidden text-gray-500 text-sm italic">Unlocking world-className
                destinations with curated travel plans just for you.</p>
            </div>
          </div>

          <div className="relative" data-aos="zoom-in">
            <div className="rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl">
              <img src="https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?auto=format&fit=crop&q=80&w=1000"
                className="w-full h-[450px] object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 glass-card p-6 rounded-3xl shadow-2xl border-emerald-500/20"
              data-aos="fade-up" data-aos-delay="300">
              <p className="text-emerald-400 font-bold text-2xl">99%</p>
              <p className="text-gray-400 text-[10px] uppercase tracking-widest">Satisfaction Score</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-20 items-center pt-20 border-t border-white/5">

          <div className="space-y-8" data-aos="fade-up">
            <h2 className="text-4xl font-bold" id="agile">The Agile <span className="text-emerald-400">Series</span></h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Shehar ki tang galiyan hon ya traffic ka rush, humara naya agile fleet aapko kabhi rukne nahi dega.
              Rooda presents the most fuel-efficient and fast pickup options for solo travelers.
              United US 125 series is specifically integrated for those who value time above everything else.
              Har ride biometric-secured hai aur humare professional riders aapki safety ka khaas khayal rakhte
              hain.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <button
                className="bg-emerald-500 text-black px-10 py-4 rounded-2xl font-bold btn-glow transition-all">Book
                Now</button>
              <button
                className="border border-emerald-500/30 text-emerald-400 px-10 py-4 rounded-2xl font-bold hover:bg-emerald-500/10 transition-all">View
                Specs</button>
            </div>
          </div>

          <div className="relative glass-card p-6 rounded-[3rem]" data-aos="fade-left">

            <div className="absolute top-8 left-10">
              <span className="text-emerald-500 font-mono text-xs tracking-tighter">MODEL: <b>2026 HONDA CG 125 golden
                color</b> </span>
            </div> <br /><br />
            <img src="https://www.atlashonda.com.pk/wp-content/themes/honda-child/assets/img/360_view/cg125_self_gold_black/cg125-self-gold-black_31.webp"
              className="w-full h-[350px] object-contain hover:scale-105 transition duration-500 drop-shadow-[0_20px_50px_rgba(16,185,129,0.2)]" />
            <div className="p-6 bg-black/40 rounded-3xl border border-white/5 mt-4">
              <p className="text-sm text-gray-400 font-medium">Quick, reliable, and built for the modern urban
                environment. Experience mobility without limits.</p>
            </div>

          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-20" data-aos="fade-up">
        <div className="relative glass-card rounded-[3rem] p-10 md:p-16 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full"></div>

          <div className="relative z-10 grid lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-[2px] w-12 bg-emerald-500"></div>
                <span className="text-emerald-500 font-bold tracking-[0.3em] text-xs uppercase">Since 2024</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Moving People, <br />
                <span className="text-gradient" id="Elevating">Elevating Experiences.</span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-2xl">
                Rooda sirf ek transport service nahi, balki ek vision hai. Humne dekha ke shehar ki bhag-dor
                mein sukoon aur waqt dono kam hote ja rahe hain. Isliye, hum lekar aaye ek aisa ecosystem jahan
                **Luxury, Safety, aur Speed** ka haseen imtezaaj milta hai.
                <br /><br />
                Chahe aap premium sedan mein meeting ke liye ja rahe hon ya hamari Agile Series par traffic ko
                chirte hue nikal rahe hon—hamara maqsad har safar ko yaadgar banana hai.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center">
                <h4 className="text-3xl font-bold text-emerald-400">50k+</h4>
                <p className="text-gray-500 text-xs mt-2 uppercase font-semibold">Active Riders</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center">
                <h4 className="text-3xl font-bold text-emerald-400">24/7</h4>
                <p className="text-gray-500 text-xs mt-2 uppercase font-semibold">Support</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center">
                <h4 className="text-3xl font-bold text-emerald-400">100%</h4>
                <p className="text-gray-500 text-xs mt-2 uppercase font-semibold">Secure</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-3xl text-center">
                <h4 className="text-3xl font-bold text-emerald-400">Zero</h4>
                <p className="text-gray-500 text-xs mt-2 uppercase font-semibold">Wait Time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-20" data-aos="fade-up">
        <div className="glass-card rounded-[3rem] overflow-hidden p-2">
          <div className="relative w-full h-[450px] rounded-[2.5rem] overflow-hidden">
            <div className="absolute inset-0 pointer-events-none border-[10px] border-white/5 rounded-[2.5rem] z-10"
              id="LOCATION"></div>

            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3619.3139!2d67.0583!3d24.8722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjTCsDUyJzIwLjAiTiA2N8KwMDMnMjkuOSJF!5e0!3m2!1sen!2s!4v1715450000000!5m2!1sen!2s"
              className="w-full h-full grayscale-[0.8] invert-[0.9] contrast-[1.2]"
              style={{ border: 0 }} // Double curly braces ke saath object
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center p-8 gap-6">
            <div>
              <h3 className="text-2xl font-bold">Find Us in <span className="text-emerald-400">your ride</span></h3>
              <p className="text-gray-400 mt-1">Main Apteck SFC center </p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-sm font-bold text-emerald-500 uppercase tracking-widest">contact know</p>
                <p className="text-gray-300">+92 300 1234567</p>
              </div>
              <div
                className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 pb-20">
        <div className="grid md:grid-cols-3 gap-8">

          <div className="glass-card p-8 rounded-[2.5rem] group hover:border-emerald-500/50 transition-all duration-500"
            data-aos="fade-up" data-aos-delay="100">
            <div
              className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-500" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Safe & Verified</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Hamari har ride biometric-secured hai. Drivers ki background checking aur real-time tracking aapko
              milti hai mukammal hifazat.
            </p>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] group hover:border-emerald-500/50 transition-all duration-500"
            data-aos="fade-up" data-aos-delay="200">
            <div
              className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-500" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Transparent Pricing</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Koi hidden charges nahi. Ride book karne se pehle hi aapko accurate kiraya maloom hoga. Sasta bhi,
              acha bhi.
            </p>
          </div>

          <div className="glass-card p-8 rounded-[2.5rem] group hover:border-emerald-500/50 transition-all duration-500"
            data-aos="fade-up" data-aos-delay="300">
            <div
              className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="" className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-3">Swift & Fast</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Hamara AI-powered algorithm aapko qareeb tareen partner se connect karta hai taake aapka waiting
              time zero ho jaye.
            </p>
          </div>

        </div>
      </div>


      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16" data-aos="fade-down">
          <span className="service-tag" id="SERVICE">Rooda App</span>
          <h2 className="text-5xl font-bold mt-4">One app, <span className="text-emerald-500">many services</span></h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          <div className="glass-card p-10 flex flex-col md:flex-row gap-8 items-center" data-aos="fade-right">
            <div className="w-full md:w-1/2">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZdANk8a-fjUPXDhI9sfRjXz9Gfmog1xS3mQ&s"
                className="rounded-3xl mix-blend-screen opacity-80" />
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <h3 className="text-3xl font-bold">City rides</h3>
              <p className="text-gray-400">Forever good rides for a fair price, tailored for your daily commute.</p>

              <div className="space-y-2 pt-4">
                <a href="#" className="arrow-link block">For Passengers <span>→</span></a>
                <a href="#" className="arrow-link block">For Drivers <span>→</span></a>
                <a href="#" className="arrow-link block">For Fleet Owners <span>→</span></a>
              </div>
            </div>
          </div>

          <div className="glass-card p-10 flex flex-col md:flex-row gap-8 items-center" data-aos="fade-left">
            <div className="w-full md:w-1/2">
              <img src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcRkH77zcFIIgzMbf7LSvztRutFw7LDG8mT2cPwo_-Mo4Yj8a8dm"
                alt="City to City" className="rounded-3xl mix-blend-screen opacity-80" />
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              <h3 className="text-3xl font-bold">City to city</h3>
              <p className="text-gray-400">Choose comfort at fair price all the way long between major cities.</p>

              <div className="space-y-2 pt-4">
                <a href="#" className="arrow-link block">For Passengers <span>→</span></a>
                <a href="#" className="arrow-link block">For Drivers <span>→</span></a>
              </div>
            </div>
          </div>

        </div>

        <div className="mt-20 glass-card p-12 max-w-3xl mx-auto border-emerald-500/20" data-aos="fade-up">
          <h4 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
            Core Benefits
          </h4>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="space-y-1">
              <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Efficiency</p>
              <p className="font-semibold text-lg">3-Min Pickup</p>
            </div>
            <div className="space-y-1 bg-white/5 p-4 rounded-2xl border border-white/5">
              <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Security</p>
              <p className="font-semibold text-lg">E2E Encryption</p>
            </div>
            <div className="space-y-1">
              <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest">Payment</p>
              <p className="font-semibold text-lg">Auto Settlement</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative mt-40 pt-20 pb-12 overflow-hidden bg-[#020202]">

        <div
          className="absolute -bottom-[400px] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] border border-emerald-500/20 rounded-full shadow-[0_0_100px_rgba(16,185,129,0.1)] z-0">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] border border-emerald-500/10 rounded-full">
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 relative z-10">

          <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-24">
            <div className="max-w-2xl" data-aos="fade-right">
              <div className="flex items-center gap-3 mb-8">
                <div
                  className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center font-black text-black">
                  ur</div>
                <span className="text-2xl font-bold tracking-widest uppercase">uniRood</span>
              </div>
              <h2
                className="text-6xl md:text-8xl font-black opacity-10 leading-none select-none absolute -top-10 left-0">
                MOVING</h2>
              <h3 className="text-4xl md:text-5xl font-bold leading-tight">
                Beyond <span className="text-emerald-500">Destination.</span><br />
                Crafting Experience.
              </h3>
            </div>

            <div className="flex gap-4" data-aos="fade-left">
              <div className="group relative">
                <div
                  className="absolute -inset-2 bg-emerald-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500">
                </div>
                <button
                  className="relative w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center font-bold text-xs hover:text-emerald-400 transition">IN</button>
              </div>
              <div className="group relative">
                <div
                  className="absolute -inset-2 bg-emerald-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition duration-500">
                </div>
                <button
                  className="relative w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center font-bold text-xs hover:text-emerald-400 transition">X</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-white/5 pt-16">
            <div className="space-y-6">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Services</span>
              <ul className="space-y-4 text-sm text-gray-500">
                <li className="hover:text-white transition-all cursor-pointer flex items-center gap-2">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> City Rides
                </li>
                <li className="hover:text-white transition-all cursor-pointer flex items-center gap-2">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> Inter-City
                </li>
                <li className="hover:text-white transition-all cursor-pointer flex items-center gap-2">
                  <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> Fleet Owners
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">Support</span>
              <ul className="space-y-4 text-sm text-gray-500">
                <li className="hover:text-white transition-all cursor-pointer">Safety Center</li>
                <li className="hover:text-white transition-all cursor-pointer">Help Desk</li>
                <li className="hover:text-white transition-all cursor-pointer">Terms</li>
              </ul>
            </div>




            <div className="space-y-6">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">conact</span>
              <ul className="space-y-4 text-sm text-gray-500">
                <li className="hover:text-white transition-all cursor-pointer"> moize 03123455567 </li>
                <li className="hover:text-white transition-all cursor-pointer"> hasnain 031234567</li>
                <li className="hover:text-white transition-all cursor-pointer"> samad 031234567</li>
              </ul>
            </div>




            <div className="space-y-6">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500">feature</span>
              <ul className="space-y-4 text-sm text-gray-500">
                <li className="hover:text-white transition-all cursor-pointer">safety 100%</li>
                <li className="hover:text-white transition-all cursor-pointer"> price 50%</li>
                <li className="hover:text-white transition-all cursor-pointer"> hafe time</li>
              </ul>

            </div>











          </div>
          <div
            className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-gray-600 tracking-widest font-mono uppercase">System Node: ROODA-01 // 2026
            </p>

            <div className="group flex items-center gap-4 cursor-default">
              <div
                className="w-8 h-[1px] bg-gray-800 group-hover:w-12 group-hover:bg-emerald-500 transition-all duration-500">
              </div>
              <span className="text-xs text-gray-500 italic">Handcrafted by <span
                className="text-white font-bold group-hover:text-emerald-500 transition">Hasnain
                Ali</span></span>
            </div>
          </div>
        </div>
      </footer>


    </div>
  )
}

export default MainDashboard