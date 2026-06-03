import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { FaPhoneAlt, FaMapMarkerAlt, FaFlagCheckered, FaTimesCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';

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

// --- Sub-Component: Routing Control ---
const RoutingControl = ({ driverLive, passengerPickup, destination }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !isValidCoords(driverLive) || !isValidCoords(destination)) return;

        let points = [L.latLng(driverLive[0], driverLive[1])];

        if (isValidCoords(passengerPickup)) {
            points.push(L.latLng(passengerPickup[0], passengerPickup[1]));
        }

        points.push(L.latLng(destination[0], destination[1]));

        const routingControl = L.Routing.control({
            waypoints: points,
            lineOptions: {
                styles: [{ color: '#00ffcc', weight: 6, opacity: 0.8 }]
            },
            addWaypoints: false,
            draggableWaypoints: false,
            createMarker: () => null,
            show: false, 
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

    if (!rideData) return (
        <div className="flex flex-col justify-center items-center h-[80vh] w-full bg-[#050505]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#9dff50]"></div>
            <p className="mt-4 text-[#9dff50] text-xs font-bold tracking-[2px]">LOADING TRIP DATA...</p>
        </div>
    );

    const studentPickup = rideData.pickupCoords;
    const driverLive = rideData.driverCurrentCoords;
    const destinationCoords = rideData.destCoords;
    const mapCenter = isValidCoords(driverLive) ? driverLive : studentPickup;

    const displayName = role === 'driver' ? (rideData.passengerName || "samad") : (rideData.driverName || "Driver");
    const displayPhone = role === 'driver' ? (rideData.passengerPhone || "03114646864") : (rideData.driverPhone || "N/A");

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
    };

    // "samad" -> "SA" matching image_dac9dd.jpg
    const shortcutName = displayName.substring(0, 2).toUpperCase();

    return (
        <div className="w-full min-h-screen bg-[#050505] text-white p-4 font-sans selection:bg-[#9dff50]/30">
            <div className="max-w-[1400px] mx-auto h-[88vh] flex items-center justify-center">
                
                {/* Fixed Clean Grid Box System */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full h-full max-h-[620px] items-stretch">
                    
                    {/* LEFT CONTAINER: MAP VIEW */}
                    <div className="lg:col-span-8 relative rounded-[28px] overflow-hidden border border-gray-900 shadow-2xl h-[400px] lg:h-full">
                        
                        {/* Live Tracking Pin Indicator */}
                        <div className="absolute top-4 left-4 z-[1000] bg-black/80 border border-[#9dff50]/20 text-[#9dff50] px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-widest flex items-center gap-2">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9dff50] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9dff50]"></span>
                            </span>
                            LIVE TRACKING
                        </div>

                        {isValidCoords(mapCenter) ? (
                            <div className="w-full h-full [&>.leaflet-container]:invert-[100%] [&>.leaflet-container]:hue-rotate-[180deg] [&>.leaflet-container]:brightness-[95%] [&>.leaflet-container]:contrast-[90%]">
                                <MapContainer
                                    center={mapCenter}
                                    zoom={14}
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={true}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />

                                    {isValidCoords(studentPickup) && (
                                        <Marker position={studentPickup}>
                                            <Popup>Student Pickup: {rideData.pickup}</Popup>
                                        </Marker>
                                    )}

                                    {isValidCoords(driverLive) && (
                                        <Marker position={driverLive} icon={DefaultIcon}>
                                            <Popup>Driver Location</Popup>
                                        </Marker>
                                    )}

                                    {isValidCoords(destinationCoords) && (
                                        <Marker position={destinationCoords}>
                                            <Popup>Destination: {rideData.destination}</Popup>
                                        </Marker>
                                    )}

                                    <RoutingControl
                                        driverLive={driverLive}
                                        passengerPickup={studentPickup}
                                        destination={destinationCoords}
                                    />
                                </MapContainer>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#111] text-[#9dff50] gap-2">
                                <FaExclamationTriangle size={20} />
                                <p className="text-xs tracking-wider">Coordinates not sync.</p>
                            </div>
                        )}
                    </div>

                    {/* RIGHT CONTAINER: TRIP STATUS DETAILS */}
                    <div className="lg:col-span-4 bg-[#141414] border border-gray-900/50 rounded-[28px] p-5 flex flex-col justify-between h-[500px] lg:h-full shadow-2xl">
                        
                        {/* Upper Section */}
                        <div className="space-y-4">
                            <h4 className="text-[#9dff50] font-bold text-md tracking-wider uppercase">
                                TRIP STATUS
                            </h4>

                            {/* Driver/Passenger Quick Information Box */}
                            <div className="flex items-center justify-between bg-black/40 border border-gray-800/40 rounded-2xl p-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-[#9dff50] text-black font-extrabold text-sm flex items-center justify-center shadow-md">
                                        {shortcutName}
                                    </div>
                                    <div>
                                        <h6 className="m-0 text-white font-bold text-sm lowercase">{displayName}</h6>
                                        <small className="text-gray-500 font-medium text-[11px] block -mt-0.5">
                                            {role === 'driver' ? 'Passenger' : 'Driver'}
                                        </small>
                                        <span className="text-[#9dff50] text-[11px] font-bold block mt-0.5">
                                            {displayPhone}
                                        </span>
                                    </div>
                                </div>
                                <a 
                                    href={`tel:${displayPhone}`} 
                                    className="w-11 h-11 bg-[#9dff50] text-black rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-lg shadow-[#9dff50]/10"
                                >
                                    <FaPhoneAlt size={14} />
                                </a>
                            </div>

                            {/* Text Description Route Area */}
                            <div className="space-y-4 pt-1 px-1">
                                <div className="flex gap-2.5 items-start">
                                    <FaMapMarkerAlt className="text-green-500 mt-1 flex-shrink-0" size={13} />
                                    <div className="min-w-0">
                                        <span className="text-gray-500 text-[10px] font-black tracking-wider block uppercase">PICKUP</span>
                                        <p className="text-gray-300 text-[12px] font-medium leading-tight mt-0.5">{rideData.pickup || "Mubarak Shaheed Road, Baltistani Society, Abyssinia Lines"}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2.5 items-start">
                                    <FaFlagCheckered className="text-red-500 mt-1 flex-shrink-0" size={13} />
                                    <div className="min-w-0">
                                        <span className="text-gray-500 text-[10px] font-black tracking-wider block uppercase">DESTINATION</span>
                                        <p className="text-gray-300 text-[12px] font-medium leading-tight mt-0.5">{rideData.destination || "Dawood University of Engineering & Technology Karachi, University Road, Hussainabad"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lower Section (Fare + Control Action Triggers) */}
                        <div className="space-y-3 pt-4">
                            {/* Fare Box */}
                            <div className="border border-[#9dff50]/30 rounded-2xl py-4 text-center bg-black/20">
                                <h2 className="text-[#9dff50] font-medium text-2xl tracking-wide">
                                    Rs. {rideData.fare || "96"}
                                </h2>
                            </div>

                            {/* Actions Buttons */}
                            <div className="space-y-2">
                                {role === 'driver' && (
                                    <button 
                                        onClick={handleCompleteTrip} 
                                        className="w-full bg-[#9dff50] text-black font-black text-xs tracking-wider py-3.5 !rounded-2xl transition-all hover:bg-[#8ee045] flex justify-center items-center gap-2 uppercase"
                                    >
                                        <FaCheckCircle size={14} /> COMPLETE TRIP
                                    </button>
                                )}
                                <button 
                                    onClick={handleCancelRide} 
                                    className="w-full bg-transparent mt-4 border border-red-900/60 text-red-500/90 font-bold text-xs tracking-wider py-3.5 !rounded-2xl transition-all hover:bg-red-950/20 flex justify-center items-center gap-2 uppercase"
                                >
                                    <FaTimesCircle size={14} /> CANCEL RIDE
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