import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <nav className="main-nav">
        <NavLink className="main-nav-brand gradient-text" to="/">NZ Market Insights</NavLink>
        <NavLink className={({ isActive }) => `main-nav-link ${isActive ? 'main-nav-link-active' : ''}`} to="/" end>Homepage</NavLink>
        <NavLink className={({ isActive }) => `main-nav-link ${isActive ? 'main-nav-link-active' : ''}`} to="/analysis">AI Analysis</NavLink>
      </nav>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/analysis' element={<AnalysisPage />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
