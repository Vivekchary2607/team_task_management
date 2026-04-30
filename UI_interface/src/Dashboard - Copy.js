import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import "./dashboard.css";

export default function Dashboard({ token,logout }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  // Fetch logged-in user
  const fetchUser = async () => {
    const res = await axios.get("http://localhost:5000/api/auth/me", {
      headers: { Authorization: token }
    });
    setUserInfo(res.data);
  };

  // Fetch users (for assignment)
  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/api/auth/users", {
      headers: { Authorization: token }
    });
    setUsers(res.data);
  };

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    const res = await axios.get("http://localhost:5000/api/tasks", {
      headers: { Authorization: token }
    });
    setTasks(res.data);
  }, [token]);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    fetchUser();
  }, [fetchTasks]);

  // Add task
  const addTask = async () => {
    if (!title || !assignedTo) return alert("Fill all fields");

    await axios.post(
      "http://localhost:5000/api/tasks",
      { title, assignedTo },
      { headers: { Authorization: token } }
    );

    setTitle("");
    fetchTasks();
  };

  // Update status
  const updateStatus = async (id, status) => {
    await axios.put(
      `http://localhost:5000/api/tasks/${id}`,
      { status },
      { headers: { Authorization: token } }
    );
    fetchTasks();
  };

  const pending = tasks.filter(t => t.status === "pending").length;
  const completed = tasks.filter(t => t.status === "done").length;

  return (
  <div className="dashboard">

    {/* Header */}
    <div className="header">
      <h2>🚀 Team Task Management System</h2>
      <p>
        Logged in as: <b>{userInfo?.name}</b>
        <span style={{
            marginLeft: "10px",
            padding: "4px 8px",
            borderRadius: "5px",
            background: userInfo?.role === "admin" ? "#10b981" : "#6366f1",
            color: "white"
        }}>
            {userInfo?.role}
        </span>
        </p>
    </div>

    {/* Stats */}
    <div className="stats">
    <div className="stat-card yellow">Pending: {pending}</div>
    <div className="stat-card green">Completed: {completed}</div>
    </div>

    {/* Add Task */}
    {userInfo?.role === "admin" && (
    <div className="task-form">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task Title"
      />

      <select onChange={(e) => setAssignedTo(e.target.value)}>
        <option value="">Assign User</option>
        {users.map((u) => (
          <option key={u._id} value={u._id}>
            {u.name}
          </option>
        ))}
      </select>

      <button onClick={addTask}>Add Task</button>
    </div>
    )}
    {userInfo?.role !== "admin" && (
    <p style={{ color: "gray", marginBottom: "10px" }}>
        You can only view and update your assigned tasks.
    </p>
    )}
    {/* Tasks */}

    <div className="task-list">
      {tasks.map((t) => (
        <div key={t._id} className="task-card">
          <h4>{t.title}</h4>

          <p>Assigned: {t.assignedTo?.name || "Unassigned"}</p>

          <p>
            Status:
            <span
              style={{
                color: t.status === "done" ? "green" : "orange",
                fontWeight: "bold",
                marginLeft: "5px"
              }}
            >
              {t.status}
            </span>
          </p>

          {t.status !== "done" && (
            <button onClick={() => updateStatus(t._id, "done")}>
              ✅ Mark Complete
            </button>
          )}
        </div>
      ))}
    </div>

    {/* Logout at bottom */}
    <div className="logout-container">
      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>

  </div>
);
}