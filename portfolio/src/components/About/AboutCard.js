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
            Currently, I'm specializing in the <span className="purple">MERN stack</span> while exploring the nuances of <span className="purple">Cloud Architecture</span> and <span className="purple">DevOps</span>.
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
