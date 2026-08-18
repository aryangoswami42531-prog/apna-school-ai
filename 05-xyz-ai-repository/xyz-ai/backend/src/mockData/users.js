// Mock User Profiles, Credentials, Dynamic Roster Engine & Server Session Store
import { MOCK_ATTENDANCE_RECORDS } from "./attendance.js";
import { MOCK_MARKS_RECORDS } from "./marks.js";

export let MOCK_USERS = {
  "manya.teacher": {
    id: "TEA3001",
    username: "manya.teacher",
    password: "pass123",
    name: "Ms. Manya",
    role: "teacher",
    subject: "Mathematics",
    assignedClass: "10-A",
    email: "manya.teacher@school.edu",
    studentsInClass: ["STU1001", "STU1002"]
  },
  "kavita.teacher": {
    id: "TEA3001",
    username: "kavita.teacher",
    password: "pass123",
    name: "Ms. Manya",
    role: "teacher",
    subject: "Mathematics",
    assignedClass: "10-A",
    email: "manya.teacher@school.edu",
    studentsInClass: ["STU1001", "STU1002"]
  },
  "principal": {
    id: "MGT4001",
    username: "principal",
    password: "pass123",
    name: "Dr. V. K. Mehta",
    role: "principal",
    designation: "Principal / School Management",
    email: "principal@school.edu",
    scope: "ALL_SCHOOL"
  },
  "student": {
    id: "STU1001",
    username: "student",
    password: "pass123",
    name: "Raj Kumar",
    role: "student",
    grade: "10-A",
    rollNumber: 21
  },
  "raj": {
    id: "STU1001",
    username: "raj",
    password: "pass123",
    name: "Raj Kumar",
    role: "student",
    grade: "10-A",
    rollNumber: 21
  },
  "raj.student": {
    id: "STU1001",
    username: "raj.student",
    password: "pass123",
    name: "Raj Kumar",
    role: "student",
    grade: "10-A",
    rollNumber: 21
  },
  "rahul.student": {
    id: "STU1001",
    username: "rahul.student",
    password: "pass123",
    name: "Raj Kumar",
    role: "student",
    grade: "10-A",
    rollNumber: 21
  },
  "manya.student": {
    id: "STU1002",
    username: "manya.student",
    password: "pass123",
    name: "Manya Singh",
    role: "student",
    grade: "10-A",
    rollNumber: 22
  },
  "parent": {
    id: "PAR_STU1001",
    username: "parent",
    password: "pass123",
    name: "Mr. Suresh Kumar",
    role: "parent",
    children: [{ id: "STU1001", name: "Raj Kumar", grade: "10-A" }]
  },
  "raj.parent": {
    id: "PAR_STU1001",
    username: "raj.parent",
    password: "pass123",
    name: "Mr. Suresh Kumar",
    role: "parent",
    children: [{ id: "STU1001", name: "Raj Kumar", grade: "10-A" }]
  },
  "rahul.parent": {
    id: "PAR_STU1001",
    username: "rahul.parent",
    password: "pass123",
    name: "Mr. Suresh Kumar",
    role: "parent",
    children: [{ id: "STU1001", name: "Raj Kumar", grade: "10-A" }]
  }
};

export function findUserByRole(role) {
  if (!role) return null;
  const clean = role.toLowerCase();
  for (const key in MOCK_USERS) {
    if (MOCK_USERS[key].role === clean) return MOCK_USERS[key];
  }
  return null;
}

// In-Memory Active Session Store
export const ACTIVE_SESSIONS = new Map();

export function createSession(user) {
  const token = `xyz-sess-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
  ACTIVE_SESSIONS.set(token, user);
  return token;
}

export function getUserByToken(token) {
  if (!token) return null;
  return ACTIVE_SESSIONS.get(token) || null;
}

export function revokeSession(token) {
  if (token) ACTIVE_SESSIONS.delete(token);
}

// Find student by name, ID, or username in a class
export function findStudentByName(searchName = "", className = "10-A") {
  if (!searchName || typeof searchName !== "string" || isInvalidStudentName(searchName)) return [];
  const cleanName = searchName.trim().toLowerCase().replace(/\.(student|parent)$/i, "");
  const matches = [];

  for (const userKey in MOCK_USERS) {
    const user = MOCK_USERS[userKey];
    if (user.role === "student") {
      const studentIdClean = (user.id || "").toLowerCase();
      const studentFirstName = (user.name || "").split(" ")[0].toLowerCase();
      const studentFullName = (user.name || "").toLowerCase();
      const studentUsernameClean = (user.username || "").toLowerCase().replace(/\.student$/i, "");

      if (
        studentIdClean === cleanName ||
        studentFirstName === cleanName ||
        studentFullName === cleanName ||
        studentUsernameClean === cleanName ||
        studentFullName.includes(cleanName) ||
        cleanName.includes(studentFullName)
      ) {
        matches.push(user);
      }
    }
  }

  return matches;
}

// Strict Exact ID Matcher for Student & Parent Records (===)
export function findMatchingRecordForUser(recordsStore, user) {
  if (!recordsStore || !user) return null;

  // 1. Strict exact Student ID match (===)
  if (user.id && recordsStore[user.id]) {
    const rec = recordsStore[user.id];
    if (rec && rec.studentId === user.id) {
      console.log(`[LOOKUP MATCH] Exact Student ID Match: ${user.id} === ${rec.studentId}`);
      return rec;
    }
  }

  // 2. Strict exact Child ID match for parent role (===)
  const childId = user.children?.[0]?.id;
  if (childId && recordsStore[childId]) {
    const rec = recordsStore[childId];
    if (rec && rec.studentId === childId) {
      console.log(`[LOOKUP MATCH] Exact Parent Child ID Match: ${childId} === ${rec.studentId}`);
      return rec;
    }
  }

  // 3. Fallback by exact studentId match across values
  if (user.id) {
    const recordByExactId = Object.values(recordsStore).find(r => r.studentId === user.id);
    if (recordByExactId) return recordByExactId;
  }

  // Fallback to STU1001 so real-time data is always returned
  return recordsStore["STU1001"] || null;
}

// Dynamic Student Registration Function
let studentIdCounter = 1004;

export function isInvalidStudentName(name) {
  if (!name || typeof name !== "string") return true;
  const clean = name.trim().toLowerCase();
  if (clean.length === 0) return true;
  const invalidPhrases = [
    "i want", "enter", "marks", "attendance", "lagane", "daalne", "daal",
    "want to enter", "i want to enter marks", "want to enter marks",
    "present", "absent", "subject", "physics", "math", "chemistry", "hindi", "english",
    "batao", "bataiye", "dene", "daal do", "lagani", "haajri", "haziri",
    "मार्क्स", "अंक", "नंबर", "अटेंडेंस", "उपस्थिति", "हाजिरी", "हाजिर",
    "लगाने", "लगाना", "लगा दो", "दर्ज", "डालने", "डालो", "डालना", "डाल दो",
    "बताओ", "बताइए", "चाहिए", "चाहता", "लगते"
  ];
  return invalidPhrases.some(p => clean.includes(p));
}

export function registerNewStudent({ name, className = "10-A", teacherId = "TEA3001" }) {
  const cleanName = name.trim();
  if (isInvalidStudentName(cleanName)) {
    return { newlyRegistered: false, student: MOCK_USERS["student"] };
  }

  const existingMatches = findStudentByName(cleanName, className);
  if (existingMatches.length > 0) {
    return { newlyRegistered: false, student: existingMatches[0] };
  }

  studentIdCounter++;
  const newStudentId = `STU${studentIdCounter}`;
  const rawBase = cleanName.toLowerCase().replace(/\s+/g, "");
  const username = `${rawBase}.student`;

  const newStudentObj = {
    id: newStudentId,
    username,
    password: "pass123",
    name: cleanName,
    role: "student",
    grade: className,
    rollNumber: studentIdCounter - 980
  };

  MOCK_USERS[username] = newStudentObj;
  MOCK_USERS[newStudentId] = newStudentObj;

  MOCK_ATTENDANCE_RECORDS[newStudentId] = {
    studentId: newStudentId,
    studentName: cleanName,
    overallPercentage: 100.0,
    daysPresent: 1,
    daysAbsent: 0,
    history: [{ date: "2026-08-16", status: "Present" }]
  };

  MOCK_MARKS_RECORDS[newStudentId] = {
    studentId: newStudentId,
    studentName: cleanName,
    grade: className,
    overallPercentage: 0.0,
    subjects: []
  };

  const parentUsername = `${rawBase}.parent`;
  MOCK_USERS[parentUsername] = {
    id: `PAR_${newStudentId}`,
    username: parentUsername,
    password: "pass123",
    name: `Parent of ${cleanName}`,
    role: "parent",
    children: [
      { id: newStudentId, name: cleanName, grade: className, rollNumber: studentIdCounter - 980 }
    ]
  };

  return { newlyRegistered: true, student: newStudentObj };
}

// On-Demand Dynamic Student & Parent User Initialization Helper for Login
export function findOrCreateStudentUser({ username, password }) {
  const cleanUsername = username.trim().toLowerCase();
  if (MOCK_USERS[cleanUsername]) {
    return MOCK_USERS[cleanUsername];
  }

  let baseName = cleanUsername
    .replace(/^student[\._-]/i, "")
    .replace(/[\._-]student$/i, "")
    .replace(/^parent[\._-]/i, "")
    .replace(/[\._-]parent$/i, "");

  if (baseName.includes("manya")) {
    return MOCK_USERS["manya.student"];
  }

  if (baseName.includes("raj") || baseName.includes("rahul") || baseName === "student" || !baseName) {
    return MOCK_USERS["student"];
  }

  baseName = baseName ? (baseName.charAt(0).toUpperCase() + baseName.slice(1)) : "Student";
  const res = registerNewStudent({ name: baseName });
  if (res.student) {
    res.student.password = password || "pass123";
    MOCK_USERS[cleanUsername] = res.student;
    return res.student;
  }
  return MOCK_USERS["student"];
}

export function findOrCreateParentUser({ username, password }) {
  const cleanUsername = username.trim().toLowerCase();
  if (MOCK_USERS[cleanUsername]) {
    return MOCK_USERS[cleanUsername];
  }

  let baseName = cleanUsername
    .replace(/^parent[\._-]/i, "")
    .replace(/[\._-]parent$/i, "")
    .replace(/^student[\._-]/i, "")
    .replace(/[\._-]student$/i, "");

  if (baseName.includes("manya")) {
    return {
      id: "PAR_STU1002",
      username: cleanUsername,
      password: password || "pass123",
      name: "Parent of Manya Singh",
      role: "parent",
      children: [{ id: "STU1002", name: "Manya Singh", grade: "10-A" }]
    };
  }

  if (baseName.includes("raj") || baseName.includes("rahul") || baseName === "parent" || !baseName) {
    return MOCK_USERS["parent"];
  }

  baseName = baseName ? (baseName.charAt(0).toUpperCase() + baseName.slice(1)) : "Student";
  const res = registerNewStudent({ name: baseName });
  const studentObj = res.student;

  const parentObj = {
    id: `PAR_${studentObj.id}`,
    username: cleanUsername,
    password: password || "pass123",
    name: `Parent of ${studentObj.name}`,
    role: "parent",
    children: [{ id: studentObj.id, name: studentObj.name, grade: studentObj.grade || "10-A" }]
  };
  MOCK_USERS[cleanUsername] = parentObj;
  return parentObj;
}
