
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "./context/useTheme";
import DashboardSidebar from "./DashboardSidebar";

import {
  HeartPulse,
  Pill,
  Syringe,
  Activity,
  Droplets,
  Wind,
  Search,
  MapPin,
  Navigation,
  ArrowLeft,
  PackageSearch,
  ShieldCheck,
  Clock,
  Filter,
  X
} from "lucide-react";

import "./HeartResources.css";

const translations = {
  English: {
    home: "Home",
    emergency: "Emergency",
    dashboard: "Dashboard",
    lifeline: "HEARTGUARD AI LIFELINE",
    heroTitle: "Essential Healthcare",
    heroHighlight: "Resources Across India",
    heroDescription: "Find information about important heart medicines, emergency medical equipment, blood banks and oxygen services across India.",
    searchLocation: "Search resources by state and city",
    demoTitle: "Frontend demonstration only",
    demoDescription: "These are sample listings, not verified providers or live stock information. Do not use them to make medical or emergency decisions.",
    explore: "EXPLORE",
    resources: "Healthcare Resources",
    chooseResource: "Choose the type of resource you are looking for.",
    findResources: "FIND RESOURCES",
    searchIndia: "Search Across India",
    searchDescription: "Search by resource name, provider or location.",
    searchPlaceholder: "Search medicines, equipment, blood...",
    allStates: "All States",
    allCities: "All Cities",
    listings: "Resource Listings",
    listingsFound: "demonstration listing(s) found",
    demoData: "Demo data",
    viewDetails: "View Details",
    noResults: "No matching resources found",
    noResultsDescription: "Try another search term, state or category.",
    clearFilters: "Clear Filters",
    closeDetails: "Close Details",
    sampleInformation: "This is sample information. Provider details and availability have not been verified.",
    provider: "Provider",
    updated: "Updated",
    footerDescription: "Healthcare resource discovery concept for India. Always confirm availability directly with a verified provider.",
    copyright: "© 2026 HeartGuard AI. All rights reserved.",
    allResources: "All Resources",
    medicines: "Heart Medicines",
    injections: "Emergency Injections",
    equipment: "Medical Equipment",
    blood: "Blood Availability",
    oxygen: "Oxygen Supply",
    demoListing: "Demo listing",
    demoRecord: "Demo record",
    clearSearch: "Clear search",
    close: "Close details",
    categoryLabel: "Category"
  },

  Hindi: {
    home: "होम",
    emergency: "आपातकाल",
    dashboard: "डैशबोर्ड",
    lifeline: "हार्टकेयर लाइफलाइन",
    heroTitle: "आवश्यक स्वास्थ्य सेवाएँ",
    heroHighlight: "भारत भर में संसाधन",
    heroDescription: "भारत भर में हृदय की दवाओं, आपातकालीन चिकित्सा उपकरणों, ब्लड बैंक और ऑक्सीजन सेवाओं की जानकारी प्राप्त करें।",
    searchLocation: "राज्य और शहर के अनुसार संसाधन खोजें",
    demoTitle: "केवल फ्रंटएंड प्रदर्शन",
    demoDescription: "ये नमूना सूची हैं, सत्यापित प्रदाता या वास्तविक स्टॉक की जानकारी नहीं। चिकित्सा या आपातकालीन निर्णय लेने के लिए इनका उपयोग न करें।",
    explore: "जानें",
    resources: "स्वास्थ्य संसाधन",
    chooseResource: "अपनी आवश्यकता के अनुसार संसाधन चुनें।",
    findResources: "संसाधन खोजें",
    searchIndia: "भारत भर में खोजें",
    searchDescription: "संसाधन, प्रदाता या स्थान के नाम से खोजें।",
    searchPlaceholder: "दवाइयाँ, उपकरण, रक्त खोजें...",
    allStates: "सभी राज्य",
    allCities: "सभी शहर",
    listings: "संसाधनों की सूची",
    listingsFound: "डेमो सूची मिली",
    demoData: "डेमो डेटा",
    viewDetails: "विवरण देखें",
    noResults: "कोई मिलती-जुलती जानकारी नहीं मिली",
    noResultsDescription: "दूसरा शब्द, राज्य या श्रेणी चुनकर देखें।",
    clearFilters: "फ़िल्टर हटाएँ",
    closeDetails: "विवरण बंद करें",
    sampleInformation: "यह नमूना जानकारी है। प्रदाता और उपलब्धता की पुष्टि नहीं की गई है।",
    provider: "प्रदाता",
    updated: "अपडेट",
    footerDescription: "भारत के लिए स्वास्थ्य संसाधन खोजने की अवधारणा। उपलब्धता की पुष्टि हमेशा सत्यापित प्रदाता से करें।",
    copyright: "© 2026 HeartGuard AI. सर्वाधिकार सुरक्षित।",
    allResources: "सभी संसाधन",
    medicines: "हृदय की दवाएँ",
    injections: "आपातकालीन इंजेक्शन",
    equipment: "चिकित्सा उपकरण",
    blood: "रक्त की उपलब्धता",
    oxygen: "ऑक्सीजन की आपूर्ति",
    demoListing: "डेमो सूची",
    demoRecord: "डेमो रिकॉर्ड",
    clearSearch: "खोज हटाएँ",
    close: "विवरण बंद करें",
    categoryLabel: "श्रेणी"
  },

  Bengali: {
    home: "হোম",
    emergency: "জরুরি পরিষেবা",
    dashboard: "ড্যাশবোর্ড",
    lifeline: "হার্টকেয়ার লাইফলাইন",
    heroTitle: "প্রয়োজনীয় স্বাস্থ্য পরিষেবা",
    heroHighlight: "ভারতজুড়ে স্বাস্থ্য সংস্থান",
    heroDescription: "ভারতজুড়ে গুরুত্বপূর্ণ হার্টের ওষুধ, জরুরি চিকিৎসা সরঞ্জাম, ব্লাড ব্যাংক এবং অক্সিজেন পরিষেবা সম্পর্কে তথ্য খুঁজুন।",
    searchLocation: "রাজ্য ও শহর অনুযায়ী সংস্থান খুঁজুন",
    demoTitle: "শুধুমাত্র ফ্রন্টএন্ড প্রদর্শন",
    demoDescription: "এগুলি নমুনা তালিকা, যাচাইকৃত পরিষেবা প্রদানকারী বা লাইভ স্টকের তথ্য নয়। চিকিৎসা বা জরুরি সিদ্ধান্ত নিতে এগুলি ব্যবহার করবেন না।",
    explore: "অন্বেষণ করুন",
    resources: "স্বাস্থ্য সংস্থান",
    chooseResource: "আপনার প্রয়োজনীয় সংস্থানের ধরন বেছে নিন।",
    findResources: "সংস্থান খুঁজুন",
    searchIndia: "ভারতজুড়ে খুঁজুন",
    searchDescription: "সংস্থানের নাম, প্রদানকারী বা অবস্থান দিয়ে খুঁজুন।",
    searchPlaceholder: "ওষুধ, সরঞ্জাম, রক্ত খুঁজুন...",
    allStates: "সব রাজ্য",
    allCities: "সব শহর",
    listings: "সংস্থানের তালিকা",
    listingsFound: "টি নমুনা তালিকা পাওয়া গেছে",
    demoData: "নমুনা তথ্য",
    viewDetails: "বিস্তারিত দেখুন",
    noResults: "কোনও মিল পাওয়া যায়নি",
    noResultsDescription: "অন্য শব্দ, রাজ্য বা বিভাগ দিয়ে চেষ্টা করুন।",
    clearFilters: "ফিল্টার মুছুন",
    closeDetails: "বিস্তারিত বন্ধ করুন",
    sampleInformation: "এটি নমুনা তথ্য। পরিষেবা প্রদানকারী এবং প্রাপ্যতা যাচাই করা হয়নি।",
    provider: "পরিষেবা প্রদানকারী",
    updated: "আপডেট",
    footerDescription: "ভারতের জন্য স্বাস্থ্য সংস্থান খোঁজার একটি ধারণা। প্রাপ্যতা যাচাইকৃত প্রদানকারীর কাছ থেকে নিশ্চিত করুন।",
    copyright: "© ২০২৬ HeartGuard AI. সর্বস্বত্ব সংরক্ষিত।",
    allResources: "সব সংস্থান",
    medicines: "হার্টের ওষুধ",
    injections: "জরুরি ইনজেকশন",
    equipment: "চিকিৎসা সরঞ্জাম",
    blood: "রক্তের প্রাপ্যতা",
    oxygen: "অক্সিজেন সরবরাহ",
    demoListing: "নমুনা তালিকা",
    demoRecord: "নমুনা রেকর্ড",
    clearSearch: "সার্চ মুছুন",
    close: "বিস্তারিত বন্ধ করুন",
    categoryLabel: "বিভাগ"
  }
};

const categories = [
  { id: "all", key: "allResources", icon: PackageSearch },
  { id: "medicines", key: "medicines", icon: Pill },
  { id: "injections", key: "injections", icon: Syringe },
  { id: "equipment", key: "equipment", icon: Activity },
  { id: "blood", key: "blood", icon: Droplets },
  { id: "oxygen", key: "oxygen", icon: Wind }
];

const states = [
  "West Bengal",
  "Delhi",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Uttar Pradesh",
  "Telangana",
  "Gujarat",
  "Rajasthan",
  "Kerala",
  "Bihar",
  "Odisha",
  "Punjab",
  "Assam"
];

// These are demonstration records only, not live provider or stock data.
const resources = [
  {
    id: 1,
    name: "Cardiac Medicine Information",
    category: "medicines",
    provider: "Demo Pharmacy",
    city: "Kolkata",
    state: "West Bengal",
    address: "Example Road, Kolkata",
    description: "Information listing for commonly prescribed cardiac medicines."
  },
  {
    id: 2,
    name: "Emergency Injection Information",
    category: "injections",
    provider: "Demo Medical Centre",
    city: "Delhi",
    state: "Delhi",
    address: "Example Medical Road, Delhi",
    description: "Emergency medication information. Administration requires qualified medical staff."
  },
  {
    id: 3,
    name: "ECG Machine",
    category: "equipment",
    provider: "Demo Hospital",
    city: "Mumbai",
    state: "Maharashtra",
    address: "Example Hospital Road, Mumbai",
    description: "Electrocardiogram equipment information."
  },
  {
    id: 4,
    name: "Blood Group Information - O+",
    category: "blood",
    provider: "Demo Blood Bank",
    city: "Bengaluru",
    state: "Karnataka",
    address: "Example Health Road, Bengaluru",
    description: "Blood bank contact and blood group information."
  },
  {
    id: 5,
    name: "Oxygen Concentrator",
    category: "oxygen",
    provider: "Demo Healthcare Centre",
    city: "Chennai",
    state: "Tamil Nadu",
    address: "Example Care Road, Chennai",
    description: "Oxygen concentrator service information."
  },
  {
    id: 6,
    name: "Defibrillator",
    category: "equipment",
    provider: "Demo Emergency Centre",
    city: "Hyderabad",
    state: "Telangana",
    address: "Example Emergency Road, Hyderabad",
    description: "Emergency defibrillator equipment information."
  },
  {
    id: 7,
    name: "Blood Group Information - B+",
    category: "blood",
    provider: "Demo Blood Centre",
    city: "Bhubaneswar",
    state: "Odisha",
    address: "Example Blood Centre Road, Bhubaneswar",
    description: "Blood bank contact and blood group information."
  },
  {
    id: 8,
    name: "Oxygen Cylinder Information",
    category: "oxygen",
    provider: "Demo Medical Services",
    city: "Jaipur",
    state: "Rajasthan",
    address: "Example Medical Road, Jaipur",
    description: "Oxygen cylinder service information."
  }
];

const resourceTranslations = {
  Hindi: {
    1: ["हृदय की दवाओं की जानकारी", "डेमो फार्मेसी", "आमतौर पर निर्धारित हृदय की दवाओं की जानकारी।"],
    2: ["आपातकालीन इंजेक्शन की जानकारी", "डेमो मेडिकल सेंटर", "आपातकालीन दवा की जानकारी। इसे केवल योग्य चिकित्सा कर्मचारी ही दे सकते हैं।"],
    3: ["ईसीजी मशीन", "डेमो अस्पताल", "इलेक्ट्रोकार्डियोग्राम उपकरण की जानकारी।"],
    4: ["रक्त समूह की जानकारी - O+", "डेमो ब्लड बैंक", "ब्लड बैंक संपर्क और रक्त समूह की जानकारी।"],
    5: ["ऑक्सीजन कंसंट्रेटर", "डेमो हेल्थकेयर सेंटर", "ऑक्सीजन कंसंट्रेटर सेवा की जानकारी।"],
    6: ["डिफिब्रिलेटर", "डेमो आपातकालीन केंद्र", "आपातकालीन डिफिब्रिलेटर उपकरण की जानकारी।"],
    7: ["रक्त समूह की जानकारी - B+", "डेमो ब्लड सेंटर", "ब्लड बैंक संपर्क और रक्त समूह की जानकारी।"],
    8: ["ऑक्सीजन सिलेंडर की जानकारी", "डेमो मेडिकल सेवाएँ", "ऑक्सीजन सिलेंडर सेवा की जानकारी।"]
  },
  Bengali: {
    1: ["হার্টের ওষুধের তথ্য", "ডেমো ফার্মেসি", "সাধারণত ব্যবহৃত হার্টের ওষুধ সম্পর্কে তথ্য।"],
    2: ["জরুরি ইনজেকশনের তথ্য", "ডেমো মেডিকেল সেন্টার", "জরুরি ওষুধের তথ্য। শুধুমাত্র প্রশিক্ষিত চিকিৎসাকর্মীরা এটি প্রয়োগ করবেন।"],
    3: ["ইসিজি মেশিন", "ডেমো হাসপাতাল", "ইলেক্ট্রোকার্ডিওগ্রাম সরঞ্জাম সম্পর্কে তথ্য।"],
    4: ["রক্তের গ্রুপের তথ্য - O+", "ডেমো ব্লাড ব্যাংক", "ব্লাড ব্যাংকের যোগাযোগ ও রক্তের গ্রুপের তথ্য।"],
    5: ["অক্সিজেন কনসেনট্রেটর", "ডেমো স্বাস্থ্যকেন্দ্র", "অক্সিজেন কনসেনট্রেটর পরিষেবা সম্পর্কে তথ্য।"],
    6: ["ডিফিব্রিলেটর", "ডেমো জরুরি কেন্দ্র", "জরুরি ডিফিব্রিলেটর সরঞ্জাম সম্পর্কে তথ্য।"],
    7: ["রক্তের গ্রুপের তথ্য - B+", "ডেমো ব্লাড সেন্টার", "ব্লাড ব্যাংকের যোগাযোগ ও রক্তের গ্রুপের তথ্য।"],
    8: ["অক্সিজেন সিলিন্ডারের তথ্য", "ডেমো মেডিকেল পরিষেবা", "অক্সিজেন সিলিন্ডার পরিষেবা সম্পর্কে তথ্য।"]
  }
};

function HeartResources() {
  const navigate = useNavigate();
  const { language } = useTheme();
  const t = translations[language] || translations.English;

  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedResource, setSelectedResource] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("heartcareToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    window.scrollTo(0, 0);
  }, [navigate]);

  useEffect(() => {
    if (!selectedResource) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") setSelectedResource(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedResource]);

  const cities = useMemo(() => {
    if (selectedState === "All States") return ["All Cities"];

    const stateCities = resources
      .filter(item => item.state === selectedState)
      .map(item => item.city);

    return ["All Cities", ...new Set(stateCities)];
  }, [selectedState]);

  const localizedResources = resources.map(item => {
    const translated = resourceTranslations[language]?.[item.id];

    return {
      ...item,
      displayName: translated?.[0] || item.name,
      displayProvider: translated?.[1] || item.provider,
      displayDescription: translated?.[2] || item.description
    };
  });

  const filteredResources = localizedResources.filter(item => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;

    const searchText =
      `${item.name} ${item.provider} ${item.city} ${item.state} ${item.description} ${item.displayName} ${item.displayProvider} ${item.displayDescription}`
        .toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesState =
      selectedState === "All States" || item.state === selectedState;

    const matchesCity =
      selectedCity === "All Cities" || item.city === selectedCity;

    return matchesCategory && matchesSearch && matchesState && matchesCity;
  });

  const handleStateChange = (event) => {
    setSelectedState(event.target.value);
    setSelectedCity("All Cities");
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedState("All States");
    setSelectedCity("All Cities");
    setActiveCategory("all");
  };

  const getCategoryIcon = (category) => {
    const found = categories.find(item => item.id === category);
    return found ? found.icon : PackageSearch;
  };

  const getCategoryName = (category) => {
    const found = categories.find(item => item.id === category);
    return found ? t[found.key] : t.allResources;
  };

  return (
    <div className="resources-page">
      <DashboardSidebar activeKey="/heart-resources" />

      <div className="resources-page-main">
        {/* Navigation */}
        <nav className="resources-navbar">
        <Link to="/" className="resources-logo">
          <span className="resources-logo-icon">
            <HeartPulse size={25} />
          </span>
          <span>HeartGuard AI</span>
        </Link>

        <div className="resources-nav-links">
          <Link to="/">{t.home}</Link>
          <Link to="/emergency">{t.emergency}</Link>
        </div>

        <Link to="/dashboard" className="resources-back-btn">
          <ArrowLeft size={17} />
          {t.dashboard}
        </Link>
      </nav>

      {/* Hero */}
      <section className="resources-hero">
        <div className="resources-hero-content">
          <span className="resources-eyebrow">
            <ShieldCheck size={16} />
            {t.lifeline}
          </span>

          <h1>
            {t.heroTitle}
            <span>{t.heroHighlight}</span>
          </h1>

          <p>{t.heroDescription}</p>

          <div className="resources-hero-note">
            <MapPin size={17} />
            {t.searchLocation}
          </div>
        </div>

        <div className="resources-hero-visual">
          <div className="resources-visual-circle">
            <HeartPulse size={100} strokeWidth={1.3} />
          </div>

          <span className="resources-float-icon float-one">
            <Pill size={24} />
          </span>

          <span className="resources-float-icon float-two">
            <Activity size={24} />
          </span>

          <span className="resources-float-icon float-three">
            <Droplets size={24} />
          </span>
        </div>
      </section>

      {/* Demo notice */}
      <div className="resources-demo-notice">
        <ShieldCheck size={19} />
        <div>
          <strong>{t.demoTitle}</strong>
          <p>{t.demoDescription}</p>
        </div>
      </div>

      {/* Categories */}
      <section className="resources-section">
        <div className="resources-section-heading">
          <div>
            <span className="resources-small-label">{t.explore}</span>
            <h2>{t.resources}</h2>
            <p>{t.chooseResource}</p>
          </div>
        </div>

        <div className="resources-category-grid">
          {categories.map(category => {
            const Icon = category.icon;

            return (
              <button
                type="button"
                key={category.id}
                className={`resource-category-card ${
                  activeCategory === category.id ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="resource-category-icon">
                  <Icon size={25} />
                </span>

                <strong>{t[category.key]}</strong>
                <span className="category-arrow">→</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Search and filters */}
      <section className="resources-search-section">
        <div className="resources-section-heading">
          <div>
            <span className="resources-small-label">{t.findResources}</span>
            <h2>{t.searchIndia}</h2>
            <p>{t.searchDescription}</p>
          </div>
        </div>

        <div className="resources-filter-panel">
          <div className="resources-search-box">
            <Search size={21} />

            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={event => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                aria-label={t.clearSearch}
                onClick={() => setSearch("")}
              >
                <X size={17} />
              </button>
            )}
          </div>

          <div className="resources-location-filters">
            <div className="resource-select-wrapper">
              <MapPin size={18} />

              <select value={selectedState} onChange={handleStateChange}>
                <option value="All States">{t.allStates}</option>
                {states.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="resource-select-wrapper">
              <Navigation size={18} />

              <select
                value={selectedCity}
                onChange={event => setSelectedCity(event.target.value)}
              >
                <option value="All Cities">{t.allCities}</option>
                {cities.filter(city => city !== "All Cities").map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="resources-results-section">
        <div className="resources-results-heading">
          <div>
            <h2>{t.listings}</h2>
            <p>
              {filteredResources.length} {t.listingsFound}
            </p>
          </div>

          <span className="resources-demo-badge">
            <Filter size={15} />
            {t.demoData}
          </span>
        </div>

        {filteredResources.length > 0 ? (
          <div className="resources-list-grid">
            {filteredResources.map(resource => {
              const Icon = getCategoryIcon(resource.category);

              return (
                <article className="resource-list-card" key={resource.id}>
                  <div className="resource-card-top">
                    <span className="resource-card-icon">
                      <Icon size={27} />
                    </span>

                    <span className="resource-status">
                      {t.demoListing}
                    </span>
                  </div>

                  <h3>{resource.displayName}</h3>

                  <p className="resource-provider">
                    {resource.displayProvider}
                  </p>

                  <div className="resource-card-details">
                    <div>
                      <MapPin size={16} />
                      {resource.city}, {resource.state}
                    </div>

                    <div>
                      <Clock size={16} />
                      {t.demoRecord}
                    </div>
                  </div>

                  <p className="resource-description">
                    {resource.displayDescription}
                  </p>

                  <button
                    type="button"
                    className="resource-view-btn"
                    onClick={() => setSelectedResource(resource)}
                  >
                    {t.viewDetails}
                    <span>→</span>
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="resources-empty">
            <PackageSearch size={48} />
            <h3>{t.noResults}</h3>
            <p>{t.noResultsDescription}</p>

            <button type="button" onClick={clearFilters}>
              {t.clearFilters}
            </button>
          </div>
        )}
      </section>

      {/* Details modal */}
      {selectedResource && (
        <div
          className="resource-modal-overlay"
          onClick={() => setSelectedResource(null)}
        >
          <div
            className="resource-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="resource-modal-title"
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              className="resource-modal-close"
              onClick={() => setSelectedResource(null)}
              aria-label={t.close}
            >
              <X size={21} />
            </button>

            <span className="resource-card-icon">
              {(() => {
                const Icon = getCategoryIcon(selectedResource.category);
                return <Icon size={29} />;
              })()}
            </span>

            <span className="resource-status">
              {t.demoListing}
            </span>

            <h2 id="resource-modal-title">
              {selectedResource.displayName}
            </h2>

            <p>{selectedResource.displayDescription}</p>

            <div className="resource-modal-info">
              <div>
                <MapPin size={17} />
                {selectedResource.address}, {selectedResource.city}, {selectedResource.state}
              </div>

              <div>
                <ShieldCheck size={17} />
                {selectedResource.displayProvider}
              </div>

              <div>
                <PackageSearch size={17} />
                {t.categoryLabel}: {getCategoryName(selectedResource.category)}
              </div>

              <div>
                <Clock size={17} />
                {t.demoRecord}
              </div>
            </div>

            <div className="resource-modal-warning">
              {t.sampleInformation}
            </div>

            <button
              type="button"
              className="resource-modal-done"
              onClick={() => setSelectedResource(null)}
            >
              {t.closeDetails}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="resources-footer">
        <div className="resources-logo">
          <HeartPulse size={23} />
          HeartGuard AI Lifeline
        </div>

        <p>{t.footerDescription}</p>

        <span>{t.copyright}</span>
      </footer>
      </div>
    </div>
  );
}

export default HeartResources;
