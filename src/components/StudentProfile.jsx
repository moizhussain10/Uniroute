import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ListGroup, Spinner, Button } from 'react-bootstrap';
import { FaUserCircle, FaEnvelope, FaHistory, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaMapMarkerAlt, FaPhoneAlt, FaEdit } from 'react-icons/fa';
import { auth, db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, getDoc } from 'firebase/firestore';
import './StudentProfile.css';

const StudentProfile = () => {
    const [userData, setUserData] = useState(null);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            // Dono data fetch hone ka track rakhne ke liye
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

                // Profile fetch hone ke baad hi loading khatam karein
                fetchProfile().then(() => setLoading(false));
            });

            return () => unsubscribe();
        }
    }, []);

    const getStatusBadge = (status) => {
        const commonClass = "rounded-pill px-3 py-2 status-badge-neon fw-bold";
        switch (status) {
            case 'accepted': return <Badge className={`${commonClass} bg-neon-success`}><FaCheckCircle className="me-1" /> Accepted</Badge>;
            case 'rejected': return <Badge className={`${commonClass} bg-neon-danger`}><FaTimesCircle className="me-1" /> Rejected</Badge>;
            default: return <Badge className={`${commonClass} bg-neon-warning`}><FaClock className="me-1" /> Pending</Badge>;
        }
    };

    if (loading) return (
        <div className="loader-container">
            <Spinner animation="border" style={{ color: '#9dff50' }} />
        </div>
    );

    return (
        <div className="student-profile-main">
            <Container className="py-5">
                <Row className="g-4">
                    {/* --- Profile Sidebar (Neon Glass) --- */}
                    <Col xs={12} lg={4}>
                        <div className="neon-profile-card text-center">
                            <div className="avatar-section mb-4">
                                <div className="neon-avatar-ring">
                                    <FaUserCircle size={90} color="#9dff50" />
                                </div>
                            </div>
                            <h3 className="neon-text-green fw-bold mb-1">
                                {userData?.name || auth.currentUser?.displayName || "Student"}
                            </h3>
                            <p className="text-muted small letter-spacing-1 mb-4 text-uppercase">Member Pass #8291</p>

                            <div className="profile-info-list text-start mb-4">
                                <div className="info-item">
                                    <FaEnvelope className="neon-icon-sm" />
                                    <div>
                                        <small className="d-block text-muted">EMAIL</small>
                                        <span className="text-white small">{auth.currentUser?.email}</span>
                                    </div>
                                </div>
                                <div className="info-item mt-3">
                                    <FaEnvelope className="neon-icon-sm" />
                                    <div>
                                        <small className="d-block text-muted">Phone Number</small>
                                        <span className="text-white small">{userData.phone}</span>
                                    </div>
                                </div>
                                <div className="info-item mt-3">
                                    <FaCalendarAlt className="neon-icon-sm" />
                                    <div>
                                        <small className="d-block text-muted">JOINED</small>
                                        <span className="text-white small">
                                            {auth.currentUser?.metadata.creationTime ? new Date(auth.currentUser.metadata.creationTime).toLocaleDateString('en-GB') : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button className="btn-neon-outline w-100 py-3">
                                <FaEdit className="me-2" /> EDIT PROFILE
                            </Button>
                        </div>
                    </Col>

                    {/* --- History Section --- */}
                    <Col xs={12} lg={8}>
                        <div className="history-header d-flex justify-content-between align-items-center mb-4">
                            <h4 className="neon-text-green mb-0 fw-bold"><FaHistory className="me-2" /> RIDE HISTORY</h4>
                            <Badge className="total-badge">Total Trips: {myRequests.length}</Badge>
                        </div>

                        {myRequests.length > 0 ? (
                            <div className="history-stack">
                                {myRequests.map((req) => (
                                    <div key={req.id} className="history-neon-item">
                                        <div className="p-4">
                                            <Row className="align-items-center">
                                                <Col md={8}>
                                                    <div className="route-display">
                                                        <div className="route-point">
                                                            <div className="dot green"></div>
                                                            <p className="address-text m-0">{req.pickup}</p>
                                                        </div>
                                                        <div className="route-line-neon"></div>
                                                        <div className="route-point">
                                                            <div className="dot red"></div>
                                                            <p className="address-text m-0">{req.destination}</p>
                                                        </div>
                                                    </div>
                                                </Col>
                                                <Col md={4} className="text-md-end mt-3 mt-md-0">
                                                    <div className="mb-2">{getStatusBadge(req.status)}</div>
                                                    <h4 className="fare-text mb-0">Rs. {req.fare}</h4>
                                                </Col>
                                            </Row>
                                            <div className="item-footer mt-3 pt-3 border-top-dark d-flex justify-content-between">
                                                <span className="text-muted small">ID: #{req.id.slice(0, 8).toUpperCase()}</span>
                                                <span className="text-muted small">
                                                    {req.createdAt?.toDate() ? req.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : 'Processing...'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-neon-state">
                                <p className="text-muted">No ride history found yet.</p>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default StudentProfile;