import { MOCK_MARKS_RECORDS, updateStudentMarksRecord } from "../mockData/marks.js";
import { findStudentByName, findMatchingRecordForUser } from "../mockData/users.js";

export const MARKS_TOOL_DEFINITIONS = [
  {
    name: "view_own_marks",
    description: "Get academic marks and subject grades for the authenticated student.",
    input_schema: {
      type: "object",
      properties: {
        subject: {
          type: "string",
          description: "Optional specific subject filter (e.g. 'Mathematics', 'Physics')."
        }
      }
    }
  },
  {
    name: "view_child_marks",
    description: "Get academic marks and subject grades for a parent's child.",
    input_schema: {
      type: "object",
      properties: {
        childId: {
          type: "string",
          description: "ID of the child (e.g. STU1001)."
        },
        subject: {
          type: "string",
          description: "Optional specific subject filter."
        }
      }
    }
  },
  {
    name: "view_class_marks",
    description: "View marks summary for students in a teacher's assigned class.",
    input_schema: {
      type: "object",
      properties: {
        studentId: {
          type: "string",
          description: "Optional student ID or name (e.g. 'STU1001' or 'Aryan')."
        }
      }
    }
  },
  {
    name: "update_marks",
    description: "Update or correct student marks for a subject (Teacher role only).",
    input_schema: {
      type: "object",
      properties: {
        studentId: {
          type: "string",
          description: "Target student ID or name (e.g. 'STU1001' or 'Aryan')."
        },
        studentName: {
          type: "string",
          description: "Optional student name if ID is unknown."
        },
        subject: {
          type: "string",
          description: "Subject name (e.g. Mathematics)."
        },
        newMarks: {
          type: "number",
          description: "New marks score (0 to 100)."
        }
      },
      required: ["subject", "newMarks"]
    }
  },
  {
    name: "view_school_marks_analytics",
    description: "View overall school marks analytics and subject averages (Principal/Management role only).",
    input_schema: {
      type: "object",
      properties: {
        subject: {
          type: "string",
          description: "Optional subject filter."
        }
      }
    }
  }
];

export async function executeMarksTool(name, input, currentUser) {
  switch (name) {
    case "view_own_marks": {
      if (currentUser.role !== "student") {
        return { authorized: false, error: "UNAUTHORIZED_ACTION: Only authenticated Students can call view_own_marks." };
      }

      const record = findMatchingRecordForUser(MOCK_MARKS_RECORDS, currentUser);
      if (!record) return { authorized: true, message: "No marks entered yet." };

      if (input.subject) {
        const sub = record.subjects.find(s => s.subject.toLowerCase() === input.subject.toLowerCase());
        if (!sub) return { authorized: true, message: `No marks recorded for ${input.subject}` };
        return {
          authorized: true,
          studentName: record.studentName,
          subject: sub.subject,
          marksObtained: sub.marksObtained,
          maxMarks: sub.maxMarks,
          letterGrade: sub.letterGrade
        };
      }

      return {
        authorized: true,
        studentName: record.studentName,
        overallPercentage: record.overallPercentage + "%",
        gpa: record.gpa,
        subjects: record.subjects
      };
    }

    case "view_child_marks": {
      if (currentUser.role !== "parent") {
        return { authorized: false, error: "UNAUTHORIZED_ACTION: Only authenticated Parents can view child marks." };
      }

      const record = findMatchingRecordForUser(MOCK_MARKS_RECORDS, currentUser);
      if (!record) return { authorized: true, message: "No child marks recorded yet." };
      return {
        authorized: true,
        childName: record.studentName,
        overallPercentage: record.overallPercentage + "%",
        gpa: record.gpa,
        subjects: record.subjects
      };
    }

    case "view_class_marks": {
      if (currentUser.role !== "teacher") {
        return { authorized: false, error: "UNAUTHORIZED_ACTION: Only Teachers can access class marks." };
      }

      let targetId = input.studentId;
      const record = MOCK_MARKS_RECORDS[targetId];
      if (!record) return { authorized: true, message: "No marks recorded." };
      return {
        authorized: true,
        studentName: record.studentName,
        overallPercentage: record.overallPercentage + "%",
        subjects: record.subjects
      };
    }

    case "update_marks": {
      if (currentUser.role !== "teacher") {
        return { authorized: false, error: "UNAUTHORIZED_ACTION: Only Teachers can update marks." };
      }

      let targetId = input.studentId;
      const searchName = input.studentName || input.studentId;
      let studentName = input.studentName || "";

      if (searchName && (!targetId || !String(targetId).startsWith("STU"))) {
        const matches = findStudentByName(searchName, currentUser.assignedClass || "10-A");
        if (matches.length === 0) {
          const reg = registerNewStudent({ name: String(searchName), className: currentUser.assignedClass || "10-A", teacherId: currentUser.id || "TEA3001" });
          targetId = reg.student.id;
          studentName = reg.student.name;
        } else {
          targetId = matches[0].id;
          studentName = matches[0].name;
        }
      }

      targetId = targetId || "STU1005";
      if (!studentName) studentName = searchName || "Student " + targetId;

      const updated = updateStudentMarksRecord(targetId, input.subject, input.newMarks, studentName);
      return {
        authorized: true,
        success: true,
        message: `Successfully updated ${updated.studentName}'s ${input.subject} marks score to ${input.newMarks}/100.`,
        updatedOverallPercentage: updated.overallPercentage + "%",
        subjects: updated.subjects
      };
    }

    case "view_school_marks_analytics": {
      if (currentUser.role !== "principal") {
        return { authorized: false, error: "UNAUTHORIZED_ACTION: Only Principal/Management can access school-wide marks analytics. Permission denied." };
      }

      const keys = Object.keys(MOCK_MARKS_RECORDS);
      let sum = 0;
      keys.forEach(k => { sum += MOCK_MARKS_RECORDS[k].overallPercentage || 85; });
      const avg = keys.length > 0 ? Number((sum / keys.length).toFixed(1)) : 86.5;

      return {
        authorized: true,
        overallSchoolAverage: avg + "%",
        passRatePercentage: "98.4%"
      };
    }

    default:
      return { error: "Unknown marks tool " + name };
  }
}
