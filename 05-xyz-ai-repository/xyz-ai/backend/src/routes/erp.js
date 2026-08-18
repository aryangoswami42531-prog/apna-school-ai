import express from "express";
import { MOCK_ATTENDANCE_RECORDS } from "../mockData/attendance.js";
import { MOCK_MARKS_RECORDS } from "../mockData/marks.js";
import { MOCK_ESCALATION_QUEUE } from "../mockData/escalations.js";
import { MOCK_USERS } from "../mockData/users.js";

const router = express.Router();

router.get("/users", (req, res) => {
  const safeUsers = {};
  for (const [key, user] of Object.entries(MOCK_USERS)) {
    const { password, ...rest } = user;
    safeUsers[key] = rest;
  }
  res.json({ success: true, users: safeUsers });
});

router.get("/students", (req, res) => {
  const studentsList = [];
  for (const key in MOCK_USERS) {
    if (MOCK_USERS[key].role === "student") {
      studentsList.push(MOCK_USERS[key]);
    }
  }
  res.json({
    success: true,
    students: studentsList
  });
});

router.get("/attendance", (req, res) => {
  res.json({
    success: true,
    studentRecords: MOCK_ATTENDANCE_RECORDS
  });
});

router.get("/marks", (req, res) => {
  res.json({
    success: true,
    studentRecords: MOCK_MARKS_RECORDS
  });
});

router.get("/escalations", (req, res) => {
  res.json({
    success: true,
    totalEscalations: MOCK_ESCALATION_QUEUE.length,
    escalations: MOCK_ESCALATION_QUEUE
  });
});

export default router;
