import React from "react";
import Card from "react-bootstrap/Card";
import { ImPointRight } from "react-icons/im";

function AboutCard() {
  return (
    <Card className="quote-card-view">
      <Card.Body>
        <blockquote className="blockquote mb-0">
          <p style={{ textAlign: "justify" }}>
            Hi everyone! I'm <span className="purple">Mohamed Aathil R</span>{" "}
            from <span className="purple">India</span>.
            <br />
            <br />
            I Recently completed my{" "}
            <span className="purple">Electronics and Communication Engineering (ECE)</span> at{" "}
            <span className="purple">Hindusthan Institute of Technology(2025)</span>.
            <br />
            <br />
            I'm working as a <span className="purple">Web Developer Intern</span> at a startup
            and actively seeking a <span className="purple">full-time Web Developer role</span>.
            <br />
            <br />
            Outside of coding, I love engaging in activities that keep me
            creative and inspired:
          </p>

          <ul>
            <li className="about-activity">
              <ImPointRight /> Watching and Playing Cricket 
            </li>
            <li className="about-activity">
              <ImPointRight /> Playing Video Games 
            </li>
            <li className="about-activity">
              <ImPointRight /> Problem Solving 
            </li>
          </ul>

          <p style={{ color: "rgb(155 126 172)" }}>
            "Passionate about building user-friendly web applications!"{" "}
          </p>
          <footer className="blockquote-footer">Mohamed Aathil</footer>
        </blockquote>
      </Card.Body>
    </Card>
  );
}

export default AboutCard;
