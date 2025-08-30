import { useAuth } from '../../context/auth'

export default function UserDashboard() {
  const { user } = useAuth()
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">User Dashboard</h1>
      <p className="text-gray-600">Welcome {user?.name}. This is a dummy user view.</p>
    </div>
  )
}
