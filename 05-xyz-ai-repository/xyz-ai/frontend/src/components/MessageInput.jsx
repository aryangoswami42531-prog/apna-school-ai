import React, { useState } from "react";
import { Send, Mic, MicOff, Loader2 } from "lucide-react";
import { getUIText } from "../utils/i18n.js";

export default function MessageInput({ onSendMessage, isListening, isSpeaking, onToggleMic, onInterrupt, isLoading, language }) {
  const [inputText, setInputText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ padding: "16px", borderTop: "1px solid var(--border-glass)", display: "flex", alignItems: "center", gap: "10px" }}>
      {isSpeaking ? (
        <button
          type="button"
          onClick={onInterrupt}
          style={{
            background: "#ef4444",
            border: "none",
            color: "#ffffff",
            width: "44px",
            height: "44px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            boxShadow: "0 0 16px rgba(239, 68, 68, 0.7)"
          }}
          title="Tap to interrupt"
        >
          <MicOff size={20} />
        </button>
      ) : (
      <button
        type="button"
        onClick={onToggleMic}
        className={isListening ? "anim-recording" : ""}
        style={{
          background: isListening ? "#ef4444" : "rgba(255, 255, 255, 0.08)",
          border: isListening ? "none" : "1px solid var(--border-glass)",
          color: "#ffffff",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s ease",
          flexShrink: 0
        }}
        title={isListening ? "Stop recording and transcribe with Whisper" : "Speak (Whisper STT)"}
      >
        {isListening ? <MicOff size={20} /> : <Mic size={20} color={isListening ? "#fff" : "#06b6d4"} />}
      </button>
      )}

      {/* Input Text Box */}
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder={isListening ? getUIText("listening", language) : getUIText("placeholder", language)}
        disabled={isLoading}
        style={{
          flex: 1,
          background: "#1e293b",
          border: "1px solid var(--border-glass)",
          color: "var(--text-main)",
          padding: "12px 18px",
          borderRadius: "24px",
          fontSize: "0.92rem",
          outline: "none",
          transition: "border 0.2s"
        }}
      />

      {/* Send Button */}
      <button
        type="submit"
        disabled={!inputText.trim() || isLoading}
        style={{
          background: !inputText.trim() || isLoading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg, #6366f1, #06b6d4)",
          border: "none",
          color: "#ffffff",
          width: "44px",
          height: "44px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: !inputText.trim() || isLoading ? "not-allowed" : "pointer",
          boxShadow: !inputText.trim() || isLoading ? "none" : "0 0 15px rgba(99, 102, 241, 0.4)",
          flexShrink: 0
        }}
      >
        {isLoading ? <Loader2 size={20} className="anim-pulse" /> : <Send size={18} />}
      </button>
    </form>
  );
}
