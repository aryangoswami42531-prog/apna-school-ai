import React, { useState, useEffect } from "react";
import { GraduationCap, Award, Calendar, BookOpen, Bot, RefreshCw, CheckCircle, XCircle, ShieldAlert, ArrowRight } from "lucide-react";
import HumanEscalationModal from "../HumanEscalationModal.jsx";
import { formatStudentNameInEnglish } from "../../utils/nameUtils.js";

export default function StudentDashboard({ user, onLaunchChat, activeSidebarTab = "attendance", refreshTrigger }) {
  const [attendanceData, setAttendanceData] = useState(null);
  const [marksData, setMarksData] = useState(null);
  const [escalationState, setEscalationState] = useState({ isOpen: false, type: "teacher" });

  const findMatchingStudentRecord = (studentRecords) => {
    if (!studentRecords || !user || !user.id) return null;
    const targetRecord = studentRecords[user.id];
    if (targetRecord && targetRecord.studentId === user.id) {
      console.log(`[FRONTEND MATCH] Exact Student ID Match: ${user.id} === ${targetRecord.studentId}`);
      return targetRecord;
    }
    const matchedByValue = Object.values(studentRecords).find(r => r.studentId === user.id);
    if (matchedByValue) {
      console.log(`[FRONTEND MATCH] Exact Value Student ID Match: ${user.id} === ${matchedByValue.studentId}`);
      return matchedByValue;
    }
    console.log(`[FRONTEND MISMATCH] No record found for Student ID === ${user.id}`);
    return null;
  };

  const fetchLiveMetrics = () => {
    setAttendanceData(null);
    setMarksData(null);

    const token = localStorage.getItem("xyz_session_token") || "";
    const headers = {
      "x-user-role": "student",
      "Authorization": token ? `Bearer ${token}` : ""
    };

    console.log(`[STUDENT DASHBOARD FETCH] Initiating fetch for Student ID: ${user.id} (${user.name})`);

    fetch("/api/erp/attendance", { headers })
      .then(res => res.json())
      .then(data => {
        if (data.studentRecords) {
          const matched = findMatchingStudentRecord(data.studentRecords);
          console.log(`[STUDENT DASHBOARD ATTENDANCE] User ID: ${user.id} | Fetched Record ID: ${matched ? matched.studentId : 'NONE'}`);
          setAttendanceData(matched);
        }
      })
      .catch(() => {});

    fetch("/api/erp/marks", { headers })
      .then(res => res.json())
      .then(data => {
        if (data.studentRecords) {
          const matched = findMatchingStudentRecord(data.studentRecords);
          console.log(`[STUDENT DASHBOARD MARKS] User ID: ${user.id} | Fetched Record ID: ${matched ? matched.studentId : 'NONE'}`);
          setMarksData(matched);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, [refreshTrigger, user]);

  const subjectsList = marksData?.subjects || [];
  const displayName = formatStudentNameInEnglish(user.name);
  const showAttendance = activeSidebarTab === "attendance" || activeSidebarTab === "analytics" || activeSidebarTab === "dashboard";
  const showMarks = activeSidebarTab === "marks" || activeSidebarTab === "analytics" || activeSidebarTab === "dashboard";

  return (
    <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: "28px", background: "linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(79, 70, 229, 0.15))", border: "1px solid rgba(0, 242, 254, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#00f2fe", fontWeight: "700", letterSpacing: "1px" }}>STUDENT ERP DASHBOARD</span>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "700", marginTop: "4px", color: "#f8fafc" }}>Welcome back, {displayName}!</h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>Grade {user.grade || "10-A"} | Student ID #{user.id || "STU1001"}</p>
          </div>
          <button
            onClick={() => onLaunchChat("What is my attendance?")}
            style={{ background: "linear-gradient(135deg, #00f2fe, #4facfe)", color: "#05070f", border: "none", padding: "12px 22px", borderRadius: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 20px rgba(0, 242, 254, 0.4)" }}
          >
            <Bot size={20} /> Ask XYZ AI Assistant
          </button>
        </div>
      </div>

      {/* 3D "IF NOT SATISFIED WITH XYZ AI RESPONSE, CLICK HERE" ESCALATION PANEL */}
      <div className="glass-panel" style={{ padding: "20px 24px", background: "rgba(13, 17, 29, 0.8)", border: "1px solid rgba(0, 242, 254, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <ShieldAlert size={26} style={{ color: "#00f2fe" }} />
            <div>
              <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#f8fafc" }}>If not satisfied with XYZ AI response?</h4>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: "2px" }}>Connect directly with Class Teacher Ms. Priya Nair for human assistance</p>
            </div>
          </div>

          <button
            onClick={() => setEscalationState({ isOpen: true, type: "teacher" })}
            style={{
              background: "linear-gradient(135deg, #00f2fe, #4facfe)",
              color: "#05070f",
              border: "none",
              padding: "10px 22px",
              borderRadius: "14px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 4px 20px rgba(0, 242, 254, 0.4)"
            }}
          >
            <span>Click Here</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* DEDICATED SECTION 1: DATE-WISE ATTENDANCE TABLE */}
      {showAttendance && (
        <div className="glass-panel" style={{ padding: "28px", borderLeft: "5px solid #00f2fe" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#00f2fe", display: "flex", alignItems: "center", gap: "10px" }}>
                <Calendar size={22} /> Date-by-Date Attendance Log Table ({displayName})
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>Complete historical list of recorded attendance dates</p>
            </div>
            <button onClick={fetchLiveMetrics} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)", color: "var(--text-muted)", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {attendanceData ? (
            <div>
              <div style={{ display: "flex", gap: "24px", marginBottom: "20px", background: "rgba(13, 17, 29, 0.6)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-glass)" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>OVERALL ATTENDANCE</span>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: "#00f2fe" }}>{attendanceData.overallPercentage}%</div>
                </div>
                <div style={{ borderLeft: "1px solid var(--border-glass)", paddingLeft: "24px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>DAYS PRESENT</span>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: "#34d399" }}>{attendanceData.daysPresent} Days</div>
                </div>
                <div style={{ borderLeft: "1px solid var(--border-glass)", paddingLeft: "24px" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>DAYS ABSENT</span>
                  <div style={{ fontSize: "2rem", fontWeight: "700", color: "#f87171" }}>{attendanceData.daysAbsent} Days</div>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Attendance Status</th>
                    <th>Reason / Details</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.recentLog && attendanceData.recentLog.length > 0 ? (
                    attendanceData.recentLog.map((log, idx) => (
                      <tr key={idx}>
                        <td><strong style={{ color: "#f8fafc" }}>{log.date}</strong></td>
                        <td>
                          <span style={{
                            background: log.status === "Absent" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                            color: log.status === "Absent" ? "#f87171" : "#34d399",
                            border: `1px solid ${log.status === "Absent" ? "rgba(239, 68, 68, 0.3)" : "rgba(16, 185, 129, 0.3)"}`,
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontWeight: "700",
                            fontSize: "0.8rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px"
                          }}>
                            {log.status === "Absent" ? <XCircle size={14} /> : <CheckCircle size={14} />}
                            {log.status}
                          </span>
                        </td>
                        <td style={{ color: "var(--text-muted)" }}>{log.reason || "Marked via Chat"}</td>
                        <td style={{ color: "#34d399" }}>✓ ERP Verified</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" style={{ textAlign: "center", color: "var(--text-muted)" }}>No date entries logged yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem", background: "rgba(13, 17, 29, 0.4)", borderRadius: "12px", border: "1px dashed var(--border-glass)" }}>
              No attendance records registered in database yet. Ask teacher to mark attendance via chat!
            </div>
          )}
        </div>
      )}

      {/* DEDICATED SECTION 2: SUBJECT MARKS TABLE */}
      {showMarks && (
        <div className="glass-panel" style={{ padding: "28px", borderLeft: "5px solid #818cf8" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#818cf8", display: "flex", alignItems: "center", gap: "10px" }}>
                <Award size={22} /> Subject Marks & Scores Table ({displayName})
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>Academic evaluation results per subject</p>
            </div>
            <button onClick={fetchLiveMetrics} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)", color: "var(--text-muted)", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <RefreshCw size={14} /> Refresh Marks
            </button>
          </div>

          {subjectsList.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Subject Name</th>
                  <th>Score Obtained</th>
                  <th>Max Score</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjectsList.map((sub, idx) => (
                  <tr key={idx}>
                    <td><strong style={{ color: "#f8fafc" }}>{sub.subject}</strong></td>
                    <td style={{ color: "#60a5fa", fontWeight: "700" }}>{sub.marksObtained}</td>
                    <td>{sub.maxMarks || 100}</td>
                    <td><span style={{ background: "rgba(99, 102, 241, 0.15)", color: "#a5b4fc", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>{sub.letterGrade}</span></td>
                    <td style={{ color: "#34d399" }}>✓ Evaluated</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "30px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem", background: "rgba(13, 17, 29, 0.4)", borderRadius: "12px", border: "1px dashed var(--border-glass)" }}>
              No academic subject marks entered in database yet.
            </div>
          )}
        </div>
      )}

      {/* Sleek 3D Running Tiger Escalation Modal */}
      <HumanEscalationModal
        isOpen={escalationState.isOpen}
        type={escalationState.type}
        user={user}
        language="English"
        onClose={() => setEscalationState({ isOpen: false, type: "teacher" })}
      />
    </div>
  );
}
