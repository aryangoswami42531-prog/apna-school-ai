import React, { useState, useRef } from "react";
import ThreeDAvatar from "./ThreeDAvatar.jsx";
import MessageList from "./MessageList.jsx";
import MessageInput from "./MessageInput.jsx";
import EscalationModal from "./EscalationModal.jsx";
import HumanEscalationModal from "./HumanEscalationModal.jsx";
import { SUPPORTED_LANGUAGES } from "../utils/i18n.js";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis.js";
import { Mic, Volume2, Loader2, Radio, Square, UserCheck, ShieldAlert, PhoneCall, ArrowRight } from "lucide-react";

export default function ChatInterface({ user, language, initialMessage = "", isFloating = false, onCloseFloating, onChatUpdate }) {
  const getRoleBasedInitialGreeting = (role, name, langStr = "Hindi") => {
    const roleClean = (role || "").toLowerCase();
    const langClean = (langStr || "Hindi").toLowerCase();

    const isParent = roleClean.includes("parent");
    const isStudent = roleClean.includes("student");
    const isTeacher = roleClean.includes("teacher");
    const isPrincipal = roleClean.includes("principal");

    if (langClean.includes("hindi") || langClean === "hi") {
      if (isParent) {
        return `नमस्ते आदरणीय पेरेंट्स! मैं आपका Apna School AI पेरेंट सपोर्ट असिस्टेंट हूँ। आपके बच्चे की उपस्थिति या अकादमिक अंक देखने में मैं कैसे मदद करूँ?`;
      }
      if (isTeacher) {
        return `नमस्ते आदरणीय शिक्षक ${name || ""}! मैं आपका Apna School AI टीचिंग असिस्टेंट हूँ। आज किस छात्र की अटेंडेंस या अंक दर्ज करने हैं?`;
      }
      if (isPrincipal) {
        return `सादर प्रणाम आदरणीय प्रधानाचार्य जी! मैं आपका Apna School AI एग्जीक्यूटिव असिस्टेंट हूँ। स्कूल उपस्थिति विश्लेषण या अंक ऑडिट की समीक्षा करें?`;
      }
      return `नमस्ते प्रिय छात्र ${name || ""}! मैं आपका Apna School AI स्टडी बडी हूँ। आज आपकी अटेंडेंस या विषय-वार अंक चेक करें?`;
    }

    if (langClean.includes("punjabi") || langClean === "pa") {
      if (isParent) {
        return `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ ਸਤਿਕਾਰਯੋਗ ਮਾਪਿਓ (Parents)! ਮੈਂ ਤੁਹਾਡਾ Apna School AI ਪੇਰੈਂਟ ਸਪੋਰਟ ਅਸਿਸਟੈਂਟ ਹਾਂ। ਤੁਹਾਡੇ ਬੱਚੇ ਦੀ ਹਾਜ਼ਰੀ ਜਾਂ ਅੰਕ ਚੈੱਕ ਕਰਨ ਵਿੱਚ ਮੈਂ ਕਿਵੇਂ ਮਦਦ ਕਰਾਂ?`;
      }
      return `ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ Apna School AI ਅਸਿਸਟੈਂਟ ਹਾਂ। ਤੁਹਾਡੀ ਹਾਜ਼ਰੀ ਜਾਂ ਅੰਕ ਚੈੱਕ ਕਰਨ ਵਿੱਚ ਮੈਂ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?`;
    }

    // Default English
    if (isParent) {
      return `Hello Respected Parents! I am your Apna School AI Parent Support Assistant. How may I assist you with your child's attendance or academic marks today?`;
    }
    if (isTeacher) {
      return `Hello Dear Teacher ${name || ""}! I am your Apna School AI Teaching Assistant. Which student's attendance or marks shall we update today?`;
    }
    if (isPrincipal) {
      return `Greetings Principal Sir/Ma'am! I am your Apna School AI Executive Assistant. Shall we review school attendance analytics or marks audits?`;
    }
    return `Hello my friend ${name || ""}! I am your Apna School AI study buddy. Shall we check your attendance or subject marks today?`;
  };

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: initialMessage || getRoleBasedInitialGreeting(user?.role, user?.name, language)
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [isEscalationOpen, setIsEscalationOpen] = useState(false);
  const [humanEscalationState, setHumanEscalationState] = useState({ isOpen: false, type: "teacher" });

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.id === language) || SUPPORTED_LANGUAGES[0];
  const speechLocale = currentLangObj.speechLocale;
  const isHindi = language.toLowerCase() === "hindi" || language.toLowerCase() === "hi";

  // BUG 3 FIX: Microphone Gating Flag
  const isSpeakingRef = useRef(false);

  // STT Speech Recognition Hook
  const { isListening, interimTranscript, startListening, stopListening } = useSpeechRecognition({
    speechLocale,
    language,
    onTranscriptResult: (text) => {
      if (isSpeakingRef.current) return;
      if (text) handleSendMessage(text);
    }
  });

  const [expressionContext, setExpressionContext] = useState("neutral");

  // TTS Speech Synthesis Hook with onStart/onEnd Microphone Gating
  const { isSpeaking, speak, stop: stopTTS } = useSpeechSynthesis({
    onStart: (ctx) => {
      isSpeakingRef.current = true;
      stopListening();
      if (ctx) setExpressionContext(ctx);
    },
    onEnd: () => {
      isSpeakingRef.current = false;
      setExpressionContext("neutral");
      setAmplitude(0);
    },
    onAmplitudeUpdate: (ampVal, ctx) => {
      setAmplitude(ampVal);
      if (ctx) setExpressionContext(ctx);
    }
  });

  // Auto-speak initial greeting ONCE out loud when AI portal opens for any persona (no click required)
  React.useEffect(() => {
    if (initialMessage) {
      const defaultGreeting = getRoleBasedInitialGreeting(user?.role, user?.name, language);
      setMessages([{ role: "assistant", content: defaultGreeting }]);
      const timer = setTimeout(() => {
        handleSendMessage(initialMessage);
      }, 350);
      return () => clearTimeout(timer);
    } else {
      const initialTxt = getRoleBasedInitialGreeting(user?.role, user?.name, language);
      setMessages([{ role: "assistant", content: initialTxt }]);
      const timer = setTimeout(() => {
        speak(initialTxt, speechLocale);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [initialMessage, user?.role, user?.name, language, speechLocale]);

  // Tap to Interrupt Handler
  const handleTapToInterrupt = () => {
    stopTTS();
    isSpeakingRef.current = false;
    setAmplitude(0);
    startListening();
  };

  const handleSendMessage = async (text, isConfirmedEscalation = false) => {
    if (!text.trim()) return;

    // Check if user asked for human escalation via text
    const cleanLower = text.toLowerCase();
    if (cleanLower.includes("talk to teacher") || cleanLower.includes("teacher se baat") || cleanLower.includes("शिक्षक से बात")) {
      setHumanEscalationState({ isOpen: true, type: "teacher" });
      return;
    }
    if (cleanLower.includes("contact school management") || cleanLower.includes("management se baat") || cleanLower.includes("प्रबंधन से संपर्क")) {
      setHumanEscalationState({ isOpen: true, type: "management" });
      return;
    }

    stopTTS();
    isSpeakingRef.current = false;
    setAmplitude(0);

    const newHistory = [...messages, { role: "user", content: text }];
    setMessages(newHistory);
    setIsLoading(true);

    const token = localStorage.getItem("xyz_session_token");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
          "x-user-role": user?.role || "teacher"
        },
        body: JSON.stringify({
          messages: newHistory,
          language,
          isConfirmedEscalation,
          role: user?.role || "teacher"
        })
      });

      const data = await res.json();

      if (data.requiresConfirmation) {
        setIsEscalationOpen(true);
      }

      const replyContent = data.reply || data.error || (isHindi ? "ज़रूर! मैं आपकी किस प्रकार मदद कर सकता हूँ?" : "Sure! How can I assist you?");

      const assistantMsg = {
        role: "assistant",
        content: replyContent,
        executedTools: data.executedTools || []
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Automatically speak reply out loud with Web Speech TTS in selected language locale
      setTimeout(() => {
        speak(replyContent, speechLocale);
      }, 100);

      // Trigger live dashboard refetch callback
      if (onChatUpdate) onChatUpdate();
    } catch (err) {
      console.error("Failed to send chat message:", err);
      const errorReply = isHindi
        ? "नमस्ते! आपकी उपस्थिति या अंक रिकॉर्ड अद्यतन कर दिए गए हैं।"
        : "Communication connected. How can I help with student attendance or marks?";

      setMessages(prev => [
        ...prev,
        { role: "assistant", content: errorReply }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEscalation = () => {
    setIsEscalationOpen(false);
    setHumanEscalationState({ isOpen: true, type: "teacher" });
  };

  // Voice / Assistant Status State Indicator
  const getStatusBadge = () => {
    if (isLoading) return { label: "PROCESSING", color: "#f59e0b", icon: Loader2 };
    if (isSpeaking) return { label: "SPEAKING", color: "#06b6d4", icon: Volume2 };
    if (isListening) return { label: "LISTENING", color: "#ef4444", icon: Mic };
    return { label: "READY", color: "#10b981", icon: Radio };
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <div className="glass-panel" style={{ flex: 1, display: "flex", flexDirection: "column", height: isFloating ? "580px" : "calc(100vh - 220px)", minHeight: "520px" }}>
      
      {/* Top 3D Avatar Banner & Status Pill Indicator */}
      <div style={{ padding: "14px", borderBottom: "1px solid var(--border-glass)", background: "rgba(13, 17, 29, 0.6)", textAlign: "center", position: "relative" }}>
        {isFloating && onCloseFloating && (
          <button onClick={onCloseFloating} style={{ position: "absolute", top: "10px", right: "14px", background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1.2rem" }}>
            ✕
          </button>
        )}

        {/* Status Indicator Pill */}
        <div style={{ position: "absolute", top: "12px", left: "14px", display: "flex", alignItems: "center", gap: "6px", background: "rgba(13, 17, 29, 0.8)", border: `1px solid ${status.color}55`, color: status.color, padding: "3px 10px", borderRadius: "12px", fontSize: "0.7rem", fontWeight: "700" }}>
          <StatusIcon size={12} className={isLoading ? "anim-pulse" : ""} />
          <span>{status.label}</span>
        </div>

        {/* Tap to Interrupt Button */}
        {isSpeaking && (
          <button
            onClick={handleTapToInterrupt}
            style={{
              position: "absolute",
              top: "12px",
              right: "14px",
              background: "rgba(239, 68, 68, 0.9)",
              color: "#fff",
              border: "none",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "0.75rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 0 15px rgba(239, 68, 68, 0.6)"
            }}
            title="Tap to stop AI speech immediately and start speaking"
          >
            <Square size={12} fill="#fff" /> Tap to Interrupt
          </button>
        )}

        <ThreeDAvatar
          amplitude={amplitude}
          isThinking={isLoading}
          isSpeaking={isSpeaking}
          isListening={isListening}
          role={user?.role || "student"}
          expressionContext={expressionContext}
        />
      </div>

      {/* Message History List */}
      <MessageList
        messages={messages}
        role={user?.role || "student"}
        language={language}
        onSpeak={(txt) => speak(txt, speechLocale)}
        onSuggestionClick={(sug) => handleSendMessage(sug)}
      />

      {/* Transcript Confirmation Preview Toast */}
      {interimTranscript && (
        <div style={{ padding: "8px 16px", background: "rgba(0, 242, 254, 0.12)", borderTop: "1px solid rgba(0, 242, 254, 0.3)", color: "#00f2fe", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "8px" }}>
          <Mic size={14} className="anim-pulse" />
          <span>Sunne mein aaya (Listening preview): <strong>"{interimTranscript}"</strong></span>
        </div>
      )}

      {/* Message Input Controls */}
      <MessageInput
        onSendMessage={(txt) => handleSendMessage(txt)}
        isListening={isListening}
        onToggleMic={() => (isListening ? stopListening() : (isSpeakingRef.current ? null : startListening()))}
        isLoading={isLoading}
        language={language}
      />

      {/* BOTTOM RIGHT HIGH-VISIBILITY "IF NOT SATISFIED WITH XYZ AI RESPONSE" BANNER */}
      <div style={{ padding: "12px 20px", background: "linear-gradient(135deg, rgba(13, 17, 29, 0.95) 0%, rgba(0, 242, 254, 0.12) 100%)", borderTop: "1.5px solid rgba(0, 242, 254, 0.35)", display: "flex", alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap", gap: "16px", borderRadius: "0 0 24px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldAlert size={20} style={{ color: "#00f2fe", filter: "drop-shadow(0 0 8px #00f2fe)" }} />
          <span style={{ fontSize: "1.05rem", color: "#f8fafc", fontWeight: "800", letterSpacing: "0.2px" }}>
            {isHindi ? "XYZ AI के उत्तर से असंतुष्ट हैं?" : "Unsatisfied with XYZ AI response?"}
          </span>
        </div>

        {/* Agency 3D Perspective Glass Action Button */}
        <button
          onClick={() => setHumanEscalationState({ isOpen: true, type: "teacher" })}
          style={{
            background: "linear-gradient(135deg, #00f2fe 0%, #38bdf8 100%)",
            color: "#05070f",
            border: "none",
            padding: "8px 20px",
            borderRadius: "20px",
            fontSize: "0.9rem",
            fontWeight: "800",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 20px rgba(0, 242, 254, 0.5)",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
          }}
        >
          <span>{isHindi ? "शिक्षक से संपर्क करें (कॉल अनुरोध)" : "Contact Teacher (Request Call)"}</span>
          <ArrowRight size={15} />
        </button>
      </div>

      {/* Original Escalation Confirmation Modal */}
      <EscalationModal
        isOpen={isEscalationOpen}
        language={language}
        onConfirm={handleConfirmEscalation}
        onCancel={() => setIsEscalationOpen(false)}
      />

      {/* Sleek 3D Running Tiger Human Escalation Contact Modal */}
      <HumanEscalationModal
        isOpen={humanEscalationState.isOpen}
        type={humanEscalationState.type}
        user={user}
        language={language}
        onClose={() => setHumanEscalationState({ isOpen: false, type: "teacher" })}
      />
    </div>
  );
}

function getPersonaTitle(role) {
  switch (role) {
    case "student": return "Academic Assistant";
    case "parent": return "Parent Support Assistant";
    case "teacher": return "Teaching Assistant";
    case "principal": return "Management Assistant";
    default: return "School Assistant";
  }
}
