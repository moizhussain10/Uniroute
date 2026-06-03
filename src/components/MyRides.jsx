import React, { useState, useEffect } from 'react';
import { FaCar, FaClock, FaUsers, FaTrash, FaMapMarkerAlt, FaRoad } from 'react-icons/fa';
import { db, auth } from '../config/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';


const MyRides = () => {
    const [myRides, setMyRides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const user = auth.currentUser;
        if (user) {
            const q = query(
                collection(db, "rides"),
                where("driverId", "==", user.uid),
                orderBy("createdAt", "desc")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const ridesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMyRides(ridesData);
                setLoading(false);
            }, (error) => {
                console.error("Error fetching rides:", error);
                setLoading(false);
            });

            return () => unsubscribe();
        }
    }, []);

    const handleDeleteRide = async (rideId) => {
        if (window.confirm("Kya aap waqai ye ride delete karna chahte hain?")) {
            try {
                await deleteDoc(doc(db, "rides", rideId));
                alert("Ride deleted successfully! 🗑️");
            } catch (error) {
                alert("Error deleting ride: " + error.message);
            }
        }
    };

    if (loading) return (
        <div className="flex h-[80vh] w-full justify-center items-center">
            {/* Pure Tailwind Loader Spinner */}
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#9dff50]"></div>
        </div>
    );

    return (
        <div className="w-full bg-[#0a0a0a] min-h-screen text-white px-4 md:px-8 py-6">
            <div className="max-w-7xl mx-auto">
                
                {/* Header Area */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-[#9dff50] font-black text-2xl md:text-3xl tracking-wide uppercase" style={{ textShadow: '0 0 12px rgba(157, 255, 80, 0.25)' }}>
                            MY POSTED RIDES
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Manage your active and past ride offers</p>
                    </div>
                    <div className="bg-[#9dff50] text-black font-bold px-5 py-2.5 rounded-xl text-sm tracking-wide shadow-lg shadow-[#9dff50]/10">
                        {myRides.length} Total
                    </div>
                </div>

                {/* Rides Grid System (Pure Tailwind Grid) */}
                {myRides.length > 0 ? (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
                        {myRides.map((ride) => (
                            <div key={ride.id} className="bg-[#141414]/90 border border-gray-800/60 hover:border-[#9dff50]/30 rounded-2xl p-5 md:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/80">
                                
                                {/* Top Content: Vehicle Name & Status */}
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <div className="min-w-0 flex-1">
                                        <h5 className="text-white font-bold text-lg flex items-center gap-2 truncate">
                                            <FaCar className="text-[#9dff50] flex-shrink-0" /> 
                                            <span className="truncate">{ride.vehicleName}</span>
                                        </h5>
                                        <small className="text-gray-500 font-mono tracking-wider uppercase text-xs block mt-0.5">
                                            {ride.vehicleNumber}
                                        </small>
                                    </div>
                                    <div className="bg-black/40 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider flex-shrink-0">
                                        {ride.status?.toUpperCase() || "ACTIVE"}
                                    </div>
                                </div>

                                {/* Route Details (With Line Visual) */}
                                <div className="bg-white/[0.02] border border-white/[0.02] rounded-xl p-4 my-3 space-y-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FaMapMarkerAlt className="text-emerald-500 flex-shrink-0" size={14} />
                                        <span className="text-sm text-gray-300 truncate">{ride.pickup}</span>
                                    </div>
                                    <div className="w-[2px] h-4 bg-gradient-to-bottom bg-gray-700 ml-[6px] opacity-40"></div>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FaMapMarkerAlt className="text-red-500 flex-shrink-0" size={14} />
                                        <span className="text-sm text-gray-300 truncate">{ride.destination}</span>
                                    </div>
                                </div>

                                {/* Footer Data: Meta Details & Delete Action */}
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.04]">
                                    <div className="flex gap-2 sm:gap-3">
                                        <div className="bg-white/[0.04] border border-white/[0.02] text-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs">
                                            <FaClock className="text-[#9dff50]" />
                                            <span>{ride.time}</span>
                                        </div>
                                        <div className="bg-white/[0.04] border border-white/[0.02] text-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs">
                                            <FaUsers className="text-[#9dff50]" />
                                            <span>{ride.seats} Seats</span>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        className="text-red-400/80 border border-red-500/20 hover:bg-red-500 hover:text-white p-2.5 rounded-xl transition-all duration-200 shadow-sm"
                                        onClick={() => handleDeleteRide(ride.id)}
                                    >
                                        <FaTrash size={13} />
                                    </button>
                                </div>

                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-14 border-2 border-dashed border-white/[0.06] rounded-3xl bg-white/[0.01] w-full flex flex-col items-center justify-center p-6">
                        <FaRoad size={45} className="text-gray-600 mb-3 opacity-60" />
                        <h4 className="text-gray-400 font-semibold text-lg">Aapne koi ride post nahi ki.</h4>
                        <p className="text-gray-500 text-sm max-w-sm mt-1">Dashboard par jayen aur apni pehli ride offer karein!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyRides;