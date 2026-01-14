import React from "react";
import { Col, Row } from "react-bootstrap";
import { SiWindows, SiOpenai } from "react-icons/si";
import vsCode from "../../Assets/TechIcons/vscode.svg";

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

function Toolstack() {
  return (
    <Row style={{ justifyContent: "center", paddingBottom: "50px" }}>
      <Col xs={4} md={2} className="tech-icons">
        <SiWindows style={iconStyle} />
        <div className="tech-icons-text" style={textStyle}>Windows</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <img src={vsCode} alt="VS Code" style={imgStyle} />
        <div className="tech-icons-text" style={textStyle}>VS Code</div>
      </Col>
      <Col xs={4} md={2} className="tech-icons">
        <SiOpenai style={iconStyle} />
        <div className="tech-icons-text" style={textStyle}>ChatGPT</div>
      </Col>
    </Row>
  );
}

export default Toolstack;
