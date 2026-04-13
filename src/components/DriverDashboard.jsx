import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Spinner, InputGroup } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { FaMapMarkedAlt, FaCheckCircle, FaCar, FaClock, FaUsers, FaArrowRight, FaSearch, FaIdCard, FaPalette, FaUserCircle } from 'react-icons/fa';
import { auth, db } from '../config/firebase';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import L from 'leaflet';

// Leaflet Icon Fix
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, 14);
    return null;
}

function MapClickHandler({ setPosition }) {
    useMapEvents({ click(e) { setPosition([e.latlng.lat, e.latlng.lng]); } });
    return null;
}

const DriverDashboard = () => {
    const [loading, setLoading] = useState(false);
    const [showMap, setShowMap] = useState(false);
    const [targetType, setTargetType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [pickup, setPickup] = useState({ coords: null, address: '' });
    const [dest, setDest] = useState({ coords: null, address: '' });
    const [tempPos, setTempPos] = useState([24.8607, 67.0011]);
    const [requests, setRequests] = useState([]);

    const provider = new OpenStreetMapProvider();

    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        const user = auth.currentUser;
        if (user) {
            const q = query(
                collection(db, "requests"),
                where("driverId", "==", user.uid),
                where("status", "==", "pending")
            );

            const unsubscribe = onSnapshot(q, (snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                        const newReq = change.doc.data();
                        if (Notification.permission === "granted") {
                            const notification = new Notification("UniRoute: Nayi Request! 🚗", {
                                body: `${newReq.passengerEmail} ne ride request bheji hai.`,
                                icon: "/favicon.ico",
                            });
                            notification.onclick = () => window.focus();
                        }
                        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
                        audio.play().catch(err => console.log("Audio play error:", err));
                    }
                });
                setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            });
            return () => unsubscribe();
        }
    }, []);

    const handleAction = async (requestId, action) => {
        try {
            const requestRef = doc(db, "requests", requestId);
            await updateDoc(requestRef, { status: action });
            alert(`Request ${action === 'accepted' ? 'Accepted ✅' : 'Rejected ❌'}`);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleMapSearch = async (e) => {
        if (e) e.preventDefault();
        if (!searchQuery) return;
        try {
            const results = await provider.search({ query: searchQuery });
            if (results && results.length > 0) {
                setTempPos([results[0].y, results[0].x]);
            }
        } catch (error) { console.error("Search error:", error); }
    };

    const handleConfirmLocation = async () => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${tempPos[0]}&lon=${tempPos[1]}`);
            const data = await res.json();
            const address = data.display_name.split(',').slice(0, 3).join(',');
            if (targetType === 'pickup') setPickup({ coords: tempPos, address });
            else setDest({ coords: tempPos, address });
            setShowMap(false);
            setSearchQuery('');
        } catch (error) { alert("Location select karne mein masla hua."); }
    };

    const handlePostRide = async (e) => {
        e.preventDefault();
        const form = e.target;
        if (!pickup.coords || !dest.coords) return alert("Pehle Map se rasta select karein!");

        setLoading(true);
        try {
            await addDoc(collection(db, "rides"), {
                pickup: pickup.address,
                pickupCoords: pickup.coords,
                destination: dest.address,
                destCoords: dest.coords,
                time: form.time.value,
                seats: form.seats.value,
                vehicleName: form.vehicleName.value,
                vehicleNumber: form.vehicleNumber.value,
                driverId: auth.currentUser.uid,
                status: 'available',
                createdAt: serverTimestamp()
            });
            alert("Ride Successfully Posted! 🚀");
            setPickup({ coords: null, address: '' });
            setDest({ coords: null, address: '' });
            form.reset();
        } catch (err) { alert("Error: " + err.message); }
        setLoading(false);
    };

    return (
        <div className="light-vibrant-bg py-4 py-md-5">
            <Container className="animate-slide-up">
                <div className="text-center mb-4 mb-md-5">
                    <h2 className="fw-bold px-2" style={{ color: '#2c3e50' }}>DRIVER DASHBOARD <FaPalette className="ms-2 text-primary d-none d-sm-inline" /></h2>
                    <p className="text-muted small px-3">Apni ride ki details enter karein aur passengers dhoondein.</p>
                </div>

                <Row className="justify-content-center mx-0">
                    <Col xs={12} lg={10} xl={9}>
                        <Card className="border-0 shadow-sm p-3 p-md-5 mb-5" style={{ borderRadius: '20px', background: '#fff' }}>
                            <Form onSubmit={handlePostRide}>
                                <h5 className="mb-4 text-primary border-bottom pb-2">1. Route Selection</h5>
                                <Row className="g-3 mb-5">
                                    <Col xs={12} md={6}>
                                        <div
                                            className={`p-3 border rounded-4 d-flex align-items-center gap-3 transition-all h-100 ${pickup.coords ? 'bg-light border-info' : 'bg-white'}`}
                                            onClick={() => { setTargetType('pickup'); setShowMap(true); }}
                                            style={{ cursor: 'pointer', transition: '0.3s' }}
                                        >
                                            <FaMapMarkedAlt size={24} className="text-info flex-shrink-0" />
                                            <div className="overflow-hidden">
                                                <h6 className="mb-1 text-dark small fw-bold">Starting Point</h6>
                                                <p className="small text-muted mb-0 text-truncate">{pickup.address || "Tap to select on map"}</p>
                                            </div>
                                            {pickup.coords && <FaCheckCircle className="ms-auto text-success flex-shrink-0" />}
                                        </div>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <div
                                            className={`p-3 border rounded-4 d-flex align-items-center gap-3 transition-all h-100 ${dest.coords ? 'bg-light border-danger' : 'bg-white'}`}
                                            onClick={() => { setTargetType('destination'); setShowMap(true); }}
                                            style={{ cursor: 'pointer', transition: '0.3s' }}
                                        >
                                            <FaMapMarkedAlt size={24} className="text-danger flex-shrink-0" />
                                            <div className="overflow-hidden">
                                                <h6 className="mb-1 text-dark small fw-bold">Final Destination</h6>
                                                <p className="small text-muted mb-0 text-truncate">{dest.address || "Tap to select on map"}</p>
                                            </div>
                                            {dest.coords && <FaCheckCircle className="ms-auto text-success flex-shrink-0" />}
                                        </div>
                                    </Col>
                                </Row>

                                <h5 className="mb-4 text-primary border-bottom pb-2">2. Ride Details</h5>
                                <Row className="g-3">
                                    <Col xs={12} md={6} lg={4}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-secondary"><FaCar className="me-1" /> Vehicle Name</Form.Label>
                                            <Form.Control name="vehicleName" required placeholder="e.g. Honda 125" style={{ borderRadius: '10px', padding: '12px' }} />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={12} md={6} lg={4}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-secondary"><FaIdCard className="me-1" /> Plate Number</Form.Label>
                                            <Form.Control name="vehicleNumber" required placeholder="KAE-1234" style={{ borderRadius: '10px', padding: '12px' }} />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={6} md={6} lg={2}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-secondary"><FaClock className="me-1" /> Time</Form.Label>
                                            <Form.Control name="time" type="time" required style={{ borderRadius: '10px', padding: '12px' }} />
                                        </Form.Group>
                                    </Col>
                                    <Col xs={6} md={6} lg={2}>
                                        <Form.Group>
                                            <Form.Label className="small fw-bold text-secondary"><FaUsers className="me-1" /> Seats</Form.Label>
                                            <Form.Select name="seats" style={{ borderRadius: '10px', padding: '12px' }}>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Button type="submit" disabled={loading} className="btn-primary w-100 mt-5 py-3 fw-bold shadow-sm" style={{ borderRadius: '12px', fontSize: '1.1rem' }}>
                                    {loading ? <Spinner animation="border" size="sm" /> : "POST RIDE NOW"} <FaArrowRight className="ms-2" />
                                </Button>
                            </Form>
                        </Card>

                        <div className="mt-4 px-2">
                            <h4 className="fw-bold mb-4" style={{ color: '#2c3e50' }}>Incoming Requests 🔔</h4>
                            {requests.length > 0 ? (
                                requests.map((req) => (
                                    <Card key={req.id} className="border-0 shadow-sm mb-3 p-3 animate-slide-up" style={{ borderRadius: '15px', borderLeft: '5px solid #0d6efd' }}>
                                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                                            <div className="d-flex align-items-center">
                                                <FaUserCircle size={40} className="text-secondary me-3 flex-shrink-0" />
                                                <div className="overflow-hidden">
                                                    <h6 className="mb-0 fw-bold text-truncate">{req.passengerEmail}</h6>
                                                    <small className="text-muted d-block text-truncate">{req.pickup} → {req.destination}</small>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2 w-100 w-md-auto">
                                                <Button variant="success" size="sm" className="px-3 rounded-pill fw-bold flex-grow-1" onClick={() => handleAction(req.id, 'accepted')}>Accept</Button>
                                                <Button variant="outline-danger" size="sm" className="px-3 rounded-pill fw-bold flex-grow-1" onClick={() => handleAction(req.id, 'rejected')}>Reject</Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center py-5 bg-white rounded-4 shadow-sm border">
                                    <p className="text-muted mb-0 small">Abhi tak koi nayi request nahi aayi.</p>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>

                <Modal show={showMap} onHide={() => setShowMap(false)} centered size="lg" fullscreen="sm-down">
                    <Modal.Header closeButton className="border-0">
                        <Form className="w-100 me-2" onSubmit={handleMapSearch}>
                            <InputGroup>
                                <Form.Control
                                    placeholder="Search location..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ borderRadius: '10px 0 0 10px' }}
                                />
                                <Button variant="primary" type="submit" style={{ borderRadius: '0 10px 10px 0' }}>
                                    <FaSearch />
                                </Button>
                            </InputGroup>
                        </Form>
                    </Modal.Header>
                    <Modal.Body className="p-0">
                        <div style={{ height: '60vh', minHeight: '300px', width: '100%' }}>
                            <MapContainer center={tempPos} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <ChangeView center={tempPos} />
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={tempPos} icon={DefaultIcon} />
                                <MapClickHandler setPosition={setTempPos} />
                            </MapContainer>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-0 p-3">
                        <Button variant="light" className="flex-grow-1" onClick={() => setShowMap(false)}>Cancel</Button>
                        <Button variant="primary" className="px-4 flex-grow-1" onClick={handleConfirmLocation}>Confirm</Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default DriverDashboard;