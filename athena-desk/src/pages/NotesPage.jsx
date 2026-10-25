
import { useEffect, useMemo, useState } from "react";

function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    window.athenaAPI
      .loadNotes()
      .then((savedNotes) => {
        if (active) setNotes(savedNotes);
      })
      .catch(() => {
        if (active) setMessage("Could not load your saved notes.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    let active = true;

    window.athenaAPI
      .saveNotes(notes)
      .then(() => {
        if (active) setMessage("");
      })
      .catch(() => {
        if (active) setMessage("Could not save notes to disk.");
      });

    return () => {
      active = false;
    };
  }, [notes, loading]);

  const visibleNotes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return notes.filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query);

      const matchesFilter =
        filter === "All" ||
        (filter === "Recent" && Date.now() - note.id < 7 * 86400000);

      return matchesSearch && matchesFilter;
    });
  }, [notes, search, filter]);

  function addNote(event) {
    event.preventDefault();

    const cleanTitle = title.trim();
    const cleanContent = content.trim();

    if (!cleanTitle || !cleanContent) {
      setMessage("Enter both a title and note content.");
      return;
    }

    if (cleanTitle.length > 200 || cleanContent.length > 20000) {
      setMessage("The title or note content exceeds the allowed length.");
      return;
    }

    setNotes((current) => [
      {
        id: Date.now(),
        title: cleanTitle,
        content: cleanContent,
      },
      ...current,
    ]);

    setTitle("");
    setContent("");
    setMessage("");
  }

  function deleteNote(id) {
    setNotes((current) => current.filter((note) => note.id !== id));
  }

  async function exportNotes() {
    try {
      const result = await window.athenaAPI.exportNotes(notes);

      if (!result.canceled) {
        setMessage("Notes exported successfully.");
      }
    } catch {
      setMessage("Could not export notes.");
    }
  }

  async function importNotes() {
    try {
      const result = await window.athenaAPI.importNotes();

      if (result.canceled) return;

      setNotes((current) => {
        const existingIds = new Set(current.map((note) => note.id));
        const imported = result.notes.filter(
          (note) => !existingIds.has(note.id)
        );

        return [...imported, ...current];
      });

      setMessage("Imported notes will be saved automatically.");
    } catch {
      setMessage("Could not import notes. Check the JSON file.");
    }
  }

  if (loading) {
    return <p className="subtitle">Loading your notes...</p>;
  }

  return (
    <>
      <p className="eyebrow">CAPTURE YOUR IDEAS</p>
      <h1>Notes</h1>
      <p className="subtitle">
        Your notes are saved on this computer.
      </p>

      {message && (
        <p className="notes-error" role="status">
          {message}
        </p>
      )}

      <section className="panel task-panel">
        <div className="file-actions">
          <button className="secondary-button" onClick={importNotes}>
            Import JSON
          </button>
          <button className="secondary-button" onClick={exportNotes}>
            Export JSON
          </button>
        </div>

        <form className="note-form" onSubmit={addNote}>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Note title"
            maxLength={200}
            aria-label="Note title"
          />

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Write your note..."
            rows={5}
            maxLength={20000}
            aria-label="Note content"
          />

          <button className="primary-button" type="submit">
            Save note
          </button>
        </form>

        <div className="saved-notes">
          <h2>Saved notes ({notes.length})</h2>

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search titles and note content..."
            aria-label="Search notes"
          />

          <div className="filter-row">
            {["All", "Recent"].map((option) => (
              <button
                key={option}
                className={`filter-button ${filter === option ? "selected" : ""}`}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>

          {visibleNotes.length === 0 ? (
            <p className="empty-state">
              {notes.length === 0
                ? "No notes yet. Create your first note above."
                : "No notes match your search."}
            </p>
          ) : (
            visibleNotes.map((note) => (
              <article className="saved-note" key={note.id}>
                <div>
                  <h3>{note.title}</h3>
                  <p>{note.content}</p>
                </div>

                <button
                  className="delete-button"
                  onClick={() => deleteNote(note.id)}
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
