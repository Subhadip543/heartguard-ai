
import { useState } from "react";
import {
  HeartPulse,
  Activity,
  Info,
  RotateCcw,
  ChevronRight
} from "lucide-react";

import { useTheme } from "../context/useTheme";
import "./HeartExplorer.css";

const translations = {
  English: {
    eyebrow: "EXPLORE THE HUMAN HEART",
    title: "Interactive Heart Explorer",
    intro: "Explore the four chambers, valves and coronary arteries through an anatomical heart demonstration. Select a region to learn how it works.",
    anatomy: "HEART ANATOMY DEMONSTRATION",
    educational: "EDUCATIONAL VIEW",
    heartbeat: "Simulated heartbeat animation",
    oxygenPoor: "Oxygen-poor blood",
    oxygenRich: "Oxygen-rich blood",
    valvesArteries: "Valves / arteries",
    guide: "HEART ANATOMY GUIDE",
    selected: "SELECTED REGION",
    whatIs: "What is it?",
    whatDoes: "What does it do?",
    didYouKnow: "Did you know?",
    exploreAnother: "Explore another region",
    reset: "Reset selection",
    disclaimer: "This is an educational anatomical illustration, not a clinical diagnostic tool. The region buttons explain heart structures but do not highlight or detect diseases in the image. The heartbeat animation is decorative and does not measure a real heartbeat.",
    regions: {
      rightAtrium: {
        name: "Right Atrium",
        subtitle: "Upper right chamber",
        description: "The right atrium receives oxygen-poor blood returning from the body through the superior and inferior vena cava.",
        function: "It transfers blood through the tricuspid valve into the right ventricle.",
        fact: "The right atrium is one of the heart's four chambers."
      },
      leftAtrium: {
        name: "Left Atrium",
        subtitle: "Upper left chamber",
        description: "The left atrium receives oxygen-rich blood from the lungs through the pulmonary veins.",
        function: "It transfers blood through the mitral valve into the left ventricle.",
        fact: "The left atrium helps complete the return of blood from the lungs."
      },
      rightVentricle: {
        name: "Right Ventricle",
        subtitle: "Lower right chamber",
        description: "The right ventricle receives blood from the right atrium and pumps it towards the lungs.",
        function: "It sends blood through the pulmonary valve into the pulmonary artery.",
        fact: "The lungs add oxygen to the blood before it returns to the left side of the heart."
      },
      leftVentricle: {
        name: "Left Ventricle",
        subtitle: "Lower right side of the displayed image",
        description: "The left ventricle pumps oxygen-rich blood into the aorta, which distributes it throughout the body.",
        function: "It generates the pressure needed to send blood around the body.",
        fact: "The left ventricle has a thicker muscular wall than the right ventricle."
      },
      coronary: {
        name: "Coronary Arteries",
        subtitle: "Blood supply to the heart muscle",
        description: "The coronary arteries carry oxygen-rich blood to the heart muscle itself.",
        function: "They supply the heart with oxygen and nutrients so it can continue pumping.",
        fact: "Narrowing or blockage of a coronary artery can cause coronary artery disease."
      },
      valves: {
        name: "Heart Valves",
        subtitle: "Control the direction of blood flow",
        description: "The heart has four valves: tricuspid, pulmonary, mitral and aortic.",
        function: "They open and close to help blood move forward and prevent backward flow.",
        fact: "Valve disease can affect how efficiently blood moves through the heart."
      }
    },
    regionLabels: {
      rightAtrium: "Right atrium",
      leftAtrium: "Left atrium",
      rightVentricle: "Right ventricle",
      leftVentricle: "Left ventricle",
      coronary: "Coronary arteries",
      valves: "Heart valves"
    }
  },

  Bengali: {
    eyebrow: "মানব হৃদপিণ্ড সম্পর্কে জানুন",
    title: "ইন্টারঅ্যাকটিভ হার্ট এক্সপ্লোরার",
    intro: "হৃদপিণ্ডের চারটি প্রকোষ্ঠ, ভালভ এবং করোনারি ধমনী সম্পর্কে জানুন। একটি অংশ নির্বাচন করে সেটি কীভাবে কাজ করে তা শিখুন।",
    anatomy: "হৃদপিণ্ডের গঠন প্রদর্শনী",
    educational: "শিক্ষামূলক দৃশ্য",
    heartbeat: "অনুকরণ করা হৃদস্পন্দনের অ্যানিমেশন",
    oxygenPoor: "অক্সিজেন-স্বল্প রক্ত",
    oxygenRich: "অক্সিজেন-সমৃদ্ধ রক্ত",
    valvesArteries: "ভালভ / ধমনী",
    guide: "হৃদপিণ্ডের গঠন নির্দেশিকা",
    selected: "নির্বাচিত অংশ",
    whatIs: "এটি কী?",
    whatDoes: "এটি কী কাজ করে?",
    didYouKnow: "আপনি কি জানেন?",
    exploreAnother: "অন্য অংশ দেখুন",
    reset: "নির্বাচন রিসেট করুন",
    disclaimer: "এটি একটি শিক্ষামূলক শারীরস্থানগত চিত্র, কোনো চিকিৎসাগত রোগ নির্ণয়ের সরঞ্জাম নয়। অংশ নির্বাচন করার বোতামগুলি হৃদপিণ্ডের গঠন সম্পর্কে ব্যাখ্যা করে, কিন্তু ছবিতে রোগ শনাক্ত করে না। হৃদস্পন্দনের অ্যানিমেশনটি শুধুমাত্র প্রদর্শনের জন্য; এটি প্রকৃত হৃদস্পন্দন মাপে না।",
    regions: {
      rightAtrium: {
        name: "ডান অলিন্দ",
        subtitle: "উপরের ডান প্রকোষ্ঠ",
        description: "ডান অলিন্দ শরীর থেকে ফিরে আসা অক্সিজেন-স্বল্প রক্ত গ্রহণ করে।",
        function: "এটি ট্রাইকাসপিড ভালভের মাধ্যমে রক্ত ডান নিলয়ে পাঠায়।",
        fact: "ডান অলিন্দ হৃদপিণ্ডের চারটি প্রকোষ্ঠের একটি।"
      },
      leftAtrium: {
        name: "বাম অলিন্দ",
        subtitle: "উপরের বাম প্রকোষ্ঠ",
        description: "বাম অলিন্দ ফুসফুস থেকে পালমোনারি শিরার মাধ্যমে অক্সিজেন-সমৃদ্ধ রক্ত গ্রহণ করে।",
        function: "এটি মাইট্রাল ভালভের মাধ্যমে রক্ত বাম নিলয়ে পাঠায়।",
        fact: "বাম অলিন্দ ফুসফুস থেকে রক্ত ফিরে আসার প্রক্রিয়ার অংশ।"
      },
      rightVentricle: {
        name: "ডান নিলয়",
        subtitle: "নিচের ডান প্রকোষ্ঠ",
        description: "ডান নিলয় ডান অলিন্দ থেকে রক্ত গ্রহণ করে এবং ফুসফুসের দিকে পাম্প করে।",
        function: "এটি পালমোনারি ভালভের মাধ্যমে রক্ত পালমোনারি ধমনীতে পাঠায়।",
        fact: "ফুসফুস রক্তে অক্সিজেন যোগ করে এবং রক্ত হৃদপিণ্ডের বাম দিকে ফিরে আসে।"
      },
      leftVentricle: {
        name: "বাম নিলয়",
        subtitle: "ছবিতে নিচের ডান দিকে অবস্থিত",
        description: "বাম নিলয় অক্সিজেন-সমৃদ্ধ রক্ত অ্যাওর্টায় পাঠায়, যা সারা শরীরে রক্ত সরবরাহ করে।",
        function: "এটি সারা শরীরে রক্ত পাঠানোর জন্য প্রয়োজনীয় চাপ তৈরি করে।",
        fact: "বাম নিলয়ের পেশির দেয়াল ডান নিলয়ের তুলনায় বেশি পুরু।"
      },
      coronary: {
        name: "করোনারি ধমনী",
        subtitle: "হৃদপেশিতে রক্ত সরবরাহ",
        description: "করোনারি ধমনী হৃদপেশিতে অক্সিজেন-সমৃদ্ধ রক্ত পৌঁছে দেয়।",
        function: "এগুলি হৃদপিণ্ডকে অক্সিজেন ও পুষ্টি সরবরাহ করে।",
        fact: "করোনারি ধমনী সরু বা বন্ধ হয়ে গেলে করোনারি আর্টারি ডিজিজ হতে পারে।"
      },
      valves: {
        name: "হৃদপিণ্ডের ভালভ",
        subtitle: "রক্তপ্রবাহের দিক নিয়ন্ত্রণ করে",
        description: "হৃদপিণ্ডে চারটি ভালভ রয়েছে: ট্রাইকাসপিড, পালমোনারি, মাইট্রাল এবং অ্যাওর্টিক।",
        function: "এগুলি রক্তকে সামনের দিকে প্রবাহিত হতে সাহায্য করে এবং পিছনে ফিরে যাওয়া আটকায়।",
        fact: "ভালভের রোগ হৃদপিণ্ডের রক্ত পাম্প করার দক্ষতাকে প্রভাবিত করতে পারে।"
      }
    },
    regionLabels: {
      rightAtrium: "ডান অলিন্দ",
      leftAtrium: "বাম অলিন্দ",
      rightVentricle: "ডান নিলয়",
      leftVentricle: "বাম নিলয়",
      coronary: "করোনারি ধমনী",
      valves: "হৃদপিণ্ডের ভালভ"
    }
  },

  Hindi: {
    eyebrow: "मानव हृदय को जानें",
    title: "इंटरैक्टिव हार्ट एक्सप्लोरर",
    intro: "हृदय के चार कक्षों, वाल्व और कोरोनरी धमनियों के बारे में जानें। किसी भाग को चुनकर समझें कि वह कैसे काम करता है।",
    anatomy: "हृदय की संरचना का प्रदर्शन",
    educational: "शैक्षिक दृश्य",
    heartbeat: "अनुकरण किया गया दिल की धड़कन एनीमेशन",
    oxygenPoor: "कम ऑक्सीजन वाला रक्त",
    oxygenRich: "ऑक्सीजन से भरपूर रक्त",
    valvesArteries: "वाल्व / धमनियां",
    guide: "हृदय संरचना मार्गदर्शिका",
    selected: "चयनित भाग",
    whatIs: "यह क्या है?",
    whatDoes: "यह क्या काम करता है?",
    didYouKnow: "क्या आप जानते हैं?",
    exploreAnother: "दूसरा भाग देखें",
    reset: "चयन रीसेट करें",
    disclaimer: "यह एक शैक्षिक शारीरिक चित्रण है, चिकित्सकीय निदान का साधन नहीं। भाग चुनने वाले बटन हृदय की संरचना समझाते हैं, लेकिन चित्र में बीमारी का पता नहीं लगाते। धड़कन का एनीमेशन केवल सजावटी है और वास्तविक धड़कन नहीं मापता।",
    regions: {
      rightAtrium: {
        name: "दायां आलिंद",
        subtitle: "ऊपरी दायां कक्ष",
        description: "दायां आलिंद शरीर से वापस आने वाला कम ऑक्सीजन वाला रक्त प्राप्त करता है।",
        function: "यह ट्राइकसपिड वाल्व के माध्यम से रक्त को दाएं निलय में भेजता है।",
        fact: "दायां आलिंद हृदय के चार कक्षों में से एक है।"
      },
      leftAtrium: {
        name: "बायां आलिंद",
        subtitle: "ऊपरी बायां कक्ष",
        description: "बायां आलिंद फेफड़ों से पल्मोनरी नसों के माध्यम से ऑक्सीजन युक्त रक्त प्राप्त करता है।",
        function: "यह माइट्रल वाल्व के माध्यम से रक्त को बाएं निलय में भेजता है।",
        fact: "बायां आलिंद फेफड़ों से रक्त की वापसी की प्रक्रिया में मदद करता है।"
      },
      rightVentricle: {
        name: "दायां निलय",
        subtitle: "निचला दायां कक्ष",
        description: "दायां निलय दाएं आलिंद से रक्त प्राप्त करता है और उसे फेफड़ों की ओर पंप करता है।",
        function: "यह पल्मोनरी वाल्व के माध्यम से रक्त को पल्मोनरी धमनी में भेजता है।",
        fact: "फेफड़े रक्त में ऑक्सीजन जोड़ते हैं और रक्त हृदय के बाईं ओर लौटता है।"
      },
      leftVentricle: {
        name: "बायां निलय",
        subtitle: "दिखाई गई तस्वीर के निचले दाएं हिस्से में",
        description: "बायां निलय ऑक्सीजन युक्त रक्त को महाधमनी में पंप करता है, जो पूरे शरीर में रक्त पहुंचाती है।",
        function: "यह पूरे शरीर में रक्त भेजने के लिए आवश्यक दबाव बनाता है।",
        fact: "बाएं निलय की मांसपेशियों की दीवार दाएं निलय से अधिक मोटी होती है।"
      },
      coronary: {
        name: "कोरोनरी धमनियां",
        subtitle: "हृदय की मांसपेशियों को रक्त की आपूर्ति",
        description: "कोरोनरी धमनियां हृदय की मांसपेशियों तक ऑक्सीजन युक्त रक्त पहुंचाती हैं।",
        function: "ये हृदय को ऑक्सीजन और पोषक तत्व प्रदान करती हैं।",
        fact: "कोरोनरी धमनी के संकुचित या अवरुद्ध होने से कोरोनरी धमनी रोग हो सकता है।"
      },
      valves: {
        name: "हृदय के वाल्व",
        subtitle: "रक्त प्रवाह की दिशा नियंत्रित करते हैं",
        description: "हृदय में चार वाल्व होते हैं: ट्राइकसपिड, पल्मोनरी, माइट्रल और एओर्टिक।",
        function: "ये रक्त को आगे बढ़ने में मदद करते हैं और पीछे बहने से रोकते हैं।",
        fact: "वाल्व की बीमारी हृदय की रक्त पंप करने की क्षमता को प्रभावित कर सकती है।"
      }
    },
    regionLabels: {
      rightAtrium: "दायां आलिंद",
      leftAtrium: "बायां आलिंद",
      rightVentricle: "दायां निलय",
      leftVentricle: "बायां निलय",
      coronary: "कोरोनरी धमनियां",
      valves: "हृदय के वाल्व"
    }
  }
};

const regionButtons = [
  "rightAtrium",
  "leftAtrium",
  "rightVentricle",
  "leftVentricle",
  "coronary",
  "valves"
];

const regionColors = {
  rightAtrium: "#38bdf8",
  leftAtrium: "#fb7185",
  rightVentricle: "#0ea5e9",
  leftVentricle: "#e11d48",
  coronary: "#f59e0b",
  valves: "#a78bfa"
};

function HeartExplorer() {
  const { language } = useTheme();

  const t = translations[language] || translations.English;

  const [selectedRegion, setSelectedRegion] = useState("leftVentricle");

  const selected = t.regions[selectedRegion];

  const selectRegion = (region) => {
    setSelectedRegion(region);
  };

  return (
    <section className="heart-explorer-section">

      <div className="heart-explorer-heading">
        <span className="heart-explorer-eyebrow">
          <HeartPulse size={16} />
          {t.eyebrow}
        </span>

        <h2>{t.title}</h2>

        <p>{t.intro}</p>
      </div>

      <div className="heart-explorer-layout">

        <div className="heart-visual-card">

          <div className="heart-visual-top">
            <div>
              <span className="heart-live-dot" />
              <span>{t.anatomy}</span>
            </div>

            <span className="heart-model-tag">
              {t.educational}
            </span>
          </div>

          <div className="heart-svg-stage">

            <div className="heart-glow heart-glow-one" />
            <div className="heart-glow heart-glow-two" />

            <img
              src="/heart.png.png"
              alt="Anatomical illustration of the human heart"
              className="heart-demo-image"
              loading="lazy"
            />

            <div className="heart-beat-caption">
              <span className="heart-beat-wave">
                <Activity size={16} />
              </span>

              <span>{t.heartbeat}</span>
            </div>

          </div>

          <div className="heart-visual-footer">
            <span>
              <i className="legend-blue" />
              {t.oxygenPoor}
            </span>

            <span>
              <i className="legend-red" />
              {t.oxygenRich}
            </span>

            <span>
              <i className="legend-gold" />
              {t.valvesArteries}
            </span>
          </div>

        </div>

        <div className="heart-information-card">

          <div className="heart-info-top">
            <span className="heart-info-icon">
              <Info size={19} />
            </span>

            <span>{t.guide}</span>
          </div>

          <div className="heart-selected-indicator">
            <span
              style={{ background: regionColors[selectedRegion] }}
            />
            {t.selected}
          </div>

          <h3>{selected.name}</h3>

          <p className="heart-info-subtitle">
            {selected.subtitle}
          </p>

          <div className="heart-info-divider" />

          <div className="heart-info-block">
            <h4>{t.whatIs}</h4>
            <p>{selected.description}</p>
          </div>

          <div className="heart-info-block">
            <h4>{t.whatDoes}</h4>
            <p>{selected.function}</p>
          </div>

          <div className="heart-fact-box">
            <HeartPulse size={20} />

            <div>
              <strong>{t.didYouKnow}</strong>
              <p>{selected.fact}</p>
            </div>
          </div>

          <div className="heart-region-picker">
            <h4>{t.exploreAnother}</h4>

            <div className="heart-region-buttons">
              {regionButtons.map((region) => (
                <button
                  type="button"
                  key={region}
                  className={
                    selectedRegion === region ? "active" : ""
                  }
                  onClick={() => selectRegion(region)}
                  aria-pressed={selectedRegion === region}
                >
                  {t.regionLabels[region]}
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="heart-reset-button"
            onClick={() => setSelectedRegion("leftVentricle")}
          >
            <RotateCcw size={15} />
            {t.reset}
          </button>

        </div>
      </div>

      <div className="heart-explorer-note">
        <Info size={17} />

        <p>{t.disclaimer}</p>
      </div>

    </section>
  );
}

export default HeartExplorer;
