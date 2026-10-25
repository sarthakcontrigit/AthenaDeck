
import { useEffect, useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import TasksPage from "./pages/TasksPage";
import NotesPage from "./pages/NotesPage";
import SettingsPage from "./pages/SettingsPage";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [appVersion, setAppVersion] = useState("Loading...");
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    window.athenaAPI
      .getAppVersion()
      .then(setAppVersion)
      .catch(() => setAppVersion("Unavailable"));

    window.athenaAPI
      .isWindowMaximized()
      .then(setIsMaximized)
      .catch(() => {});
  }, []);

  const navigation = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Tasks", icon: "✓" },
    { name: "Notes", icon: "▤" },
    { name: "Settings", icon: "⚙" },
  ];

  async function toggleMaximize() {
    const result = await window.athenaAPI.toggleMaximizeWindow();
    setIsMaximized(result);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">A</div>
          <div>
            <h2>Athena Desk</h2>
            <span>Personal workspace</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav>
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${activePage === item.name ? "active" : ""}`}
              onClick={() => setActivePage(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="avatar">S</div>
          <div>
            <strong>My Workspace</strong>
            <span>Local desktop app</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <span className="breadcrumb">Workspace /</span>
            <strong>{activePage}</strong>
          </div>

          <div className="header-actions">
            <div className="status-pill">
              <span className="status-dot" />
              Desktop mode
            </div>

            <button
              className="window-button"
              onClick={() => window.athenaAPI.minimizeWindow()}
              aria-label="Minimize window"
              title="Minimize"
            >
              −
            </button>

            <button
              className="window-button"
              onClick={toggleMaximize}
              aria-label={isMaximized ? "Restore window" : "Maximize window"}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? "❐" : "□"}
            </button>

            <button
              className="window-button close-window"
              onClick={() => window.athenaAPI.closeWindow()}
              aria-label="Close window"
              title="Close"
            >
              ×
            </button>
          </div>
        </header>

        <section className="page-content">
          {activePage === "Dashboard" && (
            <DashboardPage onNavigate={setActivePage} />
          )}
          {activePage === "Tasks" && <TasksPage />}
          {activePage === "Notes" && <NotesPage />}
          {activePage === "Settings" && (
            <SettingsPage appVersion={appVersion} />
          )}

          <p className="footer-note">
            Athena Desk · Electron {appVersion}
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
