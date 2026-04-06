import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { FaUserCircle, FaCar, FaIdCard, FaEnvelope, FaCalendarAlt, FaStar, FaEdit } from 'react-icons/fa';
import { auth, db } from '../config/firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

const DriverProfile = () => {
    const [userData, setUserData] = useState(null);
    const [rideCount, setRideCount] = useState(0);
    const [loading, setLoading] = useState(true);

    // --- Edit Logic States ---
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
                        // Modal ke inputs mein purana data pehle se show ho
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

    // --- Update Function ---
    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const userRef = doc(db, "users", auth.currentUser.uid);
            await updateDoc(userRef, {
                vehicleName: editData.vehicleName,
                vehicleNumber: editData.vehicleNumber
            });

            // State update karein taake UI pe foran nazar aaye
            setUserData({ 
                ...userData, 
                vehicleName: editData.vehicleName, 
                vehicleNumber: editData.vehicleNumber 
            });
            
            setShowEditModal(false);
            alert("Vehicle details updated successfully! 🚀");
        } catch (error) {
            alert("Update fail ho gaya: " + error.message);
        } finally {
            setIsUpdating(false);
        }
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
            <Spinner animation="border" variant="primary" />
        </div>
    );

    return (
        <Container className="py-5 animate-slide-up">
            <Row className="justify-content-center">
                <Col lg={10}>
                    {/* Header Section - No Changes */}
                    <Card className="border-0 shadow-sm mb-4 overflow-hidden" style={{ borderRadius: '20px' }}>
                        <div style={{ height: '120px', background: 'linear-gradient(90deg, #007bff, #00c6ff)' }}></div>
                        <Card.Body className="text-center" style={{ marginTop: '-60px' }}>
                            <div className="mb-3">
                                <FaUserCircle size={100} className="bg-white rounded-circle text-secondary shadow-sm" />
                            </div>
                            <h3 className="fw-bold mb-1">{userData?.name || "Driver Name"}</h3>
                            <Badge bg="primary" className="px-3 py-2 rounded-pill">Verified Driver</Badge>
                            <div className="d-flex justify-content-center gap-4 mt-4 text-muted">
                                <div><h5 className="fw-bold text-dark mb-0">{rideCount}</h5><small>Total Rides</small></div>
                                <div style={{borderLeft: '1px solid #eee'}}></div>
                                <div><h5 className="fw-bold text-dark mb-0">4.8 <FaStar className="text-warning mb-1" size={14}/></h5><small>Rating</small></div>
                            </div>
                        </Card.Body>
                    </Card>

                    <Row>
                        {/* Personal Details - No Changes */}
                        <Col md={6} className="mb-4">
                            <Card className="border-0 shadow-sm h-100 p-3" style={{ borderRadius: '15px' }}>
                                <Card.Body>
                                    <h5 className="fw-bold mb-4 text-primary border-bottom pb-2">Personal Information</h5>
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="p-2 bg-light rounded-3 me-3"><FaEnvelope className="text-primary" /></div>
                                        <div><p className="small text-muted mb-0">Email Address</p><h6 className="mb-0">{auth.currentUser?.email}</h6></div>
                                    </div>
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="p-2 bg-light rounded-3 me-3"><FaIdCard className="text-primary" /></div>
                                        <div><p className="small text-muted mb-0">Role</p><h6 className="mb-0 text-capitalize">{userData?.role || "Driver"}</h6></div>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <div className="p-2 bg-light rounded-3 me-3"><FaCalendarAlt className="text-primary" /></div>
                                        <div><p className="small text-muted mb-0">Member Since</p><h6 className="mb-0">April 2026</h6></div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Vehicle Details - Added Button onClick */}
                        <Col md={6} className="mb-4">
                            <Card className="border-0 shadow-sm h-100 p-3" style={{ borderRadius: '15px' }}>
                                <Card.Body>
                                    <h5 className="fw-bold mb-4 text-primary border-bottom pb-2">Primary Vehicle</h5>
                                    <div className="text-center py-3 bg-light rounded-4 mb-3">
                                        <FaCar size={40} className="text-secondary mb-2" />
                                        <h5 className="fw-bold mb-1">{userData?.vehicleName || "Honda 125"}</h5>
                                        <p className="text-muted mb-0">{userData?.vehicleNumber || "KAE-XXXX"}</p>
                                    </div>
                                    <Button 
                                        variant="outline-primary" 
                                        className="w-100 rounded-3 fw-bold mt-2"
                                        onClick={() => setShowEditModal(true)}
                                    >
                                        <FaEdit className="me-2"/> Edit Vehicle Details
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Button variant="danger" className="w-100 py-3 shadow-sm border-0" style={{ borderRadius: '12px', fontWeight: 'bold' }}>
                        DEACTIVATE ACCOUNT
                    </Button>
                </Col>
            </Row>

            {/* --- Edit Vehicle Modal (Light Theme) --- */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-bold">Update Vehicle</Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4 pb-4">
                    <Form onSubmit={handleUpdate}>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-muted">Vehicle Name</Form.Label>
                            <Form.Control 
                                type="text"
                                className="py-2"
                                style={{ borderRadius: '10px' }}
                                value={editData.vehicleName}
                                onChange={(e) => setEditData({...editData, vehicleName: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className="small fw-bold text-muted">Number Plate</Form.Label>
                            <Form.Control 
                                type="text"
                                className="py-2"
                                style={{ borderRadius: '10px' }}
                                value={editData.vehicleNumber}
                                onChange={(e) => setEditData({...editData, vehicleNumber: e.target.value})}
                                required
                            />
                        </Form.Group>
                        <Button 
                            variant="primary" 
                            type="submit" 
                            className="w-100 py-2 fw-bold shadow-sm"
                            style={{ borderRadius: '10px' }}
                            disabled={isUpdating}
                        >
                            {isUpdating ? <Spinner animation="border" size="sm" /> : "Save Changes"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default DriverProfile;