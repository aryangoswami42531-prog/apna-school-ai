import React from "react";
import { GraduationCap, Users, UserCheck, ShieldAlert } from "lucide-react";

export default function RoleSelector({ currentRole, onRoleChange }) {
  const roles = [
    { id: "student", label: "Student", icon: GraduationCap, color: "#06b6d4", user: "Created after teacher registers a name" },
    { id: "parent", label: "Parent", icon: Users, color: "#10b981", user: "Created after teacher registers a name" },
    { id: "teacher", label: "Teacher", icon: UserCheck, color: "#f59e0b", user: "Ms. Manya (Math Teacher 10-A)" },
    { id: "principal", label: "Principal", icon: ShieldAlert, color: "#ec4899", user: "Dr. V. K. Mehta (Management)" }
  ];

  return (
    <div className="glass-panel" style={{ padding: "12px", marginBottom: "20px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
        {roles.map(r => {
          const Icon = r.icon;
          const isActive = currentRole === r.id;
          return (
            <button
              key={r.id}
              onClick={() => onRoleChange(r.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 14px",
                borderRadius: "12px",
                background: isActive ? `rgba(${hexToRgb(r.color)}, 0.18)` : "rgba(255, 255, 255, 0.03)",
                border: `1px solid ${isActive ? r.color : "var(--border-glass)"}`,
                color: isActive ? "#ffffff" : "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                textAlign: "left"
              }}
            >
              <div style={{ background: isActive ? r.color : "rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px", display: "flex" }}>
                <Icon size={18} color={isActive ? "#ffffff" : r.color} />
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: "600" }}>{r.label}</div>
                <div style={{ fontSize: "0.72rem", opacity: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.user}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : "99, 102, 241";
}
