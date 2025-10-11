import React from 'react'
import './Skill.css'

const Skill = () => {
  return (
    <div className='skillsdiv'>
      <h1>Skills & Certifications</h1>

      <div className='section'>
        <h2>Technical Skills</h2>
        <div className='skills-grid'>
          <span>HTML</span>
          <span>CSS</span>
          <span>React.js</span>
          <span>Bootstrap</span>
          <span>MongoDB</span>
          <span>Node.js</span>
        </div>
      </div>

      <div className='section'>
        <h2>Soft Skills</h2>
        <div className='skills-grid'>
          <span>Teamwork</span>
          <span>Communication</span>
          <span>Time Management</span>
          <span>Adaptability</span>
        </div>
      </div>

      <div className='section'>
        <h2>Certifications & Activities</h2>
        <ul className='certification-list'>
          <li>
            Successfully completed a <strong>MERN Stack Development Internship</strong> at Qtree Technologies.
          </li>
          <li>
            Participated in the technical workshop on <strong>“Welding Assembly Using Software”</strong> organized by PUMO Technovation.
          </li>
          <li>
            Earned a <strong>DSIB Certification</strong> for demonstrating proficiency in digital skills and innovative development practices.
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Skill
