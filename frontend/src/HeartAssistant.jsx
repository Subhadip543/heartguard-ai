
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  Send,
  Bot,
  User,
  Plus,
  Trash2,
  HeartPulse,
  MessageCircle,
  ArrowLeft,
  ShieldAlert
} from "lucide-react";

import { useTheme } from "./context/useTheme";
import "./HeartAssistant.css";

// ========================================
// LANGUAGE TRANSLATIONS
// ========================================

const translations = {
  English: {
    brand: "HeartCare",
    assistant: "AI Assistant",
    newConversation: "New Conversation",
    supportTitle: "Heart Health Support",
    supportDescription:
      "Ask questions and learn about cardiovascular health.",
    backDashboard: "Back to Dashboard",
    headerTitle: "HeartCare AI",
    headerSubtitle: "Heart Health Information Assistant",
    clearChat: "Clear Chat",
    clearTitle: "Clear conversation",
    welcomeTitle: "Your Heart Health Companion",
    welcomeDescription:
      "Ask questions, understand heart conditions and learn how to maintain a healthy heart.",
    welcomeMessage:
      "Hello! I'm HeartCare AI, your heart health assistant.\n\nYou can ask me questions about heart diseases, symptoms, blood pressure, cholesterol, healthy lifestyle and cardiovascular health.\n\nHow can I help you today?",
    welcomeAgain:
      "Hello again! I'm HeartCare AI. Ask me anything about heart health.",
    you: "You",
    suggestionsTitle: "Suggested Questions",
    suggestions: [
      "What are the common symptoms of heart disease?",
      "How can I keep my heart healthy?",
      "What is the difference between a heart attack and cardiac arrest?",
      "What foods are good for heart health?"
    ],
    placeholder: "Ask anything about heart health...",
    disclaimer:
      "AI provides general health information, not medical diagnosis or treatment. For emergency symptoms, seek immediate medical attention.",
    errorMessage:
      "Sorry, I'm unable to connect to the AI service right now. Please check your backend server and try again.",
    requestError: "Unable to get a response.",
    loading: "Thinking...",
    infoNotice: "HeartCare AI Assistant provides cardiovascular education. For medical emergencies, call 112 / 911 immediately.",
  },

  Hindi: {
    brand: "HeartCare",
    assistant: "AI सहायक",
    newConversation: "नई बातचीत",
    supportTitle: "हृदय स्वास्थ्य सहायता",
    supportDescription:
      "हृदय स्वास्थ्य के बारे में प्रश्न पूछें और जानकारी प्राप्त करें।",
    backDashboard: "डैशबोर्ड पर वापस जाएं",
    headerTitle: "HeartCare AI",
    headerSubtitle: "हृदय स्वास्थ्य जानकारी सहायक",
    clearChat: "चैट साफ करें",
    clearTitle: "बातचीत साफ करें",
    welcomeTitle: "आपका हृदय स्वास्थ्य साथी",
    welcomeDescription:
      "प्रश्न पूछें, हृदय संबंधी बीमारियों को समझें और स्वस्थ हृदय बनाए रखने के तरीके जानें।",
    welcomeMessage:
      "नमस्ते! मैं HeartCare AI हूं, आपका हृदय स्वास्थ्य सहायक।\n\nआप मुझसे हृदय रोग, लक्षण, रक्तचाप, कोलेस्ट्रॉल और स्वस्थ जीवनशैली के बारे में प्रश्न पूछ सकते हैं।\n\nआज मैं आपकी कैसे मदद कर सकता हूं?",
    welcomeAgain:
      "फिर से नमस्ते! मैं HeartCare AI हूं। हृदय स्वास्थ्य के बारे में कुछ भी पूछें।",
    you: "आप",
    suggestionsTitle: "सुझाए गए प्रश्न",
    suggestions: [
      "हृदय रोग के सामान्य लक्षण क्या हैं?",
      "मैं अपने हृदय को स्वस्थ कैसे रख सकता हूं?",
      "हार्ट अटैक और कार्डियक अरेस्ट में क्या अंतर है?",
      "हृदय के स्वास्थ्य के लिए कौन से खाद्य पदार्थ अच्छे हैं?"
    ],
    placeholder: "हृदय स्वास्थ्य के बारे में कुछ भी पूछें...",
    disclaimer:
      "AI सामान्य स्वास्थ्य जानकारी प्रदान करता है, चिकित्सा निदान या उपचार नहीं। आपातकालीन लक्षण होने पर तुरंत चिकित्सा सहायता लें।",
    errorMessage:
      "क्षमा करें, अभी AI सेवा से कनेक्ट नहीं हो पा रहा है। कृपया अपना बैकएंड सर्वर जांचें और पुनः प्रयास करें।",
    requestError: "जवाब प्राप्त नहीं हो सका।",
    loading: "सोच रहा है...",
    infoNotice: "HeartCare AI सहायक हृदय स्वास्थ्य शिक्षा प्रदान करता है। आपातकालीन स्थिति में तुरंत 112 / 911 पर कॉल करें।",
  },

  Bengali: {
    brand: "HeartCare",
    assistant: "AI সহকারী",
    newConversation: "নতুন কথোপকথন",
    supportTitle: "হৃদযন্ত্রের স্বাস্থ্য সহায়তা",
    supportDescription:
      "হৃদযন্ত্রের স্বাস্থ্য সম্পর্কে প্রশ্ন করুন এবং জানুন।",
    backDashboard: "ড্যাশবোর্ডে ফিরে যান",
    headerTitle: "HeartCare AI",
    headerSubtitle: "হৃদযন্ত্রের স্বাস্থ্য তথ্য সহায়ক",
    clearChat: "চ্যাট মুছুন",
    clearTitle: "কথোপকথন মুছুন",
    welcomeTitle: "আপনার হৃদযন্ত্রের স্বাস্থ্যসঙ্গী",
    welcomeDescription:
      "প্রশ্ন করুন, হৃদরোগ সম্পর্কে জানুন এবং কীভাবে হৃদযন্ত্র সুস্থ রাখা যায় তা শিখুন।",
    welcomeMessage:
      "নমস্কার! আমি HeartCare AI, আপনার হৃদযন্ত্রের স্বাস্থ্য সহায়ক।\n\nআপনি হৃদরোগ, উপসর্গ, রক্তচাপ, কোলেস্টেরল, স্বাস্থ্যকর জীবনযাপন এবং হৃদযন্ত্রের স্বাস্থ্য সম্পর্কে প্রশ্ন করতে পারেন।\n\nআজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    welcomeAgain:
      "আবারও নমস্কার! আমি HeartCare AI। হৃদযন্ত্রের স্বাস্থ্য সম্পর্কে যেকোনো প্রশ্ন করুন।",
    you: "আপনি",
    suggestionsTitle: "প্রস্তাবিত প্রশ্ন",
    suggestions: [
      "হৃদরোগের সাধারণ লক্ষণগুলি কী কী?",
      "আমি কীভাবে আমার হৃদযন্ত্র সুস্থ রাখতে পারি?",
      "হার্ট অ্যাটাক এবং কার্ডিয়াক অ্যারেস্টের মধ্যে পার্থক্য কী?",
      "হৃদযন্ত্রের স্বাস্থ্যের জন্য কোন খাবারগুলি ভালো?"
    ],
    placeholder: "হৃদযন্ত্রের স্বাস্থ্য সম্পর্কে যেকোনো প্রশ্ন করুন...",
    disclaimer:
      "AI সাধারণ স্বাস্থ্য তথ্য প্রদান করে, চিকিৎসাগত রোগ নির্ণয় বা চিকিৎসা নয়। জরুরি উপসর্গ দেখা দিলে অবিলম্বে চিকিৎসা সহায়তা নিন।",
    errorMessage:
      "দুঃখিত, এই মুহূর্তে AI পরিষেবার সঙ্গে সংযোগ করা যাচ্ছে না। আপনার ব্যাকএন্ড সার্ভার পরীক্ষা করে আবার চেষ্টা করুন।",
    requestError: "উত্তর পাওয়া যায়নি।",
    loading: "ভাবছে...",
    infoNotice: "HeartCare AI সহকারী হৃদযন্ত্রের স্বাস্থ্য সংক্রান্ত তথ্য ও শিক্ষা প্রদান করে। যেকোনো জরুরি পরিস্থিতিতে অবিলম্বে ১১২ / ৯১১ নম্বরে যোগাযোগ করুন।",
  }
};

// ========================================
// LANGUAGE NORMALIZATION
// ========================================

function getLanguage(language) {
  const value = String(language || "English")
    .trim()
    .toLowerCase();

  if (
    value === "bengali" ||
    value === "বাংলা" ||
    value === "bn"
  ) {
    return "Bengali";
  }

  if (
    value === "hindi" ||
    value === "हिंदी" ||
    value === "hi"
  ) {
    return "Hindi";
  }

  return "English";
}

// ========================================
// HEART ASSISTANT COMPONENT
// ========================================

function HeartAssistant() {
  const { language } = useTheme();

  const selectedLanguage = getLanguage(language);
  const t = translations[selectedLanguage];

  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content: translations.English.welcomeMessage
    }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Update initial welcome message when language changes.
  // Existing conversation messages are preserved.
  useEffect(() => {
    setMessages((previousMessages) => {
      if (
        previousMessages.length === 1 &&
        previousMessages[0].role === "assistant"
      ) {
        return [
          {
            ...previousMessages[0],
            content: t.welcomeMessage
          }
        ];
      }

      return previousMessages;
    });
  }, [selectedLanguage]);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages, loading]);

  // ========================================
  // SEND MESSAGE TO BACKEND
  // ========================================

  const sendMessage = async (text = input) => {
    const message = text.trim();

    if (!message || loading) return;

    const userMessage = {
      role: "user",
      content: message,
    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      // Exclude initial welcome greeting from conversation history
      const historyPayload = messages
        .filter((msg, idx) => !(idx === 0 && msg.role === "assistant"))
        .map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          content: msg.content,
        }));

      const response = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          history: historyPayload,
          language: selectedLanguage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || t.requestError);
      }

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (err) {
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          role: "assistant",
          content: `${t.errorMessage}\n\n[Details: ${err.message}]`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // CLEAR CONVERSATION
  // ========================================

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: t.welcomeAgain
      }
    ]);

    setInput("");
  };

  // ========================================
  // FORM SUBMISSION
  // ========================================

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  // ========================================
  // UI
  // ========================================

  return (
    <div className="heart-chat-page">

      {/* Sidebar */}
      <aside className="heart-chat-sidebar">

        <div className="chat-brand">
          <div className="chat-brand-icon">
            <HeartPulse size={27} />
          </div>

          <div>
            <h2>{t.brand}</h2>
            <span>{t.assistant}</span>
          </div>
        </div>

        <button
          className="new-chat-btn"
          onClick={clearChat}
        >
          <Plus size={19} />
          {t.newConversation}
        </button>

        <div className="chat-sidebar-info">
          <MessageCircle size={20} />

          <div>
            <h4>{t.supportTitle}</h4>
            <p>{t.supportDescription}</p>
          </div>
        </div>

        <div className="chat-sidebar-bottom">
          <Link
            to="/dashboard"
            className="back-dashboard"
          >
            <ArrowLeft size={18} />
            {t.backDashboard}
          </Link>
        </div>

      </aside>

      {/* Main Chat */}
      <main className="heart-chat-main">

        {/* Educational Health Assistant Banner */}
        <div className="chat-preview-banner">
          <ShieldAlert size={16} />
          <span>{t.infoNotice}</span>
        </div>

        {/* Header */}
        <header className="heart-chat-header">

          <div className="chat-header-left">

            <div className="online-indicator">
              <Bot size={23} />
            </div>

            <div>
              <h3>{t.headerTitle}</h3>
              <span>{t.headerSubtitle}</span>
            </div>

          </div>

          <button
            className="clear-chat-btn"
            onClick={clearChat}
            title={t.clearTitle}
          >
            <Trash2 size={19} />
            <span>{t.clearChat}</span>
          </button>

        </header>

        {/* Messages */}
        <section className="heart-chat-messages">

          {/* Welcome Section */}
          <div className="chat-welcome">

            <div className="welcome-icon">
              <HeartPulse size={35} />
            </div>

            <h2>{t.welcomeTitle}</h2>

            <p>{t.welcomeDescription}</p>

          </div>

          {/* Chat Messages */}
          {messages.map((msg, index) => (

            <div
              className={`chat-message ${
                msg.role === "user"
                  ? "user-message"
                  : "ai-message"
              }`}
              key={index}
            >

              <div className="message-avatar">

                {msg.role === "user" ? (
                  <User size={19} />
                ) : (
                  <Bot size={20} />
                )}

              </div>

              <div className="message-content">

                <span className="message-sender">
                  {msg.role === "user"
                    ? t.you
                    : t.headerTitle}
                </span>

                <p>{msg.content}</p>

              </div>

            </div>

          ))}

          {/* Typing Indicator */}
          {loading && (

            <div className="chat-message ai-message">

              <div className="message-avatar">
                <Bot size={20} />
              </div>

              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>

            </div>

          )}

          <div ref={chatEndRef} />

        </section>

        {/* Suggested Questions */}
        {messages.length === 1 && (

          <div className="chat-suggestions">

            <h4>{t.suggestionsTitle}</h4>

            <div className="suggestion-list">

              {t.suggestions.map((question, index) => (

                <button
                  key={index}
                  onClick={() => sendMessage(question)}
                  disabled={loading}
                >
                  {question}
                </button>

              ))}

            </div>

          </div>

        )}

        {/* Input Area */}
        <div className="chat-input-area">

          <form
            className="chat-input-form"
            onSubmit={handleSubmit}
          >

            <input
              type="text"
              placeholder={t.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="send-message-btn"
              aria-label={t.button || "Send message"}
            >
              <Send size={20} />
            </button>

          </form>

          {/* Medical Disclaimer */}
          <div className="chat-disclaimer">

            <ShieldAlert size={14} />

            <span>{t.disclaimer}</span>

          </div>

        </div>

      </main>

    </div>
  );
}

export default HeartAssistant;
