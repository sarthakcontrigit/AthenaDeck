
import { useEffect, useState } from "react";
import DashboardPage from "./pages/DashboardPage.jsx";
import TasksPage from "./pages/TasksPage.jsx";
import NotesPage from "./pages/NotesPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [appVersion, setAppVersion] = useState("Loading...");

  useEffect(() => {
    window.athenaAPI
      .getAppVersion()
      .then(setAppVersion)
      .catch(() => setAppVersion("Unavailable"));
  }, []);

  const navigation = [
    { name: "Dashboard", icon: "⌂" },
    { name: "Tasks", icon: "✓" },
    { name: "Notes", icon: "▤" },
    { name: "Settings", icon: "⚙" },
  ];

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

          <div className="status-pill">
            <span className="status-dot" />
            Desktop mode
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
