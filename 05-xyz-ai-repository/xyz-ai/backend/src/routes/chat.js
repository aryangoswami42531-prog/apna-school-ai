import express from "express";
import { processChatConversation } from "../services/geminiService.js";
import { sanitizeUserPrompt } from "../middleware/securityScrubber.js";
import { saveUserLongTermMemory } from "../services/personaService.js";

const router = express.Router();

// Server-Side Multi-Turn Session Memory Map
export const ACTIVE_CONVERSATIONS = new Map();

router.post("/", async (req, res) => {
  try {
    const { messages = [], language = "English", isConfirmedEscalation = false } = req.body;
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ success: false, error: "Unauthorized session. Please log in." });
    }

    if (!messages || messages.length === 0) {
      return res.status(400).json({ success: false, error: "Messages array cannot be empty." });
    }

    const sessionKey = req.headers["authorization"] || req.headers["x-session-token"] || currentUser.id;

    // Log raw incoming UTF-8 text on backend to visually verify Hindi text integrity
    const lastMsg = messages[messages.length - 1];
    console.log(`[RAW UTF-8 CHAT INCOMING] User: ${currentUser.name} (${currentUser.role}) | Msg: "${lastMsg?.content}"`);

    // Sync Server-Side Session Conversation History.
    // IMPORTANT: the client's `messages` array is always the full, current
    // conversation state (it's what's rendered on screen), so it is always
    // the source of truth. The old logic here compared array LENGTHS to
    // decide whether to trust the client or append to the stored server
    // copy — that comparison broke whenever the client array wasn't
    // strictly longer (e.g. after a refresh, or a length coincidence),
    // silently gluing the new message onto a STALE stored history from an
    // earlier, unrelated conversation (e.g. a half-finished attendance
    // flow). That's what caused replies to keep repeating old attendance
    // confirmations no matter what the user typed next.
    let conversationHistory = [...messages];
    ACTIVE_CONVERSATIONS.set(sessionKey, conversationHistory);

    const injectionCheck = sanitizeUserPrompt(lastMsg?.content || "");

    const aiResult = await processChatConversation({
      messages: conversationHistory,
      user: currentUser,
      language,
      isConfirmedEscalation
    });

    // Append Assistant response turn to server-side session history
    conversationHistory.push({
      role: "assistant",
      content: aiResult.reply
    });
    ACTIVE_CONVERSATIONS.set(sessionKey, conversationHistory);

    // Long-Term Memory Summary Pattern: Update short memory summary for user
    if (currentUser.id && conversationHistory.length >= 2) {
      const userMemoryLines = conversationHistory
        .filter(m => m.role === "user")
        .map(m => m.content)
        .slice(-4)
        .join("; ");
      saveUserLongTermMemory(currentUser.id, `${currentUser.name} recently conversed about: ${userMemoryLines}`);
    }

    res.json({
      success: true,
      role: currentUser.role,
      user: {
        id: currentUser.id,
        name: currentUser.name
      },
      language,
      reply: aiResult.reply,
      executedTools: aiResult.executedTools || [],
      requiresConfirmation: aiResult.requiresConfirmation || false,
      securityFlags: {
        promptInjectionDetected: injectionCheck.isInjection
      },
      engineMode: aiResult.mode || "CLAUDE_TOOL_LOOP"
    });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    res.status(500).json({
      success: false,
      error: "Internal Chat Processing Error",
      details: error.message
    });
  }
});

export default router;
