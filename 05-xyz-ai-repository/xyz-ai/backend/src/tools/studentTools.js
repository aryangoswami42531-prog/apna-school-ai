import { registerNewStudent, findStudentByName } from "../mockData/users.js";

export const STUDENT_TOOL_DEFINITIONS = [
  {
    name: "register_student",
    description: "Register a new student into the teacher's assigned class roster dynamically.",
    input_schema: {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "Student full name or first name (e.g. 'Aryan' or 'Aryan Patel')."
        },
        className: {
          type: "string",
          description: "Assigned class (e.g. '10-A'). Defaults to teacher's class."
        }
      },
      required: ["name"]
    }
  }
];

export async function executeStudentTool(name, input, currentUser) {
  if (name === "register_student") {
    // Authorization Check: Only Teacher can register a student
    if (currentUser.role !== "teacher") {
      return { authorized: false, error: "UNAUTHORIZED_ACTION: Only Teachers can register new students." };
    }

    const className = input.className || currentUser.assignedClass || "10-A";
    const searchMatches = findStudentByName(input.name, className);

    // Collision Check: Multiple students with same name
    if (searchMatches.length > 1) {
      return {
        authorized: true,
        hasCollision: true,
        message: `Multiple students named "${input.name}" were found in class ${className}. Please specify which student or confirm if this is a new enrollment.`
      };
    }

    // Single match already exists
    if (searchMatches.length === 1) {
      const existing = searchMatches[0];
      return {
        authorized: true,
        alreadyRegistered: true,
        studentId: existing.id,
        studentName: existing.name,
        className,
        message: `Student "${existing.name}" is already registered (ID: ${existing.id}).`
      };
    }

    // Register new student
    const result = registerNewStudent({
      name: input.name,
      className,
      teacherId: currentUser.id
    });

    return {
      authorized: true,
      newlyRegistered: true,
      studentId: result.student.id,
      studentName: result.student.name,
      className,
      message: `Successfully registered new student "${result.student.name}" (ID: ${result.student.id}) into Class ${className}.`
    };
  }

  return { error: "Unknown student tool " + name };
}
