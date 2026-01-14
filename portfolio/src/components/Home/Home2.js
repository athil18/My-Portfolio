import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import myImg from "../../Assets/avatar.svg";
import Tilt from "react-parallax-tilt";

function Home2() {
  return (
    <Container fluid className="home-about-section" id="about">
      <Container>
        <Row>
          <Col md={8} className="home-about-description">
            <h1 style={{ fontSize: "2.6em" }}>
              LET ME <span className="purple"> INTRODUCE </span> MYSELF
            </h1>
            <p className="home-about-body">
              I am <b className="purple">Mohamed Aathil</b> from <b className="purple">Chennai</b>.
              <br />
              <br />
              I recently graduated with a degree in <b className="purple">Electronics and Communication Engineering (ECE)</b> from
              <b className="purple"> Hindusthan Institute of Technology</b>.
              <br />
              <br />
              Currently, I am working as a <b className="purple">Developer Intern</b> at a startup in Chennai and actively looking for a
              <b className="purple"> permanent Web Developer role</b>.
              <br />
              <br />
              I am passionate about learning new technologies and building user-friendly applications.
            </p>
          </Col>
          <Col md={4} className="myAvtar">
            <Tilt>
              <img src={myImg} className="img-fluid" alt="avatar" />
            </Tilt>
          </Col>
        </Row>
      </Container>
    </Container>
  );
}
export default Home2;
