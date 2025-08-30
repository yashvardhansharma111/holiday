import { useAuth } from '../../context/auth'

export default function AgentDashboard() {
  const { user } = useAuth()
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Agent Dashboard</h1>
      <p className="text-gray-600">Welcome {user?.name}. This is a dummy agent view.</p>
    </div>
  )
}
