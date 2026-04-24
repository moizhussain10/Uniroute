import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { FaUserCircle, FaCar, FaIdCard, FaEnvelope, FaCalendarAlt, FaStar, FaEdit, FaShieldAlt } from 'react-icons/fa';
import { auth, db } from '../config/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import './DriverProfile.css'; // Neon theme CSS

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

                console.log(user)
                if (user) {
                    // Firestore se user ka document nikalna
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        console.log("Fetched User Data:", data); // Debugging ke liye

                        setUserData(data); // Yahan pura data save ho raha hai (including name)

                        setEditData({
                            vehicleName: data.vehicleName || "Honda 125",
                            vehicleNumber: data.vehicleNumber || "KAE-XXXX"
                        });
                    }

                    // Rides count fetch karna
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

    console.log(userData)

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
        <div className="d-flex flex-column justify-content-center align-items-center" style={{height: '80vh', background: '#000'}}>
            <Spinner animation="border" style={{color: '#9dff50'}} />
            <p className="mt-3" style={{color: '#9dff50', letterSpacing: '2px'}}>LOADING PROFILE...</p>
        </div>
    );

    return (
        <Container className="profile-container py-4" >
            <Row>
                <Col lg={10}>
                    {/* --- Profile Header Card --- */}
                    <Card className="glass-panel profile-header-card mb-4">
                        <Card.Body className="text-center p-0">
                            <div className="profile-cover"></div>
                            <div className="profile-avatar-wrapper">
                                <FaUserCircle size={110} className="profile-icon" />
                                <div className="online-indicator"></div>
                            </div>
                            <div className="pb-4 pt-2">
                                <h2 className="neon-text-main fw-bold mb-1 text-uppercase">{userData?.name || "Driver Name"}</h2>
                                <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                                    <Badge className="badge-neon"><FaShieldAlt className="me-1" /> Verified Driver</Badge>
                                </div>

                                <div className="stats-row d-flex justify-content-center gap-5 mt-4">
                                    <div className="stat-item">
                                        <h4 className="fw-bold neon-text-blue mb-0">{rideCount}</h4>
                                        <small className="text-muted text-uppercase">Rides</small>
                                    </div>
                                    <div className="stat-divider"></div>
                                    <div className="stat-item">
                                        <h4 className="fw-bold neon-text-yellow mb-0">4.8 <FaStar size={14} /></h4>
                                        <small className="text-muted text-uppercase">Rating</small>
                                    </div>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Row>
                        {/* --- Personal Info --- */}
                        <Col md={6} className="mb-4">
                            <Card className="glass-panel h-100">
                                <Card.Body>
                                    <h5 className="section-title mb-4"><FaIdCard className="me-2" /> Information</h5>
                                    <div className="info-box mb-3">
                                        <FaEnvelope className="info-icon" />
                                        <div>
                                            <span>Email Address</span>
                                            <h6>{auth.currentUser?.email}</h6>
                                        </div>
                                    </div>
                                    <div className="info-box mb-3">
                                        <FaCalendarAlt className="info-icon" />
                                        <div>
                                            <span>Phone Number</span>
                                            <h6>{userData.phone}</h6>
                                        </div>
                                    </div>
                                    <div className="info-box mb-3">
                                        <FaCalendarAlt className="info-icon" />
                                        <div>
                                            <span>Member Since</span>
                                            <h6>April 2026</h6>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* --- Vehicle Info --- */}
                        <Col md={6} className="mb-4">
                            <Card className="glass-panel h-100">
                                <Card.Body className="d-flex flex-column">
                                    <h5 className="section-title mb-4"><FaCar className="me-2" /> Primary Vehicle</h5>
                                    <div className="vehicle-display mb-3">
                                        <div className="vehicle-badge">Active</div>
                                        <FaCar size={40} className="mb-2" style={{ color: '#9dff50' }} />
                                        <h4 className="fw-bold mb-0 text-white">{userData?.vehicleName || "Honda 125"}</h4>
                                        <p className="vehicle-number">{userData?.vehicleNumber || "KAE-XXXX"}</p>
                                    </div>
                                    <Button className="btn-neon-edit mt-auto" onClick={() => setShowEditModal(true)}>
                                        <FaEdit className="me-2" /> Update Details
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <button className="deactivate-link">Deactivate UniRoute Account</button>
                </Col>
            </Row>

            {/* --- Dark Edit Modal --- */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered className="dark-modal">
                <Modal.Header closeButton closeVariant="white" className="border-0 bg-dark text-white">
                    <Modal.Title className="fw-bold neon-text-main">Update Vehicle</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark p-4">
                    <Form onSubmit={handleUpdate}>
                        <Form.Group className="mb-3">
                            <Form.Label className="neon-label">Vehicle Name</Form.Label>
                            <Form.Control
                                type="text"
                                className="neon-input"
                                value={editData.vehicleName}
                                onChange={(e) => setEditData({ ...editData, vehicleName: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="neon-label">Number Plate</Form.Label>
                            <Form.Control
                                type="text"
                                className="neon-input"
                                value={editData.vehicleNumber}
                                onChange={(e) => setEditData({ ...editData, vehicleNumber: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="btn-neon-submit w-100 py-3" disabled={isUpdating}>
                            {isUpdating ? <Spinner animation="border" size="sm" /> : "CONFIRM UPDATE"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default DriverProfile;