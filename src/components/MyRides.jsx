import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import { FaCar, FaClock, FaUsers, FaTrash, FaMapMarkerAlt, FaRoad } from 'react-icons/fa';
import { db, auth } from '../config/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, orderBy } from 'firebase/firestore';
import './MyRides.css';

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
        <div className="loader-box">
            <Spinner animation="border" style={{ color: '#9dff50' }} />
        </div>
    );

    return (
        <div className="my-rides-wrapper">
            <Container className="py-5">
                <div className="d-flex justify-content-between align-items-center mb-5">
                    <div>
                        <h2 className="neon-text-green fw-bold mb-0">MY POSTED RIDES</h2>
                        <p className="text-muted">Manage your active and past ride offers</p>
                    </div>
                    <Badge className="ride-count-badge">{myRides.length} Total</Badge>
                </div>

                <Row className="g-4">
                    {myRides.length > 0 ? (
                        myRides.map((ride) => (
                            <Col key={ride.id} xs={12} lg={6}>
                                <Card className="ride-manage-card">
                                    <Card.Body className="p-4">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="vehicle-info-box">
                                                <h5 className="text-white fw-bold mb-0">
                                                    <FaCar className="neon-text-green me-2" /> {ride.vehicleName}
                                                </h5>
                                                <small className="text-muted">{ride.vehicleNumber}</small>
                                            </div>
                                            <Badge bg="dark" className="border border-success text-success px-3 py-2">
                                                {ride.status?.toUpperCase() || "ACTIVE"}
                                            </Badge>
                                        </div>

                                        <div className="route-visual-neon my-4">
                                            <div className="point">
                                                <FaMapMarkerAlt className="text-success" />
                                                <span className="address text-truncate">{ride.pickup}</span>
                                            </div>
                                            <div className="connecting-line"></div>
                                            <div className="point">
                                                <FaMapMarkerAlt className="text-danger" />
                                                <span className="address text-truncate">{ride.destination}</span>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mt-4">
                                            <div className="d-flex gap-3">
                                                <div className="ride-meta">
                                                    <FaClock className="neon-text-green me-1" />
                                                    <span>{ride.time}</span>
                                                </div>
                                                <div className="ride-meta">
                                                    <FaUsers className="neon-text-green me-1" />
                                                    <span>{ride.seats} Seats</span>
                                                </div>
                                            </div>
                                            <Button 
                                                variant="outline-danger" 
                                                className="btn-delete-neon"
                                                onClick={() => handleDeleteRide(ride.id)}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    ) : (
                        <div className="text-center py-5 empty-state-neon w-100">
                            <FaRoad size={50} className="text-muted mb-3" />
                            <h4 className="text-muted">Aapne koi ride post nahi ki.</h4>
                            <p className="text-muted small">Dashboard par jayen aur apni pehli ride offer karein!</p>
                        </div>
                    )}
                </Row>
            </Container>
        </div>
    );
};

export default MyRides;