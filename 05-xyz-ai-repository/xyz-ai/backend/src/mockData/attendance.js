// Mock In-Memory ERP Attendance Database - Pure Empty Initial State

export const CURRENT_SERVER_DATE = "2026-08-16";

// Pre-populated student attendance database (Only Rahul/Raj and Manya)
export let MOCK_ATTENDANCE_RECORDS = {
  STU1001: { studentId: "STU1001", studentName: "Rahul Kumar", overallPercentage: 94.5, daysPresent: 18, daysAbsent: 1, history: [{ date: "2026-08-16", status: "Present" }] },
  STU1002: { studentId: "STU1002", studentName: "Manya Singh", overallPercentage: 96.0, daysPresent: 19, daysAbsent: 0, history: [{ date: "2026-08-16", status: "Present" }] }
};

export function clearAttendanceRecordsForTest() {
  for (const k in MOCK_ATTENDANCE_RECORDS) delete MOCK_ATTENDANCE_RECORDS[k];
}

export let MOCK_SCHOOL_ANALYTICS = {
  overallAttendancePercentage: 92.4,
  totalStudents: 1250,
  presentToday: 1155,
  absentToday: 95,
  todaysAttendanceRate: 92.4,
  gradeBreakdown: [
    { grade: "Grade 9", attendanceRate: 93.1, totalStudents: 310 },
    { grade: "Grade 10", attendanceRate: 91.8, totalStudents: 300 },
    { grade: "Grade 11", attendanceRate: 92.9, totalStudents: 320 },
    { grade: "Grade 12", attendanceRate: 92.0, totalStudents: 320 }
  ],
  trend: "Stable (+0.4% from last month)"
};

// Devanagari digit converter
function parseDigits(str = "") {
  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  let res = str;
  devanagariDigits.forEach((d, idx) => {
    res = res.replace(new RegExp(d, 'g'), String(idx));
  });
  return res;
}

// Deterministic Date Resolver with Full Hindi & English Support
export function resolveRelativeDate(rawDateStr = "") {
  if (!rawDateStr || typeof rawDateStr !== "string") return CURRENT_SERVER_DATE;
  const str = parseDigits(rawDateStr.trim().toLowerCase());

  // 1. Direct ISO YYYY-MM-DD format check FIRST
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

  if (str === "today" || str === "aaj" || str === "आज" || str === "आज की") return CURRENT_SERVER_DATE;
  if (str === "yesterday" || str === "kal" || str === "कल" || str === "कल की") return "2026-08-15";

  // 2. Match English or Hindi month names with digits (e.g., "9 अगस्त", "9 aug", "10 august")
  const match = str.match(/(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|अगस्त|जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|सितंबर|अक्टूबर|नवंबर|दिसंबर|अग)/i) ||
                str.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|अगस्त|जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|सितंबर|अक्टूबर|नवंबर|दिसंबर|अग)\s*(\d{1,2})/i);
  
  if (match) {
    const rawNum = match[1].length <= 2 ? match[1] : match[2];
    const day = rawNum.padStart(2, "0");
    return `2026-08-${day}`;
  }

  // 3. Pure day number (e.g. "9" or "10")
  const pureNumMatch = str.match(/^\d{1,2}$/);
  if (pureNumMatch) {
    const day = pureNumMatch[0].padStart(2, "0");
    return `2026-08-${day}`;
  }

  return CURRENT_SERVER_DATE;
}

// Function to update attendance record with accurate math percentage
export function updateStudentAttendanceRecord(studentId, dateOrEntries, status, reason = "", studentName = "") {
  if (!MOCK_ATTENDANCE_RECORDS[studentId]) {
    MOCK_ATTENDANCE_RECORDS[studentId] = {
      studentId,
      studentName: studentName || (studentId === "STU1001" ? "Rahul Sharma" : "Student " + studentId),
      grade: "10-A",
      overallPercentage: 100.0,
      totalWorkingDays: 0,
      daysPresent: 0,
      daysAbsent: 0,
      recentLog: []
    };
  }

  const record = MOCK_ATTENDANCE_RECORDS[studentId];
  if (studentName) record.studentName = studentName;

  let entriesList = [];
  if (Array.isArray(dateOrEntries)) {
    entriesList = dateOrEntries;
  } else if (typeof dateOrEntries === "object" && dateOrEntries !== null && dateOrEntries.entries) {
    entriesList = dateOrEntries.entries;
  } else {
    entriesList = [{ date: dateOrEntries, status, reason }];
  }

  entriesList.forEach(entry => {
    const resolvedDate = resolveRelativeDate(entry.date);
    const entryStatus = (entry.status || "Present").charAt(0).toUpperCase() + (entry.status || "Present").slice(1).toLowerCase();

    record.recentLog = (record.recentLog || []).filter(item => item.date !== resolvedDate);

    record.recentLog.unshift({
      date: resolvedDate,
      status: entryStatus,
      reason: entry.reason || "Marked by Teacher"
    });
  });

  record.recentLog.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Recalculate present and absent totals accurately from recentLog
  const daysPresent = record.recentLog.filter(l => l.status === "Present").length;
  const daysAbsent = record.recentLog.filter(l => l.status === "Absent").length;
  const totalLogged = daysPresent + daysAbsent;

  record.daysPresent = daysPresent;
  record.daysAbsent = daysAbsent;
  record.totalWorkingDays = Math.max(totalLogged, 1);

  record.overallPercentage = totalLogged > 0
    ? Number(((daysPresent / totalLogged) * 100).toFixed(1))
    : 100.0;

  return record;
}
