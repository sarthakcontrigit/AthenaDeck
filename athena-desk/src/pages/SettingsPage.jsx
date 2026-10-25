
function SettingsPage({ appVersion }) {
  return (
    <>
      <p className="eyebrow">PREFERENCES</p>
      <h1>Settings</h1>
      <p className="subtitle">Application information and preferences.</p>

      <section className="panel task-panel">
        <div className="panel-heading">
          <div>
            <h2>About Athena Desk</h2>
            <p>Application runtime information.</p>
          </div>
        </div>

        <div className="task-row">
          <span>Application</span>
          <strong>Athena Desk</strong>
        </div>

        <div className="task-row">
          <span>Electron version</span>
          <strong>{appVersion}</strong>
        </div>
      </section>
    </>
  );
}

export default SettingsPage;

