
import { useState } from "react";

const initialTasks = [
  { id: 1, title: "Review lecture notes", completed: false },
  { id: 2, title: "Finish desktop application", completed: false },
  { id: 3, title: "Plan weekly study goals", completed: true },
];

function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState("All");
  const [message, setMessage] = useState("");

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

    setTasks((current) => [
      ...current,
      { id: Date.now(), title, completed: false },
    ]);

    setNewTask("");
    setMessage("");

    try {
      const result = await window.athenaAPI.showNotification({
        title: "Athena Desk",
        body: `New task added: ${title}`,
      });

      if (!result.success && result.reason === "unsupported") {
        setMessage("Your system does not support desktop notifications.");
      }
    } catch {
      setMessage("Task added, but the notification could not be shown.");
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
            <p className="empty-state">No tasks in this filter.</p>
          )}
        </div>
      </section>
    </>
  );
}

export default TasksPage;
