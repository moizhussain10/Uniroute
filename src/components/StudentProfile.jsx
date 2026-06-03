import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaEnvelope, FaHistory, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaPhoneAlt, FaEdit } from 'react-icons/fa';
import { auth, db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';

const StudentProfile = () => {
    const [userData, setUserData] = useState(null);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const fetchProfile = async () => {
                const docSnap = await getDoc(doc(db, "users", currentUser.uid));
                if (docSnap.exists()) {
                    setUserData(docSnap.data());
                }
            };

            const q = query(
                collection(db, "requests"),
                where("passengerId", "==", currentUser.uid),
                orderBy("createdAt", "desc")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const reqData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setMyRequests(reqData);

                fetchProfile().then(() => setLoading(false));
            });

            return () => unsubscribe();
        }
    }, []);

    const getStatusBadge = (status) => {
        const baseClass = "text-[11px] font-extrabold tracking-[1.5px] px-3 py-1.5 rounded-[8px] uppercase flex items-center justify-center w-fit border";
        switch (status) {
            case 'accepted':
                return (
                    <span className={`${baseClass} bg-[#9dff50]/10 text-[#9dff50] border-[#9dff50]/30 shadow-[0_0_10px_rgba(157,255,80,0.1)]`}>
                        <FaCheckCircle className="mr-1.5" /> Accepted
                    </span>
                );
            case 'rejected':
                return (
                    <span className={`${baseClass} bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.1)]`}>
                        <FaTimesCircle className="mr-1.5" /> Rejected
                    </span>
                );
            default:
                return (
                    <span className={`${baseClass} bg-[#ffc107]/10 text-[#ffc107] border-[#ffc107]/30 shadow-[0_0_10px_rgba(255,193,7,0.1)]`}>
                        <FaClock className="mr-1.5" /> Pending
                    </span>
                );
        }
    };

    if (loading) return (
        <div className="min-h-[80vh] flex justify-center items-center bg-[#0b0b0b]">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-t-transparent border-[#9dff50]"></div>
        </div>
    );

    return (
        <div className="bg-[#0b0b0b] min-h-screen text-white pb-20 font-sans selection:bg-[#9dff50] selection:text-black">
            {/* FIX: Is div mein 'lg:pl-[280px]' ya 'lg:ml-[260px]' lagaya hai 
      taake desktop par content automatic right side shift ho jaye aur sidebar ke upar na aaye.
    */}
            <div className="w-full transition-all duration-300">
                <div className="max-w-[1200px] mx-auto px-4 py-8">

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* --- Profile Sidebar (Neon Glass Card) --- */}
                        <div className="lg:col-span-4 bg-white/[0.02] border  !border-gray-700  rounded-[24px] p-6 backdrop-blur-md text-center lg:sticky lg:top-6">

                            {/* Avatar Section */}
                            <div className="mb-5 flex justify-center">
                                <div className="w-[120px] h-[120px] border-2 border-[#9dff50] rounded-full flex items-center justify-center text-[#9dff50] shadow-[0_0_20px_rgba(157,255,80,0.2)] bg-[#121212]">
                                    <FaUserCircle size={90} />
                                </div>
                            </div>

                            {/* User Meta */}
                            <h3 className="text-[#9dff50] text-2xl font-black uppercase tracking-wide text-shadow-[0_0_10px_rgba(157,255,80,0.3)]">
                                {userData?.name || auth.currentUser?.displayName || "Student"}
                            </h3>
                            <p className="text-[#666666] text-[11px] uppercase tracking-[2px] font-bold mt-1 mb-6">
                                Member Pass #8291
                            </p>

                            {/* Info Items List */}
                            <div className="space-y-3 text-left mb-6">
                                {/* Email */}
                                <div className="flex items-center gap-4 p-3.5 bg-white/[0.01] border  !border-gray-700  rounded-[14px]">
                                    <FaEnvelope className="text-[#9dff50] text-base shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <small className="block text-[#444444] text-[9px] font-black tracking-wider uppercase">EMAIL ADDRESS</small>
                                        <span className="text-[#e0e0e0] text-sm font-medium block truncate">{auth.currentUser?.email}</span>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-center gap-4 p-3.5 bg-white/[0.01] border  !border-gray-700  rounded-[14px]">
                                    <FaPhoneAlt className="text-[#9dff50] text-base shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <small className="block text-[#444444] text-[9px] font-black tracking-wider uppercase">PHONE NUMBER</small>
                                        <span className="text-[#e0e0e0] text-sm font-medium block truncate">{userData?.phone || "Not Added"}</span>
                                    </div>
                                </div>

                                {/* Joined Date */}
                                <div className="flex items-center gap-4 p-3.5 bg-white/[0.01] border  !border-gray-700  rounded-[14px]">
                                    <FaCalendarAlt className="text-[#9dff50] text-base shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <small className="block text-[#444444] text-[9px] font-black tracking-wider uppercase">JOINED DATE</small>
                                        <span className="text-[#e0e0e0] text-sm font-medium block truncate">
                                            {auth.currentUser?.metadata.creationTime ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString('en-GB') : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Edit Profile Button */}
                            <button className="w-full bg-transparent border !border-gray-700 text-[#9dff50] !rounded-2xl py-3.5 font-black text-[13px] tracking-wide uppercase transition-all duration-300 hover:bg-[#9dff50] hover:text-white hover:shadow-[0_0_20px_rgba(157,255,80,0.3)] flex items-center justify-center gap-2">
                                <FaEdit size={14} /> EDIT PROFILE
                            </button>
                        </div>

                        {/* --- History Section --- */}
                        <div className="lg:col-span-8">
                            {/* Header Content */}
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-[#9dff50] text-lg font-black uppercase tracking-wider flex items-center gap-2">
                                    <FaHistory /> RIDE HISTORY
                                </h4>
                                <span className="bg-[#9dff50] text-black text-xs font-black px-4 py-2 rounded-[10px] tracking-wide shadow-[0_4px_12px_rgba(157,255,80,0.2)]">
                                    Total Trips: {myRequests.length}
                                </span>
                            </div>

                            {/* Stack Items */}
                            {myRequests.length > 0 ? (
                                <div className="space-y-4">
                                    {myRequests.map((req) => (
                                        <div
                                            key={req.id}
                                            className="bg-white/[0.02] border  !border-gray-700  border-l-4 border-l-[#9dff50] rounded-[20px] p-5 backdrop-blur-md transition-all duration-300 hover:translate-x-1 hover:bg-white/[0.04] hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)]"
                                        >
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                                                <div className="relative pl-6 flex-1 min-w-0">
                                                    <div className="absolute left-[4px] top-[6px] bottom-[6px] w-[2px] bg-gradient-to-b from-[#9dff50] to-red-500/40"></div>

                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-2.5 h-2.5 bg-[#9dff50] rounded-full shrink-0 shadow-[0_0_8px_#9dff50]"></div>
                                                        <p className="text-[#e0e0e0] text-[14px] font-medium truncate m-0">{req.pickup}</p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full shrink-0 shadow-[0_0_8px_#ff4444]"></div>
                                                        <p className="text-[#e0e0e0] text-[14px] font-medium truncate m-0">{req.destination}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row md:flex-col justify-between items-center md:items-end shrink-0 gap-2 border-t  !border-gray-700  pt-3 md:border-none md:pt-0">
                                                    <div>{getStatusBadge(req.status)}</div>
                                                    <h4 className="text-[#9dff50] text-xl font-black tracking-wide mt-1">
                                                        Rs. {req.fare}
                                                    </h4>
                                                </div>

                                            </div>

                                            <div className="mt-4 pt-3 border-t  !border-gray-700  flex justify-between text-[#555555] text-[11px] font-bold tracking-wider uppercase">
                                                <span>ID: #{req.id.slice(0, 8).toUpperCase()}</span>
                                                <span>
                                                    {req.createdAt?.toDate() ? req.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Processing...'}
                                                </span>
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-[24px] py-16 text-center">
                                    <p className="text-[#555555] text-sm font-medium">No ride history found yet.</p>
                                </div>
                            )}
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default StudentProfile;