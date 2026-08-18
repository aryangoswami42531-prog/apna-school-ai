import React, { useState, useEffect } from "react";
import Header from "./components/Header.jsx";
import LoginScreen from "./components/LoginScreen.jsx";
import StudentDashboard from "./components/dashboards/StudentDashboard.jsx";
import ParentDashboard from "./components/dashboards/ParentDashboard.jsx";
import TeacherDashboard from "./components/dashboards/TeacherDashboard.jsx";
import PrincipalDashboard from "./components/dashboards/PrincipalDashboard.jsx";
import ChatInterface from "./components/ChatInterface.jsx";
import Nav3DLoader from "./components/Nav3DLoader.jsx";
import DumpTruckLoader from "./components/DumpTruckLoader.jsx";
import EscalationModal from "./components/EscalationModal.jsx";
import InitialAppLoader from "./components/InitialAppLoader.jsx";
import Footer from "./components/Footer.jsx";
import { Bot, Calendar, Award, Building2, Sparkles } from "lucide-react";

export default function App() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [language, setLanguage] = useState("English");
  const [activeSidebarTab, setActiveSidebarTab] = useState("chat"); // 'chat', 'attendance', 'marks', 'analytics'
  const [isNavLoading, setIsNavLoading] = useState(false);
  const [navProgress, setNavProgress] = useState(0);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);
  const [chatInitialMsg, setChatInitialMsg] = useState("");
  const [isEscalationModalOpen, setIsEscalationModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Auto-login check via session token
  useEffect(() => {
    const savedUser = localStorage.getItem("xyz_user");
    const token = localStorage.getItem("xyz_session_token");
    if (savedUser && token) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    }
  }, []);

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    localStorage.setItem("xyz_user", JSON.stringify(user));
    localStorage.setItem("xyz_session_token", token);
  };

  const handleLogout = () => {
    const token = localStorage.getItem("xyz_session_token");
    if (token) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem("xyz_user");
    localStorage.removeItem("xyz_session_token");
    setCurrentUser(null);
    setActiveSidebarTab("chat");
    setIsFloatingChatOpen(false);
  };

  // 2-Second 3D Isometric Cube Navigation Loading Transition
  const handleTabClick = (tabId) => {
    if (tabId === activeSidebarTab && !isNavLoading) return;
    setIsNavLoading(true);
    setNavProgress(0);

    const startTime = Date.now();
    const duration = 1400; // Exactly 1.4 Seconds for Dump Truck Loading Animation

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setNavProgress(progress);

      if (elapsed >= duration) {
        clearInterval(interval);
        setActiveSidebarTab(tabId);
        setIsNavLoading(false);
      }
    }, 40);
  };

  const handleLaunchChat = (prompt = "") => {
    setChatInitialMsg(prompt);
    handleTabClick("chat");
  };

  const handleDataChanged = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const navMenuItems = [
    { id: "chat", label: "AI Voice Assistant", icon: Bot, badge: "Live" },
    { id: "attendance", label: "Attendance Roster", icon: Calendar },
    { id: "marks", label: "Academic Subject Marks", icon: Award },
    { id: "analytics", label: "Analytics & Tickets", icon: Building2 }
  ];

  const renderDashboardComponent = () => {
    switch (currentUser?.role) {
      case "student":
        return <StudentDashboard user={currentUser} onLaunchChat={handleLaunchChat} activeSidebarTab={activeSidebarTab} refreshTrigger={refreshTrigger} />;
      case "parent":
        return <ParentDashboard user={currentUser} onLaunchChat={handleLaunchChat} activeSidebarTab={activeSidebarTab} onEscalate={() => setIsEscalationModalOpen(true)} refreshTrigger={refreshTrigger} />;
      case "teacher":
        return <TeacherDashboard user={currentUser} onLaunchChat={handleLaunchChat} activeSidebarTab={activeSidebarTab} refreshTrigger={refreshTrigger} />;
      case "principal":
        return <PrincipalDashboard user={currentUser} onLaunchChat={handleLaunchChat} activeSidebarTab={activeSidebarTab} refreshTrigger={refreshTrigger} />;
      default:
        return <StudentDashboard user={currentUser} onLaunchChat={handleLaunchChat} activeSidebarTab={activeSidebarTab} refreshTrigger={refreshTrigger} />;
    }
  };

  return (
    <>
      {isInitialLoading && (
        <InitialAppLoader onComplete={() => setIsInitialLoading(false)} />
      )}
      {!currentUser ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <Header
            user={currentUser}
            language={language}
            onLanguageChange={(lang) => setLanguage(lang)}
            onLogout={handleLogout}
          />

      {/* Full-Bleed Far Left Sidebar Layout */}
      <div style={{ flex: 1, width: "100%", padding: "0 24px 32px 8px", display: "grid", gridTemplateColumns: "270px 1fr", gap: "20px" }}>
        
        {/* Sleek Flush Far-Left Sidebar Navigation */}
        <aside className="glass-panel" style={{ padding: "24px 18px", display: "flex", flexDirection: "column", gap: "18px", minHeight: "calc(100vh - 200px)", background: "rgba(13, 17, 29, 0.9)", border: "1px solid var(--border-glass)", borderRadius: "0 24px 24px 0" }}>
          <div style={{ padding: "8px 12px 18px 12px", borderBottom: "1px solid var(--border-glass)", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "800", letterSpacing: "1.2px", textTransform: "uppercase" }}>NAVIGATION MENU</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", flex: 1 }}>
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSidebarTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "16px 18px",
                    borderRadius: "16px",
                    border: isActive ? "1px solid rgba(0, 242, 254, 0.5)" : "1px solid rgba(255, 255, 255, 0.05)",
                    background: isActive ? "linear-gradient(135deg, rgba(0, 242, 254, 0.18), rgba(79, 70, 229, 0.18))" : "rgba(255, 255, 255, 0.03)",
                    color: isActive ? "#00f2fe" : "var(--text-muted)",
                    fontWeight: isActive ? "800" : "600",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: isActive ? "0 8px 24px rgba(0, 242, 254, 0.2)" : "none",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Icon size={20} color={isActive ? "#00f2fe" : "var(--text-muted)"} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span style={{ background: "rgba(0, 242, 254, 0.2)", color: "#00f2fe", padding: "3px 8px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: "800" }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right-Side Dashboard & Footer Area */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "24px" }}>
          <main style={{ flex: 1, position: "relative" }}>
            {isNavLoading ? (
              <DumpTruckLoader
                progress={navProgress}
                tabName={navMenuItems.find(m => m.id === activeSidebarTab)?.label || "Dashboard"}
              />
            ) : (
              <div key={activeSidebarTab} className="anim-nav-slide">
                {activeSidebarTab === "chat" ? (
                  <ChatInterface
                    user={currentUser}
                    language={language}
                    initialMessage={chatInitialMsg}
                    onChatUpdate={handleDataChanged}
                  />
                ) : (
                  renderDashboardComponent()
                )}
              </div>
            )}
          </main>

          <Footer language={language} />
        </div>
      </div>

      {/* Floating Chat Trigger for non-chat tabs */}
      {activeSidebarTab !== "chat" && !isFloatingChatOpen && (
        <button
          onClick={() => setIsFloatingChatOpen(true)}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #00f2fe, #4facfe)",
            color: "#05070f",
            border: "none",
            boxShadow: "0 10px 30px rgba(0, 242, 254, 0.5)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999
          }}
          className="anim-pulse"
          title="Open Floating XYZ AI Assistant"
        >
          <Bot size={28} />
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {activeSidebarTab !== "chat" && isFloatingChatOpen && (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", width: "420px", maxWidth: "calc(100vw - 32px)", zIndex: 1000 }}>
          <ChatInterface
            user={currentUser}
            language={language}
            isFloating={true}
            onCloseFloating={() => setIsFloatingChatOpen(false)}
            onChatUpdate={handleDataChanged}
          />
        </div>
      )}

      {/* Standalone Escalation Request Modal */}
      <EscalationModal
        isOpen={isEscalationModalOpen}
        language={language}
        onConfirm={() => {
          setIsEscalationModalOpen(false);
          handleLaunchChat("Yes, submit human callback request.");
        }}
        onCancel={() => setIsEscalationModalOpen(false)}
      />
        </div>
      )}
    </>
  );
}
