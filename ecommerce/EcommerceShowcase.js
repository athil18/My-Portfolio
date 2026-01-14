import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards"; // Assuming you have this generic card
import Particle from "../Particle";

function EcommerceShowcase() {
    return (
        <Container fluid className="project-section">
            <Particle />
            <Container>
                <h1 className="project-heading">
                    My <strong className="purple">E-Commerce</strong> Suite
                </h1>
                <p style={{ color: "white" }}>
                    Explore the full-stack "Premium Purchases" platform integrated here.
                </p>

                <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
                    {/* Main Storefront */}
                    <Col md={4} className="project-card">
                        <ProjectCard
                            imgPath="https://via.placeholder.com/500x300?text=Storefront" // Replace with actual screenshot
                            isBlog={false}
                            title="Premium Storefront"
                            description="A modern, high-performance shopping experience built with React 19 and Vite. Features real-time search, cart management, and glass-morphic UI."
                            ghLink="https://github.com/yourusername/1-8"
                            demoLink="http://localhost:5173"
                        />
                    </Col>

                    {/* Admin Dashboard */}
                    <Col md={4} className="project-card">
                        <ProjectCard
                            imgPath="https://via.placeholder.com/500x300?text=Admin+Panel"
                            isBlog={false}
                            title="Admin Dashboard"
                            description="Comprehensive administrative control panel for managing products, orders, and user analytics with visualized data charts."
                            ghLink="https://github.com/yourusername/1-8"
                            demoLink="http://localhost:5173/admin"
                        />
                    </Col>

                    {/* Contextual Details */}
                    <Col md={4} className="project-card">
                        <ProjectCard
                            imgPath="https://via.placeholder.com/500x300?text=AI+Context"
                            isBlog={false}
                            title="AI Contextual Details"
                            description="An innovative 'Contextual Details' system that provides deep metadata insights for every product and order entity."
                            ghLink="https://github.com/yourusername/1-8"
                            demoLink="http://localhost:5173/details/product/featured"
                        />
                    </Col>
                </Row>
            </Container>
        </Container>
    );
}

export default EcommerceShowcase;
