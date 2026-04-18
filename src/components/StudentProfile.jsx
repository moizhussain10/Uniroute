import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ListGroup, Spinner, Button } from 'react-bootstrap';
import { FaUserCircle, FaEnvelope, FaHistory, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaMapMarkerAlt, FaPhoneAlt } from 'react-icons/fa';
import { auth, db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import './StudentProfile.css';

const StudentProfile = () => {
    const [user, setUser] = useState(null);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUser(currentUser);
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
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, []);

    const getStatusBadge = (status) => {
        const commonClass = "rounded-pill px-3 py-2 status-badge fw-600";
        switch (status) {
            case 'accepted': return <Badge bg="success" className={commonClass}><FaCheckCircle className="me-1" /> Accepted</Badge>;
            case 'rejected': return <Badge bg="danger" className={commonClass}><FaTimesCircle className="me-1" /> Rejected</Badge>;
            case 'expired': return <Badge bg="secondary" className={commonClass}><FaClock className="me-1" /> Expired</Badge>;
            default: return <Badge bg="warning" text="dark" className={commonClass}><FaClock className="me-1" /> Pending</Badge>;
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <Spinner animation="grow" variant="primary" />
        </div>
    );

    return (
        <div className="profile-main-wrapper py-4 py-md-5">
            <Container fluid className="px-md-5">
                {/* g-lg-5 se sidebar aur history ke darmiyan gap barh jayega */}
                <Row className="g-4 g-lg-5">

                    {/* Sidebar: Profile Info */}
                    <Col xs={12} lg={4} xl={3} className="user-info-card">
                        <Card className="profile-sidebar-card border-0 shadow-sm text-center p-4">
                            <div className="mb-4">
                                <div className="avatar-wrapper">
                                    <FaUserCircle size={100} className="text-primary opacity-75" />
                                </div>
                            </div>
                            <h3 className="fw-bold mb-1 text-dark">{user?.displayName || "Student Name"}</h3>
                            <p className="text-muted fw-medium mb-4">Aptech Passenger</p>

                            <div className="profile-details-box text-start p-3 rounded-4 bg-light mb-4">
                                <div className="d-flex align-items-center mb-3">
                                    <div className="detail-icon-bg me-3"><FaEnvelope size={14} /></div>
                                    <div className="text-truncate">
                                        <small className="text-muted d-block">Email Address</small>
                                        <span className="fw-bold text-dark">{user?.email}</span>
                                    </div>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className="detail-icon-bg me-3"><FaCalendarAlt size={14} /></div>
                                    <div>
                                        <small className="text-muted d-block">Member Since</small>
                                        <span className="fw-bold text-dark">
                                            {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-GB') : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button variant="primary" className="w-100 py-3 rounded-4 fw-bold shadow-sm">
                                Edit Profile Details
                            </Button>
                        </Card>
                    </Col>

                    {/* Main Content: Requests History */}
                    <Col xs={12} lg={8} xl={9}>
                        <Card className="history-main-card border-0 shadow-sm p-4 w-100">
                            <div className="d-flex align-items-center justify-content-between mb-5">
                                <div className="d-flex align-items-center">
                                    <div className="history-header-icon me-3">
                                        <FaHistory size={22} />
                                    </div>
                                    <h4 className="fw-bold mb-0 text-dark">Ride Activity History</h4>
                                </div>
                                <Badge bg="primary" className="rounded-pill px-3 py-2">Total: {myRequests.length}</Badge>
                            </div>

                            {myRequests.length > 0 ? (
                                <ListGroup variant="flush" className="gap-4">
                                    {myRequests.map((req) => (
                                        <ListGroup.Item key={req.id} className="border-0 p-0">
                                            <div className="ride-history-item p-4 border rounded-4 bg-white shadow-hover transition-3s">
                                                <Row className="align-items-center">
                                                    <Col md={8}>
                                                        {/* Locations Section - Font size increased */}
                                                        <div className="location-route-box">
                                                            <div className="d-flex align-items-start gap-3 mb-3">
                                                                <div className="loc-icon-wrapper pickup"><FaMapMarkerAlt size={16} /></div>
                                                                <div>
                                                                    <small className="text-muted d-block">Pickup Point</small>
                                                                    <span className="fw-bold fs-6 text-dark address-text">{req.pickup}</span>
                                                                </div>
                                                            </div>
                                                            <div className="d-flex align-items-start gap-3">
                                                                <div className="loc-icon-wrapper destination"><FaMapMarkerAlt size={16} /></div>
                                                                <div>
                                                                    <small className="text-muted d-block">Drop-off Destination</small>
                                                                    <span className="fw-bold fs-6 text-dark address-text">{req.destination}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                    <Col md={4} className="text-md-end mt-4 mt-md-0">
                                                        <div className="status-fare-wrapper">
                                                            <div className="mb-3">{getStatusBadge(req.status)}</div>
                                                            <div className="fare-display mb-3">
                                                                <span className="text-muted small me-2">Amount Paid</span>
                                                                <h4 className="fw-extrabold text-primary mb-0 d-inline">Rs. {req.fare}</h4>
                                                            </div>
                                                            {req.status === 'accepted' && (
                                                                <Button variant="info" className="text-white rounded-pill px-4 fw-bold">
                                                                    <FaPhoneAlt className="me-2" size={12} /> Contact Driver
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <div className="mt-4 pt-3 border-top d-flex justify-content-between align-items-center">
                                                    <span className="text-muted small">
                                                        Booking ID: <span className="text-dark fw-medium">#{req.id.slice(0, 8).toUpperCase()}</span>
                                                    </span>
                                                    <span className="text-muted small fw-medium bg-light px-3 py-1 rounded-pill">
                                                        {req.createdAt?.toDate() ? req.createdAt.toDate().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Pending...'}
                                                    </span>
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-5">
                                    <img src="https://illustrations.popsy.co/flat/empty-state.svg" alt="no-data" style={{ width: '180px', opacity: 0.6 }} className="mb-4" />
                                    <h5 className="text-muted">No ride history found.</h5>
                                    <p className="text-muted small">Once you start booking rides, they will appear here.</p>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default StudentProfile;