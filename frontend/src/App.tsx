import './App.css'
import { AuthProvider } from './context/auth'
import Router from './router'

function App() {

  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}

export default App
