import React, { useState } from "react";
import { Bot, Lock, User, AlertCircle, ArrowRight, ShieldCheck, Users, GraduationCap, School, UserCheck } from "lucide-react";
import BrandLogo3D from "./BrandLogo3D.jsx";
import Footer from "./Footer.jsx";

export default function LoginScreen({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState("parent"); // 'parent', 'student', 'teacher', 'principal'
  const [username, setUsername] = useState("parent.rahul");
  const [password, setPassword] = useState("pass123");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const demoAccounts = [
    { label: "Parent Portal", user: "parent.rahul", pass: "pass123", roleKey: "parent", roleDesc: "Parent of Raj Kumar" },
    { label: "Student Portal", user: "raj.student", pass: "pass123", roleKey: "student", roleDesc: "Raj Kumar (Student)" },
    { label: "Teacher Portal", user: "manya.teacher", pass: "pass123", roleKey: "teacher", roleDesc: "Ms. Manya (Class Teacher)" },
    { label: "Principal Management", user: "principal", pass: "pass123", roleKey: "principal", roleDesc: "Dr. V. K. Mehta" }
  ];

  const handleFillDemo = (acc) => {
    setSelectedRole(acc.roleKey);
    setUsername(acc.user);
    setPassword(acc.pass);
    setErrorMsg("");
    console.log(`[LOGIN SELECTION] Selected Username: ${acc.user} | Role: ${acc.roleKey}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg("Invalid username or password");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    console.log(`[LOGIN SUBMIT] Submitting login request for Username: ${username} | Role: ${selectedRole}`);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role: selectedRole })
      });

      const data = await res.json();

      if (data.success && data.token) {
        console.log(`[LOGIN SUCCESS] Authenticated User ID: ${data.user.id} | Name: ${data.user.name} | Role: ${data.user.role}`);
        localStorage.setItem("xyz_session_token", data.token);
        localStorage.setItem("xyz_user", JSON.stringify(data.user));
        onLoginSuccess(data.user, data.token);
      } else {
        setErrorMsg(data.error || "Invalid username or password");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setErrorMsg("Network error connecting to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px 20px" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "500px", padding: "40px 36px", borderRadius: "24px", background: "rgba(13, 17, 29, 0.88)", border: "1px solid var(--border-glass)" }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <BrandLogo3D size={72} />
          </div>
          <h1 style={{ fontSize: "1.9rem", fontWeight: "700", letterSpacing: "-0.03em", color: "#f8fafc" }}>
            Apna School <span style={{ color: "#00f2fe" }}>AI</span> Portal
          </h1>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Autonomous School ERP Intelligence
          </p>
        </div>



        {/* Error Banner */}
        {errorMsg && (
          <div style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", padding: "12px 14px", borderRadius: "14px", fontSize: "0.85rem", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px" }}>
              {selectedRole === "parent" ? "Child Name or Parent Username" : "Username or ID"}
            </label>
            <div style={{ position: "relative" }}>
              <User size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={selectedRole === "parent" ? "e.g. parent.rahul or rahul" : "e.g. rahul.student"}
                style={{ width: "100%", background: "rgba(13, 17, 29, 0.9)", border: "1px solid var(--border-glass)", color: "#f8fafc", padding: "12px 14px 12px 44px", borderRadius: "14px", fontSize: "0.9rem", outline: "none" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "var(--text-muted)", marginBottom: "8px" }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={18} color="var(--text-muted)" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: "100%", background: "rgba(13, 17, 29, 0.9)", border: "1px solid var(--border-glass)", color: "#f8fafc", padding: "12px 14px 12px 44px", borderRadius: "14px", fontSize: "0.9rem", outline: "none" }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ width: "100%", marginTop: "10px", background: "linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)", color: "#05070f", padding: "14px", borderRadius: "14px", fontWeight: "700", fontSize: "0.95rem", border: "none", cursor: isLoading ? "wait" : "pointer", boxShadow: "0 4px 25px rgba(0, 242, 254, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "all 0.2s ease" }}
          >
            <span>{isLoading ? "Authenticating..." : `Sign In to ${selectedRole.toUpperCase()} Dashboard`}</span>
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Quick Demo Logins Helper */}
        <div style={{ marginTop: "24px", paddingTop: "18px", borderTop: "1px solid var(--border-glass)" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={14} color="#10b981" />
            <span>Quick Demo Logins (Click to autofill):</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {demoAccounts.map((acc, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleFillDemo(acc)}
                style={{ background: "rgba(255, 255, 255, 0.04)", border: selectedRole === acc.roleKey ? "1px solid #00f2fe" : "1px solid var(--border-glass)", color: "#cbd5e1", padding: "10px 12px", borderRadius: "12px", fontSize: "0.78rem", textAlign: "left", cursor: "pointer", transition: "all 0.2s" }}
              >
                <div style={{ fontWeight: "700", color: "#00f2fe" }}>{acc.label}</div>
                <div style={{ fontSize: "0.7rem", opacity: 0.75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc.roleDesc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div style={{ width: "100%", maxWidth: "1280px" }}>
        <Footer />
      </div>
    </div>
  );
}
