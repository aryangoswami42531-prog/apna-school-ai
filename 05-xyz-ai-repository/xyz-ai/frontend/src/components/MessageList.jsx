import React from "react";
import { Bot, User, Wrench, Volume2, Sparkles, ShieldAlert } from "lucide-react";
import { getUIText } from "../utils/i18n.js";

export default function MessageList({ messages, role, language, onSpeak, onSuggestionClick }) {
  const getSuggestions = () => {
    switch (role) {
      case "student":
        return ["What is my attendance?", "Show my subject-wise attendance"];
      case "parent":
        return ["How much attendance does my child have?", "I want to talk to my child's teacher"];
      case "teacher":
        return ["attendance lagani hai", "I want to enter marks"];
      case "principal":
        return ["What is the overall school attendance?", "Show grade-wise attendance breakdown"];
      default:
        return ["What is my attendance?"];
    }
  };

  const suggestions = getSuggestions();

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {messages.map((msg, index) => {
        const isUser = msg.role === "user";
        return (
          <div
            key={index}
            style={{
              display: "flex",
              justifyContent: isUser ? "flex-end" : "flex-start",
              alignItems: "flex-start",
              gap: "10px"
            }}
          >
            {!isUser && (
              <div style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "4px" }}>
                <Bot size={18} color="#ffffff" />
              </div>
            )}

            <div
              style={{
                maxWidth: "75%",
                background: isUser ? "linear-gradient(135deg, #6366f1, #4f46e5)" : "rgba(30, 41, 59, 0.8)",
                border: isUser ? "none" : "1px solid var(--border-glass)",
                color: "#ffffff",
                padding: "12px 16px",
                borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                boxShadow: isUser ? "0 4px 12px rgba(99, 102, 241, 0.3)" : "none",
                fontSize: "0.92rem",
                lineHeight: "1.5"
              }}
            >
              {/* Message Content */}
              <div>{msg.content}</div>

              {/* Tool Execution Badges */}
              {msg.executedTools && msg.executedTools.length > 0 && (
                <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {msg.executedTools.map((tool, tIdx) => (
                    <span
                      key={tIdx}
                      style={{
                        fontSize: "0.72rem",
                        background: "rgba(6, 182, 212, 0.15)",
                        color: "#22d3ee",
                        border: "1px solid rgba(6, 182, 212, 0.3)",
                        padding: "2px 8px",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Wrench size={12} />
                      Tool Executed: <strong>{tool.name}</strong>
                    </span>
                  ))}
                </div>
              )}

              {/* Audio Play Button for Assistant Message */}
              {!isUser && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "6px" }}>
                  <button
                    onClick={() => onSpeak(msg.content)}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "none",
                      color: "var(--text-muted)",
                      borderRadius: "6px",
                      padding: "3px 8px",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                    title="Listen with Text-to-Speech"
                  >
                    <Volume2 size={13} /> Speak
                  </button>
                </div>
              )}
            </div>

            {isUser && (
              <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "4px" }}>
                <User size={18} color="#e2e8f0" />
              </div>
            )}
          </div>
        );
      })}

      {/* Suggested Quick Prompt Chips */}
      <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
          <Sparkles size={12} color="#06b6d4" />
          {getUIText("suggestedQueries", language)}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {suggestions.map((sug, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick(sug)}
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid var(--border-glass)",
                color: "#e2e8f0",
                padding: "6px 12px",
                borderRadius: "14px",
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
            >
              "{sug}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
