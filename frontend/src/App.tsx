import './App.css'
import { AuthProvider } from './context/auth'
import Router from './router'
import Navbar from './components/Navbar'

function App() {

  return (
    <AuthProvider>
      <Navbar />
      <Router />
    </AuthProvider>
  )
}

export default App
