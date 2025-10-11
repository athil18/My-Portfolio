import React from 'react'
import Navbar from './Components/Navbar'
import './App.css'

import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './PAGES/Home'
import About from './PAGES/About'
import Projects from './PAGES/Projects'
import Skills from './PAGES/Skill'
import Contact from './PAGES/Contact'

const App = () => {
  return (
    <div className='nav-box'>
      <BrowserRouter>
          <Navbar />

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/projects' element={<Projects />} />
          <Route path='/skills' element={<Skills />} />
          <Route path='/contact' element={<Contact />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App