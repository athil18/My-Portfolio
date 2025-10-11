import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'
import 'bootstrap-icons/font/bootstrap-icons.css';

const Navbar = () => {
  return (
      <div className='navdiv'>
        <h1>Portfolio</h1>
        <div className='linkdiv'>
          <Link to='/'>Home</Link>
          <Link to='/about'>About</Link>
          <Link to='/projects'>Projects</Link>
          <Link to='/skills'>Skills</Link>
          <Link to='/contact'>Contact </Link>
        </div>
        <div className='icons'>
          <a href="https://www.linkedin.com/in/mohamed-aathil-r-41b43b321"  target="_blank"><i className="bi bi-linkedin"></i></a>
          <a href="https://www.instagram.com/mohamed_04_18" target='_blank'><i class="bi bi-instagram"></i></a>
          <a href="mailto:aathilmohamed52@gmail.com"><i class="bi bi-envelope"></i></a>
        </div>
      </div>
  )
}

export default Navbar