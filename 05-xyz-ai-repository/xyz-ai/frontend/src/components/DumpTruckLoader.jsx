import React, { useEffect, useRef } from "react";

/**
 * Premium 3D Dump Truck Navigation Loading Animation (1.4 Seconds)
 * Features a 3D Dump Truck driving into stage, halting in center, tilting its hydraulic container
 * upward to dump school ERP load elements (A+ marks, attendance pills, data cubes), and triggering
 * a cyan particle wipe transition to reveal the dashboard.
 */
export default function DumpTruckLoader({ progress = 0, tabName = "Dashboard" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animId;
    let time = 0;

    // Debris Particles for Dump Phase
    const particles = Array.from({ length: 45 }, () => ({
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -6 - 2,
      size: 3 + Math.random() * 6,
      color: ["#00f2fe", "#10b981", "#fbbf24", "#ec4899", "#ffffff"][Math.floor(Math.random() * 5)],
      opacity: 1
    }));

    const render = () => {
      time += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Phase Progress (0 to 1)
      const p = Math.min(1, Math.max(0, progress / 100));

      // Ground Road Line
      const roadY = centerY + 50;

      // Road Surface
      ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
      ctx.fillRect(0, roadY, width, height - roadY);

      // White Road Lane Dashed Line
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 3;
      ctx.setLineDash([16, 14]);
      ctx.lineDashOffset = -time * 50;
      ctx.beginPath();
      ctx.moveTo(0, roadY + 25);
      ctx.lineTo(width, roadY + 25);
      ctx.stroke();
      ctx.setLineDash([]);

      // 1. Truck Position Logic (Drives in from left, stops at center)
      let truckX = -200 + p * 2.2 * (centerX + 50);
      if (p > 0.45) {
        truckX = centerX - 20; // Hold at center for dump phase
      }

      // Suspension Bouncing
      const bounce = p < 0.45 ? Math.sin(time * 18) * 2.5 : 0;
      const wheelRotation = time * 12;

      // 2. Dump Container Tilt Angle (0 to 45 deg during p = 0.55 to 0.85)
      let tiltAngle = 0;
      if (p >= 0.55 && p <= 0.85) {
        tiltAngle = ((p - 0.55) / 0.3) * (Math.PI * 0.25);
      } else if (p > 0.85) {
        tiltAngle = Math.PI * 0.25;
      }

      // 3. Ground Shadow under Truck
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.beginPath();
      ctx.ellipse(truckX + 30, roadY - 2, 85, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(truckX, roadY - 18 - bounce);

      // --- TRUCK DRAWING GROUP ---

      // A. Hydraulic Lift Cylinder
      if (tiltAngle > 0) {
        ctx.strokeStyle = "#94a3b8";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-10, -25);
        ctx.lineTo(-25 - Math.sin(tiltAngle) * 30, -25 - Math.cos(tiltAngle) * 30);
        ctx.stroke();
      }

      // B. Tilting Dump Bed / Container
      ctx.save();
      ctx.translate(-25, -28); // Pivot point at rear axle
      ctx.rotate(-tiltAngle);

      // Container Body (Dark Slate & Gold Rim)
      const bedGrad = ctx.createLinearGradient(-70, -35, 10, 0);
      bedGrad.addColorStop(0, "#1e293b");
      bedGrad.addColorStop(1, "#334155");

      ctx.fillStyle = bedGrad;
      ctx.strokeStyle = "#fbbf24";
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(-75, -40);
      ctx.lineTo(15, -40);
      ctx.lineTo(15, 0);
      ctx.lineTo(-75, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Side Rib Reinforcements
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      for (let rx = -60; rx <= 0; rx += 20) {
        ctx.beginPath();
        ctx.moveTo(rx, -38);
        ctx.lineTo(rx, -2);
        ctx.stroke();
      }

      // LOADED ELEMENTS INSIDE TRUCK BED (A+ Marks, Attendance Pills, AI Blocks)
      if (tiltAngle < Math.PI * 0.2) {
        // A+ Badge 1
        ctx.fillStyle = "#00f2fe";
        ctx.beginPath();
        ctx.arc(-50, -18, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0f172a";
        ctx.font = "bold 9px sans-serif";
        ctx.fillText("A+", -55, -15);

        // 100% Attendance Pill
        ctx.fillStyle = "#10b981";
        ctx.beginPath();
        ctx.roundRect(-30, -24, 22, 11, 5);
        ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 7px sans-serif";
        ctx.fillText("100%", -28, -16);

        // Gold Score Star
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(-10, -16, 7, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // End Container Group

      // C. Front Cabin (Cyan Metallic Pixar Style)
      const cabinGrad = ctx.createLinearGradient(15, -45, 60, 0);
      cabinGrad.addColorStop(0, "#00f2fe");
      cabinGrad.addColorStop(1, "#0284c7");

      ctx.fillStyle = cabinGrad;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(15, -45);
      ctx.lineTo(45, -45);
      ctx.lineTo(62, -22);
      ctx.lineTo(62, 0);
      ctx.lineTo(15, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Windshield Glass
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.beginPath();
      ctx.moveTo(35, -40);
      ctx.lineTo(43, -40);
      ctx.lineTo(54, -25);
      ctx.lineTo(35, -25);
      ctx.closePath();
      ctx.fill();

      // Headlight Beam
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(60, -10, 4, 0, Math.PI * 2);
      ctx.fill();

      // Headlight Beam Glow Light
      if (p < 0.45) {
        const beamGrad = ctx.createLinearGradient(64, -10, 140, -10);
        beamGrad.addColorStop(0, "rgba(251, 191, 36, 0.6)");
        beamGrad.addColorStop(1, "transparent");
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(64, -14);
        ctx.lineTo(140, -30);
        ctx.lineTo(140, 10);
        ctx.lineTo(64, -6);
        ctx.closePath();
        ctx.fill();
      }

      // D. Rotating 3D Wheels (2 Axles)
      const drawWheel = (wx, wy) => {
        ctx.save();
        ctx.translate(wx, wy);
        ctx.rotate(wheelRotation);

        // Outer Tire
        ctx.fillStyle = "#0f172a";
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Chrome Rim Spokes
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-9, 0); ctx.lineTo(9, 0);
        ctx.moveTo(0, -9); ctx.lineTo(0, 9);
        ctx.stroke();

        // Center Cap
        ctx.fillStyle = "#00f2fe";
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      };

      drawWheel(-45, 2);
      drawWheel(-15, 2);
      drawWheel(40, 2);

      ctx.restore(); // End Truck Group

      // 4. DUMP PARTICLES EXPLOSION (Triggered during dump p >= 0.65)
      if (p >= 0.65) {
        particles.forEach((part) => {
          if (part.x === 0) {
            part.x = truckX - 55 + (Math.random() - 0.5) * 30;
            part.y = roadY - 35;
          }
          part.x += part.vx;
          part.y += part.vy;
          part.vy += 0.35; // Gravity
          part.opacity = Math.max(0, part.opacity - 0.02);

          ctx.fillStyle = part.color;
          ctx.globalAlpha = part.opacity;
          ctx.shadowColor = part.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
      }

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
        boxShadow: "0 0 60px rgba(0, 242, 254, 0.28)"
      }}
    >
      {/* Full Screen 3D Dump Truck Viewport */}
      <div style={{ position: "relative", width: "100%", height: "460px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <canvas ref={canvasRef} width={800} height={460} style={{ width: "100%", height: "100%", borderRadius: "20px" }} />

        {/* Center Percentage Core Badge */}
        <div
          style={{
            position: "absolute",
            top: "24px",
            right: "28px",
            background: "rgba(13, 17, 29, 0.9)",
            border: "2.5px solid #00f2fe",
            borderRadius: "18px",
            padding: "8px 20px",
            boxShadow: "0 0 25px rgba(0, 242, 254, 0.7)",
            backdropFilter: "blur(12px)"
          }}
        >
          <span style={{ fontSize: "1.45rem", fontWeight: "800", color: "#00f2fe" }}>{progress}%</span>
        </div>
      </div>

      {/* Sleek Gradient Progress Bar */}
      <div style={{ width: "360px", maxWidth: "80%", height: "8px", background: "rgba(255, 255, 255, 0.08)", borderRadius: "10px", overflow: "hidden", marginTop: "10px", marginBottom: "18px", border: "1px solid rgba(0, 242, 254, 0.35)" }}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "linear-gradient(90deg, #00f2fe 0%, #10b981 50%, #fbbf24 100%)",
            borderRadius: "10px",
            transition: "width 0.03s linear",
            boxShadow: "0 0 18px #00f2fe"
          }}
        />
      </div>

      {/* Clean & Bold Text */}
      <h3 style={{ fontSize: "1.6rem", fontWeight: "800", letterSpacing: "1.5px", background: "linear-gradient(135deg, #00f2fe, #10b981, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
        DELIVERING {tabName.toUpperCase()}...
      </h3>
    </div>
  );
}
