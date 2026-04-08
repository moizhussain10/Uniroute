import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup, Spinner } from 'react-bootstrap';
import { FaSearch, FaMapMarkerAlt, FaClock, FaUserCircle, FaRoute } from 'react-icons/fa';
import { db, auth } from '../config/firebase';
import { collection, onSnapshot, query, addDoc, serverTimestamp } from 'firebase/firestore';

const StudentDashboard = () => {
  const [rides, setRides] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState(null); // Track specific ride request loading

  useEffect(() => {
    const q = query(collection(db, "rides"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ridesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRides(ridesData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Yeh raha tumhara request send karne wala function ---
  const handleRequestRide = async (ride) => {
    const user = auth.currentUser;
    if (!user) {
      return alert("Pehle login karein!");
    }

    try {
      setRequestingId(ride.id); // Start loading for this specific button
      
      await addDoc(collection(db, "requests"), {
        rideId: ride.id,
        driverId: ride.driverId,
        passengerId: user.uid,
        passengerEmail: user.email,
        pickup: ride.pickup,
        destination: ride.destination,
        status: "pending",
        createdAt: serverTimestamp()
      });

      alert("Request bhej di gayi hai! Driver dashboard check karega. 🚀");
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setRequestingId(null); // Stop loading
    }
  };

  const filteredRides = rides.filter(ride =>
    ride.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.pickup.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container className="py-4 animate-slide-up">
      <div className="mb-5 text-center">
        <h2 className="fw-bold text-primary">Find Your Ride 🚗</h2>
        <p className="text-muted">Apni university ya office ke liye sasti aur sukoon deh ride dhoondein.</p>
      </div>

      <Row className="justify-content-center mb-5">
        <Col md={8}>
          <InputGroup className="shadow-sm rounded-pill overflow-hidden border-0">
            <InputGroup.Text className="bg-white border-0 ps-4 text-primary">
              <FaSearch />
            </InputGroup.Text>
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
        ) : filteredRides.length > 0 ? (
          filteredRides.map((ride) => (
            <Col key={ride.id} lg={4} md={6} className="mb-4">
              <Card className="border-0 shadow-sm p-3 mb-3" style={{ borderRadius: '15px' }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <FaUserCircle size={40} className="text-secondary" />
                    <div>
                      <h6 className="mb-0 fw-bold">{ride.driverName || "Driver"}</h6>
                      <small className="text-muted">{ride.vehicleName || "Vehicle"}</small>
                    </div>
                  </div>
                  <Badge bg="success">Available</Badge>
                </div>

                <div className="ps-2 border-start border-2 border-dashed ms-3 my-2">
                  <div className="mb-2">
                    <small className="text-muted d-block">Pickup</small> 
                    <strong className="text-truncate d-block" style={{maxWidth: '200px'}}>{ride.pickup}</strong>
                  </div>
                  <div>
                    <small className="text-muted d-block">Destination</small> 
                    <strong className="text-truncate d-block" style={{maxWidth: '200px'}}>{ride.destination}</strong>
                  </div>
                </div>

                <div className="d-flex gap-2 mt-3">
                  <Button
                    variant="outline-info"
                    style={{ borderRadius: '10px' }}
                    className="flex-grow-1"
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(ride.pickup)}&destination=${encodeURIComponent(ride.destination)}`, '_blank')}
                  >
                    View Route
                  </Button>
                  
                  {/* --- FIXED BUTTON: onClick ab handleRequestRide se connected hai --- */}
                  <Button
                    variant="primary"
                    style={{ borderRadius: '10px' }}
                    className="flex-grow-1"
                    disabled={requestingId === ride.id}
                    onClick={() => handleRequestRide(ride)}
                  >
                    {requestingId === ride.id ? <Spinner size="sm" /> : "Request Ride"}
                  </Button>
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <div className="text-center w-100 text-muted py-5">Koi ride nahi mili.</div>
        )}
      </Row>
    </Container>
  );
};

export default StudentDashboard;