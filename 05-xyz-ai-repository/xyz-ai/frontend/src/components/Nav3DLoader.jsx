import React, { useEffect, useRef } from "react";

/**
 * 3D Colorful Energy Hammer Screen Smash Loading Screen (1.0 Second)
 * Features a colorful 3D Cyber Hammer coming down to SMASH the screen,
 * triggering 3D glass fissures, electric lightning sparks, floating shards, and 1.0s progress.
 */
export default function Nav3DLoader({ progress = 0 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animId;
    let time = 0;

    // 12 Fissure Crack Branches originating from Hammer Impact point
    const crackBranches = [
      { angle: -0.3, length: 420, subBranches: [{ t: 0.3, angle: -0.8, len: 140 }, { t: 0.7, angle: 0.3, len: 160 }] },
      { angle: 0.6, length: 450, subBranches: [{ t: 0.4, angle: 1.1, len: 170 }, { t: 0.8, angle: 0.2, len: 120 }] },
      { angle: 2.2, length: 380, subBranches: [{ t: 0.5, angle: 2.7, len: 150 }] },
      { angle: -2.1, length: 430, subBranches: [{ t: 0.35, angle: -2.7, len: 180 }, { t: 0.75, angle: -1.6, len: 140 }] },
      { angle: 3.14, length: 460, subBranches: [{ t: 0.5, angle: 3.6, len: 160 }] },
      { angle: -1.3, length: 390, subBranches: [{ t: 0.6, angle: -0.9, len: 140 }] }
    ];

    // 20 Floating 3D Glass Shards
    const shards = Array.from({ length: 20 }, () => ({
      x: (Math.random() - 0.5) * 320,
      y: (Math.random() - 0.5) * 220,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.09,
      size: 10 + Math.random() * 22
    }));

    const render = () => {
      time += 0.07;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Crack Expansion Factor based on Progress (0.1 to 1.0)
      const crackFactor = Math.min(1, Math.max(0.1, progress / 100));

      // 1. Inner Neon Energy Aura behind Cracks
      const coreGrad = ctx.createRadialGradient(centerX, centerY - 20, 10, centerX, centerY - 20, 200 * crackFactor);
      coreGrad.addColorStop(0, "rgba(0, 242, 254, 0.8)");
      coreGrad.addColorStop(0.35, "rgba(251, 191, 36, 0.5)");
      coreGrad.addColorStop(0.7, "rgba(236, 72, 153, 0.3)");
      coreGrad.addColorStop(1, "transparent");
      ctx.fillStyle = coreGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Fissure Crack Lines & Electric Lightning Sparks from Hammer Impact
      ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
      ctx.lineWidth = 2.2;
      ctx.shadowColor = "#00f2fe";
      ctx.shadowBlur = 16;

      crackBranches.forEach((branch) => {
        const totalLen = branch.length * crackFactor;
        const endX = centerX + Math.cos(branch.angle) * totalLen;
        const endY = (centerY - 20) + Math.sin(branch.angle) * totalLen;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 20);

        const steps = 6;
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const jitterX = (Math.random() - 0.5) * 14;
          const jitterY = (Math.random() - 0.5) * 14;
          const px = centerX + (endX - centerX) * t + jitterX;
          const py = (centerY - 20) + (endY - (centerY - 20)) * t + jitterY;
          ctx.lineTo(px, py);
        }
        ctx.stroke();

        // Sub-Branch Cracks
        branch.subBranches.forEach((sub) => {
          if (crackFactor >= sub.t) {
            const subStartX = centerX + Math.cos(branch.angle) * (totalLen * sub.t);
            const subStartY = (centerY - 20) + Math.sin(branch.angle) * (totalLen * sub.t);
            const subLen = sub.len * ((crackFactor - sub.t) / (1 - sub.t));
            const subEndX = subStartX + Math.cos(sub.angle) * subLen;
            const subEndY = subStartY + Math.sin(sub.angle) * subLen;

            ctx.beginPath();
            ctx.moveTo(subStartX, subStartY);
            ctx.lineTo(subEndX, subEndY);
            ctx.stroke();
          }
        });
      });
      ctx.shadowBlur = 0;

      // 3. Floating 3D Glass Fracture Shards
      shards.forEach((s) => {
        s.rot += s.rotSpeed;
        const sx = centerX + s.x * (1 + crackFactor * 0.4);
        const sy = (centerY - 20) + s.y * (1 + crackFactor * 0.4);

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(s.rot);

        ctx.fillStyle = "rgba(0, 242, 254, 0.18)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
        ctx.lineWidth = 1.2;

        ctx.beginPath();
        ctx.moveTo(0, -s.size);
        ctx.lineTo(s.size * 0.7, s.size * 0.6);
        ctx.lineTo(-s.size * 0.7, s.size * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.restore();
      });

      // 4. --- 3D COLORFUL ENERGY HAMMER (SMASHING ANIMATION) ---
      // Hammer swing angle: Starts high, smashes down at impact!
      const hammerSwing = Math.sin(time * 6.0) * 0.25 - 0.2; // Strike swing motion
      const hammerY = (centerY - 20) + Math.sin(time * 6.0) * 12;

      ctx.save();
      ctx.translate(centerX + 35, hammerY - 45);
      ctx.rotate(hammerSwing);

      // A. Metallic Handle
      const handleGrad = ctx.createLinearGradient(-6, 0, 6, 80);
      handleGrad.addColorStop(0, "#fbbf24");
      handleGrad.addColorStop(0.5, "#d97706");
      handleGrad.addColorStop(1, "#78350f");

      ctx.fillStyle = handleGrad;
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 1.5;
      ctx.fillRect(-6, 0, 12, 85);
      ctx.strokeRect(-6, 0, 12, 85);

      // Handle Leather Grip Wraps
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 2;
      for (let y = 20; y < 75; y += 10) {
        ctx.beginPath();
        ctx.moveTo(-6, y);
        ctx.lineTo(6, y + 5);
        ctx.stroke();
      }

      // B. 3D Colorful Energy Hammer Head
      const headGrad = ctx.createLinearGradient(-45, -35, 45, 10);
      headGrad.addColorStop(0, "#00f2fe"); // Cyan
      headGrad.addColorStop(0.35, "#3b82f6"); // Blue
      headGrad.addColorStop(0.7, "#ec4899"); // Pink
      headGrad.addColorStop(1, "#fbbf24"); // Gold

      ctx.fillStyle = headGrad;
      ctx.shadowColor = "#00f2fe";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.roundRect(-45, -35, 90, 42, 10);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Beveled Metallic Metallic Edge Outlines
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.2;
      ctx.strokeRect(-43, -33, 86, 38);

      // Left Strike Face (Cyan Glow)
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(-45, -14, 6, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right Strike Face (Gold Glow)
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.ellipse(45, -14, 6, 18, 0, 0, Math.PI * 2);
      ctx.fill();

      // Center Rune Gem on Hammer Head
      ctx.fillStyle = "#00f2fe";
      ctx.beginPath();
      ctx.arc(0, -14, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // End Hammer Group

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [progress]);

  return (
    <div
      className="glass-panel anim-fade-in"
      style={{
        width: "100%",
        minHeight: "calc(100vh - 180px)",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        background: "rgba(13, 17, 29, 0.97)",
        border: "1px solid rgba(0, 242, 254, 0.45)",
        borderRadius: "24px",
        position: "relative",
        overflow: "hidden",
        textAlign: "center",
        padding: "30px",
        boxShadow: "0 0 60px rgba(0, 242, 254, 0.3)"
      }}
    >
      {/* Full Screen 3D Hammer Screen Smash Canvas Viewport */}
      <div style={{ position: "relative", width: "100%", height: "460px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <canvas ref={canvasRef} width={800} height={460} style={{ width: "100%", height: "100%", borderRadius: "20px" }} />

        {/* Center Percentage Core Badge */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -65%)",
            background: "rgba(13, 17, 29, 0.9)",
            border: "2.5px solid #00f2fe",
            borderRadius: "50%",
            width: "84px",
            height: "84px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 35px rgba(0, 242, 254, 0.8), inset 0 0 18px rgba(0, 242, 254, 0.5)",
            backdropFilter: "blur(12px)"
          }}
        >
          <span style={{ fontSize: "1.5rem", fontWeight: "800", color: "#00f2fe" }}>{progress}%</span>
        </div>
      </div>

      {/* Ultra-Sleek Cracked Energy Progress Bar */}
      <div style={{ width: "360px", maxWidth: "80%", height: "8px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "10px", overflow: "hidden", marginTop: "10px", marginBottom: "18px", border: "1px solid rgba(0, 242, 254, 0.35)" }}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #00f2fe 0%, #fbbf24 50%, #ec4899 100%)",
            borderRadius: "10px",
            transition: "width 0.03s linear",
            boxShadow: "0 0 20px #00f2fe"
          }}
        />
      </div>

      {/* Clean & Bold Text */}
      <h3 style={{ fontSize: "1.7rem", fontWeight: "800", letterSpacing: "2px", background: "linear-gradient(135deg, #00f2fe, #fbbf24, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        LOADING...
      </h3>
    </div>
  );
}
