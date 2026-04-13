import React from "react";
import { Form, Button, Card, Container, Row, Col, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaUserPlus, FaEnvelope, FaLock, FaUserTag } from 'react-icons/fa'; // Naye Icons
import "./Signupform.css";

const Signupform = ({ registeruser }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const name = form.name.value; // Name field add kar diya hai
    const email = form.email.value;
    const password = form.password.value;
    const role = form.role.value;
    registeruser({ email, password, role, name }); // Driver Profile ke liye name zaroori hai
  };

  return (
    // "bg-gradient-dark" ko "light-vibrant-bg" se replace kiya
    <div className="light-vibrant-bg d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Container>
        <Row className="justify-content-center mx-o">
          <Col xs={12} sm={10} md={8} lg={6}>
            {/* "glass-card" ko "glass-card-light" se replace kiya aur "p-5" card radius barha di */}
            <Card className="p-4 p-md-5 glass-card-light animate-slide-up shadow-sm border-0" style={{ borderRadius: '20px' }}>
              <div className="text-center mb-5">
                {/* Neon text hata kar bold professional text kar diya */}
                <h2 className="fw-bold mb-1" style={{ color: '#007bff', letterSpacing: '1px' }}>UniRoute</h2>
              </div>

              <Form onSubmit={handleSubmit}>
                {/* Full Name Input - Added Icons and Light Style */}
                <Form.Group className="mb-4" controlId="formBasicName">
                  <Form.Label className="small fw-bold text-secondary">Full Name</Form.Label>
                  <InputGroup className="shadow-xs rounded-3 overflow-hidden">
                      <InputGroup.Text className="bg-white border-end-0 text-muted"><FaUserTag /></InputGroup.Text>
                      <Form.Control 
                        type="text" 
                        name="name" 
                        placeholder="e.g. Ali Ahmed" 
                        required 
                        className="light-input border-start-0 ps-1" 
                      />
                  </InputGroup>
                </Form.Group>

                {/* Email Input */}
                <Form.Group className="mb-4" controlId="formBasicEmail">
                  <Form.Label className="small fw-bold text-secondary">Email Address</Form.Label>
                  <InputGroup className="shadow-xs rounded-3 overflow-hidden">
                      <InputGroup.Text className="bg-white border-end-0 text-muted"><FaEnvelope /></InputGroup.Text>
                      <Form.Control 
                        type="email" 
                        name="email" 
                        placeholder="yourname@aptech.edu.pk" 
                        required 
                        className="light-input border-start-0 ps-1" 
                      />
                  </InputGroup>
                </Form.Group>

                {/* Password Input */}
                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label className="small fw-bold text-secondary">Password</Form.Label>
                  <InputGroup className="shadow-xs rounded-3 overflow-hidden">
                      <InputGroup.Text className="bg-white border-end-0 text-muted"><FaLock /></InputGroup.Text>
                      <Form.Control 
                        type="password" 
                        name="password" 
                        placeholder="••••••••" 
                        minLength={6} 
                        required 
                        className="light-input border-start-0 ps-1" 
                      />
                  </InputGroup>
                </Form.Group>

                {/* Role Select Dropdown */}
                <Form.Group className="mb-5" controlId="formBasicRole">
                  <Form.Label className="small fw-bold text-secondary">I want to:</Form.Label>
                  <Form.Select name="role" className="light-input custom-select-light" style={{ borderRadius: '10px' }} required>
                    <option value="student">Passenger</option>
                    <option value="driver">Driver</option>
                  </Form.Select>
                </Form.Group>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-100 py-3 fw-bold shadow-sm"
                  style={{ borderRadius: '12px', fontSize: '1.1rem', background: '#007bff', border: 'none' }}
                >
                  <FaUserPlus className="me-2 mb-1" /> CREATE MY ACCOUNT
                </Button>
              </Form>

              <div className="text-center mt-4 pt-2 border-top">
                <small className="text-muted">
                  Already registered?{" "}
                  <Link to="/login" className="fw-bold" style={{ color: '#007bff', textDecoration: 'none' }}>
                    Login Here
                  </Link>
                </small>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Signupform;