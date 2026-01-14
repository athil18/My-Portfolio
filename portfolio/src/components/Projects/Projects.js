import React, { useState } from "react";
import { Container, Row, Col, Badge, Button, Form, Spinner } from "react-bootstrap";
import {
  FaReact, FaNodeJs, FaExternalLinkAlt,
  FaPlay, FaLock, FaPaperPlane, FaCheckCircle
} from "react-icons/fa";
import { SiMongodb, SiTypescript, SiTailwindcss, SiExpress, SiStripe } from "react-icons/si";
import Particle from "../Particle";
import ecommercePreview from "../../Assets/ecommerce-preview.png";
import projectIdeasPreview from "../../Assets/project-ideas-preview.png";

function Projects() {
  // Form state
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    email: '',
    problem: '',
    targetUsers: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null

  const techStack = [
    { name: "React 19", icon: <FaReact />, color: "#61DAFB" },
    { name: "TypeScript", icon: <SiTypescript />, color: "#007ACC" },
    { name: "Node.js", icon: <FaNodeJs />, color: "#68A063" },
    { name: "Express", icon: <SiExpress />, color: "#FFFFFF" },
    { name: "MongoDB", icon: <SiMongodb />, color: "#4DB33D" },
    { name: "TailwindCSS", icon: <SiTailwindcss />, color: "#38B2AC" },
    { name: "Stripe", icon: <SiStripe />, color: "#635BFF" },
    { name: "JWT Auth", icon: <FaLock />, color: "#F7DF1E" }
  ];

  const handleLaunchDemo = () => {
    window.open("http://127.0.0.1:5173", "_blank");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Using Web3Forms - free form submission service
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: 'YOUR_WEB3FORMS_ACCESS_KEY', // Replace with your key from web3forms.com
          subject: `New Project Suggestion: ${formData.projectName}`,
          from_name: 'Portfolio Project Suggestion',
          project_name: formData.projectName,
          description: formData.description,
          problem_solved: formData.problem,
          target_users: formData.targetUsers,
          email: formData.email,
          to: 'mohammedaathil.jobs@gmail.com'
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ projectName: '', description: '', email: '', problem: '', targetUsers: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    }

    setIsSubmitting(false);
  };

  return (
    <Container fluid className="project-section">
      <Particle />
      <Container style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="text-center mb-5">
          <h1 className="project-heading">
            My Recent <strong className="purple">Works</strong>
          </h1>
          <p style={{ color: "white" }}>Here are a few projects I've worked on recently.</p>
        </div>

        {/* Featured Project Card */}
        <Row className="justify-content-center mb-5">
          <Col lg={11}>
            <div
              style={{
                background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
                borderRadius: '24px',
                padding: '2.5rem',
                boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {/* Project Header */}
              <Row className="align-items-center g-4">
                <Col lg={6}>
                  {/* Project Thumbnail */}
                  <div
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                      border: '2px solid rgba(108, 92, 231, 0.3)'
                    }}
                  >
                    <img
                      src={ecommercePreview}
                      alt="Premium Purchases E-commerce"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        transition: 'transform 0.3s ease'
                      }}
                      className="project-thumbnail"
                    />
                  </div>
                </Col>

                <Col lg={6}>
                  <Badge bg="warning" text="dark" className="mb-3 px-3 py-2">
                    ⭐ Featured Project
                  </Badge>
                  <h2 className="purple mb-2" style={{ fontSize: "2rem" }}>
                    Premium Purchases
                  </h2>
                  <p className="text-white-50 small mb-3">Full-Stack MERN + TypeScript</p>
                  <p className="text-white-50 mb-4">
                    A comprehensive e-commerce platform with React 19, TypeScript,
                    Node.js/Express backend, MongoDB, Stripe payments, JWT authentication
                    with 2FA, admin dashboard, and real-time notifications.
                  </p>

                  {/* Tech Stack Badges */}
                  <div className="mb-4">
                    {techStack.map((tech, i) => (
                      <Badge
                        key={i}
                        className="me-2 mb-2 px-2 py-1"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          color: "white",
                          border: `1px solid ${tech.color}60`,
                          fontSize: '0.75rem'
                        }}
                      >
                        <span style={{ marginRight: '4px', color: tech.color }}>{tech.icon}</span>
                        {tech.name}
                      </Badge>
                    ))}
                  </div>

                  {/* CTA Buttons */}
                  <div className="d-flex gap-3 flex-wrap">
                    <Button
                      onClick={handleLaunchDemo}
                      size="lg"
                      className="d-flex align-items-center gap-2"
                      style={{
                        background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                        border: 'none',
                        borderRadius: '50px',
                        padding: '12px 28px',
                        fontWeight: '600',
                        boxShadow: '0 8px 20px rgba(108, 92, 231, 0.4)'
                      }}
                    >
                      <FaPlay size={14} /> Launch Demo
                    </Button>
                    <Button
                      href="https://github.com/athil18/My-Portfolio"
                      target="_blank"
                      variant="outline-light"
                      size="lg"
                      className="d-flex align-items-center gap-2"
                      style={{
                        borderRadius: '50px',
                        padding: '12px 28px',
                        fontWeight: '600'
                      }}
                    >
                      <FaExternalLinkAlt size={14} /> Source Code
                    </Button>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Project Suggestion Form Section */}
        <Row className="justify-content-center mb-5">
          <Col lg={11}>
            <div
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                padding: '3rem',
                boxShadow: '0 15px 30px rgba(102, 126, 234, 0.3)'
              }}
            >
              <Row className="align-items-center g-4 mb-4">
                <Col lg={5}>
                  {/* Thumbnail */}
                  <div
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                      border: '2px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <img
                      src={projectIdeasPreview}
                      alt="Share Your Project Ideas"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                      }}
                    />
                  </div>
                </Col>
                <Col lg={7}>
                  <h3 className="text-white mb-3" style={{ fontWeight: '700', fontSize: '2rem' }}>
                    💡 Suggest a Project Idea
                  </h3>
                  <p className="text-white mb-0" style={{ fontSize: '1.1rem', opacity: 0.9 }}>
                    Have an idea for a web application or tool? Share it below and I might build it!
                  </p>
                </Col>
              </Row>

              {/* Success Message */}
              {submitStatus === 'success' && (
                <div
                  className="text-center mb-4 p-4"
                  style={{
                    background: 'rgba(46, 213, 115, 0.2)',
                    borderRadius: '12px',
                    border: '1px solid rgba(46, 213, 115, 0.5)'
                  }}
                >
                  <FaCheckCircle size={40} color="#2ed573" className="mb-2" />
                  <h5 className="text-white mb-1">Thank you!</h5>
                  <p className="text-white mb-0" style={{ opacity: 0.9 }}>
                    Your project idea has been submitted successfully. I'll review it soon!
                  </p>
                </div>
              )}

              {/* Error Message */}
              {submitStatus === 'error' && (
                <div
                  className="text-center mb-4 p-3"
                  style={{
                    background: 'rgba(255, 71, 87, 0.2)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 71, 87, 0.5)'
                  }}
                >
                  <p className="text-white mb-0">
                    Oops! Something went wrong. Please try again or email me directly.
                  </p>
                </div>
              )}

              {/* Form */}
              <Form onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-white" style={{ fontWeight: '500' }}>
                        Project Name *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleInputChange}
                        placeholder="e.g., Task Scheduler App"
                        required
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          color: 'white'
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-white" style={{ fontWeight: '500' }}>
                        Your Email *
                      </Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                        required
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          color: 'white'
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-white" style={{ fontWeight: '500' }}>
                        Problem it Solves
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="problem"
                        value={formData.problem}
                        onChange={handleInputChange}
                        placeholder="What issue does this project address?"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          color: 'white'
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="text-white" style={{ fontWeight: '500' }}>
                        Target Users
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="targetUsers"
                        value={formData.targetUsers}
                        onChange={handleInputChange}
                        placeholder="Who would use this? (e.g., Students, Developers)"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          color: 'white'
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12}>
                    <Form.Group>
                      <Form.Label className="text-white" style={{ fontWeight: '500' }}>
                        Project Description *
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your project idea in detail... What features should it have? Any specific technologies you'd like to see used?"
                        required
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          borderRadius: '10px',
                          padding: '12px 16px',
                          color: 'white',
                          resize: 'vertical'
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col xs={12} className="text-center mt-4">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting}
                      className="d-inline-flex align-items-center gap-2"
                      style={{
                        background: 'white',
                        color: '#667eea',
                        border: 'none',
                        borderRadius: '50px',
                        padding: '14px 40px',
                        fontWeight: '600',
                        boxShadow: '0 8px 20px rgba(255,255,255,0.3)',
                        opacity: isSubmitting ? 0.7 : 1
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner animation="border" size="sm" /> Submitting...
                        </>
                      ) : (
                        <>
                          <FaPaperPlane size={16} /> Submit Your Idea
                        </>
                      )}
                    </Button>
                  </Col>
                </Row>
              </Form>

              <p className="text-white text-center mt-4 mb-0" style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                Your suggestions help me build projects that matter to the community!
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Hover Styles */}
      <style>{`
        .project-thumbnail:hover {
          transform: scale(1.02);
        }
        .form-control::placeholder {
          color: rgba(255,255,255,0.5);
        }
        .form-control:focus {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.4);
          box-shadow: 0 0 0 0.2rem rgba(255,255,255,0.1);
          color: white;
        }
      `}</style>
    </Container>
  );
}

export default Projects;
