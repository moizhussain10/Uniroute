import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { FaPhoneAlt, FaMapMarkerAlt, FaFlagCheckered, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { db } from '../config/firebase'; 
import { doc, updateDoc } from 'firebase/firestore';
import './ActiveTrip.css';

// Marker icon fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const RoutingControl = ({ pickup, destination }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !pickup || !destination) return;

        // OSRM Demo server warning hatane ke liye aur error fix karne ke liye
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(pickup[0], pickup[1]), 
                L.latLng(destination[0], destination[1])
            ],
            // Agar aapka apna server nahi hai toh filhal yehi demo URL use hoga
            // Production mein Mapbox ya GraphHopper ka URL yahan aata hai
            serviceUrl: 'https://router.project-osrm.org/route/v1', 
            lineOptions: { 
                styles: [{ color: '#9dff50', weight: 6, opacity: 0.8 }] 
            },
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true,
            show: false,
            createMarker: () => null,
        });

        routingControl.addTo(map);

        // Cleanup function: Error 'removeLayer' ko rokne ke liye
        return () => {
            if (map && routingControl) {
                try {
                    map.removeControl(routingControl);
                } catch (e) {
                    console.warn("Routing cleanup handled:", e);
                }
            }
        };
    }, [map, pickup, destination]);

    return null;
};

const ActiveTrip = ({ rideData, role, onTripEnd }) => {

    console.log(rideData)

    // --- Cancel Ride Function ---
    const handleCancelRide = async () => {
        if (window.confirm("Bhai, kya waqai ride cancel karni hai?")) {
            try {
                const requestRef = doc(db, "requests", rideData.id);
                await updateDoc(requestRef, {
                    status: 'cancelled',
                    endTime: new Date()
                });
                alert("Ride Cancel ho gayi hai.");
                if (onTripEnd) onTripEnd(); 
            } catch (error) {
                console.error("Cancel karne mein masla aaya:", error);
            }
        }
    };

    if (!rideData) return <div className="text-white text-center p-5">Loading Trip Data...</div>;

    const pickupCoords = rideData.pickupCoords;
    const destCoords = rideData.destCoords;
    const isValidCoords = (coords) => Array.isArray(coords) && coords.length === 2 && coords[0] !== undefined;

    // --- Dynamic Data Logic ---
    // Agar driver hai toh student (passenger) ka data dikhao, warna driver ka
    const displayName = role === 'driver' ? rideData.passengerName : (rideData.driverName || "Driver");
    const displayPhone = role === 'driver' ? (rideData.passengerPhone || "N/A") : (rideData.driverPhone || "N/A");

    return (
        <div className="active-trip-page">
            <div className="container-fluid p-3 p-md-4">
                <div className="row g-4 h-100">
                    
                    {/* LEFT: MAP SECTION */}
                    <div className="col-12 col-lg-8 order-2 order-lg-1">
                        <div className="map-holder-neon shadow-lg">
                            <div className="live-badge"><span className="pulse-dot"></span> LIVE TRACKING</div>
                            {isValidCoords(pickupCoords) ? (
                                <MapContainer center={pickupCoords} zoom={14} style={{ height: '100%', width: '100%' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
                                    <Marker position={pickupCoords}><Popup>Pickup</Popup></Marker>
                                    {isValidCoords(destCoords) && <Marker position={destCoords}><Popup>Destination</Popup></Marker>}
                                    {isValidCoords(pickupCoords) && isValidCoords(destCoords) && <RoutingControl pickup={pickupCoords} destination={destCoords} />}
                                </MapContainer>
                            ) : (
                                <div className="map-error-state">
                                    <div className="spinner-grow text-success mb-2"></div>
                                    <p className="text-white">Connecting to GPS...</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT: TRIP INFO SECTION */}
                    <div className="col-12 col-lg-4 order-1 order-lg-2">
                        <div className="info-card-neon p-4">
                            <h4 className="neon-title mb-4">TRIP STATUS</h4>

                            {/* Profile Box - FIXED NUMBER DISPLAY */}
                            <div className="profile-mini-box d-flex align-items-center mb-4 border border-secondary">
                                <div className="avatar-frame">
                                    <img src={`https://ui-avatars.com/api/?name=${displayName}&background=9dff50&color=000`} alt="user" />
                                </div>
                                <div className="ms-3 flex-grow-1">
                                    <h6 className="m-0 text-white fw-bold">{displayName}</h6>
                                    <small className="text-muted d-block">{role === 'driver' ? 'Student / Passenger' : 'Driver'}</small>
                                    {/* Phone number text show hona chahiye */}
                                    <div className="text-white small mt-1" style={{color: '#9dff50 !important', fontWeight: 'bold'}}>
                                        <FaPhoneAlt size={10} className="me-1" /> {displayPhone}
                                    </div>
                                </div>
                                <a href={`tel:${displayPhone}`} className="call-neon-btn"><FaPhoneAlt /></a>
                            </div>

                            {/* Location Timeline */}
                            <div className="route-timeline mt-4 px-2">
                                <div className="timeline-point">
                                    <FaMapMarkerAlt className="icon-pickup" />
                                    <div className="ms-3">
                                        <label>PICKUP</label>
                                        <p>{rideData.pickup}</p>
                                    </div>
                                </div>
                                <div className="timeline-line"></div>
                                <div className="timeline-point">
                                    <FaFlagCheckered className="icon-dest" />
                                    <div className="ms-3">
                                        <label>DESTINATION</label>
                                        <p>{rideData.destination}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Fare Box */}
                            <div className="fare-neon-box my-4">
                                <span className="text-secondary">Estimated Fare</span>
                                <h2 className="text-neon">Rs. {rideData.fare}</h2>
                            </div>

                            {/* Action Buttons */}
                            <div className="d-grid gap-3 mt-auto">
                                {role === 'driver' && (
                                    <button className="btn btn-complete-trip">
                                        <FaCheckCircle className="me-2" /> COMPLETE TRIP
                                    </button>
                                )}
                                <button className="btn btn-cancel-trip" onClick={handleCancelRide}>
                                    <FaTimesCircle className="me-2" /> CANCEL RIDE
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveTrip;