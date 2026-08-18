import React from "react";
import { PhoneCall, AlertCircle } from "lucide-react";
import { getUIText } from "../utils/i18n.js";

export default function EscalationModal({ isOpen, language, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "460px", padding: "28px", borderRadius: "20px", border: "1px solid rgba(245, 158, 11, 0.4)" }}>
        
        <div style={{ background: "rgba(245, 158, 11, 0.15)", borderRadius: "50%", width: "56px", height: "56px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px auto", border: "1px solid #f59e0b" }}>
          <PhoneCall size={28} color="#f59e0b" />
        </div>

        <h3 style={{ fontSize: "1.2rem", fontWeight: "700", textAlign: "center", marginBottom: "8px" }}>
          {getUIText("confirmEscalationTitle", language)}
        </h3>

        <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", textAlign: "center", lineHeight: "1.5", marginBottom: "24px" }}>
          {getUIText("confirmEscalationBody", language)}
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid var(--border-glass)",
              color: "var(--text-main)",
              fontWeight: "600",
              cursor: "pointer"
            }}
          >
            {getUIText("cancel", language)}
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              border: "none",
              color: "#ffffff",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 0 15px rgba(245, 158, 11, 0.4)"
            }}
          >
            {getUIText("yesConfirm", language)}
          </button>
        </div>

      </div>
    </div>
  );
}
