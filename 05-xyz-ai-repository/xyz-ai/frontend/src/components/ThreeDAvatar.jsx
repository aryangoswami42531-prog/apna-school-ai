import React, { useEffect, useRef, useState } from "react";
import VisemeAvatar from "./VisemeAvatar.jsx";
import { Video, Sparkles } from "lucide-react";

/**
 * 3D Pixar Human Character Avatar Renderer Component (Large 220px Portrait)
 * Features real-time lip synchronization, natural speech boundary morphing,
 * context-aware facial expressions (greeting, question, explanation, success),
 * natural micro-blinking, eye micro-gaze shifts, and subtle head nod animations.
 */
export default function ThreeDAvatar({
  amplitude = 0,
  isThinking = false,
  isSpeaking = false,
  isListening = false,
  role = "teacher",
  expressionContext = "neutral"
}) {
  const [avatarMode, setAvatarMode] = useState("3d");
  const canvasRef = useRef(null);

  useEffect(() => {
    if (avatarMode !== "3d") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animId;
    let time = 0;
    let blinkTimer = 0;
    let isBlinking = false;

    const render3DAvatar = () => {
      time += 0.04;
      blinkTimer += 0.04;

      // Natural micro-blinking every 3.2 seconds
      if (blinkTimer > 3.2) {
        isBlinking = true;
        if (blinkTimer > 3.34) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2; // 110px
      const centerY = height / 2; // 110px

      ctx.clearRect(0, 0, width, height);

      const roleConfigs = {
        student: { skin: "#fcd5ce", hair: "#1a0d08", hairHighlight: "#4a281c", accent: "#00f2fe", outfit: "#00f2fe" },
        parent: { skin: "#f5cbb0", hair: "#120804", hairHighlight: "#361b10", accent: "#10b981", outfit: "#10b981" },
        teacher: { skin: "#f8d4be", hair: "#261309", hairHighlight: "#542c17", accent: "#f59e0b", outfit: "#f59e0b" },
        principal: { skin: "#edd0be", hair: "#2d3748", hairHighlight: "#4a5568", accent: "#ec4899", outfit: "#ec4899" }
      };

      const config = roleConfigs[role] || roleConfigs.teacher;
      const { skin, hair, hairHighlight, accent, outfit } = config;

      // Dynamic Physics Sway for Hair Locks
      const hairSway1 = Math.sin(time * 1.5) * 5.0;
      const hairSway2 = Math.cos(time * 1.3) * 4.0;
      const hairSway3 = Math.sin(time * 2.0) * 2.5;

      // Dynamic Head Motions: Breathing, Listening tilt, Question tilt, Speaking nod
      const isQuestionContext = expressionContext === "question";
      const isSuccessContext = expressionContext === "success";

      let headTiltX = isListening ? -12 : isThinking ? Math.sin(time * 0.8) * 10 : isQuestionContext ? -6 : Math.sin(time * 0.5) * 4;
      let headTiltY = isListening ? 4 : isThinking ? Math.cos(time * 0.8) * 8 : Math.cos(time * 0.4) * 3;

      // Subtle Head Nod when speaking or confirming
      if (isSpeaking) {
        headTiltY += Math.sin(time * 3.5) * 2.2;
      } else if (isSuccessContext) {
        headTiltY += Math.sin(time * 4) * 3.0;
      }

      const headRotation = isListening ? 0.22 : isQuestionContext ? -0.08 : 0;
      const avatarScale = isListening ? 1.55 : 1.45;

      // Ambient Glow Ring
      const auraGrad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, 105);
      auraGrad.addColorStop(0, isListening ? "rgba(239, 68, 68, 0.65)" : isSpeaking ? accent + "77" : accent + "44");
      auraGrad.addColorStop(1, "transparent");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 105, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(centerX + headTiltX, centerY + headTiltY + 10);
      ctx.rotate(headRotation);
      ctx.scale(avatarScale, avatarScale);

      // --- LAYER 1: BACK FLOWING HAIR LOCKS ---
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.moveTo(-25, -20);
      ctx.quadraticCurveTo(-46 + hairSway1, 0, -36 + hairSway1, 55);
      ctx.quadraticCurveTo(-20 + hairSway1, 62, -12, 35);
      ctx.quadraticCurveTo(-28, 5, -20, -20);
      ctx.fill();

      ctx.moveTo(25, -20);
      ctx.quadraticCurveTo(46 + hairSway2, 0, 36 + hairSway2, 55);
      ctx.quadraticCurveTo(20 + hairSway2, 62, 12, 35);
      ctx.quadraticCurveTo(28, 5, 20, -20);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, -10, 40, Math.PI, 0);
      ctx.quadraticCurveTo(44 + hairSway2, 30, 36 + hairSway2, 55);
      ctx.lineTo(-36 + hairSway1, 55);
      ctx.quadraticCurveTo(-44 + hairSway1, 30, -40, -10);
      ctx.fill();

      // --- LAYER 2: OUTFIT & SHOULDERS ---
      const outfitGrad = ctx.createLinearGradient(-40, 40, 40, 65);
      outfitGrad.addColorStop(0, outfit);
      outfitGrad.addColorStop(1, "#0f172a");

      ctx.fillStyle = outfitGrad;
      ctx.beginPath();
      ctx.moveTo(-45, 65);
      ctx.quadraticCurveTo(0, 28, 45, 65);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(-12, 65);
      ctx.lineTo(0, 46);
      ctx.lineTo(12, 65);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#d49b84";
      ctx.fillRect(-10, 18, 20, 16);
      ctx.fillStyle = skin;
      ctx.fillRect(-9, 18, 18, 14);

      // --- LAYER 3: HEAD SPHERE & EARS ---
      const headGrad = ctx.createRadialGradient(-10, -18, 8, 0, -5, 40);
      headGrad.addColorStop(0, "#ffffff");
      headGrad.addColorStop(0.25, skin);
      headGrad.addColorStop(1, "#c98f78");

      ctx.fillStyle = headGrad;
      ctx.strokeStyle = accent + "88";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.ellipse(0, -6, 33, 38, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = skin;
      ctx.beginPath();
      ctx.ellipse(-34, -6, 5, 7.5, 0, 0, Math.PI * 2);
      ctx.ellipse(34, -6, 5.5, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- HAND CUPPING EAR (WHEN LISTENING) ---
      if (isListening) {
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.arc(38, -6, 12, Math.PI * 1.6, Math.PI * 0.4);
        ctx.stroke();

        ctx.strokeStyle = "#ef444488";
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.arc(38, -6, 18, Math.PI * 1.6, Math.PI * 0.4);
        ctx.stroke();

        ctx.fillStyle = skin;
        ctx.strokeStyle = "#c98f78";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(45, -4, 7, 13, Math.PI * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "#b0735d";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(42, -12); ctx.lineTo(46, -10);
        ctx.moveTo(43, -6); ctx.lineTo(48, -4);
        ctx.moveTo(42, 0); ctx.lineTo(47, 2);
        ctx.stroke();
      }

      // --- LAYER 4: HAIR BANGS & STRANDS ---
      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.arc(0, -18, 34, Math.PI, 0);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-33, -26);
      ctx.quadraticCurveTo(-14 + hairSway3, -38, 0, -30);
      ctx.quadraticCurveTo(14 + hairSway3, -38, 33, -26);
      ctx.quadraticCurveTo(0, -48, -33, -26);
      ctx.fill();

      ctx.fillStyle = hairHighlight;
      ctx.beginPath();
      ctx.moveTo(-28, -28);
      ctx.quadraticCurveTo(-10 + hairSway3, -40, 0, -32);
      ctx.quadraticCurveTo(10 + hairSway3, -40, 28, -28);
      ctx.quadraticCurveTo(0, -48, -28, -28);
      ctx.fill();

      ctx.fillStyle = hair;
      ctx.beginPath();
      ctx.moveTo(-33, -22);
      ctx.quadraticCurveTo(-40 + hairSway1, 15, -30 + hairSway1, 42);
      ctx.quadraticCurveTo(-24 + hairSway1, 46, -20 + hairSway1, 30);
      ctx.quadraticCurveTo(-30, 8, -27, -22);
      ctx.fill();

      ctx.moveTo(33, -22);
      ctx.quadraticCurveTo(40 + hairSway2, 15, 30 + hairSway2, 42);
      ctx.quadraticCurveTo(24 + hairSway2, 46, 20 + hairSway2, 30);
      ctx.quadraticCurveTo(30, 8, 27, -22);
      ctx.fill();

      // --- LAYER 5: CONTEXT-AWARE EYEBROWS ---
      const eyebrowColor = isListening ? "#ef4444" : "#0f172a";
      ctx.strokeStyle = eyebrowColor;
      ctx.lineWidth = 3.6;
      ctx.lineCap = "round";

      ctx.beginPath();
      if (isListening) {
        ctx.moveTo(-22, -17); ctx.quadraticCurveTo(-14, -13, -6, -17);
        ctx.moveTo(6, -17); ctx.quadraticCurveTo(14, -13, 22, -17);
      } else if (isThinking || isQuestionContext) {
        // Raised Attentive Eyebrows
        ctx.moveTo(-22, -22); ctx.quadraticCurveTo(-14, -28, -6, -20);
        ctx.moveTo(6, -17); ctx.quadraticCurveTo(14, -23, 22, -17);
      } else if (expressionContext === "greeting" || isSuccessContext) {
        // Warm Raised Smile Eyebrows
        ctx.moveTo(-22, -20); ctx.quadraticCurveTo(-14, -26, -6, -20);
        ctx.moveTo(6, -20); ctx.quadraticCurveTo(14, -26, 22, -20);
      } else {
        // Friendly Curved Eyebrows
        ctx.moveTo(-22, -18); ctx.quadraticCurveTo(-14, -24, -6, -18);
        ctx.moveTo(6, -18); ctx.quadraticCurveTo(14, -24, 22, -18);
      }
      ctx.stroke();

      // --- LAYER 6: EXPRESSIVE EYES WITH MICRO-BLINKING & GAZE SHIFT ---
      const eyeSpacing = 15;
      const eyeOffsetY = -6;

      if (isBlinking) {
        // Closed Eye Blink Line
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(-eyeSpacing - 6, eyeOffsetY);
        ctx.quadraticCurveTo(-eyeSpacing, eyeOffsetY + 3, -eyeSpacing + 6, eyeOffsetY);
        ctx.moveTo(eyeSpacing - 6, eyeOffsetY);
        ctx.quadraticCurveTo(eyeSpacing, eyeOffsetY + 3, eyeSpacing + 6, eyeOffsetY);
        ctx.stroke();
      } else {
        // Eyelash Top Lines
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-eyeSpacing, eyeOffsetY, 7.5, Math.PI * 0.9, Math.PI * 0.1);
        ctx.arc(eyeSpacing, eyeOffsetY, 7.5, Math.PI * 0.9, Math.PI * 0.1);
        ctx.stroke();

        // White Sclera
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.ellipse(-eyeSpacing, eyeOffsetY, 7, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(eyeSpacing, eyeOffsetY, 7, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Iris Gaze Shift (Subtle natural eye micro-movement)
        const pupilShiftX = isListening ? 1.8 : Math.sin(time * 1.2) * 1.2;
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(-eyeSpacing + pupilShiftX, eyeOffsetY, 4.2, 0, Math.PI * 2);
        ctx.arc(eyeSpacing + pupilShiftX, eyeOffsetY, 4.2, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.fillStyle = "#0f172a";
        ctx.beginPath();
        ctx.arc(-eyeSpacing + pupilShiftX, eyeOffsetY, 2.3, 0, Math.PI * 2);
        ctx.arc(eyeSpacing + pupilShiftX, eyeOffsetY, 2.3, 0, Math.PI * 2);
        ctx.fill();

        // Catchlight Dual Sparkles
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(-eyeSpacing + pupilShiftX + 1.4, eyeOffsetY - 1.4, 1.5, 0, Math.PI * 2);
        ctx.arc(eyeSpacing + pupilShiftX + 1.4, eyeOffsetY - 1.4, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Soft Blush Cheeks
      ctx.fillStyle = "#f43f5e";
      ctx.globalAlpha = expressionContext === "greeting" ? 0.35 : 0.25;
      ctx.beginPath();
      ctx.ellipse(-19, 4, 6, 3.5, 0, 0, Math.PI * 2);
      ctx.ellipse(19, 4, 6, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // Nose Contour
      ctx.strokeStyle = "#c98f78";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-2, 2);
      ctx.quadraticCurveTo(0, 7, 2.5, 7);
      ctx.stroke();

      // --- LAYER 7: REAL-TIME LIP SYNCHRONIZATION & MOUTH MORPHING ---
      const mouthY = 17;
      const normalizedAmp = isSpeaking ? Math.min(100, Math.max(0, amplitude)) : 0;

      ctx.fillStyle = "#881337";
      ctx.strokeStyle = "#fda4af";
      ctx.lineWidth = 2;

      ctx.beginPath();
      if (isListening) {
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2.5;
        ctx.arc(0, mouthY + 1, 3.5, 0, Math.PI * 2);
        ctx.stroke();
      } else if (!isSpeaking || normalizedAmp <= 5) {
        // Natural Closed Idle Resting Smile Line (Stops immediately when speech ends)
        ctx.strokeStyle = "#be123c";
        ctx.lineWidth = 3;
        ctx.moveTo(-13, mouthY);
        ctx.quadraticCurveTo(0, mouthY + 6, 13, mouthY);
        ctx.stroke();
      } else if (normalizedAmp > 75) {
        // Open Wide Mouth ('AH', 'OH' sound)
        ctx.ellipse(0, mouthY + 3, 11, 13, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-7, mouthY - 4, 14, 4);
      } else if (normalizedAmp > 40) {
        // Teeth-showing Mouth ('E', 'S' sound)
        ctx.ellipse(0, mouthY + 2, 9, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(-6, mouthY - 2, 12, 3.2);
      } else {
        // Neutral Open Spoken Mouth
        ctx.rect(-9, mouthY - 2, 18, 6.5);
        ctx.fill();
        ctx.stroke();
      }

      ctx.restore();
      animId = requestAnimationFrame(render3DAvatar);
    };

    render3DAvatar();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [avatarMode, amplitude, isThinking, isSpeaking, isListening, role, expressionContext]);

  return (
    <div style={{ position: "relative", width: 250, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div style={{
          background: isListening ? "rgba(239, 68, 68, 0.2)" : isSpeaking ? "rgba(0, 242, 254, 0.15)" : isThinking ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
          border: `1px solid ${isListening ? "#ef4444" : isSpeaking ? "#00f2fe" : isThinking ? "#f59e0b" : "#10b981"}66`,
          color: isListening ? "#ef4444" : isSpeaking ? "#00f2fe" : isThinking ? "#f59e0b" : "#10b981",
          padding: "3px 14px",
          borderRadius: "14px",
          fontSize: "0.75rem",
          fontWeight: "800",
          letterSpacing: "0.02em",
          display: "flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <span>{isListening ? "👂 LISTENING ATTENTIVELY..." : isSpeaking ? "🗣️ SPEAKING (LIP-SYNC)" : isThinking ? "💭 THINKING..." : "✨ APNA SCHOOL 3D AI"}</span>
        </div>
      </div>

      <div style={{ width: 220, height: 220, margin: "0 auto", borderRadius: "50%", overflow: "hidden", background: "#0f172a", border: "3px solid rgba(0, 242, 254, 0.6)", boxShadow: "0 0 35px rgba(0, 242, 254, 0.4)" }}>
        <canvas ref={canvasRef} width={220} height={220} />
      </div>
    </div>
  );
}
