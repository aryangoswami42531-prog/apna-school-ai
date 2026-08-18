// Pre-populated student marks database (Only Rahul/Raj and Manya)
export let MOCK_MARKS_RECORDS = {
  STU1001: {
    studentId: "STU1001",
    studentName: "Rahul Kumar",
    grade: "10-A",
    overallPercentage: 88.75,
    subjects: [
      { subject: "Mathematics", marksObtained: 88, maxMarks: 100, letterGrade: "A" },
      { subject: "Physics", marksObtained: 85, maxMarks: 100, letterGrade: "A" },
      { subject: "Chemistry", marksObtained: 90, maxMarks: 100, letterGrade: "A+" },
      { subject: "English", marksObtained: 92, maxMarks: 100, letterGrade: "A+" }
    ]
  },
  STU1002: {
    studentId: "STU1002",
    studentName: "Manya Singh",
    grade: "10-A",
    overallPercentage: 94.25,
    subjects: [
      { subject: "Mathematics", marksObtained: 96, maxMarks: 100, letterGrade: "A+" },
      { subject: "Physics", marksObtained: 92, maxMarks: 100, letterGrade: "A+" },
      { subject: "Chemistry", marksObtained: 94, maxMarks: 100, letterGrade: "A+" },
      { subject: "English", marksObtained: 95, maxMarks: 100, letterGrade: "A+" }
    ]
  }
};

export function clearMarksRecordsForTest() {
  for (const k in MOCK_MARKS_RECORDS) delete MOCK_MARKS_RECORDS[k];
}

export function computeSchoolMarksAnalytics() {
  const records = Object.values(MOCK_MARKS_RECORDS);
  if (records.length === 0) {
    return {
      overallSchoolAverage: 0,
      totalStudentsEvaluated: 0,
      passRatePercentage: 0,
      topPerformingGrade: "No marks entered yet",
      subjectAverages: [],
      gradeComparison: []
    };
  }

  const percSum = records.reduce((sum, rec) => sum + (rec.overallPercentage || 0), 0);
  const passed = records.filter((rec) => (rec.overallPercentage || 0) >= 33).length;
  const subjectMap = {};

  records.forEach((rec) => {
    (rec.subjects || []).forEach((sub) => {
      if (!subjectMap[sub.subject]) subjectMap[sub.subject] = { total: 0, count: 0, highest: 0 };
      subjectMap[sub.subject].total += sub.marksObtained;
      subjectMap[sub.subject].count += 1;
      subjectMap[sub.subject].highest = Math.max(subjectMap[sub.subject].highest, sub.marksObtained);
    });
  });

  return {
    overallSchoolAverage: Number((percSum / records.length).toFixed(1)),
    totalStudentsEvaluated: records.length,
    passRatePercentage: Number(((passed / records.length) * 100).toFixed(1)),
    topPerformingGrade: "Class 10-A",
    subjectAverages: Object.entries(subjectMap).map(([subject, stats]) => ({
      subject,
      averagePercentage: Number((stats.total / stats.count).toFixed(1)),
      highestScore: stats.highest
    })),
    gradeComparison: [
      { grade: "Class 10-A", averageMarks: Number((percSum / records.length).toFixed(1)) }
    ]
  };
}

export function updateStudentMarksRecord(studentId, subjectName, newMarks, studentName = "") {
  if (!MOCK_MARKS_RECORDS[studentId]) {
    MOCK_MARKS_RECORDS[studentId] = {
      studentId,
      studentName: studentName || "Student",
      grade: "10-A",
      examName: "Live Class Assessment",
      overallPercentage: Number(newMarks),
      gpa: "—",
      subjects: []
    };
  }

  const record = MOCK_MARKS_RECORDS[studentId];
  if (studentName) record.studentName = studentName;

  const targetSub = record.subjects.find(
    (s) => s.subject.toLowerCase() === String(subjectName).toLowerCase()
  );

  const numMarks = Number(newMarks);
  const letterGrade = numMarks >= 90 ? "A+" : numMarks >= 80 ? "A" : numMarks >= 70 ? "B" : "C";

  if (targetSub) {
    targetSub.marksObtained = numMarks;
    targetSub.letterGrade = letterGrade;
  } else {
    record.subjects.push({
      subject: subjectName,
      marksObtained: numMarks,
      maxMarks: 100,
      letterGrade,
      remarks: "Updated by Teacher"
    });
  }

  const total = record.subjects.reduce((sum, s) => sum + s.marksObtained, 0);
  record.overallPercentage = Number((total / record.subjects.length).toFixed(1));
  return record;
}
