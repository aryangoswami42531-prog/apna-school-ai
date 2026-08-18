// Mock Human Escalation Call Queue

export let MOCK_ESCALATION_QUEUE = [];

export function logEscalationRequest({ userRole, userId, userName, target, reason, requestedAt }) {
  const escalationRecord = {
    id: "ESC-" + Date.now(),
    userRole,
    userId,
    userName,
    target: target || "Class Teacher (Ms. Manya)",
    reason: reason || "Parent requested phone callback / query resolution",
    status: "PENDING_CALLBACK",
    requestedAt: requestedAt || new Date().toISOString()
  };
  MOCK_ESCALATION_QUEUE.push(escalationRecord);
  return escalationRecord;
}
