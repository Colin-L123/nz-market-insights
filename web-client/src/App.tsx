import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <nav className="main-nav">
        <Link className="main-nav-link" to="/">Homepage</Link>
        <Link className="main-nav-link" to="/analysis">AI Analysis</Link>
      </nav>
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/analysis' element={<AnalysisPage />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
