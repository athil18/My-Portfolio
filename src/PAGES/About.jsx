import React from 'react'
import './About.css' // Make sure you style using this file

const About = () => {
  return (
    <div className='aboutpage'>
      <h1>About</h1>

      <h2>Career Objective</h2>
      <p className="career-text">
        A responsible, organized, and self-motivated individual seeking an opportunity in a reputed organization to apply my technical skills and contribute to innovative projects. I aim to enhance my professional growth through continuous learning, collaboration, and dedication while delivering effective and high-quality solutions that drive organizational success.
      </p>

      <h2>Professional Experience</h2>
      <table className='table experience-table'>
        <thead>
          <tr>
            <th>Role</th>
            <th>Organization</th>
            <th>Duration</th>
            <th>Responsibilities</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Python Developer (Intern Trainee)</td>
            <td>VCodez Company</td>
            <td> Sep 2025</td>
            <td>Currently working as a temporary employee focused on front-end development using React.js and back-end development with Python, contributing to web application enhancement and API integration tasks during a 4–6 month training period..</td>
          </tr>
          <tr>
            <td>Frontend Developer (Project)</td>
            <td>Academic Project - Hindusthan Institute of Technology</td>
            <td>Dec 2024 – May 2025</td>
            <td>Developed a Doctor Availability and Patient Seat Allocation website using React.js, Node.js, and MongoDB to streamline hospital operations.</td>
          </tr>
        </tbody>
      </table>

      <h2>Education</h2>
      <table className='table education-table'>
        <thead>
          <tr>
            <th>Course</th>
            <th>Institution</th>
            <th>Percentage / CGPA</th>
            <th>Graduation</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>B.E. in Electronics and Communication Engineering (ECE)</td>
            <td>Hindusthan Institute of Technology, Coimbatore</td>
            <td>72%</td>
            <td>June 2025</td>
          </tr>
          <tr>
            <td>Class XII (State Board)</td>
            <td>MSSD Higher Secondary School, Coimbatore</td>
            <td>74%</td>
            <td>May 2021</td>
          </tr>
          <tr>
            <td>Class X (State Board)</td>
            <td>Little Flower Higher Secondary School</td>
            <td>61%</td>
            <td>March 2019</td>
          </tr>
        </tbody>
      </table>

      <h2>Languages Known</h2>
      <table className='table language-table'>
        <thead>
          <tr>
            <th>Language</th>
            <th>Speak</th>
            <th>Read</th>
            <th>Write</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Tamil</td>
            <td className='tick'>☑</td>
            <td className='tick'>☑</td>
            <td className='tick'>☑</td>
          </tr>
          <tr>
            <td>English</td>
            <td className='tick'>☑</td>
            <td className='tick'>☑</td>
            <td className='tick'>☑</td>
          </tr>
          <tr>
            <td>Arabic</td>
            <td className='tick'>—</td>
            <td className='tick'>☑</td>
            <td className='tick'>☑</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default About
