
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle.jsx";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./Emergency.css";

// Default map position (India)
const DEFAULT_CENTER = [22.9734, 78.6569];

// Custom hospital marker
const hospitalIcon = L.divIcon({
  className: "hospital-marker",
  html: "🏥",
  iconSize: [35, 35],
  iconAnchor: [17, 17]
});

// Custom user location marker
const userLocationIcon = L.divIcon({
  className: "user-marker",
  html: "📍",
  iconSize: [35, 35],
  iconAnchor: [17, 17]
});

// Calculate distance between two locations
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Move map when user's location changes
function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13, {
        duration: 1.5
      });
    }
  }, [position, map]);

  return null;
}

function Emergency() {
  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [locationMessage, setLocationMessage] = useState(
    "Allow location access to find nearby hospitals."
  );

  // Get user's current location
  const getCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError("Your browser does not support location services.");
      return;
    }

    setLocationMessage("Getting your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = [
          position.coords.latitude,
          position.coords.longitude
        ];

        setUserLocation(location);
        setLocationMessage("Your current location is detected.");
      },
      () => {
        setError(
          "Unable to access your location. Please allow location permission."
        );

        setLocationMessage("Location access is unavailable.");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Search nearby hospitals using OpenStreetMap Overpass API
  const findNearbyHospitals = async () => {
    if (!userLocation) {
      setError("Please detect your current location first.");
      return;
    }

    setLoading(true);
    setError("");
    setHospitals([]);

    const [latitude, longitude] = userLocation;

    const query = `
      [out:json][timeout:25];
      (
        nwr["amenity"="hospital"](around:10000,${latitude},${longitude});
        nwr["healthcare"="hospital"](around:10000,${latitude},${longitude});
      );
      out center tags;
    `;

    try {
      const response = await fetch(
        "https://overpass-api.de/api/interpreter",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: `data=${encodeURIComponent(query)}`
        }
      );

      if (!response.ok) {
        throw new Error(
          "Hospital search service is temporarily unavailable."
        );
      }

      const data = await response.json();

      const results = (data.elements || [])
        .map((hospital) => {
          const lat = hospital.lat ?? hospital.center?.lat;
          const lon = hospital.lon ?? hospital.center?.lon;

          if (lat == null || lon == null) {
            return null;
          }

          const tags = hospital.tags || {};

          return {
            id: `${hospital.type}-${hospital.id}`,
            name: tags.name || "Hospital name unavailable",
            latitude: lat,
            longitude: lon,

            address: [
              tags["addr:street"],
              tags["addr:city"],
              tags["addr:postcode"]
            ]
              .filter(Boolean)
              .join(", "),

            phone: tags.phone || tags["contact:phone"] || "",
            website: tags.website || tags["contact:website"] || "",

            distance: calculateDistance(
              latitude,
              longitude,
              lat,
              lon
            )
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);

      setHospitals(results);

      if (results.length === 0) {
        setError(
          "No hospital records were found nearby. Try again later or use another hospital search service."
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Unable to find hospitals. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Open directions in Google Maps
  const getDirections = (hospital) => {
    const url = new URL("https://www.google.com/maps/dir/");

    url.searchParams.set("api", "1");

    if (userLocation) {
      url.searchParams.set(
        "origin",
        `${userLocation[0]},${userLocation[1]}`
      );
    }

    url.searchParams.set(
      "destination",
      `${hospital.latitude},${hospital.longitude}`
    );

    url.searchParams.set("travelmode", "driving");

    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  return (
    <div className="emergency-page">

      {/* Header */}
      <header className="emergency-header">
        <div>
          <h1>Emergency Assistance</h1>
          <p>
            Quick access to emergency services and nearby hospitals.
          </p>
        </div>

        <div className="emergency-header-actions">
          <ThemeToggle />

          <a href="/dashboard" className="back-dashboard">
            Back to Dashboard
          </a>
        </div>
      </header>

      <main className="emergency-content">

        {/* Emergency Calling Section */}
        <section className="emergency-section">
          <h2>Emergency Services</h2>

          <p>
            If someone is experiencing a medical emergency, contact
            emergency services immediately.
          </p>

          <div className="emergency-cards">

            <div className="emergency-card">
              <div className="emergency-card-icon">🚨</div>

              <h3>Emergency Help</h3>

              <p>
                India's emergency response number for urgent assistance.
              </p>

              <a
                href="tel:112"
                className="call-button emergency-call"
                aria-label="Call emergency number 112"
              >
                Call 112
              </a>
            </div>

            <div className="emergency-card">
              <div className="emergency-card-icon">🚑</div>

              <h3>Ambulance Service</h3>

              <p>
                Call the ambulance service for medical transportation.
              </p>

              <a
                href="tel:102"
                className="call-button ambulance-call"
                aria-label="Call ambulance number 102"
              >
                Call 102
              </a>
            </div>

          </div>
        </section>

        {/* Nearby Hospital Section */}
        <section className="hospital-section">

          <div className="section-heading">
            <div>
              <h2>Nearby Hospitals</h2>
              <p>
                Find hospitals around your current location.
              </p>
            </div>

            <span className="map-label">
              OpenStreetMap
            </span>
          </div>

          {/* Location Controls */}
          <div className="location-controls">

            <button
              type="button"
              className="location-button"
              onClick={getCurrentLocation}
            >
              📍 Detect My Location
            </button>

            <button
              type="button"
              className="hospital-search-button"
              onClick={findNearbyHospitals}
              disabled={!userLocation || loading}
            >
              {loading ? "Searching..." : "Find Nearby Hospitals"}
            </button>

          </div>

          <p className="location-message">
            {locationMessage}
          </p>

          {error && (
            <div className="emergency-error" role="alert">
              {error}
            </div>
          )}

          {/* OpenStreetMap */}
          <div className="emergency-map">

            <MapContainer
              center={DEFAULT_CENTER}
              zoom={5}
              scrollWheelZoom={true}
              className="leaflet-map"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapUpdater position={userLocation} />

              {/* User Location */}
              {userLocation && (
                <Marker position={userLocation} icon={userLocationIcon}>
                  <Popup>
                    Your current location
                  </Popup>
                </Marker>
              )}

              {/* Hospital Markers */}
              {hospitals.map((hospital) => (
                <Marker
                  key={hospital.id}
                  position={[
                    hospital.latitude,
                    hospital.longitude
                  ]}
                  icon={hospitalIcon}
                >
                  <Popup>
                    <strong>{hospital.name}</strong>
                    <br />

                    {hospital.distance.toFixed(2)} km away
                    <br />

                    <button
                      type="button"
                      onClick={() => getDirections(hospital)}
                    >
                      Get Directions
                    </button>
                  </Popup>
                </Marker>
              ))}

            </MapContainer>

          </div>

          {/* Hospital Results */}
          <div className="hospital-results">
            <h3>Hospital Search Results</h3>

            {!loading && hospitals.length === 0 && (
              <p className="empty-hospitals">
                Detect your location and click Find Nearby Hospitals.
              </p>
            )}

            {hospitals.map((hospital) => (
              <div
                className="hospital-result-card"
                key={hospital.id}
              >
                <div>
                  <h4>{hospital.name}</h4>

                  <p>
                    📍 {hospital.distance.toFixed(2)} km away
                  </p>

                  {hospital.address && (
                    <p>{hospital.address}</p>
                  )}

                  {hospital.phone && (
                    <p>
                      Phone:{" "}
                      <a href={`tel:${hospital.phone}`}>
                        {hospital.phone}
                      </a>
                    </p>
                  )}

                  {hospital.website && (
                    <p>
                      <a
                        href={
                          hospital.website.startsWith("http")
                            ? hospital.website
                            : `https://${hospital.website}`
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        Hospital Website
                      </a>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="directions-button"
                  onClick={() => getDirections(hospital)}
                >
                  Get Directions
                </button>
              </div>
            ))}
          </div>

        </section>

        {/* Emergency Contacts */}
        <section className="contacts-section">
          <h2>Emergency Contacts</h2>

          <p>
            Keep important family members' and caregivers' phone
            numbers accessible.
          </p>

          <p className="contact-note">
            Personal emergency contacts can be added here in a future
            update.
          </p>
        </section>

        {/* Medical Warning */}
        <section className="medical-warning">
          <h3>Important Medical Notice</h3>

          <p>
            Do not wait for an online assessment if someone has severe
            chest pain, difficulty breathing, fainting, or other
            serious symptoms. Contact emergency services immediately.
          </p>

          <strong>For emergencies in India, call 112.</strong>
        </section>

      </main>

      <footer className="emergency-footer">
        <p>HeartCare | Emergency Assistance</p>
      </footer>

    </div>
  );
}

export default Emergency;
