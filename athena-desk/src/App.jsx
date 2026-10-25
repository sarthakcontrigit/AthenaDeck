
import { useEffect, useState } from "react";
import "./App.css";

const initialTasks = [
  { id: 1, title: "Review lecture notes", completed: false },
  { id: 2, title: "Finish desktop application", completed: false },
  { id: 3, title: "Plan weekly study goals", completed: true },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("All");
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

  const completedCount = tasks.filter((task) => task.completed).length;

  const visibleTasks = tasks.filter((task) => {
    if (filter === "Active") return !task.completed;
    if (filter === "Completed") return task.completed;
    return true;
  });

  function addTask(event) {
    event.preventDefault();

    const title = newTask.trim();
    if (!title) return;

    setTasks((current) => [
      ...current,
      {
        id: Date.now(),
        title,
        completed: false,
      },
    ]);

    setNewTask("");
  }

  function toggleTask(id) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function deleteTask(id) {
    setTasks((current) =>
      current.filter((task) => task.id !== id)
    );
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
          {activePage === "Dashboard" && (
            <>
              <div className="welcome-row">
                <div>
                  <p className="eyebrow">YOUR PERSONAL WORKSPACE</p>
                  <h1>Welcome back.</h1>
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
                  <h2>{tasks.length}</h2>
                  <span className="stat-caption">
                    Your current workload
                  </span>
                </article>

                <article className="stat-card">
                  <span className="stat-icon green">↗</span>
                  <p>Completed</p>
                  <h2>{completedCount}</h2>
                  <span className="stat-caption">
                    Tasks checked off
                  </span>
                </article>

                <article className="stat-card">
                  <span className="stat-icon orange">▤</span>
                  <p>Remaining</p>
                  <h2>{tasks.length - completedCount}</h2>
                  <span className="stat-caption">
                    Tasks still to do
                  </span>
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
                    <button
                      className="primary-button"
                      onClick={() => setActivePage("Tasks")}
                    >
                      Manage tasks
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}

          {activePage === "Tasks" && (
            <>
              <p className="eyebrow">STAY ORGANIZED</p>
              <h1>Task manager</h1>
              <p className="subtitle">
                {completedCount} of {tasks.length} tasks completed.
              </p>

              <section className="panel task-panel">
                <form className="task-form" onSubmit={addTask}>
                  <input
                    value={newTask}
                    onChange={(event) => setNewTask(event.target.value)}
                    placeholder="What do you need to do?"
                    aria-label="New task"
                  />
                  <button className="primary-button" type="submit">
                    Add task
                  </button>
                </form>

                <div className="filter-row">
                  {["All", "Active", "Completed"].map((option) => (
                    <button
                      key={option}
                      className={`filter-button ${
                        filter === option ? "selected" : ""
                      }`}
                      onClick={() => setFilter(option)}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="task-list">
                  {visibleTasks.map((task) => (
                    <div className="task-row" key={task.id}>
                      <label className="task-label">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id)}
                        />
                        <span
                          className={
                            task.completed ? "task-done" : ""
                          }
                        >
                          {task.title}
                        </span>
                      </label>

                      <button
                        className="delete-button"
                        onClick={() => deleteTask(task.id)}
                        aria-label={`Delete ${task.title}`}
                      >
                        Delete
                      </button>
                    </div>
                  ))}

                  {visibleTasks.length === 0 && (
                    <p className="empty-state">
                      No tasks here yet. Add a task to get started.
                    </p>
                  )}
                </div>
              </section>
            </>
          )}

          {activePage === "Notes" && (
            <>
              <p className="eyebrow">CAPTURE YOUR IDEAS</p>
              <h1>Notes</h1>
              <p className="subtitle">
                Local note storage is coming in the next commits.
              </p>
            </>
          )}

          {activePage === "Settings" && (
            <>
              <p className="eyebrow">PREFERENCES</p>
              <h1>Settings</h1>
              <p className="subtitle">
                Desktop preferences will be added in later commits.
              </p>
            </>
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
