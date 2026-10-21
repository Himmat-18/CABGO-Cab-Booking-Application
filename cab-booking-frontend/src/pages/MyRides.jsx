import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function MyRides() {
  const [rides, setRides] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)

const cancelRide = async (rideId) => {
  const confirmed = window.confirm(
   `Are you sure you want to cancel Ride #${rideId}?`
  )

  if (!confirmed) {
    return
  }

  setCancellingId(rideId)
  setError('')

  try {
    const response = await fetch(
      `http://localhost:8080/api/rides/${rideId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED',
        }),
      }
    )

    if (!response.ok) {
      const message = await response.text()
      throw new Error(message || 'Error occured while cancelling the ride.')
    }

    setRides((previousRides) =>
      previousRides.map((ride) =>
        ride.id === rideId
          ? { ...ride, status: 'CANCELLED' }
          : ride
      )
    )
  } catch (err) {
    setError(err.message || 'Ride cancel karte waqt error aaya.')
  } finally {
    setCancellingId(null)
  }
}

  useEffect(() => {
    fetch('http://localhost:8080/api/rides/customer/2')
      .then((response) => {
        if (!response.ok) {
          throw new Error('The ride could not be loaded.')
        }

        return response.json()
      })
      .then((data) => {
        setRides(data)
      })
      .catch((err) => {
        setError(err.message || 'Could not connect to the backend.')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const getStatusStyle = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700'
      case 'CANCELLED':
        return 'bg-red-100 text-red-700'
      case 'ACCEPTED':
        return 'bg-blue-100 text-blue-700'
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-black px-6 py-5 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="text-2xl font-bold">
            CAB<span className="text-yellow-400">GO</span>
          </Link>

          <Link
            to="/"
            className="rounded-lg bg-yellow-400 px-4 py-2 font-semibold text-black hover:bg-yellow-300"
          >
            Book a Ride
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          My Rides
        </h1>

        <p className="mb-8 text-gray-600">
          View all your cab bookings and ride details.
        </p>

        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            Loading your rides...
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-100 p-5 text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && rides.length === 0 && (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="mb-3 text-xl font-semibold">
              No rides found
            </h2>

            <p className="mb-5 text-gray-600">
              You have not booked any rides yet.
            </p>

            <Link
              to="/"
              className="inline-block rounded-lg bg-yellow-400 px-6 py-3 font-bold text-black"
            >
              Book Your First Ride
            </Link>
          </div>
        )}

        {!loading && !error && rides.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2">
            {rides.map((ride) => (
              <div
                key={ride.id}
                className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    Ride #{ride.id}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusStyle(ride.status)}`}
                  >
                    {ride.status}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Pickup Location
                    </p>
                    <p className="font-semibold text-gray-900">
                      📍 {ride.pickupLocation || 'Not available'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Drop Location
                    </p>
                    <p className="font-semibold text-gray-900">
                      🏁 {ride.dropLocation || 'Not available'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t pt-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        Distance
                      </p>
                      <p className="font-semibold">
                        {ride.distanceInKm != null
                          ? `${ride.distanceInKm} km`
                          : 'Not available'}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Total Fare
                      </p>
                      <p className="text-2xl font-bold text-green-700">
                        ₹{ride.fare ?? 'N/A'}
                      </p>
                    </div>
                  </div>
                  {ride.status === 'REQUESTED' && (
                  <button
                    onClick={() => cancelRide(ride.id)}
                    disabled={cancellingId === ride.id}
                    className="mt-5 w-full rounded-lg bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {cancellingId === ride.id
                      ? 'Cancelling...'
                      : 'Cancel Ride'}
                  </button>
                )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    
    </div>
  )
}

export default MyRides