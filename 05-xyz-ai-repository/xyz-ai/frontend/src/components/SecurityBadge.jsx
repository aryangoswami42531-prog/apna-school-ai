import React from "react";
import { ShieldCheck, X, Lock, EyeOff, UserX, Cpu } from "lucide-react";

export default function SecurityBadge({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "600px", padding: "28px", borderRadius: "20px", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "18px", right: "18px", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
          <X size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <div style={{ background: "rgba(16, 185, 129, 0.2)", borderRadius: "12px", padding: "10px", display: "flex" }}>
            <ShieldCheck size={28} color="#10b981" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#34d399" }}>XYZ AI Security Architecture</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Enterprise-grade AI Guardrails & Security Policies</p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "20px" }}>
          
          <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#60a5fa", fontWeight: "600", marginBottom: "4px" }}>
              <Lock size={18} /> 1. Application-Layer Tool Authorization
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
              Authorization lives in backend mock API tool handlers, NOT in LLM system prompts. Every tool execution function enforces role & scope boundaries before touching data.
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#f472b6", fontWeight: "600", marginBottom: "4px" }}>
              <Cpu size={18} /> 2. Prompt Injection Vector Defense
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
              Inputs containing injection patterns ("ignore previous instructions", "system prompt") are intercepted by a regex pre-checker and wrapped with a strict security directive.
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#fbbf24", fontWeight: "600", marginBottom: "4px" }}>
              <UserX size={18} /> 3. Fake Role Claim Neutralization
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
              User text claims ("I am the principal") are completely ignored. Identity is derived strictly from server-side authenticated session context.
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#a78bfa", fontWeight: "600", marginBottom: "4px" }}>
              <EyeOff size={18} /> 4. Credential & Prompt Leak Scrubbing
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
              All outgoing LLM outputs pass through a regex scrubber to strip any API keys (`sk-ant-...`) or internal system prompt excerpts before reaching the client UI.
            </p>
          </div>

        </div>

        <button
          onClick={onClose}
          style={{ width: "100%", marginTop: "20px", background: "linear-gradient(135deg, #10b981, #059669)", color: "#fff", padding: "10px", borderRadius: "10px", fontWeight: "600", border: "none", cursor: "pointer" }}
        >
          Got It
        </button>
      </div>
    </div>
  );
}
