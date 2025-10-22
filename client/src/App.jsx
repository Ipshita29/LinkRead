import React from 'react'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import About from './pages/About'
import Home from './pages/Home'
import SignIN from './pages/signIN'
import SignUp from './pages/signUp'
import Project from './pages/Projects'
import Dashboard from './pages/dashboard'


export default function App() {
  return (
    <BrowserRouter >
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/signin' element={<SignIN/>}/>
        <Route path='/signup' element={<SignUp/>}/>
        <Route path='/projects' element={<Project/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
      </Routes>
    </BrowserRouter>
  )
}

