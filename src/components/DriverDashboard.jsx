import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { auth, db, onAuthStateChanged } from '../config/firebase';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import L from 'leaflet';
import { FaSearch, FaMapMarkerAlt, FaCar, FaClock, FaUsers, FaBell } from 'react-icons/fa';
import { Spinner, Button } from 'react-bootstrap';

// Notification Sound Logic
const notificationSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');

// Leaflet Icon Fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

// Map View change karne ke liye component
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, 14, { animate: true, duration: 1.5 });
        }
    }, [center, map]);
    return null;
}

function MapClickHandler({ setTempPos, handleLocationSelect }) {
    useMapEvents({
        click(e) {
            const coords = [e.latlng.lat, e.latlng.lng];
            setTempPos(coords);
            handleLocationSelect(coords);
        },
    });
    return null;
}

const DriverDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [pickup, setPickup] = useState({ coords: null, address: '' });
    const [dest, setDest] = useState({ coords: null, address: '' });
    const [tempPos, setTempPos] = useState([24.8607, 67.0011]);
    const [requests, setRequests] = useState([]);
    const [selectionStep, setSelectionStep] = useState('pickup');
    const [driverPhone, setDriverPhone] = useState("");
    const [driverName, setDriverName] = useState("");
    const [activeTripId, setActiveTripId] = useState(null);

    // 🔥 1. LIVE LOCATION TRACKING EFFECT
    useEffect(() => {
        let watchId;
        if (activeTripId) {
            console.log("📡 Starting Live Tracking for Trip:", activeTripId);

            watchId = navigator.geolocation.watchPosition(
                async (position) => {
                    const liveCoords = [position.coords.latitude, position.coords.longitude];
                    console.log("📍 Live GPS:", liveCoords);

                    try {
                        const tripRef = doc(db, "requests", activeTripId);
                        await updateDoc(tripRef, {
                            driverCurrentCoords: liveCoords
                        });
                    } catch (err) {
                        console.error("Live Update Error:", err);
                    }
                },
                (err) => console.error("GPS Error:", err),
                { enableHighAccuracy: true, distanceFilter: 5 }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [activeTripId]);

    // 2. User Data Fetching
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setDriverPhone(data.phone || "");
                        setDriverName(data.name || "");
                        console.log("Driver data fetched:", data.name);
                    }
                } catch (error) {
                    console.error("Firestore fetching mein masla:", error);
                }
            } else {
                console.log("User logged in nahi hai.");
            }
        });

        return () => unsubscribe();
    }, []);

    // 3. Notifications Logic
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
            collection(db, "requests"),
            where("driverId", "==", user.uid),
            where("status", "==", "pending")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added") {
                    notificationSound.play().catch(e => console.log("Sound blocked"));
                }
            });
            setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, []);

    // 4. Selection Logic
    const handleLocationSelect = async (coords) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords[0]}&lon=${coords[1]}`);
            const data = await res.json();
            const cleanAddress = data.display_name.split(',').slice(0, 3).join(',');

            if (selectionStep === 'pickup') {
                setPickup({ coords, address: cleanAddress });
                setSelectionStep('destination');
            } else {
                setDest({ coords, address: cleanAddress });
            }
        } catch (error) { console.error("Geocoding error:", error); }
    };

    // 5. UPDATED SEARCH: Forcefully moving map
    const handleMapSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery) return;

        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + " Karachi")}&limit=1`;
            const response = await fetch(url);
            const results = await response.json();

            if (results && results.length > 0) {
                const newCoords = [parseFloat(results[0].lat), parseFloat(results[0].lon)];
                setTempPos(newCoords);
                handleLocationSelect(newCoords);
            } else {
                alert("Location not found! 📍");
            }
        } catch (error) {
            console.error("Search failed:", error);
            alert("Search service error");
        }
    };

    // 🔥 6. UPDATE HANDLE ACTION
    const handleAction = async (requestId, action) => {
        try {
            if (action === 'accepted') {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const currentGPS = [position.coords.latitude, position.coords.longitude];

                    await updateDoc(doc(db, "requests", requestId), {
                        status: 'accepted',
                        driverName: driverName,
                        driverPhone: driverPhone,
                        driverCurrentCoords: currentGPS
                    });

                    setActiveTripId(requestId);
                    alert("Ride Accepted! Tracking started.");
                });
            } else {
                await updateDoc(doc(db, "requests", requestId), { status: action });
            }
        } catch (error) {
            console.error("Action error:", error);
        }
    };

    // 🔥 7. UPDATE POST RIDE (Initial setup)
    const handlePostRide = async (e) => {
        e.preventDefault();
        if (!pickup.coords || !dest.coords) return alert("Please select both locations!");
        setLoading(true);
        try {
            const form = e.target;
            await addDoc(collection(db, "rides"), {
                pickup: pickup.address,
                pickupCoords: pickup.coords,
                destination: dest.address,
                destCoords: dest.coords,
                driverCurrentCoords: pickup.coords,
                driverName: driverName || "Driver",
                driverPhone: driverPhone || "No Number",
                time: form.time.value,
                seats: form.seats.value,
                vehicleName: form.vehicleName.value,
                vehicleNumber: form.vehicleNumber.value,
                driverId: auth.currentUser.uid,
                status: 'available',
                createdAt: serverTimestamp()
            });
            alert("Ride Posted! 🚀");
        } catch (err) { alert("Error: " + err.message); }
        setLoading(false);
    };

    const startTracking = (requestId) => {
        if (navigator.geolocation) {
            const intervalId = setInterval(() => {
                navigator.geolocation.getCurrentPosition((position) => {
                    const { latitude, longitude } = position.coords;

                    const requestRef = doc(db, "requests", requestId);
                    updateDoc(requestRef, {
                        driverLocation: {
                            lat: latitude,
                            lng: longitude
                        }
                    });
                    console.log("Location Updated:", latitude, longitude);
                });
            }, 10000);

            return intervalId;
        }
    };

    return (
        <div 
            className="min-h-screen p-4 md:p-6 text-white relative overflow-x-hidden bg-cover bg-center bg-no-repeat lg:pl-[260px]"
            style={{ 
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.85)), url('https://static.vecteezy.com/system/resources/thumbnails/053/733/164/small/perfect-close-up-of-a-modern-car-showcasing-its-intricate-design-photo.jpg')`
            }}
        >
            {/* Grid Layout Container */}
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 h-auto lg:h-[85vh] items-stretch">
                
                {/* Form Glass Panel */}
                <div className="bg-[#141414]/80 backdrop-blur-md border !border-gray-700 rounded-[30px] p-6 md:p-8 shadow-2xl flex flex-col justify-between">
                    <div>
                        <h2 className="text-[#9dff50] text-2xl font-black uppercase tracking-wider mb-6 [text-shadow:0_0_10px_rgba(157,255,80,0.3)]">
                            Offer a Ride
                        </h2>
                        
                        <form onSubmit={handlePostRide} className="space-y-4">
                            {/* Selection Status Box */}
                            <div className="space-y-2">
                                <small className="text-white/40 block text-[11px] font-extrabold tracking-widest uppercase">
                                    SELECTION MODE
                                </small>
                                
                                {/* Pickup Box */}
                                <div 
                                    onClick={() => setSelectionStep('pickup')}
                                    className={`flex items-center bg-[#0a0a0a] border p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                                        selectionStep === 'pickup' 
                                            ? 'border-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                                            : '!border-gray-700 hover:!border-gray-7000'
                                    }`}
                                >
                                    <FaMapMarkerAlt className="text-emerald-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm truncate text-white/80">
                                        {pickup.address || "Set Pickup on Map"}
                                    </span>
                                </div>

                                {/* Destination Box */}
                                <div 
                                    onClick={() => setSelectionStep('destination')}
                                    className={`flex items-center bg-[#0a0a0a] border p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                                        selectionStep === 'destination' 
                                            ? 'border-rose-600 shadow-[0_0_12px_rgba(244,63,94,0.3)]' 
                                            : '!border-gray-700 hover:!border-gray-7000'
                                    }`}
                                >
                                    <FaMapMarkerAlt className="text-rose-500 mr-3 flex-shrink-0" />
                                    <span className="text-sm truncate text-white/80">
                                        {dest.address || "Set Destination on Map"}
                                    </span>
                                </div>
                            </div>

                            {/* Inputs */}
                            <div className="space-y-1">
                                <label className="text-[#9dff50] text-[11px] font-extrabold uppercase tracking-wider flex items-center">
                                    <FaCar className="mr-2" /> Vehicle Name
                                </label>
                                <input 
                                    name="vehicleName" 
                                    placeholder="Honda 125" 
                                    className="w-full bg-[#0a0a0a] border !border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#9dff50] focus:shadow-[0_0_10px_rgba(157,255,80,0.2)] transition-all"
                                    required 
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[#9dff50] text-[11px] font-extrabold uppercase tracking-wider block">
                                    Plate Number
                                </label>
                                <input 
                                    name="vehicleNumber" 
                                    placeholder="KAE-1234" 
                                    className="w-full bg-[#0a0a0a] border !border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#9dff50] focus:shadow-[0_0_10px_rgba(157,255,80,0.2)] transition-all"
                                    required 
                                />
                            </div>

                            {/* Time & Seats row */}
                            <div className="flex gap-4">
                                <div className="flex-grow space-y-1">
                                    <label className="text-[#9dff50] text-[11px] font-extrabold uppercase tracking-wider flex items-center">
                                        <FaClock className="mr-1" /> Time
                                    </label>
                                    <input 
                                        name="time" 
                                        type="time" 
                                        className="w-full bg-[#0a0a0a] border !border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#9dff50] focus:shadow-[0_0_10px_rgba(157,255,80,0.2)] transition-all [color-scheme:dark]"
                                        required 
                                    />
                                </div>
                                <div className="w-[100px] space-y-1">
                                    <label className="text-[#9dff50] text-[11px] font-extrabold uppercase tracking-wider flex items-center">
                                        <FaUsers className="mr-1" /> Seats
                                    </label>
                                    <select 
                                        name="seats" 
                                        className="w-full bg-[#0a0a0a] border !border-gray-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-[#9dff50] focus:shadow-[0_0_10px_rgba(157,255,80,0.2)] transition-all"
                                    >
                                        <option value="1" className="bg-[#141414]">1</option>
                                        <option value="2" className="bg-[#141414]">2</option>
                                        <option value="4" className="bg-[#141414]">4</option>
                                    </select>
                               </div>
                            </div>

                            {/* Neon Post Ride Button */}
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full bg-gradient-to-r from-[#9dff50] to-[#7ed93d] text-black font-extrabold tracking-wider uppercase !rounded-2xl p-4 mt-4 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_10px_25px_rgba(157,255,80,0.4)] active:translate-y-0 relative overflow-hidden group disabled:opacity-50"
                            >
                                {loading ? <Spinner size="sm" /> : "POST RIDE NOW"}
                                <span className="absolute inset-0 w-200% h-200% bg-white/20 transform rotate-45 -top-1/2 -left-1/2 transition-all duration-700 pointer-events-none group-hover:left-[120%]" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Map Section View */}
                <div className="relative rounded-[24px] overflow-hidden border-2 border-[#9dff50]/30 shadow-[0_0_20px_rgba(157,255,80,0.1)] min-h-[400px] lg:min-h-0">
                    
                    {/* Floating Search Bar */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] w-[90%] sm:w-[85%] max-width-[400px] bg-[#0f0f0f]/85 backdrop-blur-md px-4 py-2 rounded-full flex items-center border border-[#9dff50]/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.8),_0_0_15px_rgba(157,255,80,0.1)] focus-within:w-[92%] sm:focus-within:w-[400px] focus-within:border-[#9dff50] focus-within:shadow-[0_8px_32px_0_rgba(0,0,0,0.8),_0_0_20px_rgba(157,255,80,0.3)] transition-all duration-300">
                        <form onSubmit={handleMapSearch} className="flex w-full items-center">
                            <input
                                type="text"
                                placeholder="Search area (e.g. Clifton)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-transparent border-none text-white px-3 py-2 w-full text-sm outline-none placeholder-white/50"
                            />
                            <button 
                                type="submit" 
                                className="bg-[#9dff50] border-none rounded-full w-9 h-9 flex items-center justify-center cursor-pointer text-black text-sm transition-all duration-300 hover:scale-110 hover:bg-[#b6ff80] hover:shadow-[0_0_15px_#9dff50]"
                            >
                                <FaSearch />
                            </button>
                        </form>
                    </div>

                    {/* Leaflet Map Integration */}
                    <MapContainer center={tempPos} zoom={13} className="w-full h-full rounded-[20px]">
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <ChangeView center={tempPos} />
                        {pickup.coords && <Marker position={pickup.coords} icon={DefaultIcon} />}
                        {dest.coords && <Marker position={dest.coords} icon={DefaultIcon} />}
                        <MapClickHandler setTempPos={setTempPos} handleLocationSelect={handleLocationSelect} />
                    </MapContainer>
                </div>
            </div>

            {/* Floating Live Ride Notifications Container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4">
                {requests.length > 0 && requests.map((req) => (
                    <div 
                        key={req.id} 
                        className="w-[320px] bg-[#0a0a0a]/95 backdrop-blur-xl border border-[#9dff50] rounded-2xl overflow-hidden shadow-[0_20_50px_rgba(0,0,0,0.8),_0_0_20px_rgba(157,255,80,0.2)] animate-[slideIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.275)]"
                    >
                        {/* Notification Ticker Header */}
                        <div className="bg-[#9dff50]/10 px-4 py-2.5 border-b border-[#9dff50]/20 flex justify-between items-center text-[#9dff50] font-black text-[11px] tracking-wider">
                            <div className="flex items-center gap-2">
                                <Spinner animation="grow" size="sm" variant="success" className="m-0" />
                                <span>NEW RIDE REQUEST</span>
                            </div>
                            <FaBell className="text-xs" />
                        </div>

                        {/* Card Meta Content Body */}
                        <div className="p-4 space-y-2">
                            <div className="flex justify-between items-center mb-1">
                                <h6 className="m-0 text-white font-bold">{req.passengerName || "Student"}</h6>
                                <span className="badge bg-emerald-500 text-black font-black px-2 py-1 rounded text-xs shadow-[0_0_10px_#9dff50]">
                                    Rs. {req.fare || "0"}
                                </span>
                            </div>

                            <p className="text-xs text-white/60 m-0 truncate">
                                <FaMapMarkerAlt className="text-emerald-500 inline mr-1 mb-0.5" />
                                <strong className="text-white/80">Pickup:</strong> {req.pickup}
                            </p>
                            <p className="text-xs text-white/60 m-0 truncate">
                                <FaMapMarkerAlt className="text-rose-500 inline mr-1 mb-0.5" />
                                <strong className="text-white/80">Drop:</strong> {req.destination}
                            </p>
                        </div>

                        {/* Action CTA Buttons */}
                        <div className="p-3 bg-white/5 border-t !border-gray-700 flex gap-2">
                            <Button
                                variant="success"
                                size="sm"
                                className="w-full font-bold uppercase text-[11px] py-2 tracking-wider bg-emerald-500 border-none text-black hover:bg-emerald-400"
                                onClick={() => handleAction(req.id, 'accepted')}
                            >
                                ACCEPT & EARN
                            </Button>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                className="w-full font-bold uppercase text-[11px] py-2 tracking-wider border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white"
                                onClick={() => handleAction(req.id, 'rejected')}
                            >
                                REJECT
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DriverDashboard;