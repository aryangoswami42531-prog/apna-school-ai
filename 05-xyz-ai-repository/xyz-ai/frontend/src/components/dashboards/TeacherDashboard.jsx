import React, { useState, useEffect } from "react";
import { UserCheck, Award, Calendar, PlusCircle, Bot, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { formatStudentNameInEnglish } from "../../utils/nameUtils.js";

export default function TeacherDashboard({ user, onLaunchChat, activeSidebarTab = "attendance", refreshTrigger }) {
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [marksRecords, setMarksRecords] = useState({});

  const fetchLiveMetrics = () => {
    const token = localStorage.getItem("xyz_session_token") || "";
    const headers = {
      "x-user-role": "teacher",
      "Authorization": token ? `Bearer ${token}` : ""
    };

    fetch("/api/erp/attendance", { headers })
      .then(res => res.json())
      .then(data => {
        if (data.studentRecords) {
          setAttendanceRecords(data.studentRecords);
        }
      })
      .catch(() => {});

    fetch("/api/erp/marks", { headers })
      .then(res => res.json())
      .then(data => {
        if (data.studentRecords) {
          setMarksRecords(data.studentRecords);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, [refreshTrigger]);

  const attendanceStudentKeys = Object.keys(attendanceRecords);
  const marksStudentKeys = Object.keys(marksRecords);
  const showAttendance = activeSidebarTab === "attendance" || activeSidebarTab === "analytics" || activeSidebarTab === "dashboard";
  const showMarks = activeSidebarTab === "marks" || activeSidebarTab === "analytics" || activeSidebarTab === "dashboard";

  return (
    <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: "28px", background: "linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(79, 70, 229, 0.15))", border: "1px solid rgba(0, 242, 254, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#00f2fe", fontWeight: "700", letterSpacing: "1px" }}>TEACHER ERP DASHBOARD</span>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "700", marginTop: "4px", color: "#f8fafc" }}>Welcome, {user.name}</h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>Class Teacher: {user.assignedClass || "10-A"} | Subject: {user.subject || "Mathematics"}</p>
          </div>
          
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => onLaunchChat("attendance lagani hai")}
              style={{ background: "linear-gradient(135deg, #00f2fe, #4facfe)", color: "#05070f", border: "none", padding: "12px 20px", borderRadius: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 18px rgba(0, 242, 254, 0.4)" }}
            >
              <Bot size={20} /> Mark Attendance via XYZ AI
            </button>

            <button
              onClick={() => onLaunchChat("marks daalne hain")}
              style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 18px rgba(99, 102, 241, 0.4)" }}
            >
              <Award size={20} /> Enter Marks via XYZ AI
            </button>
          </div>
        </div>
      </div>

      {/* DEDICATED PANEL 1: CLASS ATTENDANCE ROSTER & DATE LOG TABLE */}
      {showAttendance && (
        <div className="glass-panel" style={{ padding: "28px", borderLeft: "5px solid #00f2fe" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#00f2fe", display: "flex", alignItems: "center", gap: "10px" }}>
                <Calendar size={22} /> Class Attendance Roster & Date Log Table (Class {user.assignedClass || "10-A"})
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>Dynamic student list and date-wise presence records</p>
            </div>
            <button onClick={fetchLiveMetrics} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)", color: "var(--text-muted)", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <RefreshCw size={14} /> Refresh Roster
            </button>
          </div>

          {attendanceStudentKeys.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Overall Attendance</th>
                  <th>Recent Logged Dates</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {attendanceStudentKeys.map(key => {
                  const rec = attendanceRecords[key];
                  const englishName = formatStudentNameInEnglish(rec.studentName);
                  return (
                    <tr key={key}>
                      <td><span style={{ background: "rgba(0, 242, 254, 0.15)", color: "#00f2fe", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>{rec.studentId}</span></td>
                      <td><strong style={{ color: "#f8fafc" }}>{englishName}</strong></td>
                      <td style={{ color: "#00f2fe", fontWeight: "700" }}>{rec.overallPercentage}%</td>
                      <td>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {rec.recentLog && rec.recentLog.length > 0 ? (
                            rec.recentLog.map((log, idx) => (
                              <span key={idx} style={{ background: log.status === "Absent" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)", color: log.status === "Absent" ? "#f87171" : "#34d399", padding: "2px 6px", borderRadius: "6px", fontSize: "0.75rem" }}>
                                {log.date}: {log.status}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>No dates logged yet</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => onLaunchChat(`attendance lagani hai`)}
                          style={{ background: "rgba(0, 242, 254, 0.15)", color: "#00f2fe", border: "1px solid #00f2fe", padding: "4px 10px", borderRadius: "8px", fontSize: "0.78rem", cursor: "pointer" }}
                        >
                          + Mark Date
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "30px", textAlign: "center", background: "rgba(13, 17, 29, 0.4)", borderRadius: "12px", border: "1px dashed var(--border-glass)" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "14px" }}>Database is currently empty (No pre-seeded student records).</p>
              <button
                onClick={() => onLaunchChat("attendance lagani hai")}
                style={{ background: "linear-gradient(135deg, #00f2fe, #4facfe)", color: "#05070f", border: "none", padding: "10px 20px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "0.88rem" }}
              >
                + Start Attendance Workflow (AI asks name first)
              </button>
            </div>
          )}
        </div>
      )}

      {/* DEDICATED PANEL 2: CLASS ACADEMIC MARKS TABLE */}
      {showMarks && (
        <div className="glass-panel" style={{ padding: "28px", borderLeft: "5px solid #818cf8" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#818cf8", display: "flex", alignItems: "center", gap: "10px" }}>
                <Award size={22} /> Class Academic Marks Table
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>Subject evaluation scores recorded in ERP database</p>
            </div>
            <button onClick={fetchLiveMetrics} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)", color: "var(--text-muted)", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <RefreshCw size={14} /> Refresh Marks
            </button>
          </div>

          {marksStudentKeys.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Logged Subject Scores</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {marksStudentKeys.map(key => {
                  const attRec = attendanceRecords[key];
                  const markRec = marksRecords[key];
                  const rawName = markRec?.studentName || attRec?.studentName || "Student";
                  const englishName = formatStudentNameInEnglish(rawName);
                  const subjectsList = markRec?.subjects || [];

                  return (
                    <tr key={key}>
                      <td><span style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>{attRec?.studentId || key}</span></td>
                      <td><strong style={{ color: "#f8fafc" }}>{englishName}</strong></td>
                      <td>
                        {subjectsList.length > 0 ? (
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {subjectsList.map((sub, idx) => (
                              <span key={idx} style={{ background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.3)", color: "#a5b4fc", padding: "4px 10px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "600" }}>
                                {sub.subject}: <strong style={{ color: "#60a5fa" }}>{sub.marksObtained}/{sub.maxMarks}</strong> ({sub.letterGrade})
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>No subject marks entered yet</span>
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => onLaunchChat("marks daalne hain")}
                          style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8", border: "1px solid #6366f1", padding: "4px 10px", borderRadius: "8px", fontSize: "0.78rem", cursor: "pointer" }}
                        >
                          + Enter Subject Marks
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "30px", textAlign: "center", background: "rgba(13, 17, 29, 0.4)", borderRadius: "12px", border: "1px dashed var(--border-glass)" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "14px" }}>No student marks in database yet.</p>
              <button
                onClick={() => onLaunchChat("marks daalne hain")}
                style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "12px", fontWeight: "700", cursor: "pointer", fontSize: "0.88rem" }}
              >
                + Start Marks Workflow (AI asks name first)
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
