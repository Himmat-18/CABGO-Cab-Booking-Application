import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function DriverDashboard() {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState(null)

  const DRIVER_ID = 2

  const loadRides = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `http://localhost:8080/api/rides`
      )

      if (!response.ok) {
        throw new Error('Rides load nahi ho paayi.')
      }

      const data = await response.json()
      console.log("Driver rides:", data)
      setRides(data)
    } catch (err) {
      setError(err.message || 'Backend se connection nahi ho paaya.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRides()
  }, [])

  const updateRideStatus = async (rideId, status) => {
    const action = status === 'ACCEPTED' ? 'accept' : 'reject'

    if (!window.confirm(`Are you sure you want to ${action} Ride #${rideId}?`)) {
      return
    }

    setProcessingId(rideId)
    setError('')

    try {
      const response = await fetch(
        `http://localhost:8080/api/rides/${rideId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        }
      )

      if (!response.ok) {
        const message = await response.text()
        throw new Error(message || 'Ride status update nahi hua.')
      }

      await loadRides()
    } catch (err) {
      setError(err.message || 'Ride update karte waqt error aaya.')
    } finally {
      setProcessingId(null)
    }
  }

  const requestedRides = rides.filter(
    (ride) => ride.status === 'REQUESTED'
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black px-6 py-5 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            CAB<span className="text-yellow-400">GO</span>
          </Link>

          <Link
            to="/"
            className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black"
          >
            Customer Home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Driver Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Welcome, Driver #2. Manage your ride requests here.
            </p>
          </div>

          <button
            onClick={loadRides}
            disabled={loading}
            className="rounded-lg bg-black px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh Rides'}
          </button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Total Rides</p>
            <p className="mt-2 text-3xl font-bold">{rides.length}</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">New Requests</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {requestedRides.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow">
            <p className="text-sm text-gray-500">Completed Rides</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {rides.filter((ride) => ride.status === 'COMPLETED').length}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            Loading rides...
          </div>
        )}

        {!loading && !error && rides.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-bold">No rides found</h2>
            <p className="mt-2 text-gray-600">
              New ride requests will appear here.
            </p>
          </div>
        )}

        {!loading && !error && rides.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {rides.map((ride) => (
              <div
                key={ride.id}
                className="rounded-2xl bg-white p-6 shadow-md"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold">Ride #{ride.id}</h2>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold">
                    {ride.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Pickup Location</p>
                    <p className="font-semibold">
                      📍 {ride.pickupLocation || 'Not available'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Drop Location</p>
                    <p className="font-semibold">
                      🏁 {ride.dropLocation || 'Not available'}
                    </p>
                  </div>

                  <div className="flex justify-between border-t pt-4">
                    <div>
                      <p className="text-sm text-gray-500">Distance</p>
                      <p className="font-semibold">
                        {ride.distanceInKm != null
                          ? `${ride.distanceInKm} km`
                          : 'Not available'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">Fare</p>
                      <p className="text-2xl font-bold text-green-700">
                        ₹{ride.fare ?? 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {ride.status === 'REQUESTED' && (
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateRideStatus(ride.id, 'ACCEPTED')}
                      disabled={processingId !== null}
                      className="rounded-lg bg-green-600 px-3 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {processingId === ride.id ? 'Processing...' : 'Accept Ride'}
                    </button>

                    <button
                      onClick={() => updateRideStatus(ride.id, 'REJECTED')}
                      disabled={processingId !== null}
                      className="rounded-lg bg-red-600 px-3 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      Reject Ride
                    </button>
                  </div>
                )}

                {ride.status === 'ACCEPTED' && (
                  <button
                    onClick={() => updateRideStatus(ride.id, 'IN_PROGRESS')}
                    disabled={processingId !== null}
                    className="mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    Start Ride
                  </button>
                )}

                {ride.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => updateRideStatus(ride.id, 'COMPLETED')}
                    disabled={processingId !== null}
                    className="mt-5 w-full rounded-lg bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Complete Ride
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default DriverDashboard