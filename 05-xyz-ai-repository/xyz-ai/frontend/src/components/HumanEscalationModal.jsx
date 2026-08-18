import React, { useState, useEffect } from "react";
import { Phone, Mail, Clock, CheckCircle2, X, Sparkles, Loader2 } from "lucide-react";

export default function HumanEscalationModal({ isOpen, type = "teacher", user, language = "English", onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [ticketId, setTicketId] = useState("");

  const isHindi = language.toLowerCase() === "hindi" || language.toLowerCase() === "hi";
  const isTeacher = type === "teacher";

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      const generated = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketId(generated);

      // 1.5s 3D Tiger Stage Loading Timer
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      // Post ticket to ERP backend
      fetch("/api/erp/escalations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: generated,
          requestedBy: user?.name || "Student/Parent",
          target: isTeacher ? "Class Teacher" : "School Management"
        })
      }).catch(() => {});

      return () => clearTimeout(timer);
    }
  }, [isOpen, type, user]);

  if (!isOpen) return null;

  const staff = isTeacher
    ? {
        name: "Ms. Manya",
        role: isHindi ? "कक्षा शिक्षिका (10-A)" : "Class Teacher (Grade 10-A)",
        phone: "+91 98765 43210",
        email: "manya.teacher@school.edu",
        hours: isHindi ? "सोम - शनि (सुबह 8:00 - दोपहर 3:00)" : "Mon - Sat (8:00 AM - 3:00 PM)",
        subject: "Mathematics & Academic Counseling",
        avatarBg: "linear-gradient(135deg, #00f2fe, #4facfe)"
      }
    : {
        name: "Dr. V. K. Mehta",
        role: isHindi ? "प्राचार्य एवं प्रबंध निदेशक" : "School Principal & Executive Director",
        phone: "+91 98765 00000",
        email: "principal@school.edu",
        hours: isHindi ? "सोम - शुक्र (सुबह 10:00 - शाम 4:00)" : "Mon - Fri (10:00 AM - 4:00 PM)",
        subject: "School Operations & Administration",
        avatarBg: "linear-gradient(135deg, #6366f1, #00f2fe)"
      };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(5, 7, 15, 0.92)",
        backdropFilter: "blur(24px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px"
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: "540px",
          width: "100%",
          padding: "36px",
          position: "relative",
          background: "rgba(13, 17, 29, 0.95)",
          border: `1px solid ${isTeacher ? "rgba(0, 242, 254, 0.4)" : "rgba(99, 102, 241, 0.4)"}`,
          boxShadow: `0 24px 70px rgba(0, 0, 0, 0.8), 0 0 50px ${isTeacher ? "rgba(0, 242, 254, 0.15)" : "rgba(99, 102, 241, 0.15)"}`,
          textAlign: "center",
          borderRadius: "24px"
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(255, 255, 255, 0.06)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease"
          }}
        >
          <X size={18} />
        </button>

        {isLoading ? (
          /* PHASE 1: ULTRA-SLEEK 3D TIGER MODEL STAGE LOADING SCREEN */
          <div style={{ padding: "30px 10px" }}>
            <style>{`
              @keyframes orbitSpin {
                0% { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(180deg) scale(1.06); }
                100% { transform: rotate(360deg) scale(1); }
              }
              @keyframes tiger3DDepth {
                0%, 100% { transform: translateY(0px) rotateY(-5deg) rotateX(4deg); }
                50% { transform: translateY(-14px) rotateY(5deg) rotateX(-4deg); }
              }
              @keyframes speedLinesMoving {
                0% { background-position: 0 0; }
                100% { background-position: 80px 0; }
              }
            `}</style>

            {/* 3D Visual Tiger Stage */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "180px",
                margin: "0 auto 24px",
                background: "radial-gradient(circle at center, rgba(0, 242, 254, 0.15) 0%, rgba(13, 17, 29, 0.95) 100%)",
                borderRadius: "24px",
                border: "1px solid rgba(0, 242, 254, 0.3)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                perspective: "1000px"
              }}
            >
              {/* Holographic Speed Lines */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: "linear-gradient(90deg, rgba(0, 242, 254, 0.15) 1px, transparent 1px)",
                  backgroundSize: "40px 100%",
                  animation: "speedLinesMoving 0.25s linear infinite"
                }}
              />

              {/* Orbital Neon Energy Ring */}
              <div
                style={{
                  position: "absolute",
                  width: "140px",
                  height: "140px",
                  borderRadius: "50%",
                  border: "2px dashed rgba(0, 242, 254, 0.6)",
                  boxShadow: "0 0 30px rgba(0, 242, 254, 0.3)",
                  animation: "orbitSpin 4s linear infinite"
                }}
              />

              {/* 3D Depth Animated Tiger Character */}
              <div
                style={{
                  animation: "tiger3DDepth 1.2s ease-in-out infinite",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  filter: "drop-shadow(0 0 35px rgba(0, 242, 254, 0.9))",
                  zIndex: 2
                }}
              >
                <div style={{ fontSize: "5.8rem", lineHeight: 1 }}>🐅</div>
                <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                  <span style={{ width: "8px", height: "8px", background: "#00f2fe", borderRadius: "50%", opacity: 0.9 }} />
                  <span style={{ width: "6px", height: "6px", background: "#4facfe", borderRadius: "50%", opacity: 0.7 }} />
                  <span style={{ width: "4px", height: "4px", background: "#818cf8", borderRadius: "50%", opacity: 0.5 }} />
                </div>
              </div>
            </div>

            {/* Clean Professional Loading Text */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#00f2fe", fontSize: "1.25rem", fontWeight: "700", marginBottom: "6px" }}>
              <Loader2 size={20} className="anim-pulse" />
              <span>{isHindi ? "मानव सहायता से जुड़ रहे हैं..." : "Connecting to Human Assistance..."}</span>
            </div>
            
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
              {isHindi
                ? `${staff.name} के संपर्क विवरण प्राप्त किए जा रहे हैं...`
                : `Establishing direct contact channel with ${staff.name}...`}
            </p>
          </div>
        ) : (
          /* PHASE 2: PHENOMENON STUDIO STAFF CONTACT CARD */
          <div className="anim-fade-in">
            {/* Staff Avatar Graphic */}
            <div style={{ position: "relative", width: "110px", height: "110px", margin: "0 auto 20px" }}>
              <div
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  background: staff.avatarBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 0 40px ${isTeacher ? "rgba(0, 242, 254, 0.5)" : "rgba(99, 102, 241, 0.5)"}`,
                  fontSize: "3rem",
                  border: "2px solid rgba(255, 255, 255, 0.2)"
                }}
              >
                {isTeacher ? "👩‍🏫" : "👨‍💼"}
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: "2px",
                  right: "2px",
                  background: "#10b981",
                  border: "2px solid #05070f",
                  borderRadius: "50%",
                  width: "22px",
                  height: "22px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Online & Ready for Assistance"
              >
                <CheckCircle2 size={14} color="#fff" />
              </div>
            </div>

            {/* Ticket Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(0, 242, 254, 0.1)",
                border: "1px solid rgba(0, 242, 254, 0.3)",
                color: "#00f2fe",
                padding: "4px 14px",
                borderRadius: "20px",
                fontSize: "0.78rem",
                fontWeight: "700",
                marginBottom: "14px"
              }}
            >
              <Sparkles size={14} />
              <span>{isHindi ? `ERP सहायता टिकट दर्ज: #${ticketId}` : `ERP Callback Ticket: #${ticketId}`}</span>
            </div>

            {/* Name & Role */}
            <h2 style={{ fontSize: "1.6rem", fontWeight: "700", marginBottom: "4px", color: "#f8fafc" }}>{staff.name}</h2>
            <p style={{ fontSize: "0.9rem", color: isTeacher ? "#00f2fe" : "#818cf8", fontWeight: "700", marginBottom: "6px" }}>{staff.role}</p>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "20px" }}>{staff.subject}</p>

            {/* Details Box */}
            <div
              style={{
                background: "rgba(13, 17, 29, 0.8)",
                border: "1px solid var(--border-glass)",
                borderRadius: "16px",
                padding: "18px",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                marginBottom: "24px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Phone size={18} style={{ color: "#00f2fe" }} />
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>{isHindi ? "फ़ोन संपर्क (Direct Phone)" : "Direct Phone"}</span>
                  <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>{staff.phone}</strong>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Mail size={18} style={{ color: "#60a5fa" }} />
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>{isHindi ? "ईमेल आईडी" : "Official Email"}</span>
                  <strong style={{ fontSize: "0.95rem", color: "#f8fafc" }}>{staff.email}</strong>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Clock size={18} style={{ color: "#34d399" }} />
                <div>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>{isHindi ? "परामर्श समय" : "Office Hours"}</span>
                  <strong style={{ fontSize: "0.85rem", color: "#f8fafc" }}>{staff.hours}</strong>
                </div>
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              <a
                href={`tel:${staff.phone.replace(/\s+/g, "")}`}
                style={{
                  flex: 1,
                  background: "linear-gradient(135deg, #00f2fe, #4facfe)",
                  color: "#05070f",
                  padding: "12px",
                  borderRadius: "14px",
                  fontWeight: "700",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  boxShadow: "0 4px 20px rgba(0, 242, 254, 0.4)"
                }}
              >
                <Phone size={18} /> {isHindi ? "कॉल करें" : "Call Now"}
              </a>

              <a
                href={`mailto:${staff.email}`}
                style={{
                  flex: 1,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid var(--border-glass)",
                  color: "#fff",
                  padding: "12px",
                  borderRadius: "14px",
                  fontWeight: "700",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px"
                }}
              >
                <Mail size={18} /> {isHindi ? "ईमेल भेजें" : "Send Email"}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
