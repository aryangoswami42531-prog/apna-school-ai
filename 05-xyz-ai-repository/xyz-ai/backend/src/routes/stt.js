import express from "express";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });

function languageToWhisperCode(language = "en") {
  const value = String(language).toLowerCase();
  if (value.startsWith("hi") || value.includes("hindi")) return "hi";
  if (value.startsWith("ta") || value.includes("tamil")) return "ta";
  if (value.startsWith("te") || value.includes("telugu")) return "te";
  if (value.startsWith("mr") || value.includes("marathi")) return "mr";
  if (value.startsWith("bn") || value.includes("bengali")) return "bn";
  if (value.startsWith("gu") || value.includes("gujarati")) return "gu";
  if (value.startsWith("pa") || value.includes("punjabi")) return "pa";
  if (value.startsWith("kn") || value.includes("kannada")) return "kn";
  if (value.startsWith("ml") || value.includes("malayalam")) return "ml";
  if (value.startsWith("ur") || value.includes("urdu")) return "ur";
  return "en";
}

router.post("/", upload.single("audio"), async (req, res) => {
  try {
    const audioFile = req.file;
    const language = req.body.language || "en";

    if (!audioFile) {
      return res.status(400).json({ success: false, error: "No audio file provided in request." });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey && apiKey.trim().length > 10) {
      try {
        const formData = new FormData();
        const blob = new Blob([audioFile.buffer], { type: audioFile.mimetype || "audio/webm" });
        formData.append("file", blob, "speech.webm");
        formData.append("model", "whisper-1");
        formData.append("language", languageToWhisperCode(language));

        const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`
          },
          body: formData
        });

        const whisperData = await whisperRes.json();

        if (whisperData.text) {
          return res.json({
            success: true,
            text: whisperData.text,
            mode: "OPENAI_WHISPER_STT"
          });
        }

        console.warn("Whisper STT returned no text:", whisperData);
      } catch (whisperErr) {
        console.warn("Whisper STT API call failed:", whisperErr.message);
      }
    }

    return res.json({
      success: false,
      error: "WHISPER_UNAVAILABLE",
      mode: "STT_FALLBACK_REQUIRED"
    });
  } catch (err) {
    console.error("Error in /api/stt:", err);
    res.status(500).json({ success: false, error: "STT Processing Error", details: err.message });
  }
});

export default router;
