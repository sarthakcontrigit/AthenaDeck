
import { useEffect, useState } from "react";

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    window.athenaAPI
      .loadTasks()
      .then((savedTasks) => {
        if (active) setTasks(savedTasks);
      })
      .catch(() => {
        if (active) setMessage("Could not load saved tasks.");
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
      .saveTasks(tasks)
      .then(() => {
        if (active) setMessage("");
      })
      .catch(() => {
        if (active) setMessage("Could not save tasks to disk.");
      });

    return () => {
      active = false;
    };
  }, [tasks, loading]);

  const completedCount = tasks.filter((task) => task.completed).length;

  const visibleTasks = tasks.filter((task) => {
    if (filter === "Active") return !task.completed;
    if (filter === "Completed") return task.completed;
    return true;
  });

  async function addTask(event) {
    event.preventDefault();

    const title = newTask.trim();
    if (!title) return;

    if (title.length > 500) {
      setMessage("Task titles must be 500 characters or fewer.");
      return;
    }

    setTasks((current) => [
      ...current,
      { id: Date.now(), title, completed: false },
    ]);

    setNewTask("");

    try {
      await window.athenaAPI.showNotification({
        title: "Athena Desk",
        body: `New task added: ${title}`,
      });
    } catch {
      // Task saving is handled separately.
    }
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
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  if (loading) {
    return <p className="subtitle">Loading your saved tasks...</p>;
  }

  return (
    <>
      <p className="eyebrow">STAY ORGANIZED</p>
      <h1>Task manager</h1>
      <p className="subtitle">
        {completedCount} of {tasks.length} tasks completed.
      </p>

      {message && (
        <p className="notes-error" role="status">
          {message}
        </p>
      )}

      <section className="panel task-panel">
        <form className="task-form" onSubmit={addTask}>
          <input
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            placeholder="What do you need to do?"
            aria-label="New task"
            maxLength={500}
          />
          <button className="primary-button" type="submit">
            Add task
          </button>
        </form>

        <div className="filter-row">
          {["All", "Active", "Completed"].map((option) => (
            <button
              key={option}
              className={`filter-button ${filter === option ? "selected" : ""}`}
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
                <span className={task.completed ? "task-done" : ""}>
                  {task.title}
                </span>
              </label>

              <button
                className="delete-button"
                onClick={() => deleteTask(task.id)}
              >
                Delete
              </button>
            </div>
          ))}

          {visibleTasks.length === 0 && (
            <p className="empty-state">
              {tasks.length === 0
                ? "No tasks yet. Add your first task above."
                : "No tasks in this filter."}
            </p>
          )}
        </div>
      </section>
    </>
  );
}

export default TasksPage;
