import { MOCK_ATTENDANCE_RECORDS, updateStudentAttendanceRecord, resolveRelativeDate } from "../mockData/attendance.js";
import { findStudentByName, findMatchingRecordForUser } from "../mockData/users.js";

export const ATTENDANCE_TOOL_DEFINITIONS = [
  {
    name: "get_student_attendance",
    description: "Get attendance details for the authenticated student (or linked child for a parent).",
    input_schema: {
      type: "object",
      properties: {
        studentId: {
          type: "string",
          description: "Optional ID or name of the student."
        }
      }
    }
  },
  {
    name: "get_child_attendance",
    description: "Get attendance details for a parent's child.",
    input_schema: {
      type: "object",
      properties: {
        childId: {
          type: "string",
          description: "ID of the linked child."
        }
      }
    }
  },
  {
    name: "mark_attendance",
    description: "Mark or correct past attendance for a student for single or multiple dates in one call (Teacher role only). Never guess a student name — the name must be provided.",
    input_schema: {
      type: "object",
      properties: {
        studentId: {
          type: "string",
          description: "Target student ID or student name. Required. Do not invent a default student."
        },
        studentName: {
          type: "string",
          description: "Student name if ID is unknown."
        },
        status: {
          type: "string",
          enum: ["Present", "Absent", "Late"],
          description: "Attendance status if single date."
        },
        date: {
          type: "string",
          description: "Date string (e.g. 'today', 'yesterday', '2026-08-13', '13 August')."
        },
        reason: {
          type: "string",
          description: "Reason if absent or late."
        },
        entries: {
          type: "array",
          description: "Optional array of multiple date entries for batch attendance marking/correction.",
          items: {
            type: "object",
            properties: {
              date: { type: "string", description: "Date string (e.g. 'today', '13 August')" },
              status: { type: "string", enum: ["Present", "Absent", "Late"] },
              reason: { type: "string" }
            },
            required: ["date", "status"]
          }
        }
      }
    }
  },
  {
    name: "get_school_attendance_analytics",
    description: "Get school-wide attendance metrics and analytics (Principal/Management role only).",
    input_schema: {
      type: "object",
      properties: {
        grade: {
          type: "string",
          description: "Optional specific grade filter."
        }
      }
    }
  }
];

function emptyAttendanceMessage(who = "this student") {
  return {
    authorized: true,
    empty: true,
    message: `No attendance records have been saved for ${who} yet.`
  };
}

export async function executeAttendanceTool(name, input, currentUser) {
  switch (name) {
    case "get_student_attendance": {
      if (currentUser.role === "student") {
        const record = findMatchingRecordForUser(MOCK_ATTENDANCE_RECORDS, currentUser);
        if (!record) return emptyAttendanceMessage(currentUser.name);
        return {
          authorized: true,
          studentName: record.studentName,
          overallPercentage: record.overallPercentage + "%",
          daysPresent: record.daysPresent,
          daysAbsent: record.daysAbsent,
          totalWorkingDays: record.totalWorkingDays,
          recentLog: record.recentLog
        };
      }

      if (currentUser.role === "parent") {
        const record = findMatchingRecordForUser(MOCK_ATTENDANCE_RECORDS, currentUser);
        if (!record) return emptyAttendanceMessage("your child");
        return {
          authorized: true,
          childName: record.studentName,
          overallPercentage: record.overallPercentage + "%",
          daysPresent: record.daysPresent,
          daysAbsent: record.daysAbsent,
          totalWorkingDays: record.totalWorkingDays,
          recentLog: record.recentLog
        };
      }

      if (currentUser.role === "teacher" || currentUser.role === "principal") {
        const searchName = input.studentName || input.studentId;
        let targetId = input.studentId;
        if (searchName && (!targetId || !String(targetId).startsWith("STU"))) {
          const matches = findStudentByName(searchName);
          if (matches.length === 1) targetId = matches[0].id;
        }
        const record = findMatchingRecordForUser(MOCK_ATTENDANCE_RECORDS, { id: targetId, name: searchName });
        if (!record) {
          return emptyAttendanceMessage(searchName || "the requested student");
        }
        return {
          authorized: true,
          studentName: record.studentName,
          overallPercentage: record.overallPercentage + "%",
          recentLog: record.recentLog
        };
      }

      return { error: "UNAUTHORIZED: Access denied to student attendance record." };
    }

    case "get_child_attendance": {
      if (currentUser.role !== "parent") {
        return { error: "UNAUTHORIZED: Only authenticated parents can query child attendance." };
      }
      const record = findMatchingRecordForUser(MOCK_ATTENDANCE_RECORDS, currentUser);
      if (!record) return emptyAttendanceMessage("your child");
      return {
        authorized: true,
        childName: record.studentName,
        overallPercentage: record.overallPercentage + "%",
        daysPresent: record.daysPresent,
        daysAbsent: record.daysAbsent,
        recentLog: record.recentLog
      };
    }

    case "mark_attendance": {
      if (currentUser.role !== "teacher") {
        return {
          authorized: false,
          error: "UNAUTHORIZED_ACTION: Only authorized Teachers can mark attendance."
        };
      }

      const searchName = input.studentName || input.studentId;
      if (!searchName) {
        return {
          needsStudentName: true,
          message: "A student name is required before attendance can be marked."
        };
      }

      let targetId = input.studentId;
      let studentName = input.studentName || "";

      if (!targetId || !String(targetId).startsWith("STU")) {
        const matches = findStudentByName(String(searchName));
        if (matches.length === 0) {
          const reg = registerNewStudent({ name: String(searchName), className: currentUser.assignedClass || "10-A", teacherId: currentUser.id || "TEA3001" });
          targetId = reg.student.id;
          studentName = reg.student.name;
        } else {
          targetId = matches[0].id;
          studentName = matches[0].name;
        }
      } else {
        const matches = findStudentByName(String(targetId));
        if (matches.length > 0) {
          studentName = matches[0].name;
        } else {
          studentName = searchName || `Student ${targetId}`;
        }
      }

      let entriesToProcess = [];
      if (input.entries && Array.isArray(input.entries) && input.entries.length > 0) {
        entriesToProcess = input.entries;
      } else {
        entriesToProcess = [{
          date: input.date || "today",
          status: input.status || "Present",
          reason: input.reason || ""
        }];
      }

      const updatedRecord = updateStudentAttendanceRecord(targetId, entriesToProcess, "", "", studentName);

      return {
        authorized: true,
        success: true,
        message: `Successfully updated attendance for ${updatedRecord.studentName} across ${entriesToProcess.length} date entry/entries.`,
        entriesProcessed: entriesToProcess.map((e) => ({ date: resolveRelativeDate(e.date), status: e.status })),
        updatedAttendancePercentage: updatedRecord.overallPercentage + "%",
        recentLog: updatedRecord.recentLog
      };
    }

    case "get_school_attendance_analytics": {
      if (currentUser.role !== "principal") {
        return {
          authorized: false,
          error: "UNAUTHORIZED_ACTION: Only Principal/Management role can access overall school attendance analytics. Permission denied."
        };
      }

      const keys = Object.keys(MOCK_ATTENDANCE_RECORDS);
      let sum = 0;
      keys.forEach(k => { sum += MOCK_ATTENDANCE_RECORDS[k].overallPercentage || 90; });
      const avg = keys.length > 0 ? Number((sum / keys.length).toFixed(1)) : 92.4;

      return {
        authorized: true,
        overallAttendancePercentage: avg + "%"
      };
    }

    default:
      return { error: "Unknown attendance tool " + name };
  }
}
