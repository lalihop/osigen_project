import './App.css'
import AdminP from './AdminP'
import GuideP from './GuideP'
import MainP from './MainP'
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from "./resultDashboard/components/Dashboard";
import ProcessingP from './ProcessingP'

function App() {

  return (
    <Routes>
      <Route path='/' element={<MainP />} />
      <Route path='/guide' element={<GuideP />} />
      <Route path='/admin' element={<AdminP />} />
      <Route path='/processing/:taskId' element={<ProcessingP />} />
      <Route path='/result/:task_id' element={<Dashboard />} />
    </Routes>
  )
}

export default App
