import React, { useEffect, useState } from 'react';
import { FaUserCircle, FaCar, FaIdCard, FaEnvelope, FaCalendarAlt, FaStar, FaEdit, FaShieldAlt } from 'react-icons/fa';
import { auth, db } from '../config/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

const DriverProfile = () => {
    const [userData, setUserData] = useState(null);
    const [rideCount, setRideCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const [showEditModal, setShowEditModal] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [editData, setEditData] = useState({ vehicleName: '', vehicleNumber: '' });

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setUserData(data);
                        setEditData({
                            vehicleName: data.vehicleName || "Honda 125",
                            vehicleNumber: data.vehicleNumber || "KAE-XXXX"
                        });
                    }

                    const q = query(collection(db, "rides"), where("driverId", "==", user.uid));
                    const querySnapshot = await getDocs(q);
                    setRideCount(querySnapshot.size);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, []);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                vehicleName: editData.vehicleName,
                vehicleNumber: editData.vehicleNumber
            });
            setUserData({ ...userData, vehicleName: editData.vehicleName, vehicleNumber: editData.vehicleNumber });
            setShowEditModal(false);
        } catch (error) {
            alert("Update fail: " + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[80vh] w-full bg-[#0a0a0a]">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#9dff50]"></div>
            <p className="mt-4 text-[#9dff50] text-xs font-bold tracking-[2px]">LOADING PROFILE...</p>
        </div>
    );

    return (
        <div className="w-full min-h-screen text-white bg-[#0a0a0a] px-4 md:px-8 py-6">
            <div className="max-w-5xl mx-auto">
                
                {/* --- Profile Header Card --- */}
                <div className="bg-[#141414]/90 border border-gray-800/60 rounded-3xl overflow-hidden mb-6 shadow-2xl">
                    <div className="h-24 bg-gradient-to-r from-[#0a0a0a] to-[#1a1a1a] border-b border-[#9dff50]/10"></div>
                    
                    <div className="text-center pb-6 pt-2 relative">
                        {/* Avatar Wrapper */}
                        <div className="relative inline-block -mt-16 mb-2">
                            <FaUserCircle size={110} className="text-[#111] bg-[#9dff50] p-0.5 border-[5px] border-[#0a0a0a] rounded-full shadow-[0_0_25px_rgba(157,255,80,0.25)]" />
                            <div className="absolute bottom-2 right-2 w-5 h-5 bg-[#00ff88] border-[3px] border-[#0a0a0a] rounded-full shadow-[0_0_10px_#00ff88]"></div>
                        </div>

                        <h2 className="text-[#9dff50] font-black text-2xl tracking-wide uppercase mt-2">
                            {userData?.name || "Driver Name"}
                        </h2>
                        
                        <div className="flex justify-center items-center mt-2">
                            <span className="bg-[#9dff50]/10 border border-[#9dff50]/30 text-[#9dff50] px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase flex items-center gap-1.5 shadow-sm">
                                <FaShieldAlt /> Verified Driver
                            </span>
                        </div>

                        {/* Stats Row */}
                        <div className="flex justify-center items-center gap-12 mt-6 max-w-xs mx-auto">
                            <div className="text-center flex-1">
                                <h4 className="font-black text-xl text-[#00d2ff]">{rideCount}</h4>
                                <small className="text-gray-500 text-[10px] tracking-wider uppercase font-semibold">Rides</small>
                            </div>
                            <div className="w-[1px] h-8 bg-gray-800"></div>
                            <div className="text-center flex-1">
                                <h4 className="font-black text-xl text-[#ffc107] flex items-center justify-center gap-1">
                                    4.8 <FaStar size={13} className="mb-0.5" />
                                </h4>
                                <small className="text-gray-500 text-[10px] tracking-wider uppercase font-semibold">Rating</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Two Column Layout --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    
                    {/* Left Column: Personal Info */}
                    <div className="bg-[#141414]/90 border !border-gray-800/60 rounded-3xl p-5 md:p-6 flex flex-col shadow-xl">
                        <h5 className="text-xs font-bold tracking-[2px] uppercase text-gray-500 mb-4 flex items-center gap-2">
                            <FaIdCard className="text-[#9dff50]" /> Information
                        </h5>
                        
                        <div className="space-y-3 flex-1 flex flex-col justify-center">
                            <div className="flex items-center bg-black/30 border !border-gray/700 p-4 rounded-xl gap-4">
                                <FaEnvelope className="text-[#9dff50] text-lg flex-shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Email Address</span>
                                    <h6 className="text-white text-[14px] font-medium truncate">{auth.currentUser?.email}</h6>
                                </div>
                            </div>
                            
                            <div className="flex items-center bg-black/30 border !border-gray/700 p-4 rounded-xl gap-4">
                                <FaCalendarAlt className="text-[#9dff50] text-lg flex-shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Phone Number</span>
                                    <h6 className="text-white text-[14px] font-medium truncate">{userData?.phone || "Not Added"}</h6>
                                </div>
                            </div>
                            
                            <div className="flex items-center bg-black/30 border !border-gray/700 p-4 rounded-xl gap-4">
                                <FaCalendarAlt className="text-[#9dff50] text-lg flex-shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider block">Member Since</span>
                                    <h6 className="text-white text-[14px] font-medium truncate">April 2026</h6>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Vehicle Info */}
                    <div className="bg-[#141414]/90 border !border-gray-800/60 rounded-3xl p-5 md:p-6 flex flex-col shadow-xl">
                        <h5 className="text-xs font-bold tracking-[2px] uppercase text-gray-500 mb-4 flex items-center gap-2">
                            <FaCar className="text-[#9dff50]" /> Primary Vehicle
                        </h5>
                        
                        <div className="bg-[#9dff50]/[0.03] border border-dashed border-[#9dff50]/20 rounded-2xl p-6 text-center relative flex flex-col justify-center items-center flex-1 mb-4">
                            <div className="absolute top-3 right-4 text-[9px] font-black bg-[#9dff50] text-black px-2 py-0.5 rounded uppercase tracking-wide">
                                Active
                            </div>
                            <FaCar size={38} className="text-[#9dff50] mb-2" />
                            <h4 className="font-bold text-white text-lg">{userData?.vehicleName || "Honda 125"}</h4>
                            <p className="text-[#9dff50]/70 font-mono tracking-widest text-xs mt-0.5 uppercase">{userData?.vehicleNumber || "KAE-XXXX"}</p>
                        </div>

                        <button 
                            className="w-full bg-transparent border border-[#9dff50] text-[#9dff50] font-bold text-sm py-3 px-4 rounded-xl transition-all duration-200 hover:bg-[#9dff50]/10 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            onClick={() => setShowEditModal(true)}
                        >
                            <FaEdit /> Update Details
                        </button>
                    </div>

                </div>

                {/* Account Deactivation Button */}
                <div className="text-center mt-8">
                    <button className="text-red-500/60 text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:text-red-500 hover:underline">
                        Deactivate UniRoute Account
                    </button>
                </div>

            </div>

            {/* --- Dark Edit Modal (Pure Tailwind overlay system) --- */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
                    <div className="bg-[#0a0a0a] border border-[#9dff50]/30 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-bold text-[#9dff50] text-lg tracking-wide">Update Vehicle</h3>
                            <button 
                                className="text-gray-400 hover:text-white transition-colors text-lg font-mono p-1"
                                onClick={() => setShowEditModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="text-[#9dff50] text-[10px] font-black tracking-wider uppercase block mb-2">Vehicle Name</label>
                                <input 
                                    type="text"
                                    className="w-full bg-[#111] border border-gray-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-[#9dff50] focus:ring-1 focus:ring-[#9dff50]/20 transition-all"
                                    value={editData.vehicleName}
                                    onChange={(e) => setEditData({ ...editData, vehicleName: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="text-[#9dff50] text-[10px] font-black tracking-wider uppercase block mb-2">Number Plate</label>
                                <input 
                                    type="text"
                                    className="w-full bg-[#111] border border-gray-800 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-[#9dff50] focus:ring-1 focus:ring-[#9dff50]/20 transition-all"
                                    value={editData.vehicleNumber}
                                    onChange={(e) => setEditData({ ...editData, vehicleNumber: e.target.value })}
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full bg-[#9dff50] text-black font-black text-sm tracking-wider py-3.5 rounded-xl transition-all duration-200 hover:bg-[#8ce644] active:scale-[0.99] flex justify-center items-center h-12 mt-6 shadow-md shadow-[#9dff50]/10"
                                disabled={isUpdating}
                            >
                                {isUpdating ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
                                ) : (
                                    "CONFIRM UPDATE"
                                )}
                            </button>
                        </form>

                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverProfile;