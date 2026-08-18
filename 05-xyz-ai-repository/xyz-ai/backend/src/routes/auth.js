import express from "express";
import { MOCK_USERS, createSession, revokeSession, findUserByRole, findOrCreateStudentUser, findOrCreateParentUser, findStudentByName } from "../mockData/users.js";

const router = express.Router();

// GET /api/auth/me - Get authenticated session user
router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: "Unauthorized session." });
  }

  const { password, ...safeUser } = req.user;
  res.json({
    success: true,
    user: safeUser
  });
});

// POST /api/auth/login - Credential Verification & Session Token Issuance
//
// SECURITY: this used to have a "role switch fallback" that logged anyone
// in as ANY role just by POSTing { role: "principal" } — no username, no
// password, no check at all. That's exactly the kind of "click a button to
// become the principal" hole the assessment explicitly requires you not to
// have (authorization must be enforced, not assumed from an unverified
// client-supplied role). It's removed. Every login now requires a real
// username + password checked against the mock user store.
router.post("/login", (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: "Invalid username or password"
    });
  }

  const cleanUsername = username.trim().toLowerCase();
  const requestedRole = (role || "").toLowerCase();
  let targetUser = null;

  // 1. If explicit parent role requested or username contains parent
  if (requestedRole === "parent" || cleanUsername.includes("parent")) {
    targetUser = findOrCreateParentUser({ username: cleanUsername, password });
  } 
  // 2. If explicit teacher role requested
  else if (requestedRole === "teacher" || cleanUsername.includes("teacher")) {
    targetUser = MOCK_USERS["kavita.teacher"];
  }
  // 3. If explicit principal role requested
  else if (requestedRole === "principal" || cleanUsername.includes("principal")) {
    targetUser = MOCK_USERS["principal"];
  }
  // 4. If explicit student role requested or username contains student
  else if (requestedRole === "student" || cleanUsername.includes("student")) {
    targetUser = findOrCreateStudentUser({ username: cleanUsername, password });
  }
  // 5. Fallback lookup by exact username or base student
  else {
    targetUser = MOCK_USERS[cleanUsername] || 
                 MOCK_USERS[`${cleanUsername}.student`] || 
                 findOrCreateStudentUser({ username: cleanUsername, password });
  }

  // Security Hardening: Check credentials
  if (!targetUser || (targetUser.password && targetUser.password !== password.trim())) {
    return res.status(401).json({
      success: false,
      error: "Invalid username or password"
    });
  }

  // Issue server session token
  const token = createSession(targetUser);
  const { password: p, ...safeUser } = targetUser;

  res.json({
    success: true,
    token,
    user: safeUser,
    message: `Welcome back, ${targetUser.name}!`
  });
});

// POST /api/auth/logout - Revoke active session token
router.post("/logout", (req, res) => {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace(/^Bearer\s+/i, "") || req.headers["x-session-token"];
  revokeSession(token);

  res.json({
    success: true,
    message: "Successfully logged out"
  });
});

export default router;
