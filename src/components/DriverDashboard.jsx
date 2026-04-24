import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { auth, db } from '../config/firebase';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import L from 'leaflet';
import { FaSearch, FaMapMarkerAlt, FaCar, FaClock, FaUsers, FaBell } from 'react-icons/fa';
import { Spinner, Button } from 'react-bootstrap';
import './DriverDashboard.css';

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

// Map View change karne ke liye component - Ismein map.flyTo use kiya hai force movement ke liye
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

    // 1. User Data Fetching
    useEffect(() => {
        const fetchDriverData = async () => {
            const user = auth.currentUser;
            if (user) {
                const docSnap = await getDoc(doc(db, "users", user.uid));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setDriverPhone(data.phone || "");
                    setDriverName(data.name || "");
                }
            }
        };
        fetchDriverData();
    }, []);

    // 2. Notifications Logic
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

    // 3. Selection Logic
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

    // 4. UPDATED SEARCH: Forcefully moving map
    const handleMapSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery) return;
        
        try {
            // Karachi bounding box for better results
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + " Karachi")}&limit=1`;
            const response = await fetch(url);
            const results = await response.json();
            
            if (results && results.length > 0) {
                const newCoords = [parseFloat(results[0].lat), parseFloat(results[0].lon)];
                setTempPos(newCoords); // Isse ChangeView trigger hoga aur map fly karega
                handleLocationSelect(newCoords); // Address boxes update karega
            } else {
                alert("Location not found! 📍");
            }
        } catch (error) { 
            console.error("Search failed:", error); 
            alert("Search service error");
        }
    };

    const handleAction = async (requestId, action) => {
        try {
            await updateDoc(doc(db, "requests", requestId), { status: action });
        } catch (error) { console.error(error); }
    };

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
            setPickup({ coords: null, address: '' });
            setDest({ coords: null, address: '' });
            setSelectionStep('pickup');
            form.reset();
        } catch (err) { alert("Error: " + err.message); }
        setLoading(false);
    };

    return (
        <div className="driver-dashboard-container">
            <div className="control-grid">
                <div className="glass-panel-form">
                    <h2 className="neon-text mb-4 text-uppercase fw-bold">Offer a Ride</h2>
                    <form onSubmit={handlePostRide}>
                        <div className="selection-status mb-4">
                            <small className="text-muted d-block mb-2">SELECTION MODE</small>
                            <div className={`location-box ${selectionStep === 'pickup' ? 'active-pickup' : ''}`} onClick={() => setSelectionStep('pickup')}>
                                <FaMapMarkerAlt className="text-success me-2" />
                                <span className="text-truncate">{pickup.address || "Set Pickup on Map"}</span>
                            </div>
                            <div className={`location-box mt-2 ${selectionStep === 'destination' ? 'active-dest' : ''}`} onClick={() => setSelectionStep('destination')}>
                                <FaMapMarkerAlt className="text-danger me-2" />
                                <span className="text-truncate">{dest.address || "Set Destination on Map"}</span>
                            </div>
                        </div>

                        <div className="neon-input-group">
                            <label><FaCar className="me-2" /> Vehicle Name</label>
                            <input name="vehicleName" placeholder="Honda 125" className="driver-field" required />
                        </div>
                        <div className="neon-input-group mt-3">
                            <label>Plate Number</label>
                            <input name="vehicleNumber" placeholder="KAE-1234" className="driver-field" required />
                        </div>

                        <div className="d-flex gap-3 mt-3">
                            <div className="flex-grow-1">
                                <label className="small neon-text"><FaClock className="me-1" /> Time</label>
                                <input name="time" type="time" className="driver-field" required />
                            </div>
                            <div style={{ width: '100px' }}>
                                <label className="small neon-text"><FaUsers className="me-1" /> Seats</label>
                                <select name="seats" className="driver-field">
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="4">4</option>
                                </select>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-neon-main mt-4 w-100">
                            {loading ? <Spinner size="sm" /> : "POST RIDE NOW"}
                        </button>
                    </form>
                </div>

                <div className="map-view-section">
                    <div className="map-search-bar">
                        <form onSubmit={handleMapSearch} style={{ display: 'flex', width: '100%' }}>
                           <input
                               type="text"
                               placeholder="Search area (e.g. Clifton)..."
                               value={searchQuery}
                               onChange={(e) => setSearchQuery(e.target.value)}
                           />
                           <button type="submit"><FaSearch /></button>
                        </form>
                    </div>

                    <MapContainer center={tempPos} zoom={13} style={{ height: '100%', width: '100%', borderRadius: '20px' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <ChangeView center={tempPos} />
                        {pickup.coords && <Marker position={pickup.coords} icon={DefaultIcon} />}
                        {dest.coords && <Marker position={dest.coords} icon={DefaultIcon} />}
                        <MapClickHandler setTempPos={setTempPos} handleLocationSelect={handleLocationSelect} />
                    </MapContainer>
                </div>
            </div>

            <div className="notification-container">
                {requests.length > 0 && requests.map((req) => (
                    <div key={req.id} className="live-request-notification">
                        <div className="request-header">
                            <div className="d-flex align-items-center gap-2">
                                <Spinner animation="grow" size="sm" variant="success" />
                                <span>NEW RIDE REQUEST</span>
                            </div>
                            <FaBell />
                        </div>
                        <div className="request-body p-3">
                            <p className="mb-1"><strong>Passenger:</strong> {req.passengerName || "Student"}</p>
                            <p className="small text-muted mb-1"><FaMapMarkerAlt className="text-success me-1" /> {req.pickup}</p>
                            <p className="small text-muted mb-0"><FaMapMarkerAlt className="text-danger me-1" /> {req.destination}</p>
                        </div>
                        <div className="request-footer p-2 d-flex gap-2">
                            <Button variant="success" size="sm" className="w-100 fw-bold" onClick={() => handleAction(req.id, 'accepted')}>ACCEPT</Button>
                            <Button variant="outline-danger" size="sm" className="w-100 fw-bold" onClick={() => handleAction(req.id, 'rejected')}>REJECT</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DriverDashboard;