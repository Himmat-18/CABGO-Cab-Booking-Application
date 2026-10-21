import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'
import MapPicker from '../components/MapPicker'

function Home() {
  const [pickup, setPickup] = useState('')
  const [drop, setDrop] = useState('')
  const [distance, setDistance] = useState('')
  const [routeLoading, setRouteLoading] = useState(false)
  const [pickupCoordinates, setPickupCoordinates] = useState(null)
const [dropCoordinates, setDropCoordinates] = useState(null)
  const [fare, setFare] = useState(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [locationMode, setLocationMode] = useState('pickup')

  async function calculateRoadDistance(pickupLocation, dropLocation) {
if (!pickupLocation || !dropLocation) {
setMessage('Please select both pickup and drop locations on the map.')
return
}

setRouteLoading(true)
setMessage('')
setFare(null)

try {
const routeUrl =
'https://router.project-osrm.org/route/v1/driving/' +
pickupLocation.lon + ',' + pickupLocation.lat + ';' +
dropLocation.lon + ',' + dropLocation.lat +
'?overview=false'

console.log('OSRM request URL:', routeUrl)

const routeResponse = await fetch(routeUrl)

console.log('OSRM request URL:', routeUrl)

const responseText = await routeResponse.text()

console.log('OSRM HTTP status:', routeResponse.status)
console.log('OSRM response body:', responseText)

let routeData

try {
routeData = JSON.parse(responseText)
} catch {
throw new Error('OSRM returned HTML instead of JSON. Check the Console for details.')
}

console.log('OSRM response:', routeData)


if (!routeResponse.ok) {
  throw new Error('Unable to calculate road distance. Please try again.')
}



if (
  routeData.code !== 'Ok' ||
  !routeData.routes ||
  routeData.routes.length === 0
) {
  throw new Error('No driving route found between these locations.')
}

const kilometers = routeData.routes[0].distance / 1000

if (!Number.isFinite(kilometers) || kilometers <= 0) {
  throw new Error('Please select two different locations.')
}

setDistance(kilometers.toFixed(1))
setFare(50 + kilometers * 12)
setMessage('Road distance and estimated fare calculated successfully.')

} catch (error) {
console.error('Road distance error:', error)
setMessage(error.message || 'Unable to calculate road distance.')
} finally {
setRouteLoading(false)
}
}

  // Calculate an estimated fare for display.
  // The backend calculates the actual fare when a ride is booked.
  function calculateFare() {
    setMessage('')
    setFare(null)

    if (!pickup.trim() || !drop.trim()) {
      setMessage('Please enter pickup and drop locations.')
      return
    }

    if (pickup.trim().toLowerCase() === drop.trim().toLowerCase()) {
      setMessage('Pickup and drop locations must be different.')
      return
    }

    const km = Number(distance)

    if (!Number.isFinite(km) || km <= 0) {
      setMessage('Please enter a valid distance greater than 0 km.')
      return
    }

    setFare(50 + km * 12)
    setMessage('Estimated fare calculated. Book to confirm your ride.')
  }

  // Book a real ride through the Spring Boot backend.
  async function bookRide() {
    setMessage('')
    setFare(null)

    if (!pickup.trim() || !drop.trim()) {
      setMessage('Please enter pickup and drop locations.')
      return
    }

    if (pickup.trim().toLowerCase() === drop.trim().toLowerCase()) {
      setMessage('Pickup and drop locations must be different.')
      return
    }

    const km = Number(distance)

    if (!Number.isFinite(km) || km <= 0) {
      setMessage('Please enter a valid distance greater than 0 km.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:8080/api/rides', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: 2,
          driverId: 2,
          pickupLocation: pickup.trim(),
          dropLocation: drop.trim(),
          distanceInKm: km,
        }),
      })

      const responseText = await response.text()

      let data = {}

      try {
        data = responseText ? JSON.parse(responseText) : {}
      } catch {
        data = { message: responseText }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.detail ||
            `Ride booking failed. HTTP ${response.status}`,
        )
      }

      setFare(
        typeof data.fare === 'number' ? data.fare : Number(data.fare),
      )

      setMessage(
        `Ride booked successfully! Ride ID: ${data.id}`,
      )

      setPickup('')
      setDrop('')
      setDistance('')
    } catch (error) {
      if (error instanceof TypeError) {
        setMessage(
          'Cannot connect to the backend. Check that Spring Boot is running and CORS is configured.',
        )
      } else {
        setMessage(error.message || 'Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {/* Navigation */}
      <header className="bg-black text-white">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-2xl font-extrabold">
            <span className="text-yellow-400">CAB</span>GO
          </Link>

          <div className="flex items-center gap-5 text-sm font-medium">
            <Link to="/" className="hover:text-yellow-400">
              Home
            </Link>

            <a href="#services" className="hover:text-yellow-400">
              Services
            </a>

            <a href="#booking" className="hover:text-yellow-400">
              Book Ride
            </a>

            <Link
              to="/login"
              className="rounded-full bg-yellow-400 px-5 py-2 font-bold text-black hover:bg-yellow-300"
            >
              Login
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero and Booking Section */}
        <section
          id="home"
          className="hero-section px-6 py-16 md:py-24"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-12 md:grid-cols-2">
            {/* Hero Text */}
            <div>
              <p className="mb-4 font-bold uppercase tracking-widest text-yellow-400">
                YOUR CITY. YOUR RIDE.
              </p>

              <h1 className="max-w-xl text-5xl font-extrabold leading-tight text-white md:text-7xl">
                Every journey,
                <span className="block text-yellow-400">
                  made simple.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-gray-300">
                Book your ride in minutes. Travel comfortably,
                safely, and on your schedule.
              </p>

              <a
                href="#booking"
                className="mt-8 inline-block rounded-lg bg-yellow-400 px-7 py-4 font-bold text-black hover:bg-yellow-300"
              >
                Book Your Ride →
              </a>
            </div>

            {/* Booking Form */}
            <div
              id="booking"
              className="rounded-3xl bg-white p-7 shadow-2xl md:p-9"
            >
              <p className="text-sm font-bold uppercase tracking-widest text-gray-500">
                QUICK BOOKING
              </p>

              <h2 className="mt-2 text-3xl font-extrabold">
                Where to?
              </h2>

              <form
                className="mt-7 space-y-5"
                onSubmit={(event) => {
                  event.preventDefault()
                  bookRide()
                }}
              >
                {/* Pickup */}
                <div>
                  <label
                    htmlFor="pickup"
                    className="mb-2 block text-sm font-bold"
                  >
                    Pickup Location
                  </label>

                  <input
                    id="pickup"
                    type="text"
                    required
                    value={pickup}
                    onChange={(event) => {
                      setPickup(event.target.value)
                      setFare(null)
                      setMessage('')
                    }}
                    placeholder="e.g. Ballia Railway Station"
                    className="w-full rounded-xl border border-gray-300 px-4 py-4 outline-none focus:border-black"
                  />
                </div>

                {/* Drop */}
                <div>
                  <label
                    htmlFor="drop"
                    className="mb-2 block text-sm font-bold"
                  >
                    Drop Location
                  </label>

                  <input
                    id="drop"
                    type="text"
                    required
                    value={drop}
                    onChange={(event) => {
                      setDrop(event.target.value)
                      setFare(null)
                      setMessage('')
                    }}
                    placeholder="e.g. Ballia Bus Stand"
                    className="w-full rounded-xl border border-gray-300 px-4 py-4 outline-none focus:border-black"
                  />
                </div>

                {/* Map Picker */}
<div className="space-y-2">
  <label className="block text-sm font-bold">
    Select Location on Map
  </label>

 <div className="mb-3 flex flex-wrap gap-2">
  <button
    type="button"
    onClick={() => setLocationMode('pickup')}
    className={`rounded-lg px-4 py-2 font-semibold ${
      locationMode === 'pickup'
        ? 'bg-green-600 text-white'
        : 'bg-gray-200 text-gray-800'
    }`}
  >
    Select Pickup Point
  </button>

  <button
    type="button"
    onClick={() => setLocationMode('drop')}
    className={`rounded-lg px-4 py-2 font-semibold ${
      locationMode === 'drop'
        ? 'bg-red-600 text-white'
        : 'bg-gray-200 text-gray-800'
    }`}
  >
    Select Drop Point
  </button>
</div>

<MapPicker
onLocationSelect={(location) => {
const selectedAddress =
location.address ||
"${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}"

const coordinates = {
  lat: location.lat,
  lon: location.lng,
}

if (locationMode === 'pickup') {
  setPickup(selectedAddress)
  setPickupCoordinates(coordinates)
} else {
  setDrop(selectedAddress)
  setDropCoordinates(coordinates)
}

setDistance('')
setFare(null)
setMessage('')

}}
/>

  <p className="text-xs text-gray-500">
    Click on the map to select a location.
  </p>
</div>

  {/* Distance */}
<div>
<label
htmlFor="distance"
className="mb-2 block text-sm font-bold"
>
Road Distance (km)
</label>

              <input
                id="distance"
                type="number"
                min="0.1"
                step="0.1"
                required
                readOnly
                value={distance}
                placeholder="Select pickup and drop, then calculate distance"
                className="w-full rounded-xl border border-gray-300 bg-gray-100 px-4 py-4 outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  calculateRoadDistance(
                    pickupCoordinates,
                    dropCoordinates
                  )
                }
                disabled={
                  routeLoading ||
                  !pickupCoordinates ||
                  !dropCoordinates
                }
                className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {routeLoading
                  ? 'Calculating Road Distance...'
                  : 'Calculate Road Distance'}
              </button>
            </div>


                {/* Fare */}
                {fare !== null && Number.isFinite(fare) && (
                  <div className="rounded-xl bg-yellow-50 p-5">
                    <p className="text-sm text-gray-600">
                      {message.startsWith('Ride booked successfully')
                        ? 'Confirmed Fare'
                        : 'Estimated Fare'}
                    </p>

                    <p className="mt-1 text-3xl font-extrabold">
                      ₹{fare.toFixed(2)}
                    </p>
                  </div>
                )}

                {/* Status Message */}
                {message && (
                  <p
                    role="status"
                    aria-live="polite"
                    className={`rounded-xl p-3 text-sm font-medium ${
                      message.startsWith('Ride booked successfully')
                        ? 'bg-green-100 text-green-800'
                        : message.startsWith('Estimated fare calculated')
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {message}
                  </p>
                )}

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={calculateFare}
                    disabled={loading}
                    className="rounded-xl border-2 border-black px-4 py-4 font-bold hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Calculate Fare
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-xl bg-black px-4 py-4 font-bold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? 'Booking...' : 'Book Ride'}
                  </button>
                </div>
              </form>

              <p className="mt-4 text-xs leading-5 text-gray-500">
                Demo setup: Booking currently uses test Customer ID 2
                and Driver ID 2.
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section
          id="services"
          className="mx-auto max-w-7xl px-6 py-16"
        >
          <div className="text-center">
            <p className="font-bold uppercase tracking-widest text-gray-500">
              TRAVEL YOUR WAY
            </p>

            <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">
              Choose Your Ride
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: '🚗',
                title: 'City Ride',
                description: 'Convenient rides for everyday travel.',
              },
              {
                icon: '🚙',
                title: 'Comfort Ride',
                description: 'Extra comfort for a relaxed journey.',
              },
              {
                icon: '🛣️',
                title: 'Outstation',
                description: 'Travel beyond your city with ease.',
              },
            ].map((service) => (
              <article
                key={service.title}
                className="rounded-2xl border border-gray-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className= "text-5xl">{service.icon}</span>

                <h3 className="mt-5 text-xl font-extrabold">
                  {service.title}
                </h3>

                <p className="mt-3 leading-7 text-gray-600">
                  {service.description}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-black px-6 py-7 text-center text-sm text-gray-400">
        © 2026 CABGO. Your journey, our priority.
      </footer>
    </div>
  )
}

export default Home