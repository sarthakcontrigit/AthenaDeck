
import { useEffect, useState } from "react";

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    window.athenaAPI
      .loadNotes()
      .then((savedNotes) => {
        if (active) setNotes(savedNotes);
      })
      .catch(() => {
        if (active) setMessage("Could not load saved notes.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function persistNotes(updatedNotes) {
    setBusy(true);
    setMessage("");

    try {
      await window.athenaAPI.saveNotes(updatedNotes);
      setNotes(updatedNotes);
      return true;
    } catch {
      setMessage("Could not save notes. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function addNote(event) {
    event.preventDefault();

    const title = noteTitle.trim();
    const content = noteContent.trim();

    if (!title || !content || busy) return;

    if (title.length > 200 || content.length > 20000) {
      setMessage("The title or content is too long.");
      return;
    }

    const updatedNotes = [
      ...notes,
      { id: Date.now(), title, content },
    ];

    if (await persistNotes(updatedNotes)) {
      setNoteTitle("");
      setNoteContent("");
    }
  }

  async function deleteNote(id) {
    if (busy) return;
    await persistNotes(notes.filter((note) => note.id !== id));
  }

  async function exportNotes() {
    setMessage("");

    try {
      const result = await window.athenaAPI.exportNotes(notes);

      if (result.canceled) return;
      setMessage("Notes exported successfully.");
    } catch {
      setMessage("Could not export notes.");
    }
  }

  async function importNotes() {
    setMessage("");

    try {
      const result = await window.athenaAPI.importNotes();

      if (result.canceled) return;

      // Merge imported notes with current notes, assigning new IDs
      // when an imported ID conflicts with an existing one.
      const merged = [...notes];
      const usedIds = new Set(notes.map((note) => note.id));

      for (const note of result.notes) {
        const imported = {
          ...note,
          id: usedIds.has(note.id) ? Date.now() + merged.length : note.id,
        };

        usedIds.add(imported.id);
        merged.push(imported);
      }

      if (merged.length > 1000) {
        setMessage("Too many notes to import.");
        return;
      }

      if (await persistNotes(merged)) {
        setMessage(`${result.notes.length} note(s) imported.`);
      }
    } catch {
      setMessage("Could not import notes. Check that the JSON file is valid.");
    }
  }

  return (
    <>
      <p className="eyebrow">CAPTURE YOUR IDEAS</p>
      <h1>Notes</h1>
      <p className="subtitle">Your notes are saved on this computer.</p>

      <section className="panel task-panel">
        {message && (
          <p className="notes-error" role="status">
            {message}
          </p>
        )}

        <div className="file-actions">
          <button className="secondary-button" onClick={importNotes} disabled={busy || loading}>
            Import JSON
          </button>
          <button className="secondary-button" onClick={exportNotes} disabled={busy || loading}>
            Export JSON
          </button>
        </div>

        <form className="note-form" onSubmit={addNote}>
          <input
            value={noteTitle}
            onChange={(event) => setNoteTitle(event.target.value)}
            placeholder="Note title"
            maxLength={200}
            required
          />

          <textarea
            value={noteContent}
            onChange={(event) => setNoteContent(event.target.value)}
            placeholder="Write your note..."
            maxLength={20000}
            rows={4}
            required
          />

          <button className="primary-button" type="submit" disabled={busy || loading}>
            {busy ? "Saving..." : "Save note"}
          </button>
        </form>

        <div className="saved-notes">
          <h2>Saved notes ({notes.length})</h2>

          {loading ? (
            <p className="empty-state">Loading notes...</p>
          ) : notes.length === 0 ? (
            <p className="empty-state">No notes yet. Create your first note above.</p>
          ) : (
            notes.map((note) => (
              <article className="saved-note" key={note.id}>
                <div>
                  <h3>{note.title}</h3>
                  <p>{note.content}</p>
                </div>
                <button
                  className="delete-button"
                  onClick={() => deleteNote(note.id)}
                  disabled={busy}
                >
                  Delete
                </button>
              </article>
            ))
          )}
        </div>
      </section>
    </>
  );
}

export default NotesPage;
