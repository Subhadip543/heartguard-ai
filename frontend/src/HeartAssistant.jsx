import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Send,
  Bot,
  User,
  Plus,
  Trash2,
  HeartPulse,
  ShieldAlert,
  RotateCcw,
} from "lucide-react";

import { useTheme } from "./context/useTheme";
import DashboardSidebar from "./DashboardSidebar";
import "./HeartAssistant.css";

// ========================================
// LANGUAGE TRANSLATIONS
// ========================================

const translations = {
  English: {
    brand: "HeartGuard AI",
    assistant: "Health Assistant",
    newConversation: "New Conversation",
    supportTitle: "Heart Health Support",
    supportDescription:
      "Ask questions and learn about cardiovascular health.",
    backDashboard: "Back to Dashboard",
    headerTitle: "HeartGuard AI",
    headerSubtitle: "Your Educational Cardiovascular Health Assistant",
    clearChat: "Clear Chat",
    clearTitle: "Clear conversation",
    welcomeTitle: "Your Heart Health Companion",
    welcomeDescription:
      "Ask questions, understand cardiovascular conditions, and learn how to maintain a heart-healthy lifestyle.",
    welcomeMessage:
      "Hello! I'm HeartGuard AI — Your Educational Cardiovascular Health Assistant.\n\nYou can ask me questions about heart conditions, symptoms, blood pressure, cholesterol, healthy lifestyle habits, and cardiovascular prevention.\n\nHow can I help you today?",
    welcomeAgain:
      "Hello again! I'm HeartGuard AI — Your Educational Cardiovascular Health Assistant. Ask me anything about heart health.",
    you: "You",
    suggestionsTitle: "Suggested Questions",
    suggestions: [
      "What is the difference between a heart attack and cardiac arrest?",
      "How can I keep my heart healthy?",
      "What is hypertension and how is it managed?",
      "What are the common warning signs of a heart attack?",
    ],
    placeholder: "Ask anything about heart health...",
    disclaimer:
      "HeartGuard AI provides general educational information, not medical diagnosis or treatment. For emergency symptoms, call 112 in India or your local emergency services immediately.",
    errorMessage:
      "The AI assistant is temporarily unavailable. Please check your connection and try again.",
    requestError: "Unable to get a response.",
    loading: "Thinking...",
    infoNotice:
      "HeartGuard AI provides educational cardiovascular guidance. For medical emergencies, call 112 in India or local emergency services immediately.",
    retry: "Retry",
    sendButton: "Send message",
  },

  Hindi: {
    brand: "HeartGuard AI",
    assistant: "स्वास्थ्य सहायक",
    newConversation: "नई बातचीत",
    supportTitle: "हृदय स्वास्थ्य सहायता",
    supportDescription:
      "हृदय स्वास्थ्य के बारे में प्रश्न पूछें और जानकारी प्राप्त करें।",
    backDashboard: "डैशबोर्ड पर वापस जाएं",
    headerTitle: "HeartGuard AI",
    headerSubtitle: "आपका शैक्षिक हृदय स्वास्थ्य सहायक",
    clearChat: "चैट साफ करें",
    clearTitle: "बातचीत साफ करें",
    welcomeTitle: "आपका हृदय स्वास्थ्य साथी",
    welcomeDescription:
      "प्रश्न पूछें, हृदय संबंधी स्थितियों को समझें और स्वस्थ जीवनशैली अपनाने के तरीके जानें।",
    welcomeMessage:
      "नमस्ते! मैं HeartGuard AI हूँ — आपका शैक्षिक हृदय स्वास्थ्य सहायक।\n\nआप मुझसे हृदय रोग, लक्षण, रक्तचाप, कोलेस्ट्रॉल और स्वस्थ जीवनशैली के बारे में प्रश्न पूछ सकते हैं।\n\nआज मैं आपकी कैसे मदद कर सकता हूँ?",
    welcomeAgain:
      "फिर से नमस्ते! मैं HeartGuard AI — आपका शैक्षिक हृदय स्वास्थ्य सहायक हूँ। हृदय स्वास्थ्य के बारे में कुछ भी पूछें।",
    you: "आप",
    suggestionsTitle: "सुझाए गए प्रश्न",
    suggestions: [
      "हार्ट अटैक और कार्डियक अरेस्ट में क्या अंतर है?",
      "मैं अपने हृदय को स्वस्थ कैसे रख सकता हूँ?",
      "हाइपरटेंशन (उच्च रक्तचाप) क्या है?",
      "हार्ट अटैक के सामान्य चेतावनी संकेत क्या हैं?",
    ],
    placeholder: "हृदय स्वास्थ्य के बारे में कुछ भी पूछें...",
    disclaimer:
      "HeartGuard AI सामान्य शैक्षिक स्वास्थ्य जानकारी प्रदान करता है, चिकित्सा निदान नहीं। आपातकालीन स्थिति में तुरंत 112 या स्थानीय आपातकालीन सेवाओं पर कॉल करें।",
    errorMessage:
      "AI सेवा अस्थायी रूप से अनुपलब्ध है। कृपया पुनः प्रयास करें।",
    requestError: "जवाब प्राप्त नहीं हो सका।",
    loading: "सोच रहा है...",
    infoNotice:
      "HeartGuard AI शैक्षिक हृदय स्वास्थ्य मार्गदर्शन प्रदान करता है। आपातकालीन स्थिति में तुरंत 112 पर कॉल करें।",
    retry: "पुनः प्रयास करें",
    sendButton: "संदेश भेजें",
  },

  Bengali: {
    brand: "HeartGuard AI",
    assistant: "স্বাস্থ্য সহকারী",
    newConversation: "নতুন কথোপকথন",
    supportTitle: "হৃদযন্ত্রের স্বাস্থ্য সহায়তা",
    supportDescription:
      "হৃদযন্ত্রের স্বাস্থ্য সম্পর্কে প্রশ্ন করুন এবং জানুন।",
    backDashboard: "ড্যাশবোর্ডে ফিরে যান",
    headerTitle: "HeartGuard AI",
    headerSubtitle: "আপনার শিক্ষামূলক কার্ডিওভাসকুলার স্বাস্থ্য সহায়ক",
    clearChat: "চ্যাট মুছুন",
    clearTitle: "কথোপকথন মুছুন",
    welcomeTitle: "আপনার হৃদযন্ত্রের স্বাস্থ্যসঙ্গী",
    welcomeDescription:
      "প্রশ্ন করুন, হৃদরোগ সম্পর্কে জানুন এবং কীভাবে হৃদযন্ত্র সুস্থ রাখা যায় তা শিখুন।",
    welcomeMessage:
      "নমস্কার! আমি HeartGuard AI — আপনার শিক্ষামূলক কার্ডিওভাসকুলার স্বাস্থ্য সহায়ক।\n\nআপনি হৃদরোগ, উপসর্গ, রক্তচাপ, কোলেস্টেরল এবং স্বাস্থ্যকর জীবনযাপন সম্পর্কে প্রশ্ন করতে পারেন।\n\nআজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    welcomeAgain:
      "আবারও নমস্কার! আমি HeartGuard AI — আপনার শিক্ষামূলক কার্ডিওভাসকুলার স্বাস্থ্য সহায়ক। হৃদযন্ত্রের স্বাস্থ্য সম্পর্কে যেকোনো প্রশ্ন করুন।",
    you: "আপনি",
    suggestionsTitle: "প্রস্তাবিত প্রশ্ন",
    suggestions: [
      "হার্ট অ্যাটাক এবং কার্ডিয়াক অ্যারেস্টের মধ্যে পার্থক্য কী?",
      "আমি কীভাবে আমার হৃদযন্ত্র সুস্থ রাখতে পারি?",
      "উচ্চ রক্তচাপ (হাইপারটেনশন) কী?",
      "হার্ট অ্যাটাকের সাধারণ সতর্কতামূলক লক্ষণগুলি কী কী?",
    ],
    placeholder: "হৃদযন্ত্রের স্বাস্থ্য সম্পর্কে যেকোনো প্রশ্ন করুন...",
    disclaimer:
      "HeartGuard AI সাধারণ শিক্ষামূলক স্বাস্থ্য তথ্য প্রদান করে, চিকিৎসা বা রোগ নির্ণয় নয়। জরুরি পরিস্থিতিতে অবিলম্বে ১১২ নম্বরে যোগাযোগ করুন।",
    errorMessage:
      "AI পরিষেবা এই মুহূর্তে অনুপলব্ধ। অনুগ্রহ করে আবার চেষ্টা করুন।",
    requestError: "উত্তর পাওয়া যায়নি।",
    loading: "ভাবছে...",
    infoNotice:
      "HeartGuard AI শিক্ষামূলক কার্ডিওভাসকুলার তথ্য প্রদান করে। যেকোনো জরুরি পরিস্থিতিতে অবিলম্বে ১১২ নম্বরে যোগাযোগ করুন।",
    retry: "আবার চেষ্টা করুন",
    sendButton: "বার্তা পাঠান",
  },
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
  const t = translations[selectedLanguage] || translations.English;

  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content: t.welcomeMessage,
      isError: false,
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const chatEndRef = useRef(null);

  // Update initial welcome message when language changes if no conversation started
  useEffect(() => {
    setMessages((previousMessages) => {
      if (
        previousMessages.length === 1 &&
        previousMessages[0].role === "assistant" &&
        !previousMessages[0].isError
      ) {
        return [
          {
            ...previousMessages[0],
            content: t.welcomeMessage,
          },
        ];
      }
      return previousMessages;
    });
  }, [selectedLanguage, t.welcomeMessage]);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  // ========================================
  // SEND MESSAGE TO BACKEND
  // ========================================

  const sendMessage = useCallback(
    async (textToSend, isRetry = false) => {
      const messageText = typeof textToSend === "string" ? textToSend.trim() : input.trim();

      if (!messageText || loading) return;

      const currentHistory = isRetry
        ? messages.filter((msg) => !msg.isError)
        : [
            ...messages,
            {
              role: "user",
              content: messageText,
              isError: false,
            },
          ];

      setMessages(currentHistory);
      if (!isRetry) {
        setInput("");
      }

      setLoading(true);

      try {
        // Exclude initial welcome greeting and any error cards from conversation history
        const historyPayload = currentHistory
          .filter((msg, idx) => !(idx === 0 && msg.role === "assistant") && !msg.isError)
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
            message: messageText,
            history: historyPayload,
            language: selectedLanguage,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || t.requestError);
        }

        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.reply,
            isError: false,
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: err.message || t.errorMessage,
            isError: true,
            retryPayload: messageText,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, selectedLanguage, t.errorMessage, t.requestError]
  );

  // ========================================
  // CLEAR CONVERSATION
  // ========================================

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: t.welcomeAgain,
        isError: false,
      },
    ]);
    setInput("");
  };

  // ========================================
  // FORM SUBMISSION
  // ========================================

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
  };

  // ========================================
  // UI
  // ========================================

  return (
    <div className="heart-chat-page">
      {/* Unified Dashboard Sidebar */}
      <DashboardSidebar activeKey="/heart-assistant" />

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

          <div className="chat-header-actions">
            <button
              className="chat-action-btn new-chat-btn"
              onClick={clearChat}
              title={t.newConversation}
            >
              <Plus size={17} />
              <span>{t.newConversation}</span>
            </button>

            <button
              className="chat-action-btn clear-chat-btn"
              onClick={clearChat}
              title={t.clearTitle}
            >
              <Trash2 size={17} />
              <span>{t.clearChat}</span>
            </button>
          </div>
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
                msg.role === "user" ? "user-message" : "ai-message"
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

              <div
                className={`message-content ${
                  msg.isError ? "message-content-error" : ""
                }`}
              >
                <span className="message-sender">
                  {msg.role === "user" ? t.you : t.headerTitle}
                </span>

                {msg.isError ? (
                  <div className="chat-error-card">
                    <p className="error-text">{msg.content}</p>
                    {msg.retryPayload && (
                      <button
                        className="chat-retry-btn"
                        onClick={() => sendMessage(msg.retryPayload, true)}
                        disabled={loading}
                      >
                        <RotateCcw size={14} />
                        <span>{t.retry}</span>
                      </button>
                    )}
                  </div>
                ) : msg.role === "user" ? (
                  <p className="user-text">{msg.content}</p>
                ) : (
                  <div className="markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ ...props }) => (
                          <a
                            {...props}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        ),
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="chat-message ai-message">
              <div className="message-avatar">
                <Bot size={20} />
              </div>
              <div className="typing-indicator" aria-label={t.loading}>
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
          <form className="chat-input-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder={t.placeholder}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              aria-label={t.placeholder}
            />

            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="send-message-btn"
              aria-label={t.sendButton}
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
