import { useEffect, useState } from "react";
import "./App.css";
import Login from "./login.tsx";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  assigned_to?: string;
};

function App() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Login />;
  }

  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [username, setUsername] = useState("");
  const [users, setUsers] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const loadTasks = async () => {
    // Load Tasks
    const response = await fetch(
      "http://127.0.0.1:8000/tasks",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (Array.isArray(data)) {
      setTasks(data);
    } else {
      console.log(data);
      setTasks([]);
    }

    // Load Users
    const usersResponse = await fetch(
      "http://127.0.0.1:8000/users",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const usersData = await usersResponse.json();

    if (Array.isArray(usersData)) {
      setUsers(usersData);
    }

    // Get Username from JWT
    const payload = JSON.parse(
      atob(token.split(".")[1])
    );

    setUsername(payload.sub);

    if (!assignedTo) {
      setAssignedTo(payload.sub);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (t) => t.completed
  ).length;

  const pendingTasks =
    totalTasks - completedTasks;

  const progress =
    totalTasks === 0
      ? 0
      : (completedTasks / totalTasks) * 100;

  const addTask = async () => {
    await fetch(
      "http://127.0.0.1:8000/tasks",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          assigned_to: assignedTo,
        }),
      }
    );

    setTitle("");
    setAssignedTo(username);

    loadTasks();
  };

  const deleteTask = async (
    id: string
  ) => {
    await fetch(
      `http://127.0.0.1:8000/tasks/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    loadTasks();
  };

  const completeTask = async (
    id: string
  ) => {
    await fetch(
      `http://127.0.0.1:8000/tasks/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    loadTasks();
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="container">

      <button
        style={{ float: "right" }}
        onClick={logout}
      >
        Logout
      </button>

      <h1 className="title">
        🚀 TaskFlow
      </h1>

      <h2>
        Welcome{" "}
        <span style={{ color: "#4f46e5" }}>
          {username}
        </span>
      </h2>

      <div className="dashboard">

        <div className="card">
          <h3>Total Tasks</h3>
          <h2>{totalTasks}</h2>
        </div>

        <div className="card">
          <h3>Completed</h3>
          <h2>{completedTasks}</h2>
        </div>

        <div className="card">
          <h3>Pending</h3>
          <h2>{pendingTasks}</h2>
        </div>

      </div>

      <div className="progress">
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>

      <input
        className="task-input"
        placeholder="🔍 Search Task"
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
      />

      <br />
      <br />

      <div className="task-form">

        <input
          className="task-input"
          placeholder="Task Title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
        />

        <select
          className="task-input"
          value={assignedTo}
          onChange={(e) =>
            setAssignedTo(e.target.value)
          }
        >
          <option value="">
            Assign User
          </option>

          {users.map((user) => (
            <option
              key={user}
              value={user}
            >
              {user}
            </option>
          ))}
        </select>

        <button
          className="add-btn"
          onClick={addTask}
        >
          Add Task
        </button>

      </div>

      <ul className="task-list">

        {tasks
          .filter((task) =>
            task.title
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
          )
          .map((task) => (
            <li
              key={task.id}
              className="task-card"
            >

              <span
                className={`task-title ${
                  task.completed
                    ? "completed"
                    : ""
                }`}
              >
                {task.completed
                  ? "✅ "
                  : "📌 "}
                {task.title}
              </span>

              <br />

              <small>
                Assigned To:
                <b>
                  {" "}
                  {task.assigned_to}
                </b>
              </small>

              <div className="task-actions">

                <button
                  className="complete-btn"
                  onClick={() =>
                    completeTask(task.id)
                  }
                >
                  Complete
                </button>

                <button
                  className="delete-btn"
                  onClick={() =>
                    deleteTask(task.id)
                  }
                >
                  Delete
                </button>

              </div>

            </li>
          ))}

      </ul>

    </div>
  );
}

export default App;