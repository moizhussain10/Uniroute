import React, { useEffect, useState } from 'react';
import { FaSearch, FaUserCircle, FaMapMarkerAlt, FaHistory, FaStar, FaRoute } from 'react-icons/fa';
import { db, auth } from '../config/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp, doc, getDoc, deleteDoc } from 'firebase/firestore';
// --- Map Imports ---
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

// Leaflet Icon Fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const RoutingMachine = ({ pickupCoords, destCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !pickupCoords || !destCoords) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(pickupCoords[0], pickupCoords[1]),
        L.latLng(destCoords[0], destCoords[1])
      ],
      lineOptions: {
        styles: [{ color: '#9dff50', weight: 5 }] // Neon Green Route
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      createMarker: () => null,
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, pickupCoords, destCoords]);

  return null;
};

const StudentDashboard = () => {
  const [rides, setRides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeRequestId, setActiveRequestId] = useState(null);

  // 🔥 Active booking wali ride ki ID track karenge
  const [activeBookedRideId, setActiveBookedRideId] = useState(null);

  const [timer, setTimer] = useState(0);
  const [requestingId, setRequestingId] = useState(null);
  const [userName, setUserName] = useState("Student");
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [userPhone, setUserPhone] = useState("");
  const [userPickupCoords, setUserPickupCoords] = useState([24.8607, 67.0011]);
  const [currentModalFare, setCurrentModalFare] = useState(0);
  
  // 🔥 New State: Student ka exact physical address text save karne ke liye
  const [studentAddressText, setStudentAddressText] = useState("");

  // --- Map Click Handler Logic ---
  const MapClickHandler = () => {
    useMapEvents({
      async click(e) {
        const coords = [e.latlng.lat, e.latlng.lng];
        setUserPickupCoords(coords);
        if (selectedRide) {
          const newFare = calculateFare(coords, selectedRide.destCoords);
          setCurrentModalFare(newFare);
        }

        // 🔥 Reverse Geocoding: Latitude/Longitude se Address Text nikalna
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
          const data = await response.json();
          if (data && data.display_name) {
            const addr = data.address;
            // Short readable text format banana (Road/Suburb, City)
            const shortAddress = `${addr.road || addr.suburb || addr.neighbourhood || 'Selected Location'}, ${addr.city || addr.town || 'Karachi'}`;
            setStudentAddressText(shortAddress.replace(/^,\s*/, '')); 
          }
        } catch (err) {
          console.error("Address fetch error:", err);
          setStudentAddressText("Custom Location Set on Map");
        }
      },
    });
    return userPickupCoords ? <Marker position={userPickupCoords} /> : null;
  };

  const handleOpenMap = (ride) => {
    setSelectedRide(ride);
    const initialFare = calculateFare(userPickupCoords, ride.destCoords);
    setCurrentModalFare(initialFare);
    // Jab modal khule toh reset default ya initial text set karein
    setStudentAddressText(ride.pickup || "Custom Location on Map");
    setShowMapModal(true);
  };

  // 1. Fetch User and Rides Data
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.name) setUserName(data.name);
          if (data.phone) setUserPhone(data.phone);
        }
      }
    };
    fetchUserData();

    const q = query(collection(db, "rides"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ridesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRides(ridesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Timer Logic Fixes
  useEffect(() => {
    let interval = null;
    let unsubscribeRequest = null;

    if (activeRequestId) {
      unsubscribeRequest = onSnapshot(doc(db, "requests", activeRequestId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status === "accepted" || data.status === "rejected") {
            if (data.status === "rejected") {
              alert("Ride Rejected");
            }
            setActiveRequestId(null);
            setActiveBookedRideId(null);
            setTimer(0);
          }
        }
      });

      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleCancelRequest(activeRequestId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (unsubscribeRequest) unsubscribeRequest();
    };
  }, [activeRequestId]);

  const handleCancelRequest = async (reqId) => {
    try {
      const docRef = doc(db, "requests", reqId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().status === "pending") {
        await deleteDoc(docRef);
        alert("Request timed out! Driver ne respond nahi kiya.");
      }
      setActiveRequestId(null);
      setActiveBookedRideId(null);
      setTimer(0);
    } catch (e) {
      console.error("Error:", e);
    }
  };

  const calculateFare = (pickupCoords, destCoords) => {
    if (!pickupCoords || !destCoords) return 80;
    const [lat1, lon1] = pickupCoords;
    const [lat2, lon2] = destCoords;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const aerialDistance = R * c;
    const estimatedRoadDistance = aerialDistance * 1.3;
    const baseFare = 50;
    const perKmRate = 25;
    const totalFare = Math.round(baseFare + (estimatedRoadDistance * perKmRate));
    return totalFare < 80 ? 80 : totalFare;
  };

  const handleViewRoute = (pickup, destination) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const handleRequestRide = async () => {
    const user = auth.currentUser;
    if (!user || !selectedRide) return;

    try {
      setRequestingId(selectedRide.id);
      const docRef = await addDoc(collection(db, "requests"), {
        rideId: selectedRide.id,
        driverId: selectedRide.driverId,
        passengerPhone: userPhone || "No Phone",
        passengerId: user.uid,
        passengerName: userName || "Passenger",
        pickup: selectedRide.pickup,
        destination: selectedRide.destination,
        pickupCoords: userPickupCoords,
        // 🔥 YEH NEW FIELD SAVE HOGI FIRESTORE MEIN
        studentPickupAddress: studentAddressText || selectedRide.pickup, 
        destCoords: selectedRide.destCoords || [24.9462, 67.0681],
        fare: currentModalFare,
        status: "pending",
        createdAt: serverTimestamp()
      });

      setActiveBookedRideId(selectedRide.id);
      setActiveRequestId(docRef.id);
      setTimer(15);
      setShowMapModal(false);
    } catch (e) {
      console.error("Firestore Error:", e);
    } finally {
      setRequestingId(null);
    }
  };

  const filteredRides = rides.filter(ride =>
    ride.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.pickup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-[#0b0b0b] min-h-screen text-white pb-20 font-sans selection:bg-[#9dff50] selection:text-black">
      <div className="max-w-[1200px] mx-auto px-4 py-6">

        {/* Header Section */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-[#9dff50] text-2xl md:text-3xl font-extrabold uppercase tracking-wide">
                Salam, {userName ? userName.split(' ')[0] : "Student"}! 👋
              </h2>
              <p className="text-[#666666] text-sm mt-1">Where are we going today?</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/[0.02] border !border-gray-700 p-[18px] rounded-[20px] backdrop-blur-md">
            <FaRoute className="text-[#9dff50] text-xl mb-3" />
            <span className="text-[#666666] text-[11px] uppercase tracking-wider block">Available</span>
            <h5 className="text-white text-lg font-extrabold mt-1">{rides.length} Rides</h5>
          </div>
          <div className="bg-white/[0.02] border !border-gray-700 p-[18px] rounded-[20px] backdrop-blur-md">
            <FaHistory className="text-[#9dff50] text-xl mb-3" />
            <span className="text-[#666666] text-[11px] uppercase tracking-wider block">Recent</span>
            <h5 className="text-white text-lg font-extrabold mt-1">04 Trips</h5>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex items-center bg-[#121212] border border-[#222222] rounded-[16px] overflow-hidden focus-within:border-[#9dff50] focus-within:shadow-[0_0_20px_rgba(157,255,80,0.15)] transition-all duration-300">
            <span className="text-[#9dff50] pl-[18px] pr-2">
              <FaSearch size={16} />
            </span>
            <input
              type="text"
              placeholder="Search by area (e.g. Gulshan, KU...)"
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-white border-none outline-none py-3.5 px-3 text-[15px] placeholder-[#555555]"
            />
          </div>
        </div>

        {/* Rides Grid */}
        <h5 className="text-[#444444] text-[11px] uppercase tracking-[2px] font-extrabold mb-4">Live Commutes</h5>

        {loading ? (
          <div className="flex justify-center items-center w-full py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent border-[#9dff50]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRides.map((ride) => (
              <div
                key={ride.id}
                className="bg-white/[0.02] border !border-gray-700 rounded-[24px] p-6 backdrop-blur-[12px] flex flex-col justify-between transition-all duration-300 cubic-bezier-[0.4,0,0.2,1] hover:-translate-y-1.5 hover:border-[#9dff50]/40 hover:shadow-[0_12px_30px_rgba(157,255,80,0.08)]"
              >
                <div>
                  {/* Driver Info Header */}
                  <div className="flex justify-between items-start mb-[20px]">
                    <div className="flex items-center">
                      <div className="w-[46px] h-[46px] bg-[#141414] border-2 border-[#9dff50] rounded-full flex items-center justify-center text-[#9dff50] shadow-[0_0_10px_rgba(157,255,80,0.2)]">
                        <FaUserCircle size={32} />
                      </div>
                      <div className="ml-3">
                        <h6 className="text-white font-bold text-sm mb-0">{ride.driverName || "Driver"}</h6>
                        <div className="text-[#ffc107] text-[11px] font-semibold mt-0.5 flex items-center">
                          <FaStar className="mr-1" />4.9
                        </div>
                      </div>
                    </div>
                    <span className="bg-[#9dff50]/10 text-[#9dff50] border border-[#9dff50]/30 text-[10px] font-extrabold tracking-[1.5px] px-2.5 py-1 rounded-[6px] uppercase">
                      LIVE
                    </span>
                  </div>

                  {/* Route Flow */}
                  <div className="relative pl-5 my-6">
                    <div className="absolute left-[4px] top-[6px] bottom-[6px] w-[2px] bg-gradient-to-b from-[#9dff50] to-[#9dff50]/20"></div>
                    <div className="absolute left-0 top-[4px] w-2.5 h-2.5 bg-[#9dff50] rounded-full shadow-[0_0_8px_#9dff50]"></div>

                    <div className="text-left">
                      <small className="text-[#666666] text-[10px] font-bold tracking-wider block mb-1">DROP-OFF POINT</small>
                      <p className="text-[#e0e0e0] text-sm font-medium line-clamp-1 truncate">{ride.destination}</p>
                    </div>
                  </div>
                </div>

                {/* Fare & Buttons Footer */}
                <div className="mt-4 pt-4 border-t border-white/[0.03]">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="bg-sky-500/10 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded mb-1 inline-block">Tap to set pickup</span>
                      <h5 className="text-[#888888] text-sm font-medium mt-0.5">Fare: Check in Map</h5>
                    </div>
                    <button
                      onClick={() => handleViewRoute(ride.pickup, ride.destination)}
                      className="border border-white/10 bg-white/[0.03] text-[#cccccc] rounded-[12px] p-2.5 transition-all duration-200 hover:bg-white/[0.08] hover:text-white hover:border-white/20"
                    >
                      <FaMapMarkerAlt size={16} />
                    </button>
                  </div>

                  <button
                    disabled={activeRequestId !== null && activeBookedRideId !== ride.id}
                    onClick={() => handleOpenMap(ride)}
                    className="w-full bg-[#9dff50] text-black !rounded-2xl py-3.5 px-5 font-black text-[13px] tracking-wide uppercase transition-all duration-300 cubic-bezier-[0.4,0,0.2,1] hover:enabled:-translate-y-0.5 hover:enabled:bg-[#a6ff5e] hover:enabled:shadow-[0_6px_20px_rgba(157,255,80,0.4)] disabled:bg-[#222222] disabled:text-[#555555] disabled:border disabled:border-[#333333] disabled:cursor-not-allowed"
                  >
                    {activeBookedRideId === ride.id
                      ? `Waiting ${timer}s...`
                      : "SELECT PICKUP & BOOK"
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Pure Tailwind Map Modal --- */}
      {showMapModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowMapModal(false)}></div>

          <div className="bg-[#111111] border border-white/10 rounded-[24px] w-full max-w-[800px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] z-10 relative">

            <div className="flex justify-between items-center bg-[#161616] px-5 py-3 border-b border-white/[0.05]">
              <h3 className="text-[#9dff50] text-xs font-black uppercase tracking-wider">CONFIRM YOUR PICKUP</h3>
              <button onClick={() => setShowMapModal(false)} className="text-gray-400 hover:text-white text-lg font-bold outline-none">×</button>
            </div>

            <div className="relative bg-[#0d0d0d]">
              <div className="h-[400px] w-full relative z-0">
                {selectedRide && (
                  <MapContainer center={selectedRide.pickupCoords} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <RoutingMachine pickupCoords={selectedRide.pickupCoords} destCoords={selectedRide.destCoords} />
                    <MapClickHandler />
                  </MapContainer>
                )}
              </div>

              <div className="p-4 bg-gradient-to-t from-black h-50 via-black/95 to-transparent pt-10">
                
                {/* Realtime Address Display inside Modal */}
                

                <div className="flex justify-between items-center bg-black p-4 rounded-xl border border-emerald-500/30 shadow-2xl">
                  <div>
                    <small className="text-[#666666] text-[10px] tracking-wider block uppercase font-bold">ESTIMATED FARE</small>
                    <h3 className="text-white text-2xl font-black mt-0.5">Rs. {currentModalFare}</h3>
                  </div>
                  <div className="text-end">
                    <small className="text-[#666666] text-[10px] tracking-wider block uppercase font-bold">DISTANCE IMPACT</small>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[11px] font-extrabold px-2.5 py-1 rounded border border-emerald-500/20 inline-block mt-1">
                      Student Discount Applied
                    </span>
                  </div>
                </div>

                <p className="text-center text-[#666666] text-xs mt-3">
                  Click on the map to mark your exact pickup location.
                </p>

                <button
                  onClick={handleRequestRide}
                  className="w-full bg-[#9dff50] text-black rounded-[14px] py-4 font-black text-sm uppercase tracking-wide mt-3 shadow-[0_0_20px_rgba(157,255,80,0.2)] hover:bg-[#a6ff5e] transition-all active:scale-[0.99]"
                >
                  Confirm Ride @ Rs. {currentModalFare}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        .leaflet-routing-container { display: none !important; }
        .leaflet-top, .leaflet-bottom { z-index: 800 !important; }
      `}</style>
    </div>
  );
};

export default StudentDashboard;