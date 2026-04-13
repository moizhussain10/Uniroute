import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ListGroup, Spinner, Button } from 'react-bootstrap';
import { FaUserCircle, FaEnvelope, FaHistory, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { auth, db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import './StudentProfile.css'; // CSS Import zaroor karein

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
        const commonClass = "rounded-pill px-3 status-badge";
        switch (status) {
            case 'accepted': return <Badge bg="success" className={commonClass}><FaCheckCircle className="me-1"/> Accepted</Badge>;
            case 'rejected': return <Badge bg="danger" className={commonClass}><FaTimesCircle className="me-1"/> Rejected</Badge>;
            case 'expired': return <Badge bg="secondary" className={commonClass}><FaClock className="me-1"/> Expired</Badge>;
            default: return <Badge bg="warning" text="dark" className={commonClass}><FaClock className="me-1"/> Pending</Badge>;
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <Spinner animation="grow" variant="primary" />
        </div>
    );

    return (
        <div className="py-4 py-md-5" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
            <Container className="profile-container">
                <Row className="justify-content-center">
                    
                    {/* Sidebar: Profile Info */}
                    <Col xs={12} lg={4} className="user-info-card mb-4">
                        <Card className="border-0 shadow-sm text-center p-4 h-100" style={{ borderRadius: '25px' }}>
                            <div className="mb-3">
                                <FaUserCircle size={80} className="text-primary opacity-75" />
                            </div>
                            <h4 className="fw-bold mb-1" style={{ fontSize: '1.25rem' }}>{user?.displayName || "Student Name"}</h4>
                            <p className="text-muted small mb-3">Aptech Passenger</p>
                            <hr className="opacity-50" />
                            <div className="text-start mt-3">
                                <p className="mb-2 text-truncate" style={{ fontSize: '0.85rem' }}>
                                    <FaEnvelope className="me-2 text-primary"/> {user?.email}
                                </p>
                                <p className="mb-0 small">
                                    <FaCalendarAlt className="me-2 text-primary"/> 
                                    Joined: {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}
                                </p>
                            </div>
                            <Button variant="outline-primary" size="sm" className="mt-4 rounded-pill w-100 fw-bold">Edit Profile</Button>
                        </Card>
                    </Col>

                    {/* Main Content: Requests History */}
                    <Col xs={12} lg={8}>
                        <Card className="border-0 shadow-sm p-3 p-md-4" style={{ borderRadius: '25px' }}>
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-primary text-white p-2 rounded-3 me-3 d-flex align-items-center">
                                    <FaHistory size={18} />
                                </div>
                                <h5 className="fw-bold mb-0">Ride History</h5>
                            </div>

                            {myRequests.length > 0 ? (
                                <ListGroup variant="flush">
                                    {myRequests.map((req) => (
                                        <ListGroup.Item key={req.id} className="border-0 px-0 mb-3">
                                            <div className="request-item-inner p-3 border rounded-4 bg-white shadow-sm hover-shadow">
                                                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start gap-2">
                                                    <div className="w-100">
                                                        <div className="d-flex align-items-start gap-2 mb-2">
                                                            <FaMapMarkerAlt className="text-info mt-1" size={14} />
                                                            <span className="fw-bold text-dark small location-text">{req.pickup}</span>
                                                        </div>
                                                        <div className="d-flex align-items-start gap-2">
                                                            <FaMapMarkerAlt className="text-danger mt-1" size={14} />
                                                            <span className="fw-bold text-dark small location-text">{req.destination}</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-2 mt-sm-0">
                                                        {getStatusBadge(req.status)}
                                                    </div>
                                                </div>
                                                
                                                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                                        {req.createdAt?.toDate() ? req.createdAt.toDate().toLocaleDateString('en-GB') : 'Just now'}
                                                    </small>
                                                    <div className="d-flex gap-2">
                                                        <span className="fw-bold text-primary small">Rs. {req.fare}</span>
                                                        {req.status === 'accepted' && (
                                                            <Badge bg="info" className="text-white small" style={{ cursor: 'pointer' }}>Call</Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-5">
                                    <img src="https://illustrations.popsy.co/flat/empty-state.svg" alt="no-data" style={{ width: '120px', opacity: 0.6 }} className="mb-3" />
                                    <p className="text-muted small">No ride requests found in your history.</p>
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