import React, { useEffect, useState, useRef } from "react";
import BrandLogo3D from "./BrandLogo3D.jsx";

/**
 * Initial Full-Screen SPYLT-Inspired Kinetic Typographic Loading Experience
 * Features oversized interactive kinetic typography, staggered letter scaling & rotation,
 * dynamic sub-headline word cycling, interactive mouse parallax, floating 3D particle accents,
 * and a smooth progressive 3D split curtain reveal.
 */
export default function InitialAppLoader({ onComplete }) {
  const [progress, setProgress] = useState(0);
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const cyclingWords = [
    "SMART STUDY BUDDY",
    "REAL-TIME ERP INSIGHTS",
    "VOICE AI ASSISTANT",
    "APNA SCHOOL AI"
  ];

  const headlineText = "APNA SCHOOL AI";
  const letters = headlineText.split("");

  // Mouse Parallax Track
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Cycling Words Interval
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIndex((prev) => (prev + 1) % cyclingWords.length);
    }, 550);
    return () => clearInterval(interval);
  }, [cyclingWords.length]);

  // Smooth Progressive Progress Counter (0% -> 100%)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds initial loading reveal

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(currentProgress);

      if (elapsed >= duration) {
        clearInterval(timer);
        setIsRevealing(true);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 650); // Finish curtain slide out
      }
    }, 25);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 99999,
        background: "#080c16",
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "40px 48px",
        overflow: "hidden",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        transform: isRevealing ? "translateY(-100%)" : "translateY(0%)",
        transition: "transform 0.7s cubic-bezier(0.76, 0, 0.24, 1)",
        pointerEvents: isRevealing ? "none" : "all"
      }}
    >
      {/* Dynamic Background Parallax Grid & Ambient Neon Aura */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-20%",
          width: "140%",
          height: "140%",
          background: "radial-gradient(circle at 50% 50%, rgba(0, 242, 254, 0.15), rgba(79, 70, 229, 0.1), transparent 60%)",
          transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
          transition: "transform 0.1s ease-out",
          pointerEvents: "none"
        }}
      />

      {/* Top Header Row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "0.85rem", fontWeight: "800", letterSpacing: "2px", color: "#00f2fe", textTransform: "uppercase" }}>
            [ ENTERPRISE AI PORTAL ]
          </span>
        </div>
        <div style={{ fontSize: "0.85rem", fontWeight: "700", color: "#94a3b8", letterSpacing: "1px" }}>
          v2.0 KINETIC EDITION
        </div>
      </div>

      {/* Center Hero Oversized Kinetic Typographic Stage */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          zIndex: 2,
          position: "relative"
        }}
      >
        {/* Centered Waving 3D Character Avatar ("Bacha hi kara h") */}
        <div style={{ marginBottom: "20px", transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)` }}>
          <BrandLogo3D size={120} />
        </div>

        {/* Playful Cycling Sub-Headline Pill */}
        <div
          style={{
            background: "rgba(0, 242, 254, 0.12)",
            border: "1px solid rgba(0, 242, 254, 0.35)",
            padding: "8px 20px",
            borderRadius: "30px",
            marginBottom: "24px",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            backdropFilter: "blur(10px)"
          }}
        >
          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#00f2fe", boxShadow: "0 0 10px #00f2fe" }} />
          <span style={{ fontSize: "0.9rem", fontWeight: "800", color: "#00f2fe", letterSpacing: "1.5px" }}>
            {cyclingWords[activeWordIndex]}
          </span>
        </div>

        {/* OVERSIZED KINETIC TYPOGRAPHY WITH STAGGERED LETTER ANIMATIONS */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "1100px",
            transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
            transition: "transform 0.15s ease-out"
          }}
        >
          {letters.map((char, index) => {
            if (char === " ") {
              return <span key={index} style={{ width: "24px" }} />;
            }
            return (
              <span
                key={index}
                style={{
                  fontSize: "clamp(2.8rem, 7.5vw, 6.5rem)",
                  fontWeight: "900",
                  letterSpacing: "-0.04em",
                  color: index % 3 === 0 ? "#00f2fe" : index % 3 === 1 ? "#ffffff" : "#38bdf8",
                  display: "inline-block",
                  transform: `translateY(${Math.sin(progress * 0.1 + index) * 6}px) rotate(${Math.cos(progress * 0.1 + index) * 4}deg) scale(${1 + Math.sin(progress * 0.08 + index) * 0.05})`,
                  transition: "transform 0.08s ease-out",
                  textShadow: index % 3 === 0 ? "0 0 35px rgba(0, 242, 254, 0.6)" : "none"
                }}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Subtitle Message */}
        <p style={{ fontSize: "1.1rem", color: "#94a3b8", marginTop: "24px", fontWeight: "600", maxWidth: "540px", lineHeight: 1.6 }}>
          Transforming School ERP & Academic Intelligence with Voice 3D AI
        </p>
      </div>

      {/* Bottom Footer Row with Giant Bold Percentage Counter */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          zIndex: 2,
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          paddingTop: "24px"
        }}
      >
        <div>
          <div style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: "700", letterSpacing: "1px" }}>SYSTEM INITIALIZATION</div>
          <div style={{ fontSize: "1rem", color: "#00f2fe", fontWeight: "800", marginTop: "4px" }}>READY TO LAUNCH</div>
        </div>

        {/* Giant Bold Percentage Display */}
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "4.5rem", fontWeight: "900", lineHeight: 0.9, color: "#f8fafc", letterSpacing: "-0.05em" }}>
            {progress}<span style={{ color: "#00f2fe" }}>%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
