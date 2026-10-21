import { useEffect, useState } from 'react'

function AdminDashboard() {
const [rides, setRides] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')

useEffect(() => {
fetch('http://localhost:8080/api/rides')
.then((response) => {
if (!response.ok) {
throw new Error('Failed to load rides')
}
return response.json()
})
.then((data) => {
setRides(data)
})
.catch((err) => {
setError(err.message)
})
.finally(() => {
setLoading(false)
})
}, [])

const completedRides = rides.filter(
(ride) => ride.status === 'COMPLETED',
)

const pendingRides = rides.filter(
(ride) => ride.status === 'PENDING',
)

return (
<div className="min-h-screen bg-gray-100 p-6">
<header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-black p-6 text-white">
<h1 className="text-3xl font-extrabold">
<span className="text-yellow-400">CAB</span>GO Admin Dashboard
</h1>

    <a
      href="/"
      className="rounded-lg bg-yellow-400 px-5 py-3 font-bold text-black"
    >
      Home
    </a>
  </header>

  {loading ? (
    <p className="text-lg">Loading rides...</p>
  ) : error ? (
    <p className="rounded-lg bg-red-100 p-4 text-red-700">
      {error}. Check that the Spring Boot backend is running.
    </p>
  ) : (
    <>
      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">Total Rides</p>
          <p className="mt-2 text-4xl font-bold">{rides.length}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">Pending Rides</p>
          <p className="mt-2 text-4xl font-bold">{pendingRides.length}</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">Completed Rides</p>
          <p className="mt-2 text-4xl font-bold">
            {completedRides.length}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <p className="text-gray-500">Other Rides</p>
          <p className="mt-2 text-4xl font-bold">
            {rides.length - pendingRides.length - completedRides.length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow">
        <h2 className="p-6 text-2xl font-bold">All Rides</h2>

        <table className="w-full text-left">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-4">Ride ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Driver</th>
              <th className="p-4">Pickup</th>
              <th className="p-4">Drop</th>
              <th className="p-4">Distance</th>
              <th className="p-4">Fare</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>

          <tbody>
            {rides.map((ride) => (
              <tr key={ride.id} className="border-t hover:bg-gray-50">
                <td className="p-4">{ride.id}</td>
                <td className="p-4">{ride.customerId}</td>
                <td className="p-4">{ride.driverId ?? '-'}</td>
                <td className="p-4">{ride.pickupLocation}</td>
                <td className="p-4">{ride.dropLocation}</td>
                <td className="p-4">
                  {ride.distanceInKm ?? '-'} km
                </td>
                <td className="p-4">
                  {ride.fare != null ? `₹${ride.fare}` : '-'}
                </td>
                <td className="p-4">
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold">
                    {ride.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rides.length === 0 && (
          <p className="p-6">No rides found.</p>
        )}
      </div>
    </>
  )}
</div>

)
}

export default AdminDashboard