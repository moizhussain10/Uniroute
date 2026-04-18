import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Spinner } from 'react-bootstrap';
import { FaSearch, FaUserCircle, FaMapMarkerAlt, FaLocationArrow } from 'react-icons/fa';
import { db, auth } from '../config/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [rides, setRides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [timer, setTimer] = useState(0);
  const [requestingId, setRequestingId] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "rides"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ridesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRides(ridesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const calculateFare = (pickupCoords, destCoords) => {
    if (!pickupCoords || !destCoords) return 50;
    const [lat1, lon1] = pickupCoords;
    const [lat2, lon2] = destCoords;
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(50 + (R * c * 20));
  };

  useEffect(() => {
    if (!activeRequestId) return;
    const unsubscribe = onSnapshot(doc(db, "requests", activeRequestId), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.status === 'accepted' || data.status === 'rejected') {
          setTimer(0);
          setActiveRequestId(null);
          if (data.status === 'accepted') alert("Driver ne ride accept kar li! 🎉");
        }
      }
    });
    return () => unsubscribe();
  }, [activeRequestId]);

  useEffect(() => {
    let interval;
    if (timer > 0 && activeRequestId) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0 && activeRequestId) {
      handleExpire(activeRequestId);
    }
    return () => clearInterval(interval);
  }, [timer, activeRequestId]);

  const handleExpire = async (reqId) => {
    try {
      const requestRef = doc(db, "requests", reqId);
      const snap = await getDoc(requestRef);
      if (snap.exists() && snap.data().status === "pending") {
        await updateDoc(requestRef, { status: 'expired' });
        alert("Driver ne respond nahi kiya. Request expired!");
      }
      setActiveRequestId(null);
      setTimer(0);
    } catch (e) { console.error(e); }
  };

  const handleRequestRide = async (ride) => {
    const user = auth.currentUser;
    if (!user) return alert("Pehle login karein!");
    const estimatedFare = calculateFare(ride.pickupCoords, ride.destCoords);
    try {
      setRequestingId(ride.id);
      const docRef = await addDoc(collection(db, "requests"), {
        rideId: ride.id,
        driverId: ride.driverId,
        passengerId: user.uid,
        passengerEmail: user.email,
        pickup: ride.pickup,
        destination: ride.destination,
        fare: estimatedFare,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setActiveRequestId(docRef.id);
      setTimer(30); // 30 seconds wait
    } catch (e) { alert(e.message); }
    finally { setRequestingId(null); }
  };

  const handleViewRoute = (pickup, destination) => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(pickup)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const filteredRides = rides.filter(ride =>
    ride.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.pickup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-wrapper">
      <Container fluid className="py-4">
        
        <div className="dashboard-header d-flex text-center mb-4">
          <h3 className="fw-bold">Available Rides</h3>
          <p className="text-muted small">Karachi University Commute</p>
        </div>

        <Row className="justify-content-center mb-4 g-0">
          <Col xs={12} md={8} lg={6}>
            <InputGroup className="search-group-container shadow-sm overflow-hidden">
              <InputGroup.Text className="bg-white border-0 ps-3">
                <FaSearch className="text-primary" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search by area..."
                className="border-0 shadow-none py-2 py-md-3"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
        </Row>

        <Row className="g-3">
          {loading ? (
            <div className="text-center w-100 py-5"><Spinner animation="grow" variant="primary" /></div>
          ) : filteredRides.length > 0 ? (
            filteredRides.map((ride) => (
              <Col key={ride.id} xs={12} sm={6} xl={4}>
                <Card className="ride-card h-100 border-0 shadow-sm">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between mb-3">
                      <div className="d-flex align-items-center">
                        <FaUserCircle size={35} className="text-primary me-2" />
                        <div>
                          <h6 className="mb-0 fw-bold">{ride.driverName || "Driver"}</h6>
                          <small className="text-muted">{ride.vehicleName || "Car"}</small>
                        </div>
                      </div>
                      <Badge bg="soft-success" className="status-badge-live">Live</Badge>
                    </div>

                    <div className="route-visual-container mb-3">
                      <div className="route-line-vertical"></div>
                      <div className="route-stop">
                        <FaLocationArrow className="icon-pickup" />
                        <div className="ms-3">
                          <span className="route-label">PICKUP</span>
                          <p className="route-address text-truncate">{ride.pickup}</p>
                        </div>
                      </div>
                      <div className="route-stop mt-3">
                        <FaMapMarkerAlt className="icon-dest" />
                        <div className="ms-3">
                          <span className="route-label">DESTINATION</span>
                          <p className="route-address text-truncate">{ride.destination}</p>
                        </div>
                      </div>
                    </div>

                    <div className="fare-display mb-3">
                      <span>Est. Fare</span>
                      <span className="amount">Rs. {calculateFare(ride.pickupCoords, ride.destCoords)}</span>
                    </div>

                    <div className="d-flex gap-2">
                      <Button variant="light" className="w-50 btn-map" onClick={() => handleViewRoute(ride.pickup, ride.destination)}>
                        Map
                      </Button>
                      <Button 
                        variant="primary" 
                        className="w-50 btn-book flex-grow-1"
                        disabled={activeRequestId !== null}
                        onClick={() => handleRequestRide(ride)}
                      >
                        {requestingId === ride.id ? <Spinner size="sm" /> : 
                         activeRequestId && timer > 0 ? `Waiting ${timer}s` : "Book Ride"}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <div className="text-center w-100 py-5">No rides found.</div>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default StudentDashboard;