
import { useEffect, useState } from "react";

function SettingsPage({ appVersion }) {
  const [systemInfo, setSystemInfo] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    window.athenaAPI
      .getSystemInfo()
      .then((info) => {
        if (active) setSystemInfo(info);
      })
      .catch(() => {
        if (active) setError("Could not retrieve system information.");
      });

    return () => {
      active = false;
    };
  }, []);

  async function openDocumentation() {
    setError("");

    try {
      await window.athenaAPI.openExternal(
        "https://www.electronjs.org/docs/latest"
      );
    } catch {
      setError("Could not open the Electron documentation.");
    }
  }

  return (
    <>
      <p className="eyebrow">PREFERENCES</p>
      <h1>Settings</h1>
      <p className="subtitle">
        Application details and system information.
      </p>

      <section className="panel task-panel">
        <div className="panel-heading">
          <div>
            <h2>About Athena Desk</h2>
            <p>Application and runtime details.</p>
          </div>
          <span className="panel-badge">SYSTEM</span>
        </div>

        <div className="system-info-row">
          <span>Application</span>
          <strong>Athena Desk</strong>
        </div>

        <div className="system-info-row">
          <span>Electron</span>
          <strong>{systemInfo?.electron ?? appVersion}</strong>
        </div>

        <div className="system-info-row">
          <span>Chromium</span>
          <strong>{systemInfo?.chrome ?? "Loading..."}</strong>
        </div>

        <div className="system-info-row">
          <span>Node.js</span>
          <strong>{systemInfo?.node ?? "Loading..."}</strong>
        </div>

        <div className="system-info-row">
          <span>Operating system</span>
          <strong>{systemInfo?.platform ?? "Loading..."}</strong>
        </div>

        <div className="system-info-row">
          <span>Architecture</span>
          <strong>{systemInfo?.architecture ?? "Loading..."}</strong>
        </div>

        {error && (
          <p className="notes-error" role="alert">
            {error}
          </p>
        )}

        <button
          className="primary-button documentation-button"
          onClick={openDocumentation}
        >
          Open Electron documentation ↗
        </button>
      </section>
    </>
  );
}

export default SettingsPage;
