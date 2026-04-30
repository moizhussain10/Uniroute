import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Spinner, Modal } from 'react-bootstrap';
import { FaSearch, FaUserCircle, FaMapMarkerAlt, FaHistory, FaStar, FaRoute, FaWallet } from 'react-icons/fa';
import { db, auth } from '../config/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp, doc, getDoc, deleteDoc } from 'firebase/firestore';
// --- Map Imports ---
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import './StudentDashboard.css';

// Leaflet Icon Fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const RoutingMachine = ({ pickupCoords, destCoords }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !pickupCoords || !destCoords) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(pickupCoords[0], pickupCoords[1]),
        L.latLng(destCoords[0], destCoords[1])
      ],
      lineOptions: {
        styles: [{ color: '#9dff50', weight: 5 }] // Neon Green Route
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false, // Instructions panel ko code level par band karne ke liye
      createMarker: () => null, // Extra markers ko remove karne ke liye agar zaroorat ho
    }).addTo(map);

    return () => map.removeControl(routingControl);
  }, [map, pickupCoords, destCoords]);

  return null;
};

const StudentDashboard = () => {
  const [rides, setRides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [timer, setTimer] = useState(0);
  const [requestingId, setRequestingId] = useState(null);
  const [userName, setUserName] = useState("Student");
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [userPhone, setUserPhone] = useState("");
  const [userPickupCoords, setUserPickupCoords] = useState([24.8607, 67.0011]);
  const [currentModalFare, setCurrentModalFare] = useState(0);

  // --- NEW: Map Click Handler (Yeh missing tha) ---
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const coords = [e.latlng.lat, e.latlng.lng];
        setUserPickupCoords(coords);
        // Jaise hi click ho, Modal ka fare foran update ho jaye
        if (selectedRide) {
          const newFare = calculateFare(coords, selectedRide.destCoords);
          setCurrentModalFare(newFare);
        }
      },
    });
    return userPickupCoords ? <Marker position={userPickupCoords} /> : null;
  };

  const handleOpenMap = (ride) => {
    setSelectedRide(ride);
    // Initial fare base location se calculate karlo taake khali nazar na aaye
    const initialFare = calculateFare(userPickupCoords, ride.destCoords);
    setCurrentModalFare(initialFare);
    setShowMapModal(true);
  };

  // 1. Fetch User and Rides Data
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.name) setUserName(data.name);
          if (data.phone) setUserPhone(data.phone);
        }
      }
    };
    fetchUserData();

    const q = query(collection(db, "rides"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ridesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRides(ridesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Timer Logic
  useEffect(() => {
    let interval = null;
    let unsubscribeRequest = null;

    if (activeRequestId) {
      unsubscribeRequest = onSnapshot(doc(db, "requests", activeRequestId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.status === "accepted") {
            setActiveRequestId(null);
            setTimer(0);
          }
          else if (data.status === "rejected") {
            setActiveRequestId(null);
            setTimer(0);
            alert("Ride Rjected");
          }
      }
      });

  interval = setInterval(() => {
    setTimer((prev) => {
      if (prev <= 1) {
        clearInterval(interval);
        handleCancelRequest(activeRequestId);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
}

return () => {
  if (interval) clearInterval(interval);
  if (unsubscribeRequest) unsubscribeRequest();
};
  }, [activeRequestId]);

const handleCancelRequest = async (reqId) => {
  try {
    const docRef = doc(db, "requests", reqId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().status === "pending") {
      await deleteDoc(docRef);
      alert("Request timed out! Driver ne respond nahi kiya.");
    }
    setActiveRequestId(null);
    setTimer(0);
  } catch (e) {
    console.error("Error:", e);
  }
};

const calculateFare = (pickupCoords, destCoords) => {
  if (!pickupCoords || !destCoords) return 80; // Minimum fare thora barha diya

  const [lat1, lon1] = pickupCoords;
  const [lat2, lon2] = destCoords;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const aerialDistance = R * c;

  // Road Multiplier: Aerial distance ko 1.3 se multiply kiya (Roads ghoom kar hoti hain)
  const estimatedRoadDistance = aerialDistance * 1.3;

  const baseFare = 50; // Base rate
  const perKmRate = 25; // 25 PKR per km

  const totalFare = Math.round(baseFare + (estimatedRoadDistance * perKmRate));

  // Fare hamesha minimum se zyada hona chahiye
  return totalFare < 80 ? 80 : totalFare;
};

const handleViewRoute = (pickup, destination) => {
  const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  window.open(url, '_blank');
};

const handleRequestRide = async () => {
  const user = auth.currentUser;
  if (!user || !selectedRide) return;

  try {
    setRequestingId(selectedRide.id);
    const docRef = await addDoc(collection(db, "requests"), {
      rideId: selectedRide.id,
      driverId: selectedRide.driverId,
      passengerPhone: userPhone || "No Phone",
      passengerId: user.uid,
      passengerName: userName || "Passenger",
      pickup: selectedRide.pickup,
      destination: selectedRide.destination,
      pickupCoords: userPickupCoords,
      destCoords: selectedRide.destCoords || [24.9462, 67.0681],
      fare: currentModalFare, // Updated: Modal wala confirmed fare save hoga
      status: "pending",
      createdAt: serverTimestamp()
    });

    setActiveRequestId(docRef.id);
    setTimer(15);
    setShowMapModal(false);
  } catch (e) {
    console.error("Firestore Error:", e);
  } finally {
    setRequestingId(null);
  }
};

const filteredRides = rides.filter(ride =>
  ride.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
  ride.pickup.toLowerCase().includes(searchTerm.toLowerCase())
);

return (
  <div className="student-dashboard-main">
    <Container className="py-4">
      {/* Header Section */}
      <div className="welcome-section mb-4">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <h2 className="neon-text-student mb-0">
              Salam, {userName ? userName.split(' ')[0] : "Student"}! 👋
            </h2>
            <p className="text-muted">Where are we going today?</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <Row className="mb-4 g-3">
        <Col xs={6} md={3}>
          <div className="mini-stat-card">
            <FaRoute className="stat-icon" />
            <span>Available</span>
            <h5>{rides.length} Rides</h5>
          </div>
        </Col>
        <Col xs={6} md={3}>
          <div className="mini-stat-card">
            <FaHistory className="stat-icon" />
            <span>Recent</span>
            <h5>04 Trips</h5>
          </div>
        </Col>
      </Row>

      {/* Search Bar */}
      <div className="search-wrapper mb-5">
        <InputGroup className="neon-search-group shadow-sm">
          <InputGroup.Text><FaSearch /></InputGroup.Text>
          <Form.Control
            placeholder="Search by area (e.g. Gulshan, KU...)"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>

      {/* Rides Grid */}
      <h5 className="section-label mb-3">Live Commutes</h5>
      <Row className="g-4">
        {loading ? (
          <div className="text-center w-100 py-5">
            <Spinner animation="border" style={{ color: '#9dff50' }} />
          </div>
        ) : filteredRides.map((ride) => (
          <Col key={ride.id} xs={12} md={6} lg={4}>
            <Card className="glass-ride-card h-100">
              <Card.Body className="d-flex flex-column">
                {/* Driver Info Header */}
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div className="d-flex align-items-center">
                    <div className="driver-avatar-ring"><FaUserCircle size={32} /></div>
                    <div className="ms-3">
                      <h6 className="driver-name mb-0">{ride.driverName || "Driver"}</h6>
                      <div className="rating-box"><FaStar className="me-1" />4.9</div>
                    </div>
                  </div>
                  <Badge className="live-pill">LIVE</Badge>
                </div>

                <div className="route-flow flex-grow-1">
                  <div className="flow-content">
                    <div className="flow-item">
                      <small>DROP-OFF POINT</small>
                      <p className="text-white text-truncate">{ride.destination}</p>
                    </div>
                  </div>
                </div>

                <div className="fare-footer mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="fare-info">
                      <Badge bg="info" className="mb-1">Tap to set pickup</Badge>
                      <h5 className="text-muted">Fare: Check in Map</h5>
                    </div>
                    <Button
                      variant="outline-light"
                      className="btn-map-glass"
                      onClick={() => handleViewRoute(ride.pickup, ride.destination)}
                    >
                      <FaMapMarkerAlt />
                    </Button>
                  </div>

                  <Button
                    className="btn-request-neon w-100"
                    disabled={activeRequestId !== null}
                    onClick={() => handleOpenMap(ride)}
                  >
                    {activeRequestId ? `Waiting ${timer}s...` : "SELECT PICKUP & BOOK"}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>

    {/* Map Modal (Updated with Live Fare) */}
    <Modal show={showMapModal} onHide={() => setShowMapModal(false)} centered size="lg">
      <Modal.Header closeButton className="bg-dark text-white border-0 py-2">
        <Modal.Title className="fs-6 neon-text-green">CONFIRM YOUR PICKUP</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0 bg-dark position-relative">
        <div style={{ height: '400px' }}>
          {selectedRide && (
            <MapContainer center={selectedRide.pickupCoords} zoom={14} style={{ height: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <RoutingMachine pickupCoords={selectedRide.pickupCoords} destCoords={selectedRide.destCoords} />
              <MapClickHandler />
            </MapContainer>
          )}
        </div>

        {/* Fare Floating Overlay inside Modal */}
        <div className="fare-overlay p-3">
          <div className="d-flex justify-content-between align-items-center bg-black p-3 rounded border border-success shadow-lg">
            <div>
              <small className="text-secondary d-block">ESTIMATED FARE</small>
              <h3 className="text-white mb-0">Rs. {currentModalFare}</h3>
            </div>
            <div className="text-end">
              <small className="text-secondary d-block">DISTANCE IMPACT</small>
              <span className="badge bg-success">Student Discount Applied</span>
            </div>
          </div>
          <p className="text-center text-secondary small mt-2">
            Click on the map to mark your exact pickup location.
          </p>
          <Button className="btn-request-neon w-100 py-3 fw-bold mt-2" onClick={handleRequestRide}>
            CONFIRM RIDE @ Rs. {currentModalFare}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  </div>
);
};

export default StudentDashboard;