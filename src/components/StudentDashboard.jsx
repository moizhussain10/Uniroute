import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Spinner } from 'react-bootstrap';
import { FaSearch, FaUserCircle, FaRoute, FaMoneyBillWave } from 'react-icons/fa';
import { db, auth } from '../config/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';

const StudentDashboard = () => {
  const [rides, setRides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Timer aur Request States
  const [activeRequestId, setActiveRequestId] = useState(null);
  const [timer, setTimer] = useState(0);
  const [requestingId, setRequestingId] = useState(null);

  // 1. Rides Fetching Logic
  useEffect(() => {
    const q = query(collection(db, "rides"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ridesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRides(ridesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 2. Price Calculation Logic (Haversine Formula)
  const calculateFare = (pickupCoords, destCoords) => {
    if (!pickupCoords || !destCoords) return 50; // Default base fare agar coords na hon

    const [lat1, lon1] = pickupCoords;
    const [lat2, lon2] = destCoords;

    const R = 6371; // Earth's radius in KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; 

    const baseFare = 50; 
    const perKmRate = 20; 
    return Math.round(baseFare + (distance * perKmRate));
  };

  // 3. Status Monitor (Timer ko rokne ke liye)
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

  // 4. Timer Countdown Logic
  useEffect(() => {
    let interval;
    if (timer > 0 && activeRequestId) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && activeRequestId) {
      handleExpire(activeRequestId);
    }
    return () => clearInterval(interval);
  }, [timer, activeRequestId]);

  // 5. Expire Logic
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
    } catch (error) {
      console.error("Expire error:", error);
    }
  };

  // 6. Handle Request Function
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
      setTimer(10); 
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setRequestingId(null);
    }
  };

  const filteredRides = rides.filter(ride =>
    ride.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.pickup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="py-4">
      <div className="mb-5 text-center">
        <h2 className="fw-bold text-primary">Find Your Ride 🚗</h2>
        <p className="text-muted">Price calculation aur auto-timer ke saath behtareen safar.</p>
      </div>

      <Row className="justify-content-center mb-5">
        <Col md={8}>
          <InputGroup className="shadow-sm rounded-pill overflow-hidden border-0">
            <InputGroup.Text className="bg-white border-0 ps-4 text-primary"><FaSearch /></InputGroup.Text>
            <Form.Control
              placeholder="Kahan jana hai?"
              className="py-3 border-0 shadow-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
      </Row>

      <Row>
        {loading ? (
          <div className="text-center w-100"><Spinner animation="border" variant="primary" /></div>
        ) : filteredRides.map((ride) => {
          const fare = calculateFare(ride.pickupCoords, ride.destCoords);
          return (
            <Col key={ride.id} lg={4} md={6} className="mb-4">
              <Card className="border-0 shadow-sm p-3 h-100" style={{ borderRadius: '15px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <FaUserCircle size={40} className="text-secondary" />
                    <div>
                      <h6 className="mb-0 fw-bold">{ride.driverName || "Driver"}</h6>
                      <small className="text-muted">{ride.vehicleName}</small>
                    </div>
                  </div>
                  <Badge bg="success">Available</Badge>
                </div>

                <div className="ps-2 border-start border-2 border-dashed ms-3 my-2">
                  <div className="mb-2">
                    <small className="text-muted d-block">Pickup</small> 
                    <strong className="text-truncate d-block">{ride.pickup}</strong>
                  </div>
                  <div className="mb-3">
                    <small className="text-muted d-block">Destination</small> 
                    <strong className="text-truncate d-block">{ride.destination}</strong>
                  </div>
                </div>

                {/* --- Price Display --- */}
                <div className="d-flex justify-content-between align-items-center p-2 mb-3 bg-light rounded-3">
                    <small className="text-secondary fw-bold"><FaMoneyBillWave className="me-1"/> Est. Fare</small>
                    <span className="text-primary fw-bold fs-5">Rs. {fare}</span>
                </div>

                <div className="d-flex gap-2 mt-auto">
                  <Button variant="outline-info" className="flex-grow-1" style={{ borderRadius: '10px' }}>
                    <FaRoute /> Route
                  </Button>
                  
                  {activeRequestId && timer > 0 ? (
                    <Button variant="warning" disabled className="flex-grow-1" style={{ borderRadius: '10px' }}>
                       {timer}s...
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      className="flex-grow-1"
                      style={{ borderRadius: '10px' }}
                      disabled={requestingId === ride.id || activeRequestId !== null}
                      onClick={() => handleRequestRide(ride)}
                    >
                      {requestingId === ride.id ? <Spinner size="sm" /> : "Request"}
                    </Button>
                  )}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Container>
  );
};

export default StudentDashboard;