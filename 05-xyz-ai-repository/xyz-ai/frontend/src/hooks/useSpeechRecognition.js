import { useState, useRef } from "react";
import { transcribeAudio } from "../utils/api.js";

function pickRecorderMimeType() {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  if (!window.MediaRecorder) return "";
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

export function useSpeechRecognition({ speechLocale = "en-US", language = "English", onTranscriptResult }) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState(null);
  const [sttMode, setSttMode] = useState("browser");

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const recognitionRef = useRef(null);

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startListening = () => {
    setError(null);
    setInterimTranscript("");

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setSttMode("browser");
      setInterimTranscript("Listening in real-time... speak now");

      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = true;
      rec.lang = speechLocale || "en-US";

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        let interim = "";
        let finalStr = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalStr += trans;
          else interim += trans;
        }
        setInterimTranscript(interim || finalStr);
        if (finalStr && onTranscriptResult) {
          onTranscriptResult(finalStr);
          setInterimTranscript("");
          setIsListening(false);
        }
      };

      rec.onerror = (evt) => {
        console.warn("Speech recognition error:", evt.error);
        if (evt.error !== "no-speech") {
          setError(evt.error);
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;

      try {
        rec.start();
        setIsListening(true);
        return;
      } catch (err) {
        console.warn("Native SpeechRecognition start error:", err);
      }
    }

    // Fallback to MediaRecorder + Whisper
    startMediaRecorderFallback();
  };

  const startMediaRecorderFallback = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError("Speech recognition audio hardware not accessible.");
      setIsListening(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mimeType = pickRecorderMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      setSttMode("recorder");
      setIsListening(true);
      setInterimTranscript("Recording... tap mic again to finish");

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        stopMediaTracks();
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        chunksRef.current = [];

        if (!blob.size) {
          setIsListening(false);
          return;
        }

        setInterimTranscript("Transcribing audio...");
        try {
          const result = await transcribeAudio(blob, language);
          if (result?.success && result.text) {
            setInterimTranscript("");
            setIsListening(false);
            if (onTranscriptResult) onTranscriptResult(result.text);
            return;
          }
        } catch (err) {
          console.warn("MediaRecorder transcription error:", err);
        }

        setIsListening(false);
      };

      recorder.start();
    } catch (err) {
      console.warn("Microphone access failed:", err);
      setError("Microphone permission denied.");
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        setIsListening(false);
        stopMediaTracks();
      }
      return;
    }

    stopMediaTracks();
    setIsListening(false);
  };

  return { isListening, interimTranscript, startListening, stopListening, error, sttMode };
}
