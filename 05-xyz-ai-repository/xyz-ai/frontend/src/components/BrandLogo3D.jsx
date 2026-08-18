import React, { useEffect, useRef } from "react";

/**
 * 3D Pixar Human Character Mascot Logo Component
 * Renders a vibrant, floating 3D Human Character standing next to 'Apna School AI'
 * who continuously does a friendly Waving Hand ("Hello Gesture 👋") to greet the user!
 */
export default function BrandLogo3D({ size = 58 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animId;
    let time = 0;

    const render = () => {
      time += 0.045;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Levitation Floating Offset
      const floatY = Math.sin(time * 2.2) * 3.5;
      const shadowScale = 1 - Math.sin(time * 2.2) * 0.15;

      // 1. Dynamic 3D Ground Drop Shadow
      ctx.fillStyle = "rgba(0, 242, 254, 0.22)";
      ctx.beginPath();
      ctx.ellipse(centerX, height - 5, (size * 0.36) * shadowScale, (size * 0.08) * shadowScale, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(centerX, centerY + floatY - 2);

      const r = size * 0.32; // Character Head Radius

      // 2. Ambient Glowing 3D Backdrop Ring
      const auraGrad = ctx.createRadialGradient(0, 0, 5, 0, 0, r * 1.5);
      auraGrad.addColorStop(0, "rgba(0, 242, 254, 0.45)");
      auraGrad.addColorStop(1, "transparent");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 3. Human Outfit & Shoulders
      const outfitGrad = ctx.createLinearGradient(-r, r, r, r * 2);
      outfitGrad.addColorStop(0, "#00f2fe");
      outfitGrad.addColorStop(1, "#0f172a");

      ctx.fillStyle = outfitGrad;
      ctx.beginPath();
      ctx.moveTo(-r * 1.3, r * 1.6);
      ctx.quadraticCurveTo(0, r * 0.7, r * 1.3, r * 1.6);
      ctx.closePath();
      ctx.fill();

      // Inner Shirt Collar
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, r * 1.6);
      ctx.lineTo(0, r * 1.05);
      ctx.lineTo(r * 0.4, r * 1.6);
      ctx.closePath();
      ctx.fill();

      // Neck
      ctx.fillStyle = "#fcd5ce";
      ctx.fillRect(-r * 0.25, r * 0.45, r * 0.5, r * 0.45);

      // 4. 3D Human Head Sphere
      const headGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
      headGrad.addColorStop(0, "#ffffff");
      headGrad.addColorStop(0.25, "#fcd5ce");
      headGrad.addColorStop(1, "#c98f78");

      ctx.fillStyle = headGrad;
      ctx.strokeStyle = "rgba(0, 242, 254, 0.5)";
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.1, r * 0.82, r * 0.95, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Human Ears
      ctx.fillStyle = "#fcd5ce";
      ctx.beginPath();
      ctx.ellipse(-r * 0.85, -r * 0.1, r * 0.14, r * 0.2, 0, 0, Math.PI * 2);
      ctx.ellipse(r * 0.85, -r * 0.1, r * 0.14, r * 0.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // 5. Stylized Long Hair Crown & Flowing Bangs
      ctx.fillStyle = "#1a0d08";
      ctx.beginPath();
      ctx.arc(0, -r * 0.4, r * 0.85, Math.PI, 0);
      ctx.fill();

      // Side-Swept Bangs
      ctx.beginPath();
      ctx.moveTo(-r * 0.82, -r * 0.45);
      ctx.quadraticCurveTo(0, -r * 0.9, r * 0.82, -r * 0.45);
      ctx.quadraticCurveTo(0, -r * 1.25, -r * 0.82, -r * 0.45);
      ctx.fill();

      // 6. Visible Dark Eyebrows
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-r * 0.55, -r * 0.42); ctx.quadraticCurveTo(-r * 0.35, -r * 0.55, -r * 0.15, -r * 0.42);
      ctx.moveTo(r * 0.15, -r * 0.42); ctx.quadraticCurveTo(r * 0.35, -r * 0.55, r * 0.55, -r * 0.42);
      ctx.stroke();

      // 7. Expressive Sparkling 3D Eyes
      const eyeSpacing = r * 0.38;
      const eyeY = -r * 0.15;

      // Sclera
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.ellipse(-eyeSpacing, eyeY, r * 0.18, r * 0.15, 0, 0, Math.PI * 2);
      ctx.ellipse(eyeSpacing, eyeY, r * 0.18, r * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();

      // Cyan Iris
      ctx.fillStyle = "#00f2fe";
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, r * 0.11, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, r * 0.11, 0, Math.PI * 2);
      ctx.fill();

      // Pupil
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(-eyeSpacing, eyeY, r * 0.06, 0, Math.PI * 2);
      ctx.arc(eyeSpacing, eyeY, r * 0.06, 0, Math.PI * 2);
      ctx.fill();

      // Catchlight Glint
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(-eyeSpacing + 1.2, eyeY - 1.2, r * 0.04, 0, Math.PI * 2);
      ctx.arc(eyeSpacing + 1.2, eyeY - 1.2, r * 0.04, 0, Math.PI * 2);
      ctx.fill();

      // Cheerful Smile Line
      ctx.strokeStyle = "#be123c";
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.arc(0, r * 0.32, r * 0.3, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();

      // Blush Cheeks
      ctx.fillStyle = "#f43f5e";
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.ellipse(-r * 0.48, r * 0.1, r * 0.16, r * 0.09, 0, 0, Math.PI * 2);
      ctx.ellipse(r * 0.48, r * 0.1, r * 0.16, r * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // 8. --- ANIMATED WAVING HAND ("HELLO GESTURE 👋") ---
      // The hand raises next to the head and waves back and forth!
      const handWaveAngle = Math.sin(time * 5.0) * 0.32; // Rapid cheerful wave!

      ctx.save();
      // Pivot at the right shoulder/ear area
      ctx.translate(r * 0.95, -r * 0.1);
      ctx.rotate(handWaveAngle - 0.2);

      // Raised Arm
      ctx.fillStyle = "#00f2fe";
      ctx.beginPath();
      ctx.ellipse(0, -r * 0.2, r * 0.14, r * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();

      // Palm (Skin Color)
      ctx.fillStyle = "#fcd5ce";
      ctx.beginPath();
      ctx.arc(0, -r * 0.55, r * 0.22, 0, Math.PI * 2);
      ctx.fill();

      // 4 Waving Fingers 👋
      ctx.fillStyle = "#fcd5ce";
      ctx.strokeStyle = "#c98f78";
      ctx.lineWidth = 1.2;
      const fingerLengths = [0.28, 0.34, 0.32, 0.24];
      for (let i = 0; i < 4; i++) {
        const fx = (i - 1.5) * (r * 0.1);
        const fy = -r * 0.65;
        const fh = r * fingerLengths[i];
        ctx.beginPath();
        ctx.ellipse(fx, fy - fh / 2, r * 0.05, fh / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Thumb Finger
      ctx.beginPath();
      ctx.ellipse(-r * 0.18, -r * 0.52, r * 0.06, r * 0.12, -Math.PI * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Motion Trail Sparkles around waving hand
      ctx.fillStyle = "#fbbf24";
      ctx.beginPath();
      ctx.arc(r * 0.2, -r * 0.8, 1.8, 0, Math.PI * 2);
      ctx.arc(-r * 0.25, -r * 0.85, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // End Waving Hand Group

      ctx.restore(); // End Main Character Group

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [size]);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }}
      title="Apna School 3D AI Waving Character Mascot"
    >
      <canvas ref={canvasRef} width={size} height={size} />
    </div>
  );
}
