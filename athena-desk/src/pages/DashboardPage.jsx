
function DashboardPage({ onNavigate }) {
  return (
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
          <p>Desktop workspace</p>
          <h2>Ready</h2>
          <span className="stat-caption">Your work, in one place</span>
        </article>

        <article className="stat-card">
          <span className="stat-icon green">↗</span>
          <p>Task manager</p>
          <h2>Tasks</h2>
          <span className="stat-caption">Organize your next steps</span>
        </article>

        <article className="stat-card">
          <span className="stat-icon orange">▤</span>
          <p>Local notes</p>
          <h2>Notes</h2>
          <span className="stat-caption">Save ideas on this computer</span>
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
              onClick={() => onNavigate("Notes")}
            >
              Open notes
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

export default DashboardPage;
