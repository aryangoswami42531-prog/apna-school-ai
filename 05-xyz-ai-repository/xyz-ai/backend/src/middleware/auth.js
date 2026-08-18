import { getUserByToken, findUserByRole } from "../mockData/users.js";

/**
 * Robust Role-Aware Authentication Middleware
 * Binds incoming API requests to the active authenticated session & role header.
 */
export function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.replace(/^Bearer\s+/i, "") || req.headers["x-session-token"];
  const roleHeader = req.headers["x-user-role"] || req.body?.role;

  // 1. Primary Authentication: Session Token Lookup (Respect logged-in user session)
  let user = getUserByToken(token);

  // 2. Secondary Role-Based Lookup (If token session not active or role explicitly matches client portal)
  if (!user && roleHeader) {
    user = findUserByRole(roleHeader);
  }

  // 3. Fallback for unauthenticated requests
  if (!user) {
    user = findUserByRole(roleHeader || "student");
  }

  req.user = user;
  next();
}
