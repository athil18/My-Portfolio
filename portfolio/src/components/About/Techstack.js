import React from "react";
import { Col, Row } from "react-bootstrap";
import { SiExpress, SiBootstrap } from "react-icons/si";
import { AiFillHtml5 } from "react-icons/ai";
import Javascript from "../../Assets/TechIcons/Javascript.svg";
import Node from "../../Assets/TechIcons/Node.svg";
import ReactIcon from "../../Assets/TechIcons/React.svg";
import Mongo from "../../Assets/TechIcons/Mongo.svg";

const iconStyle = {
  fontSize: "4rem",
  width: "4rem",
  height: "4rem",
};

const imgStyle = {
  width: "4rem",
  height: "4rem",
  objectFit: "contain",
};

const textStyle = {
  fontSize: "1rem",
  marginTop: "10px",
};

function Techstack() {
  return (
    <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
      <Col xs={4} md={2} className="tech-icons">
        <AiFillHtml5 style={iconStyle} />
        <div className="tech-icons-text" style={textStyle}>HTML5</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Javascript} alt="JavaScript" style={imgStyle} />
        <div className="tech-icons-text" style={textStyle}>JavaScript</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Mongo} alt="MongoDB" style={imgStyle} />
        <div className="tech-icons-text" style={textStyle}>MongoDB</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiExpress style={iconStyle} />
        <div className="tech-icons-text" style={textStyle}>Express.js</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={ReactIcon} alt="React" style={imgStyle} />
        <div className="tech-icons-text" style={textStyle}>React.js</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={Node} alt="Node.js" style={imgStyle} />
        <div className="tech-icons-text" style={textStyle}>Node.js</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiBootstrap style={iconStyle} />
        <div className="tech-icons-text" style={textStyle}>Bootstrap 5</div>
      </Col>

      <Col xs={4} md={2} className="tech-icons">
        <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 3h6.93c-.04.34-.11.67-.19 1H13v-1zm0 3h5.92c-.2.35-.43.69-.68 1H13v-1zm0 3h2.87c-.87.48-1.84.8-2.87.93V19z" />
        </svg>
        <div className="tech-icons-text" style={textStyle}>Web Vitals</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
        <div className="tech-icons-text" style={textStyle}>unDraw</div>
      </Col>
    </Row>
  );
}

export default Techstack;
