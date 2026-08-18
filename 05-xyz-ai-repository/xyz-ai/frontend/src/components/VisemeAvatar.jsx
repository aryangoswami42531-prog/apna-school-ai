import React, { useMemo, useState, useEffect } from "react";

/**
 * Phenomenon Ultra-Attractive Pixar-Style Animated Human AI Avatar
 * Features 3D lighting, natural skin gradients, detailed hair, expressive sparkling eyes,
 * micro-blinking animation, colorful studio outfit, audio spectrum equalizer bars,
 * and real-time lip-synced mouth morphing.
 */
export default function VisemeAvatar({ amplitude = 0, isThinking = false, isSpeaking = false, isListening = false, role = "student" }) {
  const [blink, setBlink] = useState(false);

  // Faster natural micro-blinking effect every 2.1 seconds
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 2100);
    return () => clearInterval(blinkInterval);
  }, []);

  // Map real-time audio amplitude (0 - 100) to Viseme Lip States
  const visemeState = useMemo(() => {
    if (!isSpeaking || amplitude <= 5) return "closed";
    if (amplitude > 80) return "open-wide";
    if (amplitude > 55) return "rounded";
    if (amplitude > 25) return "teeth-showing";
    return "neutral";
  }, [amplitude, isSpeaking]);

  // Determine Facial Expression
  const expression = useMemo(() => {
    if (isListening) return "listening";
    if (isThinking) return "thinking";
    if (isSpeaking) return "speaking";
    return "friendly";
  }, [isListening, isThinking, isSpeaking]);

  // Dynamic Theme Colors & Outfits based on Role
  const roleConfig = useMemo(() => {
    switch (role) {
      case "teacher":
        return {
          skin: "url(#skinGradTeacher)",
          skinShadow: "#d99b82",
          hair: "#2b1810",
          hairHighlight: "#5a3422",
          outfit: "#f59e0b",
          outfitGrad: "url(#outfitTeacher)",
          glow: "#f59e0b",
          iris: "#38bdf8",
          name: "Ms. Priya Nair",
          title: "Teacher Assistant"
        };
      case "parent":
        return {
          skin: "url(#skinGradParent)",
          skinShadow: "#c88a70",
          hair: "#1e1008",
          hairHighlight: "#422617",
          outfit: "#10b981",
          outfitGrad: "url(#outfitParent)",
          glow: "#10b981",
          iris: "#34d399",
          name: "Parent Advisor",
          title: "Support Assistant"
        };
      case "principal":
        return {
          skin: "url(#skinGradPrincipal)",
          skinShadow: "#ba836b",
          hair: "#475569",
          hairHighlight: "#94a3b8",
          outfit: "#ec4899",
          outfitGrad: "url(#outfitPrincipal)",
          glow: "#ec4899",
          iris: "#f472b6",
          name: "Dr. V. K. Mehta",
          title: "Executive AI"
        };
      default: // student
        return {
          skin: "url(#skinGradStudent)",
          skinShadow: "#e09c85",
          hair: "#23140c",
          hairHighlight: "#523220",
          outfit: "#00f2fe",
          outfitGrad: "url(#outfitStudent)",
          glow: "#00f2fe",
          iris: "#38bdf8",
          name: "XYZ Study Buddy",
          title: "Academic Assistant"
        };
    }
  }, [role]);

  const { skin, skinShadow, hair, hairHighlight, outfit, outfitGrad, glow, iris } = roleConfig;

  // 6-Bar Equalizer Audio Spectrum calculation when speaking
  const eqHeights = useMemo(() => {
    if (!isSpeaking) return [4, 4, 4, 4, 4, 4];
    const ampNorm = Math.min(100, Math.max(10, amplitude));
    return [
      Math.min(22, Math.max(4, Math.round((ampNorm * 0.6) % 20 + 4))),
      Math.min(22, Math.max(4, Math.round((ampNorm * 0.9) % 22 + 5))),
      Math.min(22, Math.max(4, Math.round((ampNorm * 1.1) % 24 + 6))),
      Math.min(22, Math.max(4, Math.round((ampNorm * 0.8) % 21 + 4))),
      Math.min(22, Math.max(4, Math.round((ampNorm * 1.0) % 23 + 5))),
      Math.min(22, Math.max(4, Math.round((ampNorm * 0.5) % 19 + 4)))
    ];
  }, [amplitude, isSpeaking]);

  return (
    <div style={{ position: "relative", width: 160, height: 165, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Dynamic Background Neon Aura Ring */}
      <div
        style={{
          position: "absolute",
          inset: "0 10px 25px 10px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glow}77 0%, ${glow}22 50%, transparent 80%)`,
          filter: "blur(12px)",
          transform: isSpeaking ? "scale(1.12)" : isThinking ? "scale(1.18)" : "scale(1)",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          animation: isThinking ? "pulseGlow 1.5s infinite ease-in-out" : "none"
        }}
      />

      <svg
        width="220"
        height="220"
        viewBox="0 0 140 140"
        style={{
          borderRadius: "50%",
          background: "linear-gradient(145deg, #0f172a 0%, #05070f 100%)",
          border: `2.5px solid ${glow}`,
          boxShadow: `0 8px 30px ${glow}55, inset 0 2px 4px rgba(255, 255, 255, 0.2)`,
          overflow: "hidden"
        }}
      >
        <defs>
          {/* Studio Radial Light Gradient */}
          <radialGradient id="studioLight" cx="50%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#0f172a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#05070f" stopOpacity="1" />
          </radialGradient>

          {/* Skin Tones Gradients */}
          <linearGradient id="skinGradTeacher" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe5d9" />
            <stop offset="60%" stopColor="#f8c9b5" />
            <stop offset="100%" stopColor="#eeb29c" />
          </linearGradient>

          <linearGradient id="skinGradParent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde2e4" />
            <stop offset="60%" stopColor="#f5c0b8" />
            <stop offset="100%" stopColor="#e5a9a0" />
          </linearGradient>

          <linearGradient id="skinGradPrincipal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffedd8" />
            <stop offset="60%" stopColor="#f3d5b5" />
            <stop offset="100%" stopColor="#e7bc91" />
          </linearGradient>

          <linearGradient id="skinGradStudent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff0f3" />
            <stop offset="60%" stopColor="#ffccd5" />
            <stop offset="100%" stopColor="#ffb5a7" />
          </linearGradient>

          {/* Outfit Gradients */}
          <linearGradient id="outfitTeacher" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="outfitParent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="outfitPrincipal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="100%" stopColor="#db2777" />
          </linearGradient>

          <linearGradient id="outfitStudent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="100%" stopColor="#4facfe" />
          </linearGradient>
        </defs>

        {/* Studio Background Backdrop */}
        <rect width="140" height="140" fill="url(#studioLight)" />

        {/* Vibrant Shoulder / Outfit Collar */}
        <path
          d="M 15 140 Q 70 92 125 140 Z"
          fill={outfitGrad}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="1.5"
        />

        {/* Inner Collar / Shirt */}
        <path
          d="M 52 140 L 70 112 L 88 140 Z"
          fill="#0f172a"
        />

        {/* Animated Listening Head Group (Tilts 8 deg when listening to user) */}
        <g transform={isListening ? "rotate(-8 70 70) translate(-3, 0)" : "none"} style={{ transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          {/* Human Neck & Shadow */}
          <rect x="57" y="84" width="26" height="22" fill={skinShadow} rx="5" />
          <rect x="59" y="84" width="22" height="18" fill={skin} rx="5" />

          {/* Head Contour Base */}
          <ellipse cx="70" cy="60" rx="35" ry="41" fill={skin} />
          {/* Soft Chin Shadow */}
          <path d="M 36 62 Q 70 106 104 62" fill={skinShadow} opacity="0.25" />

          {/* Ears with Wiggle & Radar Sound Wave Ripples when Listening */}
          <ellipse cx="33" cy="62" rx={isListening ? "7" : "5"} ry={isListening ? "9" : "8"} fill={skin} stroke={isListening ? "#ef4444" : "none"} strokeWidth="1.5" />
          <ellipse cx="107" cy="62" rx={isListening ? "7" : "5"} ry={isListening ? "9" : "8"} fill={skin} stroke={isListening ? "#ef4444" : "none"} strokeWidth="1.5" />

          {/* Ear Radar Sound Waves radiating out when listening to user */}
          {isListening && (
            <g stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M 22 52 Q 15 62 22 72" opacity="0.9" className="anim-pulse" />
              <path d="M 16 46 Q 6 62 16 78" opacity="0.6" className="anim-pulse" style={{ animationDelay: "0.2s" }} />
              <path d="M 118 52 Q 125 62 118 72" opacity="0.9" className="anim-pulse" />
              <path d="M 124 46 Q 134 62 124 78" opacity="0.6" className="anim-pulse" style={{ animationDelay: "0.2s" }} />
            </g>
          )}

        {/* Long Flowing Hair Back Curtain */}
        <path
          d="M 28 50 Q 25 14 70 12 Q 115 14 112 50 Q 128 85 116 130 L 24 130 Q 12 85 28 50 Z"
          fill={hair}
        />

        {/* Hair Front Bangs / Highlight Lock */}
        <path
          d="M 34 46 Q 54 36 72 46 Q 90 36 106 46 Q 98 22 70 20 Q 42 22 34 46 Z"
          fill={hairHighlight}
        />
        <path
          d="M 35 48 Q 50 40 68 48 Q 85 40 105 48 Q 96 26 70 24 Q 44 26 35 48 Z"
          fill={hair}
        />

        {/* Human Eyebrows */}
        <g stroke={hair} strokeWidth="3" strokeLinecap="round" fill="none">
          {expression === "listening" ? (
            <>
              {/* Listening Attentive Eyebrows */}
              <path d="M 45 42 Q 53 46 62 42" />
              <path d="M 78 42 Q 87 46 95 42" />
            </>
          ) : expression === "thinking" ? (
            <>
              {/* Left Eyebrow Raised */}
              <path d="M 45 43 Q 53 35 62 44" />
              {/* Right Eyebrow Neutral */}
              <path d="M 78 45 Q 87 42 95 46" />
            </>
          ) : (
            <>
              {/* Friendly Eyebrows */}
              <path d="M 45 44 Q 53 39 62 44" />
              <path d="M 78 44 Q 87 39 95 44" />
            </>
          )}
        </g>

        {/* Realistic Pixar Eyes with Blinking */}
        <g>
          {blink ? (
            /* Blinking Closed Eyelids */
            <g stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 47 55 Q 54 60 61 55" />
              <path d="M 79 55 Q 86 60 93 55" />
            </g>
          ) : expression === "speaking" ? (
            /* Smiling Curved Eyes when Speaking */
            <g stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none">
              <path d="M 46 55 Q 54 48 62 55" />
              <path d="M 78 55 Q 86 48 94 55" />
            </g>
          ) : (
            /* Expressive Eyes with Iris, Pupil & Dual Catchlight Sparkles */
            <>
              {/* Sclera White Base */}
              <ellipse cx="53.5" cy="55" rx="8" ry="7" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />
              <ellipse cx="86.5" cy="55" rx="8" ry="7" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.5" />

              {/* Iris Glow */}
              <circle cx="53.5" cy="55" r="4.5" fill={iris} />
              <circle cx="86.5" cy="55" r="4.5" fill={iris} />

              {/* Dark Pupil */}
              <circle cx="53.5" cy="55" r="2.4" fill="#0f172a" />
              <circle cx="86.5" cy="55" r="2.4" fill="#0f172a" />

              {/* Dual Sparkle Catchlights */}
              <circle cx="55" cy="53" r="1.5" fill="#ffffff" />
              <circle cx="88" cy="53" r="1.5" fill="#ffffff" />
              <circle cx="52" cy="57.5" r="0.8" fill="#ffffff" opacity="0.8" />
              <circle cx="85" cy="57.5" r="0.8" fill="#ffffff" opacity="0.8" />
            </>
          )}
        </g>

        {/* Human Nose */}
        <path d="M 68 60 Q 70 66 73 66" stroke={skinShadow} strokeWidth="2.2" strokeLinecap="round" fill="none" />

        {/* Dynamic Lip-Sync Mouth Morphing Engine */}
        <g className="viseme-human-mouth">
          {visemeState === "closed" && (
            /* Natural Smiling Lips */
            <g>
              <path d="M 54 78 Q 70 86 86 78" stroke="#be123c" strokeWidth="3.2" strokeLinecap="round" fill="none" />
              <path d="M 57 78 Q 70 83 83 78" stroke="#fda4af" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </g>
          )}

          {visemeState === "neutral" && (
            /* Open Friendly Smile */
            <g>
              <path d="M 52 76 Q 70 88 88 76 Q 70 79 52 76 Z" fill="#9f1239" stroke="#fda4af" strokeWidth="1" />
              <path d="M 56 76 Q 70 79 84 76" fill="#ffffff" />
            </g>
          )}

          {visemeState === "teeth-showing" && (
            /* Teeth Showing ('E', 'S', 'T' sound) */
            <g>
              <path d="M 50 75 Q 70 70 90 75 Q 70 90 50 75 Z" fill="#881337" stroke="#fda4af" strokeWidth="1.5" />
              {/* Top Teeth */}
              <rect x="54" y="74" width="32" height="5.5" rx="1.5" fill="#ffffff" />
              {/* Pink Tongue */}
              <ellipse cx="70" cy="83" rx="10" ry="3.5" fill="#f43f5e" />
            </g>
          )}

          {visemeState === "rounded" && (
            /* Rounded Mouth ('O', 'U' sound) */
            <g>
              <ellipse cx="70" cy="78" rx="11" ry="12" fill="#4c0519" stroke="#fda4af" strokeWidth="2" />
              {/* Inner Tongue */}
              <ellipse cx="70" cy="83" rx="7.5" ry="4" fill="#f43f5e" />
            </g>
          )}

          {visemeState === "open-wide" && (
            /* Open Wide ('AH', 'OH' loud sound) */
            <g>
              <path d="M 48 73 Q 70 65 92 73 Q 70 96 48 73 Z" fill="#4c0519" stroke="#fda4af" strokeWidth="2" />
              {/* Upper Teeth */}
              <rect x="53" y="71" width="34" height="6.5" rx="2" fill="#ffffff" />
              {/* Lower Tongue */}
              <path d="M 56 86 Q 70 79 84 86 Q 70 95 56 86 Z" fill="#f43f5e" />
            </g>
          )}
        </g>

        {/* Blush Cheeks */}
        <ellipse cx="44" cy="65" rx="7" ry="4" fill="#f43f5e" opacity="0.25" />
        <ellipse cx="96" cy="65" rx="7" ry="4" fill="#f43f5e" opacity="0.25" />
        </g>
      </svg>

      {/* Audio Equalizer Dynamic Bar Visualizer (Bounces when Speaking) */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "24px", marginTop: "4px" }}>
        {eqHeights.map((h, idx) => (
          <div
            key={idx}
            style={{
              width: "4px",
              height: `${h}px`,
              background: isSpeaking
                ? `linear-gradient(to top, ${glow}, #00f2fe)`
                : "rgba(255, 255, 255, 0.15)",
              borderRadius: "3px",
              transition: "height 0.1s ease",
              boxShadow: isSpeaking ? `0 0 8px ${glow}` : "none"
            }}
          />
        ))}
      </div>
    </div>
  );
}
