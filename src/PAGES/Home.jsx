import React from 'react'
import './Home.css'

const Home = () => {
  return (
    <div className='homepage'>
      <h1>Welcome to My Portfolio!</h1>
      <p className='intro'>
        Hi, I'm <strong>Mohamed Aathil</strong> — a passionate and focused <span className="highlight">MERN stack developer</span> in the making.
        Recently graduated in Electronics and Communication Engineering, I’ve discovered my true calling in <strong>web development</strong>. I'm now committed to building fast, scalable, and user-friendly applications.
      </p>
      <p className='call-to-action'>
        Explore my portfolio to learn more about my <strong>projects</strong>, <strong>skills</strong>, and <strong>journey</strong>. Let’s connect and create something impactful!
      </p>
    </div>
  )
}

export default Home