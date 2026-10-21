import { useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(event) {
      onLocationSelect(event.latlng)
    },
  })

  return null
}

function MapPicker({ onLocationSelect }) {
  const [selectedLocation, setSelectedLocation] = useState(null)

  const handleMapClick = async (latlng) => {
  setSelectedLocation(latlng)

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}`
    )

    if (!response.ok) {
      throw new Error('Unable to find the address')
    }

    const data = await response.json()

    const address =
      data.display_name ||
      `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`

    onLocationSelect?.({
      ...latlng,
      address,
    })
  } catch (error) {
    console.error('Address lookup failed:', error)

    onLocationSelect?.({
      ...latlng,
      address: `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`,
    })
  }
}

  return (
    <div className="overflow-hidden rounded-xl border border-gray-300">
      <p className="bg-white px-4 py-3 text-sm text-gray-700">
        📍 Click on the map to select a location.
      </p>

      <MapContainer
        center={[25.746, 84.149]}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: '350px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onLocationSelect={handleMapClick} />

        {selectedLocation && (
          <Marker position={selectedLocation} icon={pickupIcon}>
            <Popup>
              Selected Location
              <br />
              Latitude: {selectedLocation.lat.toFixed(5)}
              <br />
              Longitude: {selectedLocation.lng.toFixed(5)}
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}

export default MapPicker