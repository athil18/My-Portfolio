import React from 'react'
import './Contact.css'

const Contact = () => {
  return (
    <div className='contact-container'>
      <h1>Contact Me</h1>
      <p className='subtitle'>Let’s connect & innovate together!</p>

      <div className='contact-cards'>

        <a href="https://www.instagram.com/mohamed_04_18" className="contact-card insta" target="_blank" rel="noreferrer">
          <i className="bi bi-instagram"></i>
          <span>Instagram</span>
        </a>

        <a href="https://www.linkedin.com/in/mohamed-aathil-r-41b43b321" className="contact-card linkedin" target="_blank" rel="noreferrer">
          <i className="bi bi-linkedin"></i>
          <span>LinkedIn</span>
        </a>

        <a href="mailto:aathilmohamed552@gmail.com" className="contact-card mail">
          <i className="bi bi-envelope"></i>
          <span>aathilmohamed552@gmail.com</span>
        </a>

        <a href="tel:+916374033815" className="contact-card phone">
          <i className="bi bi-telephone"></i>
          <span>+91 6374033815</span>
        </a>

      </div>
    </div>
  )
}

export default Contact