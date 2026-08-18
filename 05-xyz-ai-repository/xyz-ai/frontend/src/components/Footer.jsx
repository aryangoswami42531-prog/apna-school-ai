import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        marginTop: "40px",
        padding: "16px 0",
        background: "rgba(5, 7, 15, 0.95)",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        overflow: "hidden",
        position: "relative",
        whiteSpace: "nowrap"
      }}
    >
      <style>{`
        @keyframes marqueeScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: inline-flex;
          align-items: center;
          animation: marqueeScroll 18s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="marquee-track">
        {[...Array(8)].map((_, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "24px",
              paddingRight: "24px",
              fontSize: "0.95rem",
              fontWeight: "700",
              letterSpacing: "0.05em",
              color: "#cbd5e1",
              fontFamily: "var(--font-heading)"
            }}
          >
            <span style={{ color: "#94a3b8" }}>Developed by</span>
            <span
              style={{
                background: "linear-gradient(135deg, #00f2fe, #4facfe)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "800"
              }}
            >
              Aryan Goswami
            </span>
            <span style={{ color: "rgba(0, 242, 254, 0.4)", fontSize: "0.8rem" }}>•</span>
          </span>
        ))}
      </div>
    </footer>
  );
}
