import { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "./context/useTheme";
import {
  PhoneCall,
  ExternalLink,
  MapPin,
  Search,
  Maximize2,
  Minimize2,
  RefreshCw,
  AlertCircle,
  Navigation
} from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";

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

const DEFAULT_CENTER = [22.9734, 78.6569]; // India center

const hospitalIcon = L.divIcon({
  className: "hospital-marker",
  html: "🏥",
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

const userLocationIcon = L.divIcon({
  className: "user-marker",
  html: "📍",
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
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
      map.flyTo(position, 13, { duration: 1.4 });
    }
  }, [position, map]);

  return null;
}

function MapResizeHandler({ isFullscreen }) {
  const map = useMap();

  useEffect(() => {
    const t1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    const t2 = setTimeout(() => {
      map.invalidateSize();
    }, 350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isFullscreen, map]);

  return null;
}

const translations = {
  English: {
    title: "Emergency Assistance",
    subtitle: "Immediate emergency dispatch services and live nearby cardiac hospital locator.",
    back: "← Back to Dashboard",
    urgentNotice: "Experiencing a Medical Emergency?",
    urgentDesc: "Do not wait. Dial emergency dispatch immediately for immediate clinical intervention.",
    call112: "Call 112 (National Emergency)",
    call102: "Call 102 / 108 (Ambulance Dispatch)",
    nearby: "Nearby Hospitals & Cardiac Centers",
    nearbyDescription: "Real-time locator for verified medical centers and hospitals near you.",
    mapLabel: "OpenStreetMap Live",
    detect: "Detect My GPS Location",
    detecting: "Detecting Location...",
    manualSearchPlaceholder: "Enter city, locality or PIN (e.g. Kolkata, 700091)",
    searchLocation: "Search Area",
    find: "Find Nearby Hospitals",
    searching: "Searching Hospitals...",
    locationInitial: "Allow location access or search your city to locate hospitals.",
    locationLoading: "Accessing GPS location from your device...",
    locationDetected: "GPS location detected successfully.",
    locationErrorPermission: "Location permission denied. Please allow location access in your browser or search your city manually below.",
    locationErrorUnavailable: "Device location unavailable. Please search your city or PIN code manually below.",
    locationErrorTimeout: "GPS location request timed out. Please retry or search your city manually below.",
    browserError: "Your browser does not support geolocation. Please search your city manually below.",
    noHospitals: "No hospitals found within this immediate radius. Try zooming out or click 'Search on Google Maps'.",
    currentLocation: "Your Detected Location",
    directions: "Get Directions",
    results: "Hospital Locator Results",
    emptyResults: "Detect your location or enter your city to find nearby hospitals.",
    searchingHospitals: "Searching verified hospital records...",
    hospitalUnavailable: "Hospital Name Unavailable",
    phone: "Phone:",
    website: "Hospital Website",
    away: "km away",
    contacts: "Emergency Contacts & Support",
    contactsDescription: "Keep emergency contacts accessible at all times during critical episodes.",
    contactNote: "Direct caregiver emergency contacts and speed-dial numbers can be saved to your profile.",
    medicalNotice: "Important Medical Notice",
    medicalWarning: "Do not wait for an online assessment if someone has severe chest pain, radiating shoulder pain, sudden shortness of breath, fainting, or acute dizziness. Contact emergency services immediately.",
    callEmergency: "For all emergencies in India, dial 112 immediately.",
    footer: "HeartGuard AI | Emergency Assistance & Rapid Response"
  },
  Bengali: {
    title: "জরুরি সহায়তা",
    subtitle: "জরুরি পরিষেবা এবং লাইভ কাছাকাছি হাসপাতালের তাৎক্ষণিক তথ্য।",
    back: "← ড্যাশবোর্ডে ফিরে যান",
    urgentNotice: "চিকিৎসাজনিত জরুরি অবস্থা?",
    urgentDesc: "দেরি করবেন না। অবিলম্বে জরুরি নম্বরে কল করে সাহায্য নিন।",
    call112: "১১২ নম্বরে কল করুন (জাতীয় জরুরি নম্বর)",
    call102: "১০২ / ১০৮ নম্বরে কল করুন (অ্যাম্বুলেন্স)",
    nearby: "কাছাকাছি হাসপাতাল",
    nearbyDescription: "আপনার অবস্থানের আশেপাশে যাচাইকৃত হাসপাতাল এবং কার্ডিয়াক কেন্দ্র খুঁজুন।",
    mapLabel: "ওপেনস্ট্রিটম্যাপ লাইভ",
    detect: "আমার অবস্থান শনাক্ত করুন",
    detecting: "অবস্থান খোঁজা হচ্ছে...",
    manualSearchPlaceholder: "শহর, এলাকা বা পিন কোড লিখুন (যেমন: Kolkata, 700091)",
    searchLocation: "এলাকা খুঁজুন",
    find: "কাছাকাছি হাসপাতাল খুঁজুন",
    searching: "হাসপাতাল খোঁজা হচ্ছে...",
    locationInitial: "কাছাকাছি হাসপাতাল দেখতে অবস্থানের অনুমতি দিন বা এলাকা অনুসন্ধান করুন।",
    locationLoading: "ডিভাইস থেকে জিপিএস অবস্থান নেওয়া হচ্ছে...",
    locationDetected: "অবস্থান সফলভাবে শনাক্ত হয়েছে।",
    locationErrorPermission: "অবস্থানের অনুমতি মেলেনি। ব্রাউজারে অনুমতি দিন অথবা নিচের বক্সে আপনার শহর লিখুন।",
    locationErrorUnavailable: "অবস্থানের তথ্য পাওয়া যায়নি। নিচের বক্সে শহরের নাম লিখে অনুসন্ধান করুন।",
    locationErrorTimeout: "অবস্থান শনাক্ত করতে সময়সীমা শেষ হয়েছে। পুনরায় চেষ্টা করুন বা শহর অনুসন্ধান করুন।",
    browserError: "আপনার ব্রাউজার অবস্থান পরিষেবা সমর্থন করে না।",
    noHospitals: "এই ব্যাসার্ধের মধ্যে কোনো হাসপাতাল পাওয়া যায়নি। গুগল ম্যাপে অনুসন্ধান করে দেখতে পারেন।",
    currentLocation: "আপনার বর্তমান অবস্থান",
    directions: "যাওয়ার পথ দেখুন",
    results: "হাসপাতাল অনুসন্ধানের ফলাফল",
    emptyResults: "আপনার অবস্থান শনাক্ত করুন বা শহরের নাম লিখে হাসপাতাল খুঁজুন।",
    searchingHospitals: "কাছাকাছি হাসপাতাল খোঁজা হচ্ছে...",
    hospitalUnavailable: "হাসপাতালের নাম পাওয়া যায়নি",
    phone: "ফোন:",
    website: "ওয়েবসাইট",
    away: "কিমি দূরে",
    contacts: "জরুরি যোগাযোগ",
    contactsDescription: "জরুরি পরিস্থিতিতে দ্রুত যোগাযোগের জন্য নম্বর হাতের কাছে রাখুন।",
    contactNote: "জরুরি পরিস্থিতিতে পরিবারের সদস্য ও চিকিৎসকের নম্বর প্রোফাইলে যুক্ত করা যাবে।",
    medicalNotice: "জরুরি চিকিৎসা সংক্রান্ত সতর্কতা",
    medicalWarning: "তীব্র বুকে ব্যথা, শ্বাসকষ্ট বা অজ্ঞান হয়ে যাওয়ার মতো উপসর্গ দেখা দিলে অনলাইন পর্যালোচনার অপেক্ষা না করে দ্রুত ১১২ নম্বরে যোগাযোগ করুন।",
    callEmergency: "ভারতে যেকোনো জরুরি পরিস্থিতিতে অবিলম্বে ১১২ নম্বরে ফোন করুন।",
    footer: "HeartGuard AI | জরুরি সহায়তা"
  },
  Hindi: {
    title: "आपातकालीन सहायता",
    subtitle: "आपातकालीन सेवाएँ और नज़दीकी अस्पतालों का तत्काल लाइव लोकेटर।",
    back: "← डैशबोर्ड पर वापस जाएँ",
    urgentNotice: "चिकित्सा आपातकाल का सामना कर रहे हैं?",
    urgentDesc: "प्रतीक्षा न करें। तत्काल चिकित्सा सहायता के लिए तुरंत आपातकालीन नंबर पर कॉल करें।",
    call112: "112 पर कॉल करें (राष्ट्रीय आपातकाल)",
    call102: "102 / 108 पर कॉल करें (एम्बुलेंस सेवा)",
    nearby: "नज़दीकी अस्पताल एवं कार्डियक केंद्र",
    nearbyDescription: "अपने वर्तमान स्थान के आसपास सत्यापित अस्पतालों की खोज करें।",
    mapLabel: "OpenStreetMap Live",
    detect: "मेरी जीपीएस लोकेशन पता करें",
    detecting: "लोकेशन पता की जा रही है...",
    manualSearchPlaceholder: "शहर, इलाका या पिन कोड दर्ज करें (उदा. Kolkata, 700091)",
    searchLocation: "क्षेत्र खोजें",
    find: "नज़दीकी अस्पताल खोजें",
    searching: "अस्पताल खोजे जा रहे हैं...",
    locationInitial: "नज़दीकी अस्पताल देखने के लिए लोकेशन की अनुमति दें या अपना शहर खोजें।",
    locationLoading: "डिवाइस से जीपीएस लोकेशन प्राप्त की जा रही है...",
    locationDetected: "लोकेशन सफलतापूर्वक प्राप्त हो गई है।",
    locationErrorPermission: "लोकेशन अनुमति अस्वीकृत। कृपया ब्राउज़र में अनुमति दें या नीचे अपना शहर दर्ज करें।",
    locationErrorUnavailable: "डिवाइस लोकेशन अनुपलब्ध। कृपया नीचे शहर या पिन कोड खोजें।",
    locationErrorTimeout: "जीपीएस अनुरोध समय समाप्त। पुनः प्रयास करें या नीचे शहर खोजें।",
    browserError: "आपका ब्राउज़र लोकेशन सेवा का समर्थन नहीं करता।",
    noHospitals: "इस दायरे में कोई अस्पताल नहीं मिला। आप गूगल मैप्स पर भी खोज सकते हैं।",
    currentLocation: "आपकी वर्तमान लोकेशन",
    directions: "रास्ता देखें",
    results: "अस्पताल खोज परिणाम",
    emptyResults: "अपनी लोकेशन पता करें या शहर का नाम लिखकर अस्पताल खोजें।",
    searchingHospitals: "सत्यापित अस्पताल खोजे जा रहे हैं...",
    hospitalUnavailable: "अस्पताल का नाम उपलब्ध नहीं है",
    phone: "फ़ोन:",
    website: "वेबसाइट",
    away: "किमी दूर",
    contacts: "आपातकालीन संपर्क",
    contactsDescription: "संकट के समय तुरंत संपर्क के लिए महत्वपूर्ण फ़ोन नंबर तैयार रखें।",
    contactNote: "परिवार के सदस्यों और डॉक्टरों के नंबर आपकी प्रोफ़ाइल में सुरक्षित किए जा सकते हैं।",
    medicalNotice: "महत्वपूर्ण चिकित्सा सूचना",
    medicalWarning: "गंभीर सीने में दर्द, सांस लेने में तकलीफ या बेहोशी होने पर तुरंत 112 पर संपर्क करें।",
    callEmergency: "भारत में किसी भी आपातकाल के लिए 112 पर तुरंत कॉल करें।",
    footer: "HeartGuard AI | आपातकालीन सहायता"
  }
};

function Emergency() {
  const { language } = useTheme();
  const t = translations[language] || translations.English;

  const [userLocation, setUserLocation] = useState(null);
  const [detectedAreaName, setDetectedAreaName] = useState("");
  const [manualQuery, setManualQuery] = useState("");
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);

  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locationStatus, setLocationStatus] = useState("locationInitial");

  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef(null);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Reverse geocode lat, lon to human readable place name
  const reverseGeocode = async (lat, lon) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=14&addressdetails=1`,
        {
          signal: controller.signal,
          headers: {
            "Accept-Language": "en"
          }
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const addr = data.address || {};
        const parts = [
          addr.suburb || addr.neighbourhood || addr.residential || addr.city_district,
          addr.city || addr.town || addr.village || addr.county,
          addr.state
        ].filter(Boolean);

        if (parts.length > 0) {
          setDetectedAreaName(parts.join(", "));
        } else if (data.display_name) {
          setDetectedAreaName(data.display_name.split(",").slice(0, 3).join(","));
        }
      }
    } catch {
      // Non-fatal, reverse geocode failed silently
    }
  };

  // Hospital search logic with Nominatim bounding box + Overpass fallback
  const fetchNearbyHospitals = useCallback(async (latitude, longitude) => {
    const cacheKey = `heartcare_hospitals_${latitude.toFixed(3)}_${longitude.toFixed(3)}`;

    // 1. Instant Cache Check (<1ms)
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHospitals(parsed);
          setLoading(false);
          setError("");
          return;
        }
      }
    } catch {
      // ignore cache read error
    }

    setLoading(true);
    setError("");

    // 2. Primary Fast Search: OSM Nominatim Bounding Box (~10-12km viewbox)
    try {
      const delta = 0.09; // ~10km
      const minLon = longitude - delta;
      const maxLon = longitude + delta;
      const minLat = latitude - delta;
      const maxLat = latitude + delta;

      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=hospital&viewbox=${minLon},${maxLat},${maxLon},${minLat}&bounded=1&limit=25&addressdetails=1`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(nominatimUrl, {
        signal: controller.signal,
        headers: {
          "Accept-Language": "en"
        }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const rawList = await response.json();
        if (Array.isArray(rawList) && rawList.length > 0) {
          const parsedList = rawList
            .map((item) => {
              const itemLat = parseFloat(item.lat);
              const itemLon = parseFloat(item.lon);
              if (isNaN(itemLat) || isNaN(itemLon)) return null;

              const dist = calculateDistance(latitude, longitude, itemLat, itemLon);
              const displayName = item.name || item.display_name.split(",")[0] || t.hospitalUnavailable;

              return {
                id: `nom-${item.place_id || item.osm_id || Math.random()}`,
                name: displayName,
                latitude: itemLat,
                longitude: itemLon,
                address: item.display_name || "",
                phone: "",
                website: "",
                distance: dist
              };
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance);

          if (parsedList.length > 0) {
            setHospitals(parsedList);
            try {
              sessionStorage.setItem(cacheKey, JSON.stringify(parsedList));
            } catch {
              // ignore cache write error
            }
            setLoading(false);
            return;
          }
        }
      }
    } catch {
      // Primary Nominatim search timed out or failed, fall through to Overpass fallback
    }

    // 3. Fallback: Overpass API with node, way, relation
    try {
      const overpassQuery = `
        [out:json][timeout:10];
        (
          node["amenity"="hospital"](around:8000,${latitude},${longitude});
          way["amenity"="hospital"](around:8000,${latitude},${longitude});
          relation["amenity"="hospital"](around:8000,${latitude},${longitude});
        );
        out center 25;
      `;

      const fallbackEndpoints = [
        "https://overpass-api.de/api/interpreter",
        "https://lz4.overpass-api.de/api/interpreter"
      ];

      let overpassData = null;
      for (const endpoint of fallbackEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `data=${encodeURIComponent(overpassQuery)}`
          });
          if (res.ok) {
            overpassData = await res.json();
            break;
          }
        } catch {
          // try next endpoint
        }
      }

      if (overpassData && overpassData.elements) {
        const overpassResults = overpassData.elements
          .map((el) => {
            const elLat = el.lat ?? el.center?.lat;
            const elLon = el.lon ?? el.center?.lon;
            if (elLat == null || elLon == null) return null;

            const tags = el.tags || {};
            const name = tags.name || tags["name:en"] || t.hospitalUnavailable;

            return {
              id: `${el.type || "el"}-${el.id}`,
              name,
              latitude: elLat,
              longitude: elLon,
              address: [
                tags["addr:street"],
                tags["addr:city"],
                tags["addr:postcode"]
              ].filter(Boolean).join(", "),
              phone: tags.phone || tags["contact:phone"] || "",
              website: tags.website || tags["contact:website"] || "",
              distance: calculateDistance(latitude, longitude, elLat, elLon)
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.distance - b.distance);

        if (overpassResults.length > 0) {
          setHospitals(overpassResults);
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(overpassResults));
          } catch {
            // ignore
          }
          setLoading(false);
          return;
        }
      }

      setError(t.noHospitals);
    } catch {
      setError(t.noHospitals);
    } finally {
      setLoading(false);
    }
  }, [t.hospitalUnavailable, t.noHospitals]);

  // GPS Location Detection with comprehensive error handling
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
        reverseGeocode(location[0], location[1]);
        fetchNearbyHospitals(location[0], location[1]);
      },
      (err) => {
        if (err.code === 1) {
          setError(t.locationErrorPermission);
        } else if (err.code === 2) {
          setError(t.locationErrorUnavailable);
        } else if (err.code === 3) {
          setError(t.locationErrorTimeout);
        } else {
          setError(t.locationErrorPermission);
        }
        setLocationStatus("locationUnavailable");
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000
      }
    );
  };

  // Manual Location Search (City, PIN, locality)
  const handleManualSearch = async (e) => {
    e?.preventDefault();
    const query = manualQuery.trim();
    if (!query) return;

    setIsSearchingLocation(true);
    setError("");

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=1`,
        {
          signal: controller.signal,
          headers: {
            "Accept-Language": "en"
          }
        }
      );
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error("Location search failed");
      }

      const list = await res.json();
      if (!list || list.length === 0) {
        // Retry without country code restriction in case query was specific
        const retryRes = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
        );
        const retryList = await retryRes.json();
        if (!retryList || retryList.length === 0) {
          setError(`No location found for "${query}". Please check the spelling or try a nearby city or PIN code.`);
          setIsSearchingLocation(false);
          return;
        }
        const found = retryList[0];
        const newCoords = [parseFloat(found.lat), parseFloat(found.lon)];
        setUserLocation(newCoords);
        setDetectedAreaName(found.display_name.split(",").slice(0, 3).join(","));
        setLocationStatus("locationDetected");
        fetchNearbyHospitals(newCoords[0], newCoords[1]);
        setIsSearchingLocation(false);
        return;
      }

      const found = list[0];
      const newCoords = [parseFloat(found.lat), parseFloat(found.lon)];
      setUserLocation(newCoords);
      setDetectedAreaName(found.display_name.split(",").slice(0, 3).join(","));
      setLocationStatus("locationDetected");
      fetchNearbyHospitals(newCoords[0], newCoords[1]);
    } catch {
      setError(`Unable to search location right now. Please check your network connection and try again.`);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const openGoogleMapsSearch = () => {
    if (!userLocation) {
      window.open("https://www.google.com/maps/search/hospitals+near+me", "_blank", "noopener,noreferrer");
      return;
    }
    const [lat, lon] = userLocation;
    window.open(`https://www.google.com/maps/search/hospitals/@${lat},${lon},14z`, "_blank", "noopener,noreferrer");
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

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
  };

  return (
    <div className="emergency-page">
      <DashboardSidebar activeKey="/emergency" />

      <div className="emergency-page-main">
        <header className="emergency-header">
          <div>
            <h1>{t.title}</h1>
            <p>{t.subtitle}</p>
          </div>

          <div className="emergency-header-actions">
            <Link to="/dashboard" className="back-dashboard">
              {t.back}
            </Link>
          </div>
        </header>

        <main className="emergency-content">
          {/* Unified High-Impact Emergency Action Section (112 & 102/108, Zero Duplicates) */}
          <section className="emergency-quick-bar" aria-label="Immediate Emergency Actions">
            <div className="quick-bar-notice">
              <span className="pulsing-red-dot" aria-hidden="true" />
              <div>
                <strong>{t.urgentNotice}</strong>
                <p>{t.urgentDesc}</p>
              </div>
            </div>

            <div className="quick-call-buttons">
              <a
                href="tel:112"
                className="quick-call-btn btn-112"
                aria-label="Call 112 National Emergency Hotline in India"
              >
                <PhoneCall size={20} aria-hidden="true" />
                <span>{t.call112}</span>
              </a>
              <a
                href="tel:102"
                className="quick-call-btn btn-102"
                aria-label="Call 102 or 108 Ambulance Dispatch in India"
              >
                <PhoneCall size={20} aria-hidden="true" />
                <span>{t.call102}</span>
              </a>
            </div>
          </section>

          {/* Hospital Locator & Map Section */}
          <section className="hospital-section">
            <div className="section-heading">
              <div>
                <h2>{t.nearby}</h2>
                <p>{t.nearbyDescription}</p>
              </div>

              <span className="map-label">{t.mapLabel}</span>
            </div>

            {/* Location & Search Controls Bar */}
            <div className="location-controls-bar">
              <div className="location-button-group">
                <button
                  type="button"
                  className="location-button"
                  onClick={getCurrentLocation}
                  disabled={locationStatus === "locationLoading"}
                >
                  {locationStatus === "locationLoading" ? (
                    <>
                      <RefreshCw size={16} className="spin-icon" aria-hidden="true" />
                      <span>{t.detecting}</span>
                    </>
                  ) : (
                    <>
                      <Navigation size={16} aria-hidden="true" />
                      <span>{t.detect}</span>
                    </>
                  )}
                </button>

                {userLocation && (
                  <button
                    type="button"
                    className="hospital-search-button"
                    onClick={() => fetchNearbyHospitals(userLocation[0], userLocation[1])}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="spin-icon" aria-hidden="true" />
                        <span>{t.searching}</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} aria-hidden="true" />
                        <span>{t.find}</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  type="button"
                  className="gmaps-search-button"
                  onClick={openGoogleMapsSearch}
                  title="Search directly on Google Maps"
                >
                  <ExternalLink size={16} aria-hidden="true" />
                  <span>Google Maps</span>
                </button>
              </div>

              {/* Manual Location Search Fallback */}
              <form className="manual-location-form" onSubmit={handleManualSearch}>
                <div className="manual-input-wrapper">
                  <MapPin size={16} className="input-pin-icon" aria-hidden="true" />
                  <input
                    type="text"
                    value={manualQuery}
                    onChange={(e) => setManualQuery(e.target.value)}
                    placeholder={t.manualSearchPlaceholder}
                    aria-label="Enter city, locality or PIN code"
                    className="manual-location-input"
                  />
                </div>
                <button
                  type="submit"
                  className="manual-search-btn"
                  disabled={isSearchingLocation || !manualQuery.trim()}
                >
                  {isSearchingLocation ? (
                    <RefreshCw size={15} className="spin-icon" aria-hidden="true" />
                  ) : (
                    <Search size={15} aria-hidden="true" />
                  )}
                  <span>{t.searchLocation}</span>
                </button>
              </form>
            </div>

            {/* Active Location Info Pill */}
            {detectedAreaName && (
              <div className="detected-area-pill">
                <MapPin size={15} aria-hidden="true" />
                <span>Detected Area: <strong>{detectedAreaName}</strong></span>
              </div>
            )}

            <p className="location-message">
              {t[locationStatus] || t.locationInitial}
            </p>

            {error && (
              <div className="emergency-error" role="alert">
                <AlertCircle size={18} className="error-icon" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* Interactive Leaflet Map with Fullscreen Support */}
            <div
              ref={mapContainerRef}
              className={`emergency-map ${isFullscreen ? "map-fullscreen" : ""}`}
            >
              {/* Fullscreen Toggle Header Bar */}
              <div className="map-action-overlay">
                <button
                  type="button"
                  className="map-fullscreen-btn"
                  onClick={toggleFullscreen}
                  title={isFullscreen ? "Exit Fullscreen (Esc)" : "Expand Map Fullscreen"}
                  aria-label={isFullscreen ? "Exit Fullscreen" : "Expand Map Fullscreen"}
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 size={16} aria-hidden="true" />
                      <span>Exit Fullscreen</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 size={16} aria-hidden="true" />
                      <span>Fullscreen Map</span>
                    </>
                  )}
                </button>
              </div>

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
                <MapResizeHandler isFullscreen={isFullscreen} />

                {userLocation && (
                  <Marker position={userLocation} icon={userLocationIcon}>
                    <Popup>
                      <strong>{t.currentLocation}</strong>
                      {detectedAreaName && <div>{detectedAreaName}</div>}
                    </Popup>
                  </Marker>
                )}

                {hospitals.map((hospital) => (
                  <Marker
                    key={hospital.id}
                    position={[hospital.latitude, hospital.longitude]}
                    icon={hospitalIcon}
                  >
                    <Popup>
                      <div className="popup-hospital-card">
                        <strong>{hospital.name}</strong>
                        <div className="popup-dist">📍 {hospital.distance.toFixed(2)} {t.away}</div>
                        {hospital.address && <div className="popup-addr">{hospital.address}</div>}
                        <button
                          type="button"
                          className="popup-dir-btn"
                          onClick={() => getDirections(hospital)}
                        >
                          {t.directions}
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* Hospital Search Results List */}
            <div className="hospital-results">
              <div className="results-header">
                <h3>{t.results}</h3>
                {hospitals.length > 0 && (
                  <span className="results-count-badge">
                    {hospitals.length} centers found
                  </span>
                )}
              </div>

              {!loading && hospitals.length === 0 && (
                <div className="empty-hospitals">
                  <p>{t.emptyResults}</p>
                  <button
                    type="button"
                    className="gmaps-search-button empty-gmaps-btn"
                    onClick={openGoogleMapsSearch}
                  >
                    <ExternalLink size={16} aria-hidden="true" />
                    <span>Search on Google Maps</span>
                  </button>
                </div>
              )}

              {loading && (
                <div className="loading-hospitals-state">
                  <RefreshCw size={24} className="spin-icon" aria-hidden="true" />
                  <p>{t.searchingHospitals}</p>
                </div>
              )}

              <div className="hospital-cards-grid">
                {hospitals.map((hospital) => (
                  <div className="hospital-result-card" key={hospital.id}>
                    <div className="hospital-card-content">
                      <div className="hospital-card-header">
                        <h4>{hospital.name}</h4>
                        <span className="distance-badge">
                          📍 {hospital.distance.toFixed(2)} {t.away}
                        </span>
                      </div>

                      {hospital.address && (
                        <p className="hospital-card-addr">{hospital.address}</p>
                      )}

                      {hospital.phone && (
                        <p className="hospital-card-phone">
                          {t.phone}{" "}
                          <a href={`tel:${hospital.phone}`}>{hospital.phone}</a>
                        </p>
                      )}

                      {hospital.website && (
                        <p className="hospital-card-web">
                          <a
                            href={
                              hospital.website.startsWith("http")
                                ? hospital.website
                                : `https://${hospital.website}`
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            {t.website} ↗
                          </a>
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="directions-button"
                      onClick={() => getDirections(hospital)}
                      aria-label={`Get directions to ${hospital.name}`}
                    >
                      <Navigation size={15} aria-hidden="true" />
                      <span>{t.directions}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Emergency Support & Contacts Section */}
          <section className="contacts-section">
            <h2>{t.contacts}</h2>
            <p>{t.contactsDescription}</p>
            <p className="contact-note">{t.contactNote}</p>
          </section>

          {/* Critical Medical Warning */}
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
    </div>
  );
}

export default Emergency;
