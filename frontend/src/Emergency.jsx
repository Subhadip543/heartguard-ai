
import { useEffect, useState } from "react";
import { useTheme } from "./context/useTheme";

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

const DEFAULT_CENTER = [22.9734, 78.6569];

const hospitalIcon = L.divIcon({
  className: "hospital-marker",
  html: "🏥",
  iconSize: [35, 35],
  iconAnchor: [17, 17]
});

const userLocationIcon = L.divIcon({
  className: "user-marker",
  html: "📍",
  iconSize: [35, 35],
  iconAnchor: [17, 17]
});

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

function MapUpdater({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13, { duration: 1.5 });
    }
  }, [position, map]);

  return null;
}

const translations = {
  English: {
    title: "Emergency Assistance",
    subtitle: "Quick access to emergency services and nearby hospitals.",
    back: "← Back to Dashboard",
    services: "Emergency Services",
    servicesDescription: "If someone is experiencing a medical emergency, contact emergency services immediately.",
    emergencyHelp: "Emergency Help",
    emergencyHelpDescription: "India's emergency response number for urgent assistance.",
    ambulance: "Ambulance Service",
    ambulanceDescription: "Call the ambulance service for medical transportation.",
    call112: "Call 112",
    call102: "Call 102",
    nearby: "Nearby Hospitals",
    nearbyDescription: "Find hospitals around your current location.",
    mapLabel: "OpenStreetMap",
    detect: "📍 Detect My Location",
    find: "Find Nearby Hospitals",
    searching: "Searching...",
    locationInitial: "Allow location access to find nearby hospitals.",
    locationLoading: "Getting your current location...",
    locationDetected: "Your current location is detected.",
    locationUnavailable: "Location access is unavailable.",
    locationError: "Unable to access your location. Please allow location permission.",
    browserError: "Your browser does not support location services.",
    detectFirst: "Please detect your current location first.",
    searchUnavailable: "Hospital search service is temporarily unavailable.",
    noHospitals: "No hospital records were found nearby. Try again later.",
    searchError: "Unable to find hospitals. Please try again later.",
    currentLocation: "Your current location",
    directions: "Get Directions",
    results: "Hospital Search Results",
    emptyResults: "Detect your location and click Find Nearby Hospitals.",
    searchingHospitals: "Searching for nearby hospitals...",
    hospitalUnavailable: "Hospital name unavailable",
    phone: "Phone:",
    website: "Hospital Website",
    away: "km away",
    contacts: "Emergency Contacts",
    contactsDescription: "Keep important family members' and caregivers' phone numbers accessible.",
    contactNote: "Personal emergency contacts can be added here in a future update.",
    medicalNotice: "Important Medical Notice",
    medicalWarning: "Do not wait for an online assessment if someone has severe chest pain, difficulty breathing, fainting, or other serious symptoms. Contact emergency services immediately.",
    callEmergency: "For emergencies in India, call 112.",
    footer: "HeartCare | Emergency Assistance"
  },

  Bengali: {
    title: "জরুরি সহায়তা",
    subtitle: "জরুরি পরিষেবা এবং কাছাকাছি হাসপাতালের দ্রুত তথ্য পান।",
    back: "← ড্যাশবোর্ডে ফিরে যান",
    services: "জরুরি পরিষেবা",
    servicesDescription: "কেউ চিকিৎসাজনিত জরুরি অবস্থায় থাকলে অবিলম্বে জরুরি পরিষেবার সঙ্গে যোগাযোগ করুন।",
    emergencyHelp: "জরুরি সাহায্য",
    emergencyHelpDescription: "জরুরি সহায়তার জন্য ভারতের জরুরি যোগাযোগ নম্বর।",
    ambulance: "অ্যাম্বুলেন্স পরিষেবা",
    ambulanceDescription: "রোগীকে হাসপাতালে নিয়ে যাওয়ার জন্য অ্যাম্বুলেন্স পরিষেবায় ফোন করুন।",
    call112: "১১২ নম্বরে কল করুন",
    call102: "১০২ নম্বরে কল করুন",
    nearby: "কাছাকাছি হাসপাতাল",
    nearbyDescription: "আপনার বর্তমান অবস্থানের আশেপাশে হাসপাতাল খুঁজুন।",
    mapLabel: "OpenStreetMap",
    detect: "📍 আমার অবস্থান শনাক্ত করুন",
    find: "কাছাকাছি হাসপাতাল খুঁজুন",
    searching: "খোঁজা হচ্ছে...",
    locationInitial: "কাছাকাছি হাসপাতাল খুঁজতে অবস্থানের অনুমতি দিন।",
    locationLoading: "আপনার বর্তমান অবস্থান খোঁজা হচ্ছে...",
    locationDetected: "আপনার বর্তমান অবস্থান শনাক্ত হয়েছে।",
    locationUnavailable: "অবস্থানের তথ্য পাওয়া যাচ্ছে না।",
    locationError: "আপনার অবস্থান পাওয়া যায়নি। অনুগ্রহ করে অবস্থানের অনুমতি দিন।",
    browserError: "আপনার ব্রাউজার অবস্থান পরিষেবা সমর্থন করে না।",
    detectFirst: "প্রথমে আপনার বর্তমান অবস্থান শনাক্ত করুন।",
    searchUnavailable: "হাসপাতাল অনুসন্ধান পরিষেবা সাময়িকভাবে উপলব্ধ নয়।",
    noHospitals: "কাছাকাছি কোনো হাসপাতালের তথ্য পাওয়া যায়নি। পরে আবার চেষ্টা করুন।",
    searchError: "হাসপাতাল খুঁজে পাওয়া যায়নি। পরে আবার চেষ্টা করুন।",
    currentLocation: "আপনার বর্তমান অবস্থান",
    directions: "যাওয়ার পথ দেখুন",
    results: "হাসপাতাল অনুসন্ধানের ফলাফল",
    emptyResults: "আপনার অবস্থান শনাক্ত করে কাছাকাছি হাসপাতাল খুঁজুন।",
    searchingHospitals: "কাছাকাছি হাসপাতাল খোঁজা হচ্ছে...",
    hospitalUnavailable: "হাসপাতালের নাম পাওয়া যায়নি",
    phone: "ফোন:",
    website: "হাসপাতালের ওয়েবসাইট",
    away: "কিমি দূরে",
    contacts: "জরুরি যোগাযোগ",
    contactsDescription: "পরিবারের সদস্য এবং পরিচর্যাকারীদের ফোন নম্বর কাছে রাখুন।",
    contactNote: "ভবিষ্যতের আপডেটে ব্যক্তিগত জরুরি যোগাযোগের নম্বর যোগ করা যাবে।",
    medicalNotice: "গুরুত্বপূর্ণ চিকিৎসা সংক্রান্ত সতর্কতা",
    medicalWarning: "কারও তীব্র বুকে ব্যথা, শ্বাসকষ্ট, অজ্ঞান হয়ে যাওয়া বা অন্য গুরুতর উপসর্গ দেখা দিলে অনলাইন মূল্যায়নের জন্য অপেক্ষা করবেন না। অবিলম্বে জরুরি পরিষেবায় যোগাযোগ করুন।",
    callEmergency: "ভারতে জরুরি অবস্থায় ১১২ নম্বরে কল করুন।",
    footer: "HeartCare | জরুরি সহায়তা"
  },

  Hindi: {
    title: "आपातकालीन सहायता",
    subtitle: "आपातकालीन सेवाओं और नज़दीकी अस्पतालों तक तुरंत पहुँचें।",
    back: "← डैशबोर्ड पर वापस जाएँ",
    services: "आपातकालीन सेवाएँ",
    servicesDescription: "यदि कोई व्यक्ति चिकित्सा आपातकाल में है, तो तुरंत आपातकालीन सेवाओं से संपर्क करें।",
    emergencyHelp: "आपातकालीन सहायता",
    emergencyHelpDescription: "तत्काल सहायता के लिए भारत का आपातकालीन नंबर।",
    ambulance: "एम्बुलेंस सेवा",
    ambulanceDescription: "मरीज़ को अस्पताल पहुँचाने के लिए एम्बुलेंस सेवा को कॉल करें।",
    call112: "112 पर कॉल करें",
    call102: "102 पर कॉल करें",
    nearby: "नज़दीकी अस्पताल",
    nearbyDescription: "अपने वर्तमान स्थान के आसपास अस्पताल खोजें।",
    mapLabel: "OpenStreetMap",
    detect: "📍 मेरी लोकेशन पता करें",
    find: "नज़दीकी अस्पताल खोजें",
    searching: "खोज रहे हैं...",
    locationInitial: "नज़दीकी अस्पताल खोजने के लिए लोकेशन की अनुमति दें।",
    locationLoading: "आपकी वर्तमान लोकेशन प्राप्त की जा रही है...",
    locationDetected: "आपकी वर्तमान लोकेशन मिल गई है।",
    locationUnavailable: "लोकेशन उपलब्ध नहीं है।",
    locationError: "आपकी लोकेशन प्राप्त नहीं हो सकी। कृपया लोकेशन की अनुमति दें।",
    browserError: "आपका ब्राउज़र लोकेशन सेवा का समर्थन नहीं करता।",
    detectFirst: "कृपया पहले अपनी वर्तमान लोकेशन पता करें।",
    searchUnavailable: "अस्पताल खोज सेवा अस्थायी रूप से उपलब्ध नहीं है।",
    noHospitals: "आसपास अस्पताल की जानकारी नहीं मिली। बाद में फिर प्रयास करें।",
    searchError: "अस्पताल खोजने में असमर्थ। कृपया बाद में फिर प्रयास करें।",
    currentLocation: "आपकी वर्तमान लोकेशन",
    directions: "रास्ता देखें",
    results: "अस्पताल खोज परिणाम",
    emptyResults: "अपनी लोकेशन पता करें और नज़दीकी अस्पताल खोजें।",
    searchingHospitals: "नज़दीकी अस्पताल खोजे जा रहे हैं...",
    hospitalUnavailable: "अस्पताल का नाम उपलब्ध नहीं है",
    phone: "फ़ोन:",
    website: "अस्पताल की वेबसाइट",
    away: "किमी दूर",
    contacts: "आपातकालीन संपर्क",
    contactsDescription: "परिवार के सदस्यों और देखभाल करने वालों के फ़ोन नंबर अपने पास रखें।",
    contactNote: "भविष्य के अपडेट में व्यक्तिगत आपातकालीन संपर्क जोड़े जा सकते हैं।",
    medicalNotice: "महत्वपूर्ण चिकित्सा सूचना",
    medicalWarning: "यदि किसी को सीने में तेज़ दर्द, साँस लेने में कठिनाई, बेहोशी या अन्य गंभीर लक्षण हों, तो ऑनलाइन मूल्यांकन की प्रतीक्षा न करें। तुरंत आपातकालीन सेवाओं से संपर्क करें।",
    callEmergency: "भारत में आपातकाल के लिए 112 पर कॉल करें।",
    footer: "HeartCare | आपातकालीन सहायता"
  }
};

function Emergency() {
  const { language } = useTheme();
  const t = translations[language] || translations.English;

  const [userLocation, setUserLocation] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [locationStatus, setLocationStatus] = useState("locationInitial");

  const getCurrentLocation = () => {
    setError("");

    if (!navigator.geolocation) {
      setError(t.browserError);
      return;
    }

    setLocationStatus("locationLoading");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = [
          position.coords.latitude,
          position.coords.longitude
        ];

        setUserLocation(location);
        setLocationStatus("locationDetected");
      },
      () => {
        setError(t.locationError);
        setLocationStatus("locationUnavailable");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  const findNearbyHospitals = async () => {
    if (!userLocation) {
      setError(t.detectFirst);
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
        throw new Error(t.searchUnavailable);
      }

      const data = await response.json();

      const results = (data.elements || [])
        .map((hospital) => {
          const lat = hospital.lat ?? hospital.center?.lat;
          const lon = hospital.lon ?? hospital.center?.lon;

          if (lat == null || lon == null) return null;

          const tags = hospital.tags || {};

          return {
            id: `${hospital.type}-${hospital.id}`,
            name: tags.name || t.hospitalUnavailable,
            latitude: lat,
            longitude: lon,
            address: [
              tags["addr:street"],
              tags["addr:city"],
              tags["addr:postcode"]
            ].filter(Boolean).join(", "),
            phone: tags.phone || tags["contact:phone"] || "",
            website: tags.website || tags["contact:website"] || "",
            distance: calculateDistance(latitude, longitude, lat, lon)
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.distance - b.distance);

      setHospitals(results);

      if (results.length === 0) {
        setError(t.noHospitals);
      }
    } catch (err) {
      setError(err.message || t.searchError);
    } finally {
      setLoading(false);
    }
  };

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

      <header className="emergency-header">
        <div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>

        <div className="emergency-header-actions">
          <a href="/dashboard" className="back-dashboard">
            {t.back}
          </a>
        </div>
      </header>

      <main className="emergency-content">

        <section className="emergency-section">
          <h2>{t.services}</h2>
          <p>{t.servicesDescription}</p>

          <div className="emergency-cards">

            <div className="emergency-card">
              <div className="emergency-card-icon">🚨</div>
              <h3>{t.emergencyHelp}</h3>
              <p>{t.emergencyHelpDescription}</p>

              <a
                href="tel:112"
                className="call-button emergency-call"
                aria-label={t.call112}
              >
                {t.call112}
              </a>
            </div>

            <div className="emergency-card">
              <div className="emergency-card-icon">🚑</div>
              <h3>{t.ambulance}</h3>
              <p>{t.ambulanceDescription}</p>

              <a
                href="tel:102"
                className="call-button ambulance-call"
                aria-label={t.call102}
              >
                {t.call102}
              </a>
            </div>

          </div>
        </section>

        <section className="hospital-section">

          <div className="section-heading">
            <div>
              <h2>{t.nearby}</h2>
              <p>{t.nearbyDescription}</p>
            </div>

            <span className="map-label">{t.mapLabel}</span>
          </div>

          <div className="location-controls">

            <button
              type="button"
              className="location-button"
              onClick={getCurrentLocation}
            >
              {t.detect}
            </button>

            <button
              type="button"
              className="hospital-search-button"
              onClick={findNearbyHospitals}
              disabled={!userLocation || loading}
            >
              {loading ? t.searching : t.find}
            </button>

          </div>

          <p className="location-message">
            {t[locationStatus]}
          </p>

          {error && (
            <div className="emergency-error" role="alert">
              {error}
            </div>
          )}

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

              {userLocation && (
                <Marker position={userLocation} icon={userLocationIcon}>
                  <Popup>{t.currentLocation}</Popup>
                </Marker>
              )}

              {hospitals.map((hospital) => (
                <Marker
                  key={hospital.id}
                  position={[hospital.latitude, hospital.longitude]}
                  icon={hospitalIcon}
                >
                  <Popup>
                    <strong>{hospital.name}</strong>
                    <br />
                    {hospital.distance.toFixed(2)} {t.away}
                    <br />
                    <button
                      type="button"
                      onClick={() => getDirections(hospital)}
                    >
                      {t.directions}
                    </button>
                  </Popup>
                </Marker>
              ))}

            </MapContainer>

          </div>

          <div className="hospital-results">
            <h3>{t.results}</h3>

            {!loading && hospitals.length === 0 && (
              <p className="empty-hospitals">{t.emptyResults}</p>
            )}

            {loading && (
              <p className="empty-hospitals">
                {t.searchingHospitals}
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
                    📍 {hospital.distance.toFixed(2)} {t.away}
                  </p>

                  {hospital.address && <p>{hospital.address}</p>}

                  {hospital.phone && (
                    <p>
                      {t.phone}{" "}
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
                        {t.website}
                      </a>
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="directions-button"
                  onClick={() => getDirections(hospital)}
                >
                  {t.directions}
                </button>
              </div>
            ))}
          </div>

        </section>

        <section className="contacts-section">
          <h2>{t.contacts}</h2>
          <p>{t.contactsDescription}</p>
          <p className="contact-note">{t.contactNote}</p>
        </section>

        <section className="medical-warning">
          <h3>{t.medicalNotice}</h3>
          <p>{t.medicalWarning}</p>
          <strong>{t.callEmergency}</strong>
        </section>

      </main>

      <footer className="emergency-footer">
        <p>{t.footer}</p>
      </footer>

    </div>
  );
}

export default Emergency;
