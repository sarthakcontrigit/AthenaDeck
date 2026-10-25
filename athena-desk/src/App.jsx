
import { useState } from "react";
import "./App.css";

const initialTasks = [
  { id: 1, title: "Review lecture notes", completed: false },
  { id: 2, title: "Finish desktop application", completed: false },
  { id: 3, title: "Plan weekly study goals", completed: true },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

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
              className={`nav-item ${
                activePage === item.name ? "active" : ""
              }`}
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
          <div className="welcome-row">
            <div>
              <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
              <h1>
                {activePage === "Dashboard"
                  ? "Welcome back."
                  : activePage}
              </h1>
              <p className="subtitle">
                Organize your work, capture ideas, and stay focused.
              </p>
            </div>
            <div className="date-card">
              <span>TODAY</span>
              <strong>
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </strong>
            </div>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <span className="stat-icon purple">✓</span>
              <p>Total tasks</p>
              <h2>{initialTasks.length}</h2>
              <span className="stat-caption">Your current workload</span>
            </article>

            <article className="stat-card">
              <span className="stat-icon green">↗</span>
              <p>Completed</p>
              <h2>
                {initialTasks.filter((task) => task.completed).length}
              </h2>
              <span className="stat-caption">Tasks checked off</span>
            </article>

            <article className="stat-card">
              <span className="stat-icon orange">▤</span>
              <p>Notes</p>
              <h2>0</h2>
              <span className="stat-caption">Ideas saved locally</span>
            </article>
          </div>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Getting started</h2>
                <p>Your workspace is ready to grow.</p>
              </div>
              <span className="panel-badge">OVERVIEW</span>
            </div>

            <div className="getting-started">
              <div className="start-icon">✦</div>
              <div>
                <h3>Make this space yours</h3>
                <p>
                  Manage tasks, save notes, and use native desktop
                  features from one place.
                </p>
              </div>
            </div>
          </section>

          <p className="footer-note">
            Athena Desk · Built with React and Electron
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
