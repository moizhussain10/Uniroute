import React from "react";
import { Form, Button, Card, Container, Row, Col, InputGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import "./Signupform.css"; // Hum wahi CSS use kar rahe hain reusable classes ke liye

const Login = ({ loginUser }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const email = form.email.value;
    const password = form.password.value;
    loginUser({ email, password });
  };

  return (
    <div className="light-vibrant-bg d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Container>
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={5}>
            <Card className="p-4 p-md-5 glass-card-light animate-slide-up shadow-sm border-0" style={{ borderRadius: '25px' }}>
              <div className="text-center mb-5">
                <h2 className="fw-bold mb-1" style={{ color: '#007bff', letterSpacing: '1px' }}>WELCOME BACK</h2>
                <p className="text-muted small">Log in to your UniRoute account</p>
              </div>

              <Form onSubmit={handleSubmit}>
                {/* Email Field */}
                <Form.Group className="mb-4" controlId="formBasicEmail">
                  <Form.Label className="small fw-bold text-secondary">Email Address</Form.Label>
                  <InputGroup className="shadow-xs rounded-3 overflow-hidden">
                    <InputGroup.Text className="bg-white border-end-0 text-muted"><FaEnvelope /></InputGroup.Text>
                    <Form.Control 
                      type="email" 
                      name="email" 
                      placeholder="name@aptech.edu.pk" 
                      required 
                      className="light-input border-start-0 ps-1" 
                    />
                  </InputGroup>
                </Form.Group>

                {/* Password Field */}
                <Form.Group className="mb-4" controlId="formBasicPassword">
                  <Form.Label className="small fw-bold text-secondary">Password</Form.Label>
                  <InputGroup className="shadow-xs rounded-3 overflow-hidden">
                    <InputGroup.Text className="bg-white border-end-0 text-muted"><FaLock /></InputGroup.Text>
                    <Form.Control 
                      type="password" 
                      name="password" 
                      placeholder="••••••••" 
                      required 
                      className="light-input border-start-0 ps-1" 
                    />
                  </InputGroup>
                </Form.Group>

                <div className="text-end mb-4">
                    <Link to="/forgot-password" style={{ color: '#007bff', fontSize: '0.85rem', textDecoration: 'none' }} className="fw-bold">
                        Forgot Password?
                    </Link>
                </div>

                <Button 
                  type="submit" 
                  className="w-100 py-3 fw-bold shadow-sm"
                  style={{ borderRadius: '12px', fontSize: '1.1rem', background: '#007bff', border: 'none' }}
                >
                  <FaSignInAlt className="me-2 mb-1" /> LOGIN NOW
                </Button>
              </Form>

              <div className="text-center mt-4 pt-2 border-top">
                <small className="text-muted">
                  New to UniRoute?{" "}
                  <Link to="/" className="fw-bold" style={{ color: '#007bff', textDecoration: 'none' }}>
                    Create Account
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

export default Login;