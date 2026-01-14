import React from "react";
import Card from "react-bootstrap/Card";
import { ImPointRight } from "react-icons/im";

function AboutCard() {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify" }}>
            Beyond the surface, I am a <span className="purple">Full-Stack Developer</span> who believes in the power of clean code and meaningful user experiences. My journey started with a fascination for how hardware and software intersect during my <span className="purple">ECE studies</span>.
            <br />
            <br />
            I don't just write code; I <span className="purple">architect solutions</span>. Whether it's optimizing a backend API or crafting a responsive frontend, my goal is always to create something that provides value.
            <br />
            <br />
            While my primary focus is building robust web architectures, I am also deeply engaged in <span className="purple">AI programming</span>—not in a direct research capacity, but through the <span className="purple">indirect orchestration</span> of intelligent systems and automated agentic workflows to solve complex problems.
            <br />
            <br />
            Some of my core pillars include:
          </p>
          <ul>
            <li className="about-activity">
              <ImPointRight /> Scalable Web Architecture
            </li>
            <li className="about-activity">
              <ImPointRight /> Responsive Design Philosophy
            </li>
            <li className="about-activity">
              <ImPointRight /> Continuous Integration & Development
            </li>
          </ul>

          <p style={{ color: "rgb(155 126 172)", marginTop: "20px" }}>
            "Good design is obvious. Great design is transparent."{" "}
          </p>
          <footer className="blockquote-footer">Mohamed Aathil</footer>
        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
