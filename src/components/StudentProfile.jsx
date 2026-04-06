import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, ListGroup, Spinner, Button } from 'react-bootstrap';
import { FaUserCircle, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHistory, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import { auth, db } from '../config/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';

const StudentProfile = () => {
    const [user, setUser] = useState(null);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUser(currentUser);

            // Real-time listener for student's own requests
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
        switch (status) {
            case 'accepted': return <Badge bg="success" className="rounded-pill px-3"><FaCheckCircle className="me-1"/> Accepted</Badge>;
            case 'rejected': return <Badge bg="danger" className="rounded-pill px-3"><FaTimesCircle className="me-1"/> Rejected</Badge>;
            default: return <Badge bg="warning" text="dark" className="rounded-pill px-3"><FaClock className="me-1"/> Pending</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                <Spinner animation="grow" variant="primary" />
            </div>
        );
    }

    return (
        <div className="light-vibrant-bg py-5" style={{ minHeight: '100vh', background: '#f0f2f5' }}>
            <Container className="animate-slide-up">
                <Row className="justify-content-center">
                    {/* User Info Card */}
                    <Col lg={4} className="mb-4">
                        <Card className="border-0 shadow-sm text-center p-4" style={{ borderRadius: '25px' }}>
                            <div className="mb-3">
                                <FaUserCircle size={100} className="text-primary opacity-75" />
                            </div>
                            <h4 className="fw-bold mb-1">{user?.displayName || "Student Name"}</h4>
                            <p className="text-muted small mb-3">Student / Passenger</p>
                            <hr />
                            <div className="text-start mt-3">
                                <p className="mb-2 small"><FaEnvelope className="me-2 text-primary"/> {user?.email}</p>
                                <p className="mb-2 small"><FaCalendarAlt className="me-2 text-primary"/> Joined: {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
                            </div>
                            <Button variant="outline-primary" size="sm" className="mt-3 rounded-pill">Edit Profile</Button>
                        </Card>
                    </Col>

                    {/* Ride History / Requests Card */}
                    <Col lg={8}>
                        <Card className="border-0 shadow-sm p-4" style={{ borderRadius: '25px' }}>
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-primary text-white p-2 rounded-3 me-3">
                                    <FaHistory size={20} />
                                </div>
                                <h5 className="fw-bold mb-0">My Ride Requests</h5>
                            </div>

                            {myRequests.length > 0 ? (
                                <ListGroup variant="flush">
                                    {myRequests.map((req) => (
                                        <ListGroup.Item key={req.id} className="border-0 px-0 mb-3">
                                            <div className="p-3 border rounded-4 bg-light shadow-sm transition-all hover-shadow">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <div>
                                                        <div className="d-flex align-items-center gap-2 mb-1">
                                                            <FaMapMarkerAlt className="text-info" size={14} />
                                                            <span className="fw-bold text-dark">{req.pickup}</span>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <FaMapMarkerAlt className="text-danger" size={14} />
                                                            <span className="fw-bold text-dark">{req.destination}</span>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(req.status)}
                                                </div>
                                                
                                                <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                                                    <small className="text-muted">
                                                        Requested on: {req.createdAt?.toDate().toLocaleDateString()}
                                                    </small>
                                                    {req.status === 'accepted' && (
                                                        <Badge bg="info" className="text-white">Contact Driver</Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </ListGroup.Item>
                                    ))}
                                </ListGroup>
                            ) : (
                                <div className="text-center py-5">
                                    <img src="https://illustrations.popsy.co/flat/empty-state.svg" alt="no-data" style={{ width: '150px' }} className="mb-3" />
                                    <p className="text-muted">Aapne abhi tak koi ride request nahi bheji.</p>
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