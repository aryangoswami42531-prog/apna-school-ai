import React, { useState, useEffect } from "react";
import { Building2, Award, Calendar, TrendingUp, Bot, RefreshCw, UserCheck, CheckCircle } from "lucide-react";
import { formatStudentNameInEnglish } from "../../utils/nameUtils.js";

export default function PrincipalDashboard({ user, onLaunchChat, activeSidebarTab = "attendance", refreshTrigger }) {
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [marksRecords, setMarksRecords] = useState({});

  const fetchLiveMetrics = () => {
    const token = localStorage.getItem("xyz_session_token") || "";
    const headers = {
      "x-user-role": "principal",
      "Authorization": token ? `Bearer ${token}` : ""
    };

    fetch("/api/erp/attendance", { headers })
      .then(res => res.json())
      .then(data => {
        if (data.studentRecords) setAttendanceRecords(data.studentRecords);
      })
      .catch(() => {});

    fetch("/api/erp/marks", { headers })
      .then(res => res.json())
      .then(data => {
        if (data.studentRecords) setMarksRecords(data.studentRecords);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLiveMetrics();
  }, [refreshTrigger]);

  const studentKeys = Object.keys(attendanceRecords);
  const studentCount = studentKeys.length;

  // Calculate live overall attendance average across all students
  let totalPctSum = 0;
  Object.values(attendanceRecords).forEach(r => {
    totalPctSum += (r.overallPercentage || 0);
  });
  const avgAttendance = studentCount > 0 ? (totalPctSum / studentCount).toFixed(1) : "0.0";

  // Calculate subject averages dynamically from live marksRecords
  const subjectMap = {};
  Object.values(marksRecords).forEach(rec => {
    (rec.subjects || []).forEach(sub => {
      if (!subjectMap[sub.subject]) {
        subjectMap[sub.subject] = { total: 0, count: 0, highest: 0 };
      }
      subjectMap[sub.subject].total += sub.marksObtained;
      subjectMap[sub.subject].count += 1;
      subjectMap[sub.subject].highest = Math.max(subjectMap[sub.subject].highest, sub.marksObtained);
    });
  });

  const subjectAnalytics = Object.entries(subjectMap).map(([subject, stats]) => ({
    subject,
    avg: (stats.total / stats.count).toFixed(1),
    highest: stats.highest,
    count: stats.count
  }));

  const showAttendance = activeSidebarTab === "attendance" || activeSidebarTab === "analytics" || activeSidebarTab === "dashboard";
  const showMarks = activeSidebarTab === "marks" || activeSidebarTab === "analytics" || activeSidebarTab === "dashboard";

  return (
    <div className="anim-fade-in" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div className="glass-panel" style={{ padding: "28px", background: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(0, 242, 254, 0.15))", border: "1px solid rgba(236, 72, 153, 0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <span style={{ fontSize: "0.8rem", color: "#f472b6", fontWeight: "700", letterSpacing: "1px" }}>MANAGEMENT ERP PORTAL</span>
            <h2 style={{ fontSize: "1.8rem", fontWeight: "700", marginTop: "4px", color: "#f8fafc" }}>Welcome, {user.name}</h2>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>Designation: {user.designation || "Principal / Management"} | Scope: School-Wide Oversight</p>
          </div>
          
          <button
            onClick={() => onLaunchChat("Show overall school attendance analytics")}
            style={{ background: "linear-gradient(135deg, #ec4899, #db2777)", color: "#fff", border: "none", padding: "12px 22px", borderRadius: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 20px rgba(236, 72, 153, 0.4)" }}
          >
            <Bot size={20} /> Query School Analytics via XYZ AI
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
        <div className="glass-panel" style={{ padding: "20px", borderLeft: "4px solid #f472b6" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700" }}>LIVE REGISTERED STUDENTS</span>
          <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#f472b6", marginTop: "4px" }}>{studentCount} Students</div>
        </div>
        <div className="glass-panel" style={{ padding: "20px", borderLeft: "4px solid #34d399" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700" }}>OVERALL SCHOOL ATTENDANCE</span>
          <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#34d399", marginTop: "4px" }}>{avgAttendance}%</div>
        </div>
        <div className="glass-panel" style={{ padding: "20px", borderLeft: "4px solid #60a5fa" }}>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700" }}>EVALUATED SUBJECTS</span>
          <div style={{ fontSize: "1.8rem", fontWeight: "700", color: "#60a5fa", marginTop: "4px" }}>{subjectAnalytics.length} Subjects</div>
        </div>
      </div>

      {/* DEDICATED PANEL 1: LIVE SCHOOL-WIDE STUDENT ATTENDANCE ROSTER */}
      {showAttendance && (
        <div className="glass-panel" style={{ padding: "28px", borderLeft: "5px solid #ec4899" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#f472b6", display: "flex", alignItems: "center", gap: "10px" }}>
                <Calendar size={22} /> Real-Time School Attendance Roster (Live Teacher Logged Data)
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>Actual attendance records submitted by teachers in live ERP database</p>
            </div>
            <button onClick={fetchLiveMetrics} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)", color: "var(--text-muted)", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <RefreshCw size={14} /> Refresh Roster
            </button>
          </div>

          {studentKeys.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Class Grade</th>
                  <th>Overall Attendance</th>
                  <th>Days Present / Absent</th>
                  <th>Latest Logged Entry</th>
                </tr>
              </thead>
              <tbody>
                {studentKeys.map(key => {
                  const rec = attendanceRecords[key];
                  const englishName = formatStudentNameInEnglish(rec.studentName);
                  const lastLog = rec.recentLog?.[0];
                  return (
                    <tr key={key}>
                      <td><span style={{ background: "rgba(236, 72, 153, 0.15)", color: "#f472b6", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>{rec.studentId}</span></td>
                      <td><strong style={{ color: "#f8fafc" }}>{englishName}</strong></td>
                      <td>{rec.grade || "10-A"}</td>
                      <td style={{ color: "#34d399", fontWeight: "700" }}>{rec.overallPercentage}%</td>
                      <td>{rec.daysPresent} Present / {rec.daysAbsent} Absent</td>
                      <td>
                        {lastLog ? (
                          <span style={{ background: lastLog.status === "Absent" ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)", color: lastLog.status === "Absent" ? "#f87171" : "#34d399", padding: "2px 8px", borderRadius: "6px", fontSize: "0.78rem" }}>
                            {lastLog.date}: {lastLog.status}
                          </span>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>No date entries logged</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "30px", textAlign: "center", background: "rgba(13, 17, 29, 0.4)", borderRadius: "12px", border: "1px dashed var(--border-glass)" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>No attendance records recorded by teachers in live ERP database yet.</p>
            </div>
          )}
        </div>
      )}

      {/* DEDICATED PANEL 2: LIVE ACADEMIC MARKS & SUBJECT PERFORMANCE */}
      {showMarks && (
        <div className="glass-panel" style={{ padding: "28px", borderLeft: "5px solid #00f2fe" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
            <div>
              <h3 style={{ fontSize: "1.3rem", fontWeight: "700", color: "#00f2fe", display: "flex", alignItems: "center", gap: "10px" }}>
                <Award size={22} /> Real-Time Academic Marks & Subject Performance (Live Teacher Submissions)
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>Actual subject evaluation scores recorded by class teachers</p>
            </div>
            <button onClick={fetchLiveMetrics} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border-glass)", color: "var(--text-muted)", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <RefreshCw size={14} /> Refresh Marks
            </button>
          </div>

          {/* Table 1: Student Level Marks */}
          {studentKeys.length > 0 ? (
            <table style={{ marginBottom: "24px" }}>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Class Grade</th>
                  <th>Teacher Logged Subject Scores</th>
                  <th>Student Average</th>
                </tr>
              </thead>
              <tbody>
                {studentKeys.map(key => {
                  const markRec = marksRecords[key];
                  const attRec = attendanceRecords[key];
                  const rawName = markRec?.studentName || attRec?.studentName || "Student";
                  const englishName = formatStudentNameInEnglish(rawName);
                  const subjectsList = markRec?.subjects || [];

                  return (
                    <tr key={key}>
                      <td><span style={{ background: "rgba(0, 242, 254, 0.15)", color: "#00f2fe", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>{key}</span></td>
                      <td><strong style={{ color: "#f8fafc" }}>{englishName}</strong></td>
                      <td>{markRec?.grade || "10-A"}</td>
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
                      <td style={{ color: "#60a5fa", fontWeight: "700" }}>{markRec?.overallPercentage ? `${markRec.overallPercentage}%` : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "30px", textAlign: "center", background: "rgba(13, 17, 29, 0.4)", borderRadius: "12px", border: "1px dashed var(--border-glass)" }}>
              <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>No subject marks entered in ERP database yet.</p>
            </div>
          )}

          {/* Table 2: Subject Level Analytics */}
          {subjectAnalytics.length > 0 && (
            <div>
              <h4 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#f8fafc", marginBottom: "12px" }}>Subject Average Performance Breakdown</h4>
              <table>
                <thead>
                  <tr>
                    <th>Subject Name</th>
                    <th>Average Score</th>
                    <th>Highest Score Achieved</th>
                    <th>Total Evaluated Students</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectAnalytics.map((s, idx) => (
                    <tr key={idx}>
                      <td><strong style={{ color: "#f8fafc" }}>{s.subject}</strong></td>
                      <td style={{ color: "#60a5fa", fontWeight: "700" }}>{s.avg}%</td>
                      <td style={{ color: "#34d399", fontWeight: "700" }}>{s.highest}/100</td>
                      <td>{s.count} Student(s)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
