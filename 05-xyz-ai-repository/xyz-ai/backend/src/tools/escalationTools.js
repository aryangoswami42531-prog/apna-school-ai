import { logEscalationRequest } from "../mockData/escalations.js";

export const ESCALATION_TOOL_DEFINITIONS = [
  {
    name: "request_teacher_callback",
    description: "Request a callback or meeting with the class teacher or school management. MUST be preceded by explicit user confirmation.",
    input_schema: {
      type: "object",
      properties: {
        confirmedByUser: {
          type: "boolean",
          description: "Must be true. Indicates that the user explicitly confirmed they want a callback."
        },
        reason: {
          type: "string",
          description: "Reason for requesting the human escalation."
        },
        targetRole: {
          type: "string",
          enum: ["Teacher", "Management"],
          description: "Target contact role."
        }
      },
      required: ["confirmedByUser"]
    }
  }
];

export async function executeEscalationTool(name, input, currentUser) {
  if (name === "request_teacher_callback") {
    if (!input.confirmedByUser) {
      return {
        success: false,
        requiresConfirmation: true,
        message: "Escalation requires explicit user confirmation before registering request."
      };
    }

    const escalation = logEscalationRequest({
      userRole: currentUser.role,
      userId: currentUser.id,
      userName: currentUser.name,
      target: input.targetRole || "Class Teacher (Ms. Manya)",
      reason: input.reason || "User requested direct human contact"
    });

    return {
      success: true,
      escalationId: escalation.id,
      status: escalation.status,
      target: escalation.target,
      confirmationMessage: `Callback request registered successfully (Ticket #${escalation.id}). ${escalation.target} has been notified.`
    };
  }

  return { error: "Unknown escalation tool " + name };
}
