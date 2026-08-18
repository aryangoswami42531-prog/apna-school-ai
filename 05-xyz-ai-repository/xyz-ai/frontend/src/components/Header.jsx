import React from "react";
import { ShieldCheck, Bot, User, LogOut } from "lucide-react";
import { SUPPORTED_LANGUAGES, getUIText } from "../utils/i18n.js";

import BrandLogo3D from "./BrandLogo3D.jsx";

export default function Header({ user, currentLanguage, onLanguageChange, onOpenSecurityModal, onLogout }) {
  const currentRole = user?.role || "student";

  const getRoleBadgeStyle = () => {
    switch (currentRole) {
      case "student": return { bg: "rgba(0, 242, 254, 0.12)", border: "rgba(0, 242, 254, 0.3)", text: "#00f2fe", label: "Student Persona" };
      case "parent": return { bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.3)", text: "#34d399", label: "Parent Persona" };
      case "teacher": return { bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)", text: "#fbbf24", label: "Teacher Persona" };
      case "principal": return { bg: "rgba(236, 72, 153, 0.12)", border: "rgba(236, 72, 153, 0.3)", text: "#f472b6", label: "Principal Persona" };
      default: return { bg: "rgba(99, 102, 241, 0.12)", border: "rgba(99, 102, 241, 0.3)", text: "#818cf8", label: "School Assistant" };
    }
  };

  const badge = getRoleBadgeStyle();

  return (
    <header className="glass-panel" style={{ padding: "16px 28px", marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", background: "rgba(13, 17, 29, 0.85)", border: "1px solid var(--border-glass)", borderRadius: "24px" }}>
      {/* Brand Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <BrandLogo3D size={52} />
        <div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700", letterSpacing: "-0.03em", color: "#f8fafc" }}>
            Apna School <span style={{ color: "#00f2fe" }}>AI</span>
          </h1>
        </div>
      </div>

      {/* Persona Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", background: badge.bg, border: `1px solid ${badge.border}`, padding: "6px 16px", borderRadius: "20px" }}>
        <User size={15} color={badge.text} />
        <span style={{ fontSize: "0.84rem", fontWeight: "700", color: badge.text }}>
          {user?.name || "Authenticated User"} ({badge.label})
        </span>
      </div>

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>

        {/* Language Selector */}
        <select
          value={currentLanguage}
          onChange={(e) => onLanguageChange(e.target.value)}
          style={{
            background: "rgba(13, 17, 29, 0.9)",
            color: "#f8fafc",
            border: "1px solid var(--border-glass)",
            padding: "8px 14px",
            borderRadius: "12px",
            fontSize: "0.84rem",
            fontWeight: "600",
            cursor: "pointer",
            outline: "none"
          }}
        >
          {SUPPORTED_LANGUAGES.map(lang => (
            <option key={lang.id} value={lang.id} style={{ background: "#0d111d", color: "#fff" }}>
              {lang.name} ({lang.native})
            </option>
          ))}
        </select>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(239, 68, 68, 0.12)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
            padding: "8px 14px",
            borderRadius: "12px",
            fontSize: "0.8rem",
            fontWeight: "700",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          title="Sign out of ERP session"
        >
          <LogOut size={15} /> Logout
        </button>
      </div>
    </header>
  );
}
