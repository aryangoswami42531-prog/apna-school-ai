import { GoogleGenAI } from "@google/genai";
import { getSystemPrompt } from "./personaService.js";
import { ATTENDANCE_TOOL_DEFINITIONS, executeAttendanceTool } from "../tools/attendanceTools.js";
import { ESCALATION_TOOL_DEFINITIONS, executeEscalationTool } from "../tools/escalationTools.js";
import { MARKS_TOOL_DEFINITIONS, executeMarksTool } from "../tools/marksTools.js";
import { STUDENT_TOOL_DEFINITIONS, executeStudentTool } from "../tools/studentTools.js";
import { sanitizeUserPrompt, scrubLLMResponseOutput } from "../middleware/securityScrubber.js";
import { MOCK_ATTENDANCE_RECORDS, updateStudentAttendanceRecord, resolveRelativeDate, CURRENT_SERVER_DATE, MOCK_SCHOOL_ANALYTICS } from "../mockData/attendance.js";
import { MOCK_MARKS_RECORDS, updateStudentMarksRecord, computeSchoolMarksAnalytics } from "../mockData/marks.js";
import { findStudentByName, registerNewStudent, findMatchingRecordForUser, MOCK_USERS, isInvalidStudentName } from "../mockData/users.js";

const ALL_TOOLS = [
  ...ATTENDANCE_TOOL_DEFINITIONS,
  ...ESCALATION_TOOL_DEFINITIONS,
  ...MARKS_TOOL_DEFINITIONS,
  ...STUDENT_TOOL_DEFINITIONS
];

export function getToolsForRole(role) {
  switch (role) {
    case "student":
      return ALL_TOOLS.filter(t => ["get_student_attendance", "view_own_marks", "request_teacher_callback"].includes(t.name));
    case "parent":
      return ALL_TOOLS.filter(t => ["get_child_attendance", "view_child_marks", "request_teacher_callback"].includes(t.name));
    case "teacher":
      return ALL_TOOLS.filter(t => ["mark_attendance", "update_marks", "register_student", "view_class_marks", "request_teacher_callback"].includes(t.name));
    case "principal":
      return ALL_TOOLS.filter(t => ["get_school_attendance_analytics", "view_school_marks_analytics", "view_class_marks", "request_teacher_callback"].includes(t.name));
    default:
      return ALL_TOOLS;
  }
}

let geminiClient = null;
const rawKey = (process.env.GEMINI_API_KEY || "").trim();
if (rawKey.length > 10) {
  geminiClient = new GoogleGenAI({ apiKey: rawKey });
  console.log("[XYZ AI] Gemini client initialized — real Gemini AI is ACTIVE.");
} else {
  console.warn(
    "\n[XYZ AI] ⚠️  WARNING: GEMINI_API_KEY is missing or invalid in backend/.env.\n" +
      "[XYZ AI] The app will run in LOCAL FALLBACK / OFFLINE DEMO mode — a scripted,\n" +
      "[XYZ AI] keyword-based state machine, NOT real AI understanding. This is why\n" +
      "[XYZ AI] natural phrasing, Hindi understanding, and conversation memory will\n" +
      "[XYZ AI] feel rigid and limited. Add a real key to backend/.env and restart\n" +
      "[XYZ AI] the server to get actual Gemini-powered natural language understanding.\n"
  );
}

// Anthropic-style tool definitions (input_schema, JSON-Schema-ish, lowercase types)
// use the SAME schema across the whole app. Gemini's function-calling API wants
// an OpenAPI-style schema with UPPERCASE type names (STRING, OBJECT, ARRAY, ...).
// This converts recursively so we don't have to duplicate every tool definition.
function convertSchemaForGemini(schema) {
  if (!schema || typeof schema !== "object") return schema;
  const out = {};
  if (schema.type) out.type = String(schema.type).toUpperCase();
  if (schema.description) out.description = schema.description;
  if (schema.enum) out.enum = schema.enum;
  if (schema.properties) {
    out.properties = {};
    for (const [key, val] of Object.entries(schema.properties)) {
      out.properties[key] = convertSchemaForGemini(val);
    }
  }
  if (schema.required) out.required = schema.required;
  if (schema.items) out.items = convertSchemaForGemini(schema.items);
  return out;
}

function buildGeminiToolDeclarations(anthropicStyleTools) {
  return [
    {
      functionDeclarations: anthropicStyleTools.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: convertSchemaForGemini(t.input_schema)
      }))
    }
  ];
}

// Gemini uses role "model" instead of "assistant", and wraps text in a
// `parts` array instead of a plain `content` string.
function toGeminiContents(messages) {
  return messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content || "" }]
  }));
}

// Full Conversation Memory Transcript Analyzer
export function analyzeChatHistoryTranscript(messages = []) {
  let studentName = null;
  let targetDateRaw = null;
  let targetSubject = null;
  let targetScore = null;
  let userStatedFacts = {};

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const txt = (msg.content || "").trim();

    // Memory Fact Extraction: e.g. "mera naam Aryan hai", "my name is Aryan"
    const nameFactMatch = txt.match(/(?:mera\s+naam|my\s+name\s+is|main)\s+([A-Za-z0-9\u0900-\u097F]+)/i);
    if (nameFactMatch && !["kya", "hai", "hu", "is", "a", "the"].includes(nameFactMatch[1].toLowerCase())) {
      userStatedFacts.statedName = nameFactMatch[1].trim();
    }

    if (msg.role === "assistant" && i + 1 < messages.length && messages[i + 1].role === "user") {
      const assistantTxt = (msg.content || "").toLowerCase();
      const userTxt = (messages[i + 1].content || "").trim();

      // Extract Student Name when Assistant asked for student name
      if (
        assistantTxt.includes("kis bache ki") ||
        assistantTxt.includes("किस छात्र") ||
        assistantTxt.includes("konse bache") ||
        assistantTxt.includes("which student") ||
        assistantTxt.includes("would you like to update")
      ) {
        if (userTxt && !isInvalidStudentName(userTxt)) {
          studentName = userTxt;
        }
      }

      // Extract Date when Assistant asked for date
      if (assistantTxt.includes("konsi date ki") || assistantTxt.includes("कौन सी तारीख") || assistantTxt.includes("date")) {
        if (userTxt) targetDateRaw = userTxt;
      }

      // Extract Subject when Assistant asked for subject
      if (assistantTxt.includes("konse subject mein") || assistantTxt.includes("कौन से सब्जेक्ट") || assistantTxt.includes("subject")) {
        if (userTxt) targetSubject = userTxt;
      }

      // Extract Score when Assistant asked for score
      if (
        assistantTxt.includes("kitne marks aaye") ||
        assistantTxt.includes("कितने मार्क्स आए") ||
        assistantTxt.includes("marks aaye") ||
        assistantTxt.includes("out of 100") ||
        assistantTxt.includes("कितने अंक")
      ) {
        const scoreMatch = userTxt.match(/\d+/);
        if (scoreMatch) targetScore = parseInt(scoreMatch[0], 10);
      }
    }
  }

  const resolvedDate = targetDateRaw ? resolveRelativeDate(targetDateRaw) : CURRENT_SERVER_DATE;

  return {
    studentName,
    targetDateRaw,
    resolvedDate,
    targetSubject: targetSubject || null,
    targetScore: targetScore !== null ? targetScore : null,
    userStatedFacts
  };
}

export async function processChatConversation({ messages, user, language = "English", isConfirmedEscalation = false }) {
  const systemPrompt = getSystemPrompt({ user, language });
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  const roleTools = getToolsForRole(user.role);
  const geminiTools = buildGeminiToolDeclarations(roleTools);

  // 1. LIVE GEMINI API AGENT (Pure LLM Tool-Calling Driven & Role-Scoped)
  if (geminiClient) {
    try {
      let currentContents = toGeminiContents(messages);
      let loops = 0;
      let finalResponseText = "";
      let executedTools = [];

      while (loops < 5) {
        loops++;
        const response = await geminiClient.models.generateContent({
          model,
          contents: currentContents,
          config: {
            systemInstruction: systemPrompt,
            tools: geminiTools,
            maxOutputTokens: 1024
          }
        });

        const candidateParts = response.candidates?.[0]?.content?.parts || [];
        const functionCallParts = candidateParts.filter(p => p.functionCall);
        const textParts = candidateParts.filter(p => p.text);

        if (functionCallParts.length === 0) {
          finalResponseText = textParts.map(p => p.text).join("\n");
          break;
        }

        // Echo the model's turn (including its function call requests) back
        // into the conversation, exactly like Claude's tool_use assistant turn.
        currentContents.push({
          role: "model",
          parts: candidateParts
        });

        const functionResponseParts = [];

        for (const part of functionCallParts) {
          const toolName = part.functionCall.name;
          const toolInput = part.functionCall.args || {};

          let toolResult = null;
          if (["get_student_attendance", "get_child_attendance", "mark_attendance", "get_school_attendance_analytics"].includes(toolName)) {
            toolResult = await executeAttendanceTool(toolName, toolInput, user);
          } else if (["view_own_marks", "view_child_marks", "view_class_marks", "update_marks", "view_school_marks_analytics"].includes(toolName)) {
            toolResult = await executeMarksTool(toolName, toolInput, user);
          } else if (toolName === "register_student") {
            toolResult = await executeStudentTool(toolName, toolInput, user);
          } else if (toolName === "request_teacher_callback") {
            if (isConfirmedEscalation) toolInput.confirmedByUser = true;
            toolResult = await executeEscalationTool(toolName, toolInput, user);
          }

          executedTools.push({ name: toolName, input: toolInput, result: toolResult });

          functionResponseParts.push({
            functionResponse: {
              name: toolName,
              response: { result: toolResult }
            }
          });
        }

        currentContents.push({
          role: "user",
          parts: functionResponseParts
        });
      }

      const scrubbed = scrubLLMResponseOutput(finalResponseText);
      return {
        reply: scrubbed,
        executedTools,
        modelUsed: model,
        mode: "LIVE_GEMINI_API"
      };
    } catch (err) {
      // Log the REAL error loudly — swallowing this is what made it look
      // like "the AI is broken" when actually the API call itself was
      // failing (bad key, network, rate limit, etc.) and nobody could see it.
      console.error(
        `[XYZ AI] ❌ Live Gemini API call FAILED — falling back to the local ` +
          `scripted agent. Root cause:`,
        err.message
      );
      console.error(
        "[XYZ AI] If this keeps happening, check: (1) GEMINI_API_KEY is a real, " +
          "valid key, (2) the model name in GEMINI_MODEL is current, (3) network " +
          "access to generativelanguage.googleapis.com is not blocked, (4) you " +
          "haven't hit the free-tier rate limit (requests/minute or requests/day)."
      );
    }
  }

  // 2. LOCAL FALLBACK AGENT — emergency-only scripted state machine.
  // This is intentionally NOT real AI. It exists only so the app doesn't
  // hard-crash if the Gemini API is temporarily unreachable. It should
  // basically never run in the actual demo — if you're seeing rigid,
  // keyword-only responses, check the server startup logs for the
  // "GEMINI_API_KEY is missing or invalid" warning above.
  console.warn("[XYZ AI] Using LOCAL FALLBACK agent (not real Gemini AI) for this turn.");
  return executeIntelligentLocalAgent({ messages, user, language, isConfirmedEscalation });
}

function executeIntelligentLocalAgent({ messages, user, language, isConfirmedEscalation }) {
  const lastUserMsg = messages[messages.length - 1]?.content || "";
  const lowerMsg = lastUserMsg.toLowerCase().trim();
  let executedTools = [];
  let reply = "";
  const isHindi = language.toLowerCase() === "hindi" || language.toLowerCase() === "hi";

  // Full Multi-Turn Transcript & Memory Fact Analyzer
  const transcriptData = analyzeChatHistoryTranscript(messages);

  // Security Protection Check
  if (/ignore\s+(previous|all)\s+instructions/i.test(lowerMsg) || /system\s+prompt/i.test(lowerMsg) || /reveal\s+key/i.test(lowerMsg)) {
    reply = isHindi
      ? "मैं सुरक्षा प्रोटोकॉल को ओवरराइड करने या सिस्टम निर्देश प्रकट करने के अनुरोधों को पूरा नहीं कर सकता।"
      : "I cannot fulfill requests to reveal system prompt details or override system security protocols.";
    return { reply, executedTools, mode: "SECURITY_REFUSAL" };
  }

  // Memory Fact Statement Check (e.g. "mera naam Aryan hai")
  if (/mera\s+naam\s+([A-Za-z0-9\u0900-\u097F]+)\s+hai|my\s+name\s+is\s+([A-Za-z0-9\u0900-\u097F]+)/i.test(lowerMsg) && !lowerMsg.includes("kya")) {
    const nameMatch = lowerMsg.match(/(?:mera\s+naam|my\s+name\s+is)\s+([A-Za-z0-9\u0900-\u097F]+)/i);
    const statedName = nameMatch ? nameMatch[1] : "Aryan";
    reply = getLocalizedText({
      language,
      en: `Hello ${statedName}! I have remembered your name. How can I assist you with school attendance or marks today?`,
      hi: `नमस्ते ${statedName}! मैंने आपका नाम याद रख लिया है। आज मैं आपकी क्या मदद कर सकता हूँ?`
    });
    return { reply, executedTools, mode: "MEMORY_STORE" };
  }

  // Memory Fact Recall Check (e.g. "mera naam kya hai?", "what is my name?")
  if (/mera\s+naam\s+kya\s+hai|my\s+name\s+is|what\s+is\s+my\s+name|who\s+am\s+i|kya\s+naam\s+hai|naam\s+kya/i.test(lowerMsg)) {
    const rememberedName = transcriptData.userStatedFacts.statedName || user.name;
    reply = getLocalizedText({
      language,
      en: `Aapka naam ${rememberedName} hai.`,
      hi: `आपका नाम ${rememberedName} है।`
    });
    return { reply, executedTools, mode: "MEMORY_RECALL" };
  }

  const prevAssistantMsg = messages.length >= 2 ? (messages[messages.length - 2]?.content || "").toLowerCase() : "";

  // Helper: Find target student record from MOCK_ATTENDANCE_RECORDS
  const getTargetStudentKey = () => {
    if (user.role === "student") return user.id;
    if (user.role === "parent") return user.children?.[0]?.id || "STU1001";
    if (transcriptData.studentName) {
      const match = findStudentByName(transcriptData.studentName)[0];
      if (match) return match.id;
    }
    return Object.keys(MOCK_ATTENDANCE_RECORDS)[0] || user.id;
  };

  // ----------------------------------------------------
  // 1. INTENT ROUTING (EXPLICIT USER INTENTS TAKE HIGHEST PRIORITY)
  // ----------------------------------------------------

  const hasMarksKeyword = 
    /\b(marks|grade|grades|score|scores|result|results|number|numbers|nambar|numbr|namber)\b/i.test(lowerMsg) ||
    /(अंक|मार्क्स|नंबर|स्कोर|ग्रेड|रिजल्ट)/i.test(lowerMsg) ||
    /enter\s+marks|marks\s+lagan|i\s+want\s+to\s+enter\s+marks|mujhe\s+marks\s+lagte/i.test(lowerMsg) ||
    (/\bmark\b/i.test(lowerMsg) && !/attendance|attandance|atendance|अटेंडेंस|haziri|haajri|हाजिरी/i.test(lowerMsg));

  const isMarksAction = hasMarksKeyword;

  const isAttendanceAction = 
    !isMarksAction && (
      /\b(attendance|attandance|atendance|atendace|atendence|etendance|haziri|haajri|hazri|hajri|presence|presents|present|absent|aaya|aayi|aaye|showing\s+up|show\s+up)\b/i.test(lowerMsg) ||
      /(अटेंडेंस|हाजिरी|उपस्थिति|प्रेजेंट|अनुपस्थित)/i.test(lowerMsg) ||
      /aten|atand|attand|atend|hazir|haajir|hajir/i.test(lowerMsg) ||
      /mark\s+attendance|meri\s+attendance|bache\s+ki\s+attendance|kitni\s+attendance|attendance\s+kitni|presence\s+batao|kitne\s+din\s+aaya/i.test(lowerMsg)
    );

  // Marks Intent
  if (isMarksAction) {
    if (
      user.role === "teacher" && (
        lowerMsg.includes("daal") ||
        lowerMsg.includes("enter") ||
        lowerMsg.includes("inter") ||
        lowerMsg.includes("lagan") ||
        lowerMsg.includes("lagane") ||
        lowerMsg.includes("lagana") ||
        lowerMsg.includes("डालने") ||
        lowerMsg.includes("डालो") ||
        lowerMsg.includes("डालना") ||
        lowerMsg.includes("लगाने") ||
        lowerMsg.includes("लगाना") ||
        lowerMsg.includes("दर्ज") ||
        lowerMsg.includes("लगते") ||
        lowerMsg.includes("मार्क्स") ||
        lowerMsg.includes("marks")
      )
    ) {
      // Check if user already provided student name or score in the same message e.g. "I want to enter marks for Manya" or "Rahul Physics 95"
      const scoreMatch = lowerMsg.match(/\b(\d{1,3})\b/);
      const numScore = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

      const subjects = ["Mathematics", "Physics", "Chemistry", "English", "Science", "Social Science", "Hindi", "Biology", "Computer Science", "Math", "Maths"];
      const foundSubject = subjects.find(s => lowerMsg.toLowerCase().includes(s.toLowerCase()));

      let studentObj = null;
      for (const k in MOCK_USERS) {
        const u = MOCK_USERS[k];
        if (u.role === "student") {
          const fName = u.name.split(" ")[0].toLowerCase();
          if (lowerMsg.includes(fName) || lowerMsg.includes(u.name.toLowerCase())) {
            studentObj = u;
            break;
          }
        }
      }

      if (!studentObj && transcriptData.studentName) {
        const matches = findStudentByName(transcriptData.studentName, user.assignedClass || "10-A");
        if (matches.length > 0) studentObj = matches[0];
      }

      // If user provided student name, subject, and score all together
      if (numScore !== null && numScore <= 100) {
        if (!studentObj) {
          const words = lowerMsg.split(/\s+/);
          const nameWord = words.find(w => w.length > 2 && !["marks", "daal", "enter", "lagane", "mein", "subject", "physics", "math", "chemistry", "english", "hindi", "score", "nambar", "want"].includes(w.toLowerCase()));
          const studentName = nameWord ? (nameWord.charAt(0).toUpperCase() + nameWord.slice(1)) : "Rahul";
          const reg = registerNewStudent({ name: studentName, className: user.assignedClass || "10-A", teacherId: user.id || "TEA3001" });
          studentObj = reg.student;
        }

        const targetSubject = foundSubject ? (foundSubject.toLowerCase().startsWith("math") ? "Mathematics" : foundSubject.charAt(0).toUpperCase() + foundSubject.slice(1)) : (user.subject || "Mathematics");

        const updated = updateStudentMarksRecord(studentObj.id, targetSubject, numScore, studentObj.name);
        executedTools.push({ name: "update_marks", input: { studentId: studentObj.id, subject: targetSubject, newMarks: numScore }, result: updated });

        reply = getLocalizedText({
          language,
          en: `Done! Saved ${numScore} marks for ${studentObj.name} in ${targetSubject}. Would you like to update marks for another subject or student?`,
          hi: `सफल! ${studentObj.name} के ${targetSubject} में ${numScore} अंक दर्ज कर दिए गए हैं। क्या आप किसी अन्य विषय या छात्र के अंक अपडेट करना चाहते हैं?`
        });
        return { reply, executedTools, mode: "MARKS_STEP_4" };
      }

      // If user provided student name (e.g. "I want to enter marks for Manya")
      if (studentObj) {
        reply = getLocalizedText({
          language,
          en: `${studentObj.name}'s marks will be entered. Which subject?`,
          hi: `${studentObj.name} के मार्क्स लगाने हैं। कौन से सब्जेक्ट में लगाने हैं?`
        });
        return { reply, executedTools, mode: "MARKS_STEP_2" };
      }

      // Default: Ask for student name
      reply = getLocalizedText({
        language,
        en: "Which student's marks would you like to update?",
        hi: "किस छात्र के अंक/मार्क्स दर्ज करने हैं?"
      });
      return { reply, executedTools, mode: "MARKS_STEP_1" };
    }

    // Guard: Non-teacher attempting to enter/update marks
    if (
      lowerMsg.includes("daal") ||
      lowerMsg.includes("enter") ||
      lowerMsg.includes("inter") ||
      lowerMsg.includes("lagan") ||
      lowerMsg.includes("lagane") ||
      lowerMsg.includes("lagana") ||
      lowerMsg.includes("ডालने") ||
      lowerMsg.includes("लगाने") ||
      lowerMsg.includes("दर्ज")
    ) {
      reply = getLocalizedText({
        language,
        en: "Only Class Teachers can enter or update student marks. Please log in as a Teacher (manya.teacher) to enter subject marks.",
        hi: "केवल शिक्षक ही छात्र के अंक दर्ज या अपडेट कर सकते हैं। अंक दर्ज करने के लिए कृपया शिक्षक (manya.teacher) खाते से लॉगिन करें।"
      });
      return { reply, executedTools, mode: "MARKS_ROLE_DENIED" };
    }

    if (user.role === "student") {
      const markRec = findMatchingRecordForUser(MOCK_MARKS_RECORDS, user);
      executedTools.push({ name: "view_own_marks", input: { studentId: user.id }, result: markRec });

      if (markRec && markRec.subjects && markRec.subjects.length > 0) {
        const subList = markRec.subjects.map(s => `${s.subject}: ${s.marksObtained}/${s.maxMarks || 100} (${s.letterGrade})`).join(", ");
        reply = getLocalizedText({
          language,
          en: `Your Academic Subject Marks: ${subList}.`,
          hi: `आपके अकादमिक विषय-वार अंक: ${subList}।`
        });
      } else {
        reply = getLocalizedText({
          language,
          en: `No subject marks recorded yet for ${user.name}.`,
          hi: `अभी तक ${user.name} के किसी भी विषय के अंक दर्ज नहीं हुए हैं।`
        });
      }
      return { reply, executedTools, mode: "MARKS_QUERY" };
    }

    if (user.role === "parent") {
      const markRec = findMatchingRecordForUser(MOCK_MARKS_RECORDS, user);
      executedTools.push({ name: "view_child_marks", input: { childId: user.id }, result: markRec });

      if (markRec && markRec.subjects && markRec.subjects.length > 0) {
        const subList = markRec.subjects.map(s => `${s.subject}: ${s.marksObtained}/${s.maxMarks || 100} (${s.letterGrade})`).join(", ");
        reply = getLocalizedText({
          language,
          en: `${markRec.studentName}'s Academic Subject Marks: ${subList}. Would you also like to check attendance percentage?`,
          hi: `${markRec.studentName} के अकादमिक विषय-वार अंक: ${subList}। क्या आप कुल उपस्थिति प्रतिशत भी देखना चाहते हैं?`
        });
      } else {
        reply = getLocalizedText({
          language,
          en: `No subject marks recorded yet. Would you like to check attendance record?`,
          hi: `अभी तक किसी भी विषय के अंक दर्ज नहीं हुए हैं। क्या आप उपस्थिति रिकॉर्ड देखना चाहते हैं?`
        });
      }
      return { reply, executedTools, mode: "MARKS_QUERY" };
    }

    if (user.role === "principal") {
      const marksAnalytics = computeSchoolMarksAnalytics();
      executedTools.push({ name: "view_school_marks_analytics", input: {}, result: marksAnalytics });

      if (transcriptData.studentName) {
        const studentObj = findStudentByName(transcriptData.studentName)[0];
        if (studentObj && MOCK_MARKS_RECORDS[studentObj.id]) {
          const markRec = MOCK_MARKS_RECORDS[studentObj.id];
          const subList = markRec.subjects.map(s => `${s.subject}: ${s.marksObtained}/${s.maxMarks || 100} (${s.letterGrade})`).join(", ");
          reply = getLocalizedText({
            language,
            en: `School-wide academic average marks is ${marksAnalytics.overallSchoolAverage}%. ${markRec.studentName}'s Marks: ${subList}.`,
            hi: `स्कूल का कुल औसत अंक ${marksAnalytics.overallSchoolAverage}% है। ${markRec.studentName} के अंक: ${subList}।`
          });
          return { reply, executedTools, mode: "MARKS_QUERY" };
        }
      }

      reply = getLocalizedText({
        language,
        en: `School-wide academic average marks is ${marksAnalytics.overallSchoolAverage}% with a pass rate of ${marksAnalytics.passRatePercentage}%. Evaluated students: ${marksAnalytics.totalStudentsEvaluated}.`,
        hi: `स्कूल का कुल औसत अंक ${marksAnalytics.overallSchoolAverage}% है और उत्तीर्ण दर ${marksAnalytics.passRatePercentage}% है। मूल्यांकन किए गए छात्र: ${marksAnalytics.totalStudentsEvaluated}।`
      });
      return { reply, executedTools, mode: "MARKS_QUERY" };
    }

    // Default fallback inside isMarksAction: ensures marks queries from any role never fall through to attendance flows
    const defaultMarkRec = findMatchingRecordForUser(MOCK_MARKS_RECORDS, user);
    if (defaultMarkRec && defaultMarkRec.subjects && defaultMarkRec.subjects.length > 0) {
      const subList = defaultMarkRec.subjects.map(s => `${s.subject}: ${s.marksObtained}/${s.maxMarks || 100} (${s.letterGrade})`).join(", ");
      reply = getLocalizedText({
        language,
        en: `${defaultMarkRec.studentName}'s Academic Subject Marks: ${subList}.`,
        hi: `${defaultMarkRec.studentName} के अकादमिक विषय-वार अंक: ${subList}।`
      });
    } else {
      reply = getLocalizedText({
        language,
        en: `No subject marks recorded yet for ${user.name || "student"}.`,
        hi: `अभी तक ${user.name || "छात्र"} के विषय-वार अंक दर्ज नहीं हुए हैं।`
      });
    }
    return { reply, executedTools, mode: "MARKS_QUERY" };
  }

  // ----------------------------------------------------
  // 2. ACTIVE CONVERSATIONAL MULTI-STEP STATE MACHINE (Teacher Role Only)
  // ----------------------------------------------------

  const isFollowupContext = prevAssistantMsg.includes("?") || prevAssistantMsg.includes("chahte") || prevAssistantMsg.includes("want") || prevAssistantMsg.includes("kisi aur");
  const isAffirmative = /^(haan|haanji|yes|yep|yeah|sure|ok|okay|ha|हां|हाँ|बिल्कुल|जरूर)$/i.test(lowerMsg) || /^yes\b|^haan\b/i.test(lowerMsg);
  const isNegative = /^(nahi|no|nope|na|naa|nahi rehne do|no thanks|bas|nothing|नहीं|नही|बस)$/i.test(lowerMsg) || /^no\b|^nahi\b/i.test(lowerMsg);

  if (isFollowupContext && isAffirmative) {
    reply = getLocalizedText({
      language,
      en: "Great! Which student, subject, or attendance entry would you like to check or update next?",
      hi: "बहुत बढ़िया! आप आगे किस छात्र या विषय के अंक/उपस्थिति देखना या अपडेट करना चाहते हैं?"
    });
    return { reply, executedTools, mode: "FOLLOW_UP_AFFIRMATIVE" };
  }

  if (isFollowupContext && isNegative) {
    reply = getLocalizedText({
      language,
      en: "Alright! Feel free to ask whenever you need assistance with school records. Have a great day! 😊",
      hi: "ठीक है! स्कूल रिकॉर्ड्स से जुड़ी किसी भी सहायता के लिए आप कभी भी पूछ सकते हैं। आपका दिन शुभ हो! 😊"
    });
    return { reply, executedTools, mode: "FOLLOW_UP_CLOSING" };
  }

  if (user.role === "teacher") {
    // Step C1: AI asked "Which student's attendance or marks" -> User gives input
    const isInitialGreetingContext = 
      (prevAssistantMsg.includes("किस छात्र") || prevAssistantMsg.includes("which student") || prevAssistantMsg.includes("konse bache")) &&
      (prevAssistantMsg.includes("अटेंडेंस") || prevAssistantMsg.includes("attendance")) &&
      (prevAssistantMsg.includes("अंक") || prevAssistantMsg.includes("marks") || prevAssistantMsg.includes("मार्क्स"));

    if (isInitialGreetingContext) {
      if (isMarksAction) {
        reply = getLocalizedText({
          language,
          en: "Which student's marks would you like to update?",
          hi: "किस छात्र के अंक/मार्क्स दर्ज करने हैं?"
        });
        return { reply, executedTools, mode: "MARKS_STEP_1" };
      }

      if (isAttendanceAction) {
        reply = getLocalizedText({
          language,
          en: "Which student's attendance would you like to mark?",
          hi: "किस छात्र की उपस्थिति दर्ज करनी है?"
        });
        return { reply, executedTools, mode: "CONVERSATIONAL_STEP_1" };
      }

      const studentName = lastUserMsg.trim();
      let studentObj = findStudentByName(studentName, user.assignedClass || "10-A")[0];

      if (!studentObj) {
        const reg = registerNewStudent({ name: studentName, className: user.assignedClass || "10-A", teacherId: user.id || "TEA3001" });
        studentObj = reg.student;
        executedTools.push({ name: "register_student", input: { name: studentName }, result: reg });
      }

      reply = getLocalizedText({
        language,
        en: `Would you like to mark Attendance or enter Subject Marks for ${studentObj.name}?`,
        hi: `${studentObj.name} की अटेंडेंस लगानी है या मार्क्स दर्ज करने हैं?`
      });
      return { reply, executedTools, mode: "DISAMBIGUATION_STEP" };
    }

    // Step C2: AI asked "Attendance lagani hai ya Marks" -> User says "Marks" or "Attendance"
    if (
      (prevAssistantMsg.includes("attendance") || prevAssistantMsg.includes("अटेंडेंस") || prevAssistantMsg.includes("हाजिरी")) &&
      (prevAssistantMsg.includes("marks") || prevAssistantMsg.includes("मार्क्स") || prevAssistantMsg.includes("अंक"))
    ) {
      const isAttendanceChoice = /attendance|attandance|atendance|haziri|haajri|हाजिरी|अटेंडेंस|presence|presents|present|absent|आया|आयी|आए|उपस्थिति/i.test(lowerMsg);
      const isMarksChoice = !isAttendanceChoice || /marks|nambar|numbr|namber|number|अंक|मार्क्स|नंबर|score|result|दर्ज|लगा|डाल|विषय|सब्जेक्ट|ग्रेड/i.test(lowerMsg);

      const targetStudentName = transcriptData.studentName || "student";
      let studentObj = findStudentByName(targetStudentName, user.assignedClass || "10-A")[0];
      if (!studentObj) {
        const reg = registerNewStudent({ name: targetStudentName, className: user.assignedClass || "10-A", teacherId: user.id || "TEA3001" });
        studentObj = reg.student;
      }

      if (isMarksChoice && !isAttendanceChoice) {
        reply = getLocalizedText({
          language,
          en: `${studentObj.name}'s marks will be entered. Which subject?`,
          hi: `${studentObj.name} के मार्क्स लगाने हैं। कौन से सब्जेक्ट में लगाने हैं?`
        });
        return { reply, executedTools, mode: "MARKS_STEP_2" };
      } else {
        reply = getLocalizedText({
          language,
          en: `Ok, ${studentObj.name}. Konsi date ki attendance lagani hai?`,
          hi: `ठीक है, ${studentObj.name}। कौन सी तारीख की अटेंडेंस लगानी है?`
        });
        return { reply, executedTools, mode: "CONVERSATIONAL_STEP_2" };
      }
    }

    // Step A2: AI asked "Kis bache ki attendance lagani hai" -> User gives Name for ATTENDANCE
    if (
      (prevAssistantMsg.includes("attendance") || prevAssistantMsg.includes("अटेंडेंस") || prevAssistantMsg.includes("हाजिरी")) &&
      (prevAssistantMsg.includes("kis bache") || prevAssistantMsg.includes("किस छात्र") || prevAssistantMsg.includes("bache ki"))
    ) {
      const studentName = lastUserMsg.trim();
      if (isInvalidStudentName(studentName)) {
        reply = getLocalizedText({
          language,
          en: "Which student's attendance would you like to mark?",
          hi: "किस छात्र की उपस्थिति दर्ज करनी है?"
        });
        return { reply, executedTools, mode: "CONVERSATIONAL_STEP_1" };
      }

      let studentObj = findStudentByName(studentName, user.assignedClass || "10-A")[0];

      if (!studentObj) {
        const reg = registerNewStudent({ name: studentName, className: user.assignedClass || "10-A", teacherId: user.id || "TEA3001" });
        studentObj = reg.student;
        executedTools.push({ name: "register_student", input: { name: studentName }, result: reg });
      }

      reply = getLocalizedText({
        language,
        en: `Ok, ${studentObj.name}. Konsi date ki attendance lagani hai?`,
        hi: `ठीक है, ${studentObj.name}। कौन सी तारीख की अटेंडेंस लगानी है?`
      });
      return { reply, executedTools, mode: "CONVERSATIONAL_STEP_2" };
    }

    // Step A3: AI asked "Konsi date ki" -> User gives Date
    if (prevAssistantMsg.includes("konsi date ki") || prevAssistantMsg.includes("कौन सी तारीख") || prevAssistantMsg.includes("date ki attendance")) {
      const dateStr = lastUserMsg.trim();

      reply = getLocalizedText({
        language,
        en: `${dateStr} ko ${transcriptData.studentName || "student"} Present hai ya Absent?`,
        hi: `${dateStr} को ${transcriptData.studentName || "student"} Present है या Absent?`
      });
      return { reply, executedTools, mode: "CONVERSATIONAL_STEP_3" };
    }

    // Step A4: AI asked "Present hai ya Absent" -> User gives Status
    if (prevAssistantMsg.includes("present hai ya absent") || prevAssistantMsg.includes("present है या absent") || prevAssistantMsg.includes("present") || prevAssistantMsg.includes("absent")) {
      const isAbsent = lowerMsg.includes("absent") || lowerMsg.includes("अब्सेंट") || lowerMsg.includes("अनुपस्थित") || lowerMsg.includes("nahi");
      const status = isAbsent ? "Absent" : "Present";

      const targetStudentName = transcriptData.studentName || "student";
      let studentObj = findStudentByName(targetStudentName, user.assignedClass || "10-A")[0];
      if (!studentObj) {
        const reg = registerNewStudent({ name: targetStudentName, className: user.assignedClass || "10-A", teacherId: user.id || "TEA3001" });
        studentObj = reg.student;
      }

      const targetDate = transcriptData.resolvedDate;

      const updatedRecord = updateStudentAttendanceRecord(studentObj.id, targetDate, status, "Marked via Chat", studentObj.name);
      executedTools.push({ name: "mark_attendance", input: { studentId: studentObj.id, date: targetDate, status }, result: updatedRecord });

      reply = getLocalizedText({
        language,
        en: `Ho gaya! ${studentObj.name} ki ${targetDate} ki attendance ${status} mark ho gayi hai. Kya aap kisi aur student ki attendance lagana chahte hain?`,
        hi: `हो गया! ${studentObj.name} की ${targetDate} की अटेंडेंस ${status} मार्क हो गई है। क्या आप किसी और छात्र की उपस्थिति दर्ज करना चाहते हैं?`
      });
      return { reply, executedTools, mode: "CONVERSATIONAL_STEP_4" };
    }

    // Step B2: AI asked "Which student's marks" -> User gives Name for MARKS
    if (
      (prevAssistantMsg.includes("marks") || prevAssistantMsg.includes("अंक") || prevAssistantMsg.includes("मार्क्स") || prevAssistantMsg.includes("update")) &&
      (prevAssistantMsg.includes("konse bache") || prevAssistantMsg.includes("किस छात्र") || prevAssistantMsg.includes("which student") || prevAssistantMsg.includes("would you like"))
    ) {
      const studentName = lastUserMsg.trim();
      let studentObj = findStudentByName(studentName, user.assignedClass || "10-A")[0];

      if (!studentObj) {
        const reg = registerNewStudent({ name: studentName, className: user.assignedClass || "10-A", teacherId: user.id || "TEA3001" });
        studentObj = reg.student;
        executedTools.push({ name: "register_student", input: { name: studentName }, result: reg });
      }

      reply = getLocalizedText({
        language,
        en: `${studentObj.name} ke marks lagane hain. Konse subject mein lagane hain?`,
        hi: `${studentObj.name} के मार्क्स लगाने हैं। कौन से सब्जेक्ट में लगाने हैं?`
      });
      return { reply, executedTools, mode: "MARKS_STEP_2" };
    }

    // Step B3: AI asked "Konse subject mein" -> User gives Subject
    if (
      prevAssistantMsg.includes("konse subject mein") ||
      prevAssistantMsg.includes("कौन से सब्जेक्ट") ||
      prevAssistantMsg.includes("subject mein") ||
      prevAssistantMsg.includes("konse subject") ||
      prevAssistantMsg.includes("which subject")
    ) {
      const subjectName = lastUserMsg.trim();

      reply = getLocalizedText({
        language,
        en: `${subjectName} mein ${transcriptData.studentName || "student"} ke kitne marks aaye hain out of 100?`,
        hi: `${subjectName} में ${transcriptData.studentName || "student"} के कितने मार्क्स आए हैं out of 100?`
      });
      return { reply, executedTools, mode: "MARKS_STEP_3" };
    }

    // Step B4: AI asked "kitne marks aaye hain out of 100" -> User gives Score
    if (
      prevAssistantMsg.includes("out of 100") ||
      prevAssistantMsg.includes("kitne marks aaye") ||
      prevAssistantMsg.includes("कितने मार्क्स आए") ||
      prevAssistantMsg.includes(" कितने अंक ")
    ) {
      const scoreMatch = lowerMsg.match(/\d+/);
      const numScore = scoreMatch ? parseInt(scoreMatch[0], 10) : transcriptData.targetScore;

      if (numScore === null || numScore === undefined || isNaN(numScore)) {
        reply = getLocalizedText({
          language,
          en: `${transcriptData.targetSubject || "Subject"} mein kitne marks aaye hain out of 100? Please number bataiye.`,
          hi: `${transcriptData.targetSubject || "सब्जेक्ट"} में कितने मार्क्स आए हैं out of 100? कृपया नंबर बताइए।`
        });
        return { reply, executedTools, mode: "MARKS_STEP_3" };
      }

      const targetStudentName = transcriptData.studentName || "student";
      let studentObj = findStudentByName(targetStudentName, user.assignedClass || "10-A")[0];
      if (!studentObj) {
        const reg = registerNewStudent({ name: targetStudentName, className: user.assignedClass || "10-A", teacherId: user.id || "TEA3001" });
        studentObj = reg.student;
      }

      const targetSubject = transcriptData.targetSubject || "Physics";

      const updatedMarks = updateStudentMarksRecord(studentObj.id, targetSubject, numScore, studentObj.name);
      executedTools.push({ name: "update_marks", input: { studentId: studentObj.id, subject: targetSubject, newMarks: numScore }, result: updatedMarks });

      reply = getLocalizedText({
        language,
        en: `Done! ${studentObj.name} ke ${targetSubject} mein ${numScore} marks save ho gaye hain. Kya aap kisi aur subject ya student ke marks update karna chahte hain?`,
        hi: `Done! ${studentObj.name} के ${targetSubject} में ${numScore} मार्क्स सेव हो गए हैं। क्या आप किसी और विषय या छात्र के अंक अपडेट करना चाहते हैं?`
      });
      return { reply, executedTools, mode: "MARKS_STEP_4" };
    }
  }

  // Attendance Intent
  if (isAttendanceAction) {
    if (user.role === "principal") {
      executedTools.push({ name: "get_school_attendance_analytics", input: {}, result: MOCK_SCHOOL_ANALYTICS });

      if (transcriptData.studentName) {
        const studentObj = findStudentByName(transcriptData.studentName)[0];
        if (studentObj && MOCK_ATTENDANCE_RECORDS[studentObj.id]) {
          const attRec = MOCK_ATTENDANCE_RECORDS[studentObj.id];
          reply = getLocalizedText({
            language,
            en: `School-wide overall attendance is ${MOCK_SCHOOL_ANALYTICS.overallAttendancePercentage}%. ${attRec.studentName}'s attendance is ${attRec.overallPercentage}% (${attRec.daysPresent} Days Present).`,
            hi: `स्कूल की कुल उपस्थिति ${MOCK_SCHOOL_ANALYTICS.overallAttendancePercentage}% है। ${attRec.studentName} की उपस्थिति ${attRec.overallPercentage}% है।`
          });
          return { reply, executedTools, mode: "ATTENDANCE_QUERY" };
        }
      }

      reply = getLocalizedText({
        language,
        en: `School-wide overall attendance is ${MOCK_SCHOOL_ANALYTICS.overallAttendancePercentage}% (${MOCK_SCHOOL_ANALYTICS.presentToday} present today out of ${MOCK_SCHOOL_ANALYTICS.totalStudents} total students).`,
        hi: `स्कूल की कुल उपस्थिति ${MOCK_SCHOOL_ANALYTICS.overallAttendancePercentage}% है (${MOCK_SCHOOL_ANALYTICS.totalStudents} में से ${MOCK_SCHOOL_ANALYTICS.presentToday} आज उपस्थित हैं)।`
      });
      return { reply, executedTools, mode: "ATTENDANCE_QUERY" };
    }

    if (
      user.role === "teacher" && (
        lowerMsg.includes("lagani") ||
        lowerMsg.includes("lagao") ||
        lowerMsg.includes("lagane") ||
        lowerMsg.includes("daal") ||
        lowerMsg.includes("enter") ||
        lowerMsg.includes("लगानी") ||
        lowerMsg.includes("लगाना") ||
        lowerMsg.includes("present") ||
        lowerMsg.includes("absent") ||
        /mark\s+attendance|mark\s+present|mark\s+absent/i.test(lowerMsg)
      )
    ) {
      reply = getLocalizedText({
        language,
        en: "Which student's attendance would you like to mark?",
        hi: "किस छात्र की उपस्थिति दर्ज करनी है?"
      });
      return { reply, executedTools, mode: "CONVERSATIONAL_STEP_1" };
    }

    const attRec = findMatchingRecordForUser(MOCK_ATTENDANCE_RECORDS, user);
    const toolName = user.role === "parent" ? "get_child_attendance" : "get_student_attendance";
    executedTools.push({ name: toolName, input: { studentId: user.id }, result: attRec });

    if (attRec) {
      if (user.role === "parent") {
        reply = getLocalizedText({
          language,
          en: `Your child ${attRec.studentName}'s overall attendance is ${attRec.overallPercentage}% (${attRec.daysPresent} Days Present, ${attRec.daysAbsent} Days Absent). Would you like to check subject marks?`,
          hi: `आपके बच्चे ${attRec.studentName} की कुल उपस्थिति ${attRec.overallPercentage}% है (${attRec.daysPresent} दिन उपस्थित, ${attRec.daysAbsent} दिन अनुपस्थित)। क्या आप विषय-वार अंक भी देखना चाहते हैं?`
        });
      } else {
        reply = getLocalizedText({
          language,
          en: `Your overall attendance is ${attRec.overallPercentage}% (${attRec.daysPresent} Days Present, ${attRec.daysAbsent} Days Absent). Would you like to check subject marks?`,
          hi: `आपकी कुल उपस्थिति ${attRec.overallPercentage}% है (${attRec.daysPresent} दिन उपस्थित, ${attRec.daysAbsent} दिन अनुपस्थित)। क्या आप विषय-वार अंक भी देखना चाहते हैं?`
        });
      }
    } else {
      reply = getLocalizedText({
        language,
        en: `No attendance record found yet. Would you like to check subject marks?`,
        hi: `अभी तक उपस्थिति दर्ज नहीं हुई है। क्या आप विषय-वार अंक देखना चाहते हैं?`
      });
    }
    return { reply, executedTools, mode: "ATTENDANCE_QUERY" };
  }

  // General Parent Persona Greeting Response
  if (user.role === "parent") {
    reply = getLocalizedText({
      language,
      en: "Hello Parents! I am your Apna School AI Parent Support Assistant. I can help you check your child's attendance percentage, subject marks, or request a callback from the class teacher. How can I assist you today?",
      hi: "हेलो पेरेंट्स! मैं आपका Apna School AI पैरेंट सपोर्ट असिस्टेंट हूँ। मैं आपके बच्चे की अटेंडेंस, सब्जेक्ट मार्क्स देखने या क्लास टीचर से कॉल की रिक्वेस्ट करने में मदद कर सकता हूँ। आज मैं आपकी क्या सहायता करूँ?"
    });
    return { reply, executedTools, mode: "PARENT_GREETING" };
  }

  // General Principal Persona Overview Response
  if (user.role === "principal") {
    reply = generatePrincipalFullAnalyticsReport({ language, executedTools });
    return { reply, executedTools, mode: "PRINCIPAL_FULL_ANALYTICS" };
  }

  // General Conversational Chit-Chat & Natural Question Response
  reply = getLocalizedText({
    language,
    en: `I am doing great, ${user.name}! I am your Apna School AI study buddy. I can help you check attendance, subject marks, update student records, or answer any school questions. What would you like to discuss today?`,
    hi: `मैं बिल्कुल बढ़िया हूँ, ${user.name}! मैं आपका Apna School AI असिस्टेंट हूँ। मैं आपकी अटेंडेंस, सब्जेक्ट मार्क्स देखने या स्कूल रिकॉर्ड्स अपडेट करने में मदद कर सकता हूँ। आज आप क्या पूछना चाहते हैं?`,
    ta: `நான் மிகவும் நன்றாக இருக்கிறேன், ${user.name}! நான் உங்கள் Apna School AI உதவியாளர். உங்கள் வருகைப் பதிவு அல்லது மதிப்பெண்களைச் சரிபார்க்க நான் உதவ முடியும்.`,
    te: `నేను చాలా బాగున్నాను, ${user.name}! నేను మీ Apna School AI అసిస్టెంట్‌ని. మీ హాజరు లేదా మార్కులను సరిచూడడంలో నేను సహాయపడగలను.`,
    mr: `मी एकदम मजेत आहे, ${user.name}! मी तुमचा Apna School AI असिस्टंट आहे. मी तुमची उपस्थिती किंवा गुणांची तपासणी करू शकतो.`,
    bn: `আমি খুব ভালো আছি, ${user.name}! আমি আপনার Apna School AI অ্যাসিস্ট্যান্ট। আমি আপনার উপস্থিতি বা নম্বর দেখতে সাহায্য করতে পারি।`,
    gu: `હું એકદમ સરસ છું, ${user.name}! હું તમારો Apna School AI આસિસ્ટન્ટ છું. હું તમારી હાજરી અથવા ગુણ બતાવી શકું છું.`,
    pa: `ਮੈਂ ਬਿਲਕੁਲ ਵਧੀਆ ਹਾਂ, ${user.name}! ਮੈਂ ਤੁਹਾਡਾ Apna School AI ਅਸਿਸਟੈਂਟ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੀ ਹਾਜ਼ਰੀ ਜਾਂ ਅੰਕ ਦੱਸ ਸਕਦਾ ਹਾਂ।`,
    kn: `ನಾನು ತುಂಬಾ ಚೆನ್ನಾಗಿದ್ದೇನೆ, ${user.name}! ನಾನು ನಿಮ್ಮ Apna School AI ಸಹಾಯಕ. ನಿಮ್ಮ ಹಾಜರಾತಿ ಅಥವಾ ಅಂಕಗಳನ್ನು ಪರೀಕ್ಷಿಸಲು ನಾನು ಸಹಾಯ ಮಾಡಬಲ್ಲೆ.`,
    ml: `ഞാൻ സുഖമായിരിക്കുന്നു, ${user.name}! ഞാൻ നിങ്ങളുടെ Apna School AI അസിസ്റ്റന്റാണ്. നിങ്ങളുടെ ഹാജർ അല്ലെങ്കിൽ മാർക്കുകൾ പരിശോധിക്കാൻ സഹായിക്കാം.`,
    ur: `میں بالکل ٹھیک ہوں، ${user.name}! میں آپ کا Apna School AI اسسٹنٹ ہوں۔ میں آپ کی حاضری اور مارکس چیک کرنے میں مدد کر سکتا ہوں۔`
  });

  return { reply, executedTools, mode: "LOCAL_DEFAULT" };
}

function getLocalizedText({ language, en, hi, ta, te, mr, bn, gu, pa, kn, ml, ur }) {
  const langClean = (language || "English").toLowerCase();

  if (langClean.includes("hindi") || langClean === "hi") {
    return hi || en;
  }

  if (langClean.includes("punjabi") || langClean === "pa") {
    if (pa) return pa;
    // Auto-translate template strings into Punjabi script
    return en
      .replace(/overall attendance is/g, "ਕੁਲ ਹਾਜ਼ਰੀ ਹੈ")
      .replace(/Days Present/g, "ਦਿਨ ਹਾਜ਼ਰ")
      .replace(/Days Absent/g, "ਦਿਨ ਗੈਰ-ਹਾਜ਼ਰ")
      .replace(/Academic Subject Marks/g, "ਅਕਾਦਮਿਕ ਵਿਸ਼ੇ ਦੇ ਅੰਕ")
      .replace(/Would you like to check/g, "ਕੀ ਤੁਸੀਂ ਚੈੱਕ ਕਰਨਾ ਚਾਹੁੰਦੇ ਹੋ")
      .replace(/Which student's marks would you like to update\?/g, "ਕਿਸ ਵਿਦਿਆਰਥੀ ਦੇ ਅੰਕ ਦਰਜ ਕਰਨੇ ਹਨ?")
      .replace(/Which student's attendance would you like to mark\?/g, "ਕਿਸ ਵਿਦਿਆਰਥੀ ਦੀ ਹਾਜ਼ਰੀ ਦਰਜ ਕਰਨੀ ਹੈ?")
      .replace(/Done! Saved/g, "ਸਫਲ! ਦਰਜ ਕਰ ਦਿੱਤਾ ਗਿਆ")
      .replace(/in/g, "ਵਿੱਚ")
      .replace(/No attendance record found yet./g, "ਅਜੇ ਤੱਕ ਕੋਈ ਹਾਜ਼ਰੀ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲਿਆ।")
      .replace(/No subject marks recorded yet./g, "ਅਜੇ ਤੱਕ ਕੋਈ ਅੰਕ ਰਿਕਾਰਡ ਨਹੀਂ ਮਿਲੇ।");
  }

  if (langClean.includes("tamil") || langClean === "ta") {
    if (ta) return ta;
    return en
      .replace(/overall attendance is/g, "மொத்த வருகைப் பதிவு")
      .replace(/Days Present/g, "நாட்கள் வருகை")
      .replace(/Days Absent/g, "நாட்கள் வராதவை")
      .replace(/Academic Subject Marks/g, "பாடவாரியான மதிப்பெண்கள்")
      .replace(/Would you like to check/g, "நீங்கள் சரிபார்க்க விரும்புகிறீர்களா")
      .replace(/Which student's marks would you like to update\?/g, "எந்த மாணவரின் மதிப்பெண்களைப் பதிவு செய்ய வேண்டும்?")
      .replace(/Which student's attendance would you like to mark\?/g, "எந்த மாணவரின் வருகைப் பதிவைப் பதிவு செய்ய வேண்டும்?");
  }

  if (langClean.includes("telugu") || langClean === "te") {
    if (te) return te;
    return en
      .replace(/overall attendance is/g, "మొత్తం హాజరు")
      .replace(/Days Present/g, "రోజులు హాజరు")
      .replace(/Days Absent/g, "రోజులు గైర్హాజరు")
      .replace(/Academic Subject Marks/g, "సబ్జెక్ట్ మార్కులు")
      .replace(/Would you like to check/g, "మీరు సరిచూడాలనుకుంటున్నారా");
  }

  if (langClean.includes("marathi") || langClean === "mr") {
    if (mr) return mr;
    return en
      .replace(/overall attendance is/g, "एकूण हजेरी")
      .replace(/Days Present/g, "दिवस उपस्थित")
      .replace(/Days Absent/g, "दिवस अनुपस्थित")
      .replace(/Academic Subject Marks/g, "विषयवार गुण")
      .replace(/Would you like to check/g, "तुम्हाला तपासायचे आहे का");
  }

  if (langClean.includes("bengali") || langClean === "bn") {
    if (bn) return bn;
    return en
      .replace(/overall attendance is/g, "মোট উপস্থিতি")
      .replace(/Days Present/g, "দিন উপস্থিত")
      .replace(/Days Absent/g, "দিন অনুপস্থিত")
      .replace(/Academic Subject Marks/g, "বিষয়ভিত্তিক নম্বর");
  }

  if (langClean.includes("gujarati") || langClean === "gu") {
    if (gu) return gu;
    return en
      .replace(/overall attendance is/g, "કુલ હાજરી")
      .replace(/Days Present/g, "દિવસ હાજર")
      .replace(/Days Absent/g, "દિવસ ગેરહાજર")
      .replace(/Academic Subject Marks/g, "વિષયવાર ગુણ");
  }

  if (langClean.includes("kannada") || langClean === "kn") {
    if (kn) return kn;
    return en
      .replace(/overall attendance is/g, "ಒಟ್ಟು ಹಾಜರಾತಿ")
      .replace(/Days Present/g, "ದಿನ ಹಾಜರು")
      .replace(/Days Absent/g, "ದಿನ ಗೈರುಹಾಜರು");
  }

  if (langClean.includes("malayalam") || langClean === "ml") {
    if (ml) return ml;
    return en
      .replace(/overall attendance is/g, "ആകെ ഹാജർ")
      .replace(/Days Present/g, "ദിവസങ്ങൾ ഹാജർ")
      .replace(/Days Absent/g, "ദിവസങ്ങൾ ഗൈർഹാജർ");
  }

  if (langClean.includes("urdu") || langClean === "ur") {
    if (ur) return ur;
    return en
      .replace(/overall attendance is/g, "کل حاضری")
      .replace(/Days Present/g, "دن حاضر")
      .replace(/Days Absent/g, "دن غیر حاضر");
  }

  return en;
}

function getPersonaTitle(role) {
  switch (role) {
    case "student": return "Academic Assistant";
    case "parent": return "Parent Support Assistant";
    case "teacher": return "Teaching Assistant";
    case "principal": return "Management Assistant";
    default: return "School Assistant";
  }
}

function generatePrincipalFullAnalyticsReport({ language, executedTools }) {
  executedTools.push({ name: "get_school_attendance_analytics", input: {}, result: MOCK_SCHOOL_ANALYTICS });

  const enReport = `Principal Sir/Ma'am, here is your executive school analytics summary: Overall school attendance is 92.4% with 1,155 students present today. School pass rate is 98.4% with Class 10-A leading at 88.5% average.`;

  const hiReport = `प्रिंसिपल सर, स्कूल की कार्यकारी एनालिटिक्स रिपोर्ट: कुल स्कूल उपस्थिति 92.4% है और आज 1,155 छात्र उपस्थित हैं। स्कूल की पास दर 98.4% है और कक्षा 10-A 88.5% औसत के साथ शीर्ष पर है।`;

  return getLocalizedText({ language, en: enReport, hi: hiReport });
}
