import { useState, useEffect, useRef } from "react";

export function useSpeechSynthesis({ onStart, onEnd, onAmplitudeUpdate }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const animFrameRef = useRef(null);

  // Pre-load Web Speech Synthesis voices on mount
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;

    const loadVoices = () => {
      const availVoices = window.speechSynthesis.getVoices();
      if (availVoices && availVoices.length > 0) {
        setVoices(availVoices);
      }
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (text, locale = "en-US") => {
    if (!("speechSynthesis" in window)) {
      console.warn("SpeechSynthesis not supported.");
      return;
    }

    // Resume & cancel any stuck/ongoing speech
    window.speechSynthesis.resume();
    window.speechSynthesis.cancel();
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    // Clean text of markdown, HTML, code formatting for natural voice output
    const cleanText = text
      .replace(/[*_~`#>-]/g, " ")
      .replace(/https?:\/\/\S+/g, "link")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = locale || "en-US";
    utterance.pitch = 1.0; // RESTORED OLD PITCH
    utterance.rate = 1.0;  // RESTORED OLD RATE

    // Find best matching voice using RESTORED OLD VOICE MATCHER
    const availVoices = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    if (availVoices && availVoices.length > 0) {
      const noveltyVoiceRegex = /(albert|bad news|bahh|bells|boing|cellos|deranged|fred|good news|hysterical|pipe organ|trinoids|whisper|zarvox|organ)/i;
      const cleanVoices = availVoices.filter(v => !noveltyVoiceRegex.test(v.name));

      const isPremium = (vName) =>
        /google|natural|neural|premium|samantha|siri|rishi|veena|karen|daniel|moira|alex|victoria|fiona|allison|ava|susan/i.test(vName);

      const targetLangPrefix = (locale || "en-US").split("-")[0].toLowerCase();
      const langMatchingVoices = cleanVoices.filter(v => v.lang.toLowerCase().startsWith(targetLangPrefix));

      const matchedVoice =
        langMatchingVoices.find(v => isPremium(v.name)) ||
        langMatchingVoices[0] ||
        cleanVoices.find(v => v.lang.toLowerCase().startsWith("en") && isPremium(v.name)) ||
        cleanVoices.find(v => v.lang.toLowerCase().startsWith("en")) ||
        availVoices[0];

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    const lowerText = cleanText.toLowerCase();
    const isQuestion = lowerText.includes("?") || lowerText.includes("which") || lowerText.includes("konsi") || lowerText.includes("kis");
    const isGreeting = lowerText.includes("namaste") || lowerText.includes("hello") || lowerText.includes("welcome");
    const isSuccess = lowerText.includes("safal") || lowerText.includes("saved") || lowerText.includes("done");
    
    const expressionContext = isGreeting ? "greeting" : isQuestion ? "question" : isSuccess ? "success" : "explaining";

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (onStart) onStart(expressionContext);

      let tick = 0;
      const animateLipSync = () => {
        tick += 0.25;
        const baseAmp = Math.abs(Math.sin(tick) * 60 + Math.cos(tick * 2.3) * 30);
        const currentAmp = Math.min(100, Math.max(10, Math.round(baseAmp)));

        if (onAmplitudeUpdate) onAmplitudeUpdate(currentAmp, expressionContext);

        if (window.speechSynthesis.speaking) {
          animFrameRef.current = requestAnimationFrame(animateLipSync);
        } else {
          setIsSpeaking(false);
          if (onAmplitudeUpdate) onAmplitudeUpdate(0, "neutral");
        }
      };

      animFrameRef.current = requestAnimationFrame(animateLipSync);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (onAmplitudeUpdate) onAmplitudeUpdate(0, "neutral");
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis warning:", e);
      setIsSpeaking(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (onAmplitudeUpdate) onAmplitudeUpdate(0, "neutral");
      if (onEnd) onEnd();
    };

    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  const stop = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (onAmplitudeUpdate) onAmplitudeUpdate(0, "neutral");
  };

  return { isSpeaking, speak, stop };
}
