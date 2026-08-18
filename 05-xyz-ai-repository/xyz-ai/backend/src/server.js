// CRITICAL: this MUST be the very first import statement in the file.
// dotenv/config's side effect (loading .env into process.env) needs to run
// before ANY other imported module evaluates its own top-level code — and
// due to how ES module import hoisting works, simply calling
// `dotenv.config()` as a statement (even before other imports textually)
// is NOT enough, because ALL import statements in a file are evaluated
// before any plain statement in that file runs. The only reliable way to
// guarantee load order is to make the env-loading itself an import
// statement, and put it first.
import "dotenv/config";

import express from "express";
import cors from "cors";

import { authMiddleware } from "./middleware/auth.js";
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import erpRoutes from "./routes/erp.js";
import sttRoutes from "./routes/stt.js";
import { MOCK_ATTENDANCE_RECORDS } from "./mockData/attendance.js";
import { MOCK_MARKS_RECORDS } from "./mockData/marks.js";

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());

// Attach Session Auth Context — but NOT on /api/auth itself, since that's
// how a token is obtained in the first place. Applying auth middleware to
// the login route would make it impossible to ever log in (you'd need a
// valid token to reach the endpoint that gives you one).
app.use("/api/chat", authMiddleware);
app.use("/api/erp", authMiddleware);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/erp", erpRoutes);
app.use("/api/stt", sttRoutes);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "HEALTHY",
    service: "XYZ AI Backend",
    timestamp: new Date().toISOString(),
    attendanceStore: MOCK_ATTENDANCE_RECORDS,
    marksStore: MOCK_MARKS_RECORDS,
    whisperConfigured: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.length > 5)
  });
});

app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  XYZ AI School ERP Backend Running on Port ${PORT}`);
  console.log(`  Health Check: http://localhost:${PORT}/api/health`);
  console.log(`=================================================`);
});

export default app;
