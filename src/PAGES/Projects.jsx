import React from 'react'
import './Projects.css'

const Projects = () => {
  return (
    <div className='projectdiv'>
      <h1>Projects & Internships</h1>

      <h2>Final Year Project</h2>
      <h3>Doctor Availability and Patient Seat Allocation</h3>
      <ul className="project-description">
        <li>
Efficient patient management in hospitals is increasingly critical due to rising patient volumes and limited healthcare resources. This project leverages modern web technologies to automate doctor availability tracking and patient seat allocation, reducing manual effort and improving real-time decision-making. By integrating smart scheduling algorithms and dynamic data handling through the MERN stack, the system enhances operational efficiency, minimizes wait times, and delivers a seamless digital experience for both patients and administrators.        </li>
      </ul>

      <h2>Internships</h2>
      <div className="internship-section">
        <div className="internship">
          <h3>Qtree Technologies <span>(MERN Stack Development)</span></h3>
          <p className="intern-period">6th Jan 2025 – 7th June 2025</p>
          
          
        </div>

        <div className="internship">
          <h3>Novitech Solutions <span>(Full Stack Development)</span></h3>
          <p className="intern-period">9th Jan 2023 – 17th March 2023</p>
          
        </div>

        <div className="internship">
          <h3>Embedded System Training <span>(DSIB Tech)</span></h3>
          <p className="intern-period">19th June 2023 – 5th July 2023</p>
        </div>
      </div>
    </div>
  )
}

export default Projects