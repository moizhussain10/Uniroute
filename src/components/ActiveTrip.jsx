import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { FaPhoneAlt, FaMapMarkerAlt, FaFlagCheckered, FaTimesCircle, FaCheckCircle } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import './ActiveTrip.css';

// Marker icon fix for Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const isValidCoords = (coords) => Array.isArray(coords) && coords.length === 2 && coords[0] !== undefined && coords[0] !== null;

// --- Sub-Component: Routing Control (FIXED LOGIC) ---
const RoutingControl = ({ driverLive, passengerPickup, destination }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !isValidCoords(driverLive) || !isValidCoords(destination)) return;

        // 1. Points Array shuru karein (Start with Driver)
        let points = [
            L.latLng(driverLive[0], driverLive[1])
        ];

        // 2. Darmiyan mein Passenger ka pickup add karein (AGAR HAI TOH)
        if (isValidCoords(passengerPickup)) {
            points.push(L.latLng(passengerPickup[0], passengerPickup[1]));
        }

        // 3. Last mein Final Destination
        points.push(L.latLng(destination[0], destination[1]));

        const routingControl = L.Routing.control({
            waypoints: points,
            lineOptions: {
                styles: [{ color: '#00ffcc', weight: 6, opacity: 0.8 }]
            },
            addWaypoints: false,
            draggableWaypoints: false,
            createMarker: () => null, // Markers humne MapContainer mein khud lagaye hain
        }).addTo(map);

        return () => {
            if (map && routingControl) {
                map.removeControl(routingControl);
            }
        };
    }, [map, driverLive, passengerPickup, destination]);

    return null;
};

const ActiveTrip = ({ rideData, role, onTripEnd }) => {

    console.log(rideData)

    if (!rideData) return <div className="text-white text-center p-5">Loading Trip Data...</div>;

    // Data Extraction
    const studentPickup = rideData.pickupCoords;
    const driverLive = rideData.driverCurrentCoords;
    const destinationCoords = rideData.destCoords;

    // Map Focus Logic
    const mapCenter = role === 'driver'
        ? (isValidCoords(driverLive) ? driverLive : studentPickup)
        : (isValidCoords(driverLive) ? driverLive : studentPickup);

    const displayName = role === 'driver' ? (rideData.passengerName || "Student") : (rideData.driverName || "Driver");
    const displayPhone = role === 'driver' ? (rideData.passengerPhone || "N/A") : (rideData.driverPhone || "N/A");

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
                console.error("Cancel error:", error);
            }
        }
    };

    const handleCompleteTrip = async () => {
        if (window.confirm("Trip complete ho gayi?")) {
            try {
                const requestRef = doc(db, "requests", rideData.id);
                await updateDoc(requestRef, {
                    status: 'completed',
                    completedAt: new Date()
                });
                alert("Trip Completed! Shabaash 🚀");
                if (onTripEnd) onTripEnd();
            } catch (error) {
                console.error("Complete error:", error);
            }
        }
    }

    return (
        <div className="active-trip-page">
            <div className="container-fluid p-3 p-md-4">
                <div className="row g-4 h-100">

                    {/* LEFT: MAP SECTION */}
                    <div className="col-12 col-lg-8 order-2 order-lg-1">
                        <div className="map-holder-neon shadow-lg">
                            <div className="live-badge">
                                <span className="pulse-dot"></span> LIVE TRACKING
                            </div>

                            {isValidCoords(mapCenter) ? (
                                <MapContainer
                                    center={mapCenter}
                                    zoom={14}
                                    style={{ height: '100%', width: '100%' }}
                                    key={JSON.stringify(driverLive)} // Key update hogi toh map re-render hoga live tracking ke liye
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />

                                    {/* Marker: Student Pickup */}
                                    {isValidCoords(studentPickup) && (
                                        <Marker position={studentPickup}>
                                            <Popup>Student Pickup: {rideData.pickup}</Popup>
                                        </Marker>
                                    )}

                                    {/* Marker: Driver Live Location */}
                                    {isValidCoords(driverLive) && (
                                        <Marker position={driverLive} icon={DefaultIcon}>
                                            <Popup>Driver is here</Popup>
                                        </Marker>
                                    )}

                                    {/* Marker: Final Destination */}
                                    {isValidCoords(destinationCoords) && (
                                        <Marker position={destinationCoords}>
                                            <Popup>Destination: {rideData.destination}</Popup>
                                        </Marker>
                                    )}

                                    {/* DYNAMIC ROUTE: Driver -> Student Pickup -> Destination */}
                                    <RoutingControl 
                                        driverLive={driverLive} 
                                        passengerPickup={studentPickup} 
                                        destination={destinationCoords} 
                                    />
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

                            <div className="profile-mini-box d-flex align-items-center mb-4 border border-secondary p-2 rounded">
                                <div className="avatar-frame">
                                    <img src={`https://ui-avatars.com/api/?name=${displayName}&background=9dff50&color=000`} alt="user" className="rounded-circle" width="50" />
                                </div>
                                <div className="ms-3 flex-grow-1">
                                    <h6 className="m-0 text-white fw-bold">{displayName}</h6>
                                    <small className="text-muted d-block">{role === 'driver' ? 'Passenger' : 'Driver'}</small>
                                    <div className="text-white small mt-1">
                                        <FaPhoneAlt size={10} className="me-1" style={{ color: '#9dff50' }} /> {displayPhone}
                                    </div>
                                </div>
                                <a href={`tel:${displayPhone}`} className="call-neon-btn btn btn-sm btn-outline-success border-0"><FaPhoneAlt /></a>
                            </div>

                            <div className="route-timeline mt-4 px-2 text-white">
                                <div className="timeline-point d-flex align-items-start mb-3">
                                    <FaMapMarkerAlt className="icon-pickup mt-1" style={{ color: '#9dff50' }} />
                                    <div className="ms-3">
                                        <label className="text-muted small d-block">PICKUP</label>
                                        <p className="m-0 small">{rideData.pickup}</p>
                                    </div>
                                </div>
                                <div className="timeline-point d-flex align-items-start">
                                    <FaFlagCheckered className="icon-dest mt-1" style={{ color: '#ff4d4d' }} />
                                    <div className="ms-3">
                                        <label className="text-muted small d-block">DESTINATION</label>
                                        <p className="m-0 small">{rideData.destination}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="fare-neon-box my-4 p-3 rounded text-center" style={{ background: 'rgba(157, 255, 80, 0.1)', border: '1px solid #9dff50' }}>
                                <span className="text-muted small">Estimated Fare</span>
                                <h2 className="text-neon m-0" style={{ color: '#9dff50' }}>Rs. {rideData.fare || "200"}</h2>
                            </div>

                            <div className="d-grid gap-3 mt-auto">
                                {role === 'driver' && (
                                    <button onClick={handleCompleteTrip} className="btn btn-success fw-bold p-2 shadow-sm" style={{ background: '#9dff50', color: '#000' }}>
                                        <FaCheckCircle className="me-2" /> COMPLETE TRIP
                                    </button>
                                )}
                                <button className="btn btn-outline-danger fw-bold p-2" onClick={handleCancelRide}>
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