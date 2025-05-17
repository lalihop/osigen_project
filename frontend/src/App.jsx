import './App.css'
import AdminP from './AdminP'
import GuideP from './GuideP'
import MainP from './MainP'
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import QresultP from './QresultP'
import CresultP from './CresultP'
import ProcessingP from './ProcessingP'

function App() {

  return (
    <Routes>
      <Route path='/' element={<MainP />} />
      <Route path='/guide' element={<GuideP />} />
      <Route path='/admin' element={<AdminP />} />
      {/* <Route path='/result/quick' element={<QresultP />} />
      <Route path='/result/com' element={<CresultP />} /> */}
      <Route path='/processing/:taskId' element={<ProcessingP />} />
    </Routes>
  )
}

export default App
