import { processChatConversation } from "./src/services/geminiService.js";
import { MOCK_USERS, findOrCreateStudentUser, findOrCreateParentUser, registerNewStudent, findMatchingRecordForUser } from "./src/mockData/users.js";
import { MOCK_ATTENDANCE_RECORDS, updateStudentAttendanceRecord, clearAttendanceRecordsForTest } from "./src/mockData/attendance.js";
import { MOCK_MARKS_RECORDS, updateStudentMarksRecord, clearMarksRecordsForTest } from "./src/mockData/marks.js";

async function runTests() {
  console.log("==================================================");
  console.log("   RUNNING AUTOMATED XYZ AI TEST SUITE & AUDIT    ");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Initial State Check (Clear pre-populated demo records for automated test run)
  clearAttendanceRecordsForTest();
  clearMarksRecordsForTest();
  console.log("\n[TEST 1] Empty Database Verification");
  assert(Object.keys(MOCK_ATTENDANCE_RECORDS).length === 0, "MOCK_ATTENDANCE_RECORDS starts completely empty ({})");

  // 2. Attendance Math Percentage Calculation Test
  console.log("\n[TEST 2] Attendance Percentage Math Calculation Test");
  const studentId = "STU_TEST_MATH";
  
  // 1 Present entry -> Should be 100.0%
  updateStudentAttendanceRecord(studentId, "2026-08-10", "Present", "Marked", "MathTestStudent");
  assert(MOCK_ATTENDANCE_RECORDS[studentId].overallPercentage === 100.0, "1 Present entry = 100.0% overall attendance");

  // Add 2 Absent entries -> 1 Present + 2 Absent = 1/3 = 33.3%
  updateStudentAttendanceRecord(studentId, "2026-08-11", "Absent", "Sick", "MathTestStudent");
  updateStudentAttendanceRecord(studentId, "2026-08-12", "Absent", "Sick", "MathTestStudent");
  assert(MOCK_ATTENDANCE_RECORDS[studentId].overallPercentage === 33.3, "1 Present + 2 Absent entries = 33.3% overall attendance");

  // 3. Dynamic Subject & Score Marks Test
  console.log("\n[TEST 3] Dynamic Subject & Score Marks Test ('Physics', 90)");
  updateStudentMarksRecord(studentId, "Physics", 90, "MathTestStudent");
  assert(MOCK_MARKS_RECORDS[studentId].subjects.some(s => s.subject === "Physics" && s.marksObtained === 90), "Physics 90/100 score persisted in MOCK_MARKS_RECORDS");

  // 4. Dynamic Student & Parent Username Authentication Test ('x.student', 'x.parent')
  console.log("\n[TEST 4] Dynamic Student & Parent Username Authentication Test ('x.student', 'x.parent')");
  const studentUser = findOrCreateStudentUser({ username: "x.student", password: "pass123" });
  assert(studentUser && studentUser.role === "student" && studentUser.name === "X", "Dynamic Student login 'x.student' successfully creates Student account X");

  const parentUser = findOrCreateParentUser({ username: "x.parent", password: "pass123" });
  assert(parentUser && parentUser.role === "parent" && parentUser.children.length > 0, "Dynamic Parent login 'x.parent' successfully creates Parent account for X");

  // 5. BUG 1 VERIFICATION: Teacher Persona Marks Intent Authorization & Tool Scoping
  console.log("\n[TEST 5] BUG 1 Fix Verification (Teacher saying 'marks lagane hain' or 'मुझे मार्क्स लगते हैं')");
  const teacherUser = { id: "TEA3001", name: "Ms. Priya Nair", role: "teacher", assignedClass: "10-A" };
  const teacherMarksRes = await processChatConversation({
    messages: [{ role: "user", content: "मुझे मार्क्स लगते हैं" }],
    user: teacherUser,
    language: "Hindi"
  });
  assert(teacherMarksRes.mode === "MARKS_STEP_1" && teacherMarksRes.reply.includes("मार्क्स"), "Teacher prompt 'मुझे मार्क्स लगते हैं' routes to MARKS_STEP_1 (update_marks) asking for student name, NOT view_own_marks");

  // 6. BUG 2 VERIFICATION: Multi-Turn Conversation State & No Mid-Conversation Greeting Reset
  console.log("\n[TEST 6] BUG 2 Fix Verification (Multi-turn conversation thread continuity)");
  const turn1 = await processChatConversation({
    messages: [{ role: "user", content: "marks lagane hain" }],
    user: teacherUser,
    language: "English"
  });
  const turn2 = await processChatConversation({
    messages: [
      { role: "user", content: "marks lagane hain" },
      { role: "assistant", content: turn1.reply },
      { role: "user", content: "Raman" }
    ],
    user: teacherUser,
    language: "English"
  });
  const turn3 = await processChatConversation({
    messages: [
      { role: "user", content: "marks lagane hain" },
      { role: "assistant", content: turn1.reply },
      { role: "user", content: "Raman" },
      { role: "assistant", content: turn2.reply },
      { role: "user", content: "Physics" }
    ],
    user: teacherUser,
    language: "English"
  });
  const turn4 = await processChatConversation({
    messages: [
      { role: "user", content: "marks lagane hain" },
      { role: "assistant", content: turn1.reply },
      { role: "user", content: "Raman" },
      { role: "assistant", content: turn2.reply },
      { role: "user", content: "Physics" },
      { role: "assistant", content: turn3.reply },
      { role: "user", content: "95" }
    ],
    user: teacherUser,
    language: "English"
  });
  assert(turn4.mode === "MARKS_STEP_4" && turn4.reply.includes("Raman") && turn4.reply.includes("95"), "4-turn conversation completes update_marks (95 in Physics) without resetting to generic greeting");

  // 7. VERIFICATION TEST: Unusual Hindi Phrasing
  console.log("\n[TEST 7] Unusual Hindi Phrasing Comprehension ('aaj Rahul school aaya tha ki nahi bata do')");
  const hindiUnusualRes = await processChatConversation({
    messages: [{ role: "user", content: "aaj Rahul school aaya tha ki nahi bata do" }],
    user: studentUser,
    language: "Hindi"
  });
  assert(hindiUnusualRes.mode === "ATTENDANCE_QUERY", "Unusual Hindi phrasing 'aaj Rahul school aaya tha ki nahi bata do' correctly understood as attendance query");

  // 8. VERIFICATION TEST: Unusual English Indirect Phrasing
  console.log("\n[TEST 8] Unusual English Indirect Phrasing ('any idea how often I've been showing up lately?')");
  const englishUnusualRes = await processChatConversation({
    messages: [{ role: "user", content: "any idea how often I've been showing up lately?" }],
    user: studentUser,
    language: "English"
  });
  assert(englishUnusualRes.mode === "ATTENDANCE_QUERY", "Unusual English indirect phrasing 'any idea how often I've been showing up lately?' correctly understood as attendance query");

  // 9. VERIFICATION TEST: Session Binding & Exact Student ID Isolation Test (Aryan vs. Aman)
  console.log("\n[TEST 9] Session Binding & Exact Student ID Isolation Test (Aryan vs. Aman)");

  // Step 1: Register Student Aryan & Mark Attendance 100% (Present)
  const aryanReg = registerNewStudent({ name: "Aryan", className: "10-A" });
  const aryanUser = aryanReg.student;
  updateStudentAttendanceRecord(aryanUser.id, "2026-08-16", "Present", "Marked Present", "Aryan");

  // Step 2: Register Student Aman & Mark Attendance 0% (Absent)
  const amanReg = registerNewStudent({ name: "Aman", className: "10-A" });
  const amanUser = amanReg.student;
  updateStudentAttendanceRecord(amanUser.id, "2026-08-16", "Absent", "Marked Absent", "Aman");

  // Step 3: Fetch Attendance for Aryan
  const aryanRecord = findMatchingRecordForUser(MOCK_ATTENDANCE_RECORDS, aryanUser);
  console.log(`  [TEST 9 - ARYAN] Selected Student ID: ${aryanUser.id} (${aryanUser.name}) | Fetched Record ID: ${aryanRecord ? aryanRecord.studentId : 'NONE'} | Attendance: ${aryanRecord ? aryanRecord.overallPercentage : 0}%`);
  assert(aryanRecord && aryanRecord.studentId === aryanUser.id && aryanRecord.overallPercentage === 100, "Aryan (STU ID match) retrieves Aryan's exact 100% attendance");

  // Step 4: Fetch Attendance for Aman
  const amanRecord = findMatchingRecordForUser(MOCK_ATTENDANCE_RECORDS, amanUser);
  console.log(`  [TEST 9 - AMAN] Selected Student ID: ${amanUser.id} (${amanUser.name}) | Fetched Record ID: ${amanRecord ? amanRecord.studentId : 'NONE'} | Attendance: ${amanRecord ? amanRecord.overallPercentage : 0}%`);
  assert(amanRecord && amanRecord.studentId === amanUser.id && amanRecord.overallPercentage === 0, "Aman (STU ID match) retrieves Aman's exact 0% attendance");

  // Step 5: Strict Isolation Assertion
  assert(aryanRecord.studentId !== amanRecord.studentId && aryanRecord.overallPercentage !== amanRecord.overallPercentage, "Aryan and Aman session data are strictly isolated with no cross-user leakage");

  // Step 6: Cleanup Test Students so database remains clean (Only Rahul & Manya)
  delete MOCK_ATTENDANCE_RECORDS[aryanUser.id];
  delete MOCK_ATTENDANCE_RECORDS[amanUser.id];
  delete MOCK_MARKS_RECORDS[aryanUser.id];
  delete MOCK_MARKS_RECORDS[amanUser.id];

  // 10. VERIFICATION TEST: 7 Mandatory Intent Phrases for Marks vs Attendance
  console.log("\n[TEST 10] 7 Mandatory Intent Phrases Verification Test");
  
  const teacherObj = { id: "TEA3001", name: "Ms. Manya", role: "teacher", assignedClass: "10-A" };

  // Marks Test Phrases
  const m1 = await processChatConversation({ messages: [{ role: "user", content: "I want to enter marks" }], user: teacherObj, language: "English" });
  assert(m1.mode.startsWith("MARKS"), "Phrase 1: 'I want to enter marks' correctly routes to MARKS flow");

  const m2 = await processChatConversation({ messages: [{ role: "user", content: "marks lagane hain" }], user: teacherObj, language: "English" });
  assert(m2.mode.startsWith("MARKS"), "Phrase 2: 'marks lagane hain' correctly routes to MARKS flow");

  const m3 = await processChatConversation({ messages: [{ role: "user", content: "मुझे मार्क्स लगते हैं" }], user: teacherObj, language: "Hindi" });
  assert(m3.mode.startsWith("MARKS"), "Phrase 3: 'मुझे मार्क्स लगते हैं' correctly routes to MARKS flow");

  const m4 = await processChatConversation({ messages: [{ role: "user", content: "enter marks for Rahul" }], user: teacherObj, language: "English" });
  assert(m4.mode.startsWith("MARKS"), "Phrase 4: 'enter marks for Rahul' correctly routes to MARKS flow");

  // Attendance Test Phrases
  const a1 = await processChatConversation({ messages: [{ role: "user", content: "mark attendance" }], user: teacherObj, language: "English" });
  assert(a1.mode.startsWith("CONVERSATIONAL"), "Phrase 5: 'mark attendance' correctly routes to ATTENDANCE flow");

  const a2 = await processChatConversation({ messages: [{ role: "user", content: "attendance lagani hai" }], user: teacherObj, language: "Hindi" });
  assert(a2.mode.startsWith("CONVERSATIONAL"), "Phrase 6: 'attendance lagani hai' correctly routes to ATTENDANCE flow");

  const a3 = await processChatConversation({ messages: [{ role: "user", content: "Rahul is present today" }], user: teacherObj, language: "English" });
  assert(a3.mode.startsWith("CONVERSATIONAL"), "Phrase 7: 'Rahul is present today' correctly routes to ATTENDANCE flow");

  // TEST 11: Principal Persona Executive ERP Analytics Verification
  console.log("\n[TEST 11] Principal Persona Executive ERP Analytics Verification");
  const principalObj = { id: "MGT4001", name: "Dr. V. K. Mehta", role: "principal" };
  const p_att = await processChatConversation({ messages: [{ role: "user", content: "attendance" }], user: principalObj, language: "English" });
  assert(p_att.mode === "ATTENDANCE_QUERY" && p_att.reply.includes("School-wide overall attendance"), "Principal attendance query returns school-wide aggregate attendance stats");

  const p_marks = await processChatConversation({ messages: [{ role: "user", content: "marks" }], user: principalObj, language: "English" });
  assert(p_marks.mode === "MARKS_QUERY" && p_marks.reply.includes("School-wide academic average marks"), "Principal marks query returns school-wide aggregate marks stats");

  // TEST 12: Student Marks Query Verification ('Mere marks kitne hain')
  console.log("\n[TEST 12] Student Marks Query Verification ('Mere marks kitne hain')");
  const stuObj = { id: "STU1001", name: "Rahul Kumar", role: "student" };
  const s_marks = await processChatConversation({ messages: [{ role: "user", content: "Mere marks kitne hain" }], user: stuObj, language: "Hindi" });
  assert(s_marks.mode === "MARKS_QUERY" && s_marks.reply.includes("अंक"), "Student prompt 'Mere marks kitne hain' returns student's subject marks, NOT attendance");

  // TEST 13: Student Attendance Typo Query Verification ('mere atendace kitni')
  console.log("\n[TEST 13] Student Attendance Typo Query Verification ('mere atendace kitni')");
  const s_att = await processChatConversation({ messages: [{ role: "user", content: "mere atendace kitni" }], user: stuObj, language: "Hindi" });
  assert(s_att.mode === "ATTENDANCE_QUERY" && s_att.reply.includes("उपस्थिति") && !s_att.reply.includes("तारीख"), "Student prompt 'mere atendace kitni' returns overall attendance percentage, NOT marking prompt");

  // TEST 14: Dynamic Student Login Roster Match Verification
  console.log("\n[TEST 14] Dynamic Student Login Roster Match Verification");
  const regRes = registerNewStudent({ name: "Kiran" });
  const kiranLogin = findOrCreateStudentUser({ username: "kiran.student", password: "pass123" });
  assert(kiranLogin.id === regRes.student.id && kiranLogin.name === "Kiran", "Login as 'kiran.student' returns Kiran's exact registered student profile");

  // TEST 15: Parent Child Attendance Query Verification
  console.log("\n[TEST 15] Parent Child Attendance Query Verification");
  const kiranParent = findOrCreateParentUser({ username: "kiran.parent", password: "pass123" });
  const parentAtt = await processChatConversation({ messages: [{ role: "user", content: "mere bache ki attendance" }], user: kiranParent, language: "Hindi" });
  assert(parentAtt.mode === "ATTENDANCE_QUERY" && parentAtt.reply.includes("Kiran"), "Parent prompt 'mere bache ki attendance' returns Kiran's attendance stats, NOT Rahul Kumar");

  // TEST 16: Student Persona Attendance Query Isolation (Never triggers teacher marking prompt)
  console.log("\n[TEST 16] Student Persona Attendance Query Isolation (Never triggers teacher marking prompt)");
  const deepakStudent = findOrCreateStudentUser({ username: "deepak.student", password: "pass123" });
  const studentAtt = await processChatConversation({ messages: [{ role: "user", content: "Meri attendance Kitni Hai" }], user: deepakStudent, language: "Hindi" });
  assert(studentAtt.mode === "ATTENDANCE_QUERY" && studentAtt.reply.includes("आपकी कुल उपस्थिति") && !studentAtt.reply.includes("Konsi date"), "Student prompt 'Meri attendance Kitni Hai' returns personalized 'आपकी कुल उपस्थिति', NOT teacher marking question");

  console.log("\n==================================================");
  console.log(`   TEST RESULTS: ${passed} PASSED, ${failed} FAILED    `);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
