import { useState, useMemo, useEffect } from 'react'

function App() {
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('currentUser') || null)
  
  // Auth States
  const [authMode, setAuthMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')

  // Todo States
  const [todos, setTodos] = useState([])
  const [task, setTask] = useState('')
  const [date, setDate] = useState('')

  // Load user's todos on login
  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`todos_${currentUser}`)
      if (saved) {
        setTodos(JSON.parse(saved))
      } else {
        setTodos([])
      }
    }
  }, [currentUser])

  // Save user's todos when they change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`todos_${currentUser}`, JSON.stringify(todos))
    }
  }, [todos, currentUser])

  const handleAuth = (e) => {
    e.preventDefault()
    setAuthError('')
    if (!username.trim() || !password.trim()) {
      setAuthError('Please fill in all fields.')
      return
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}')
    
    if (authMode === 'signup') {
      if (users[username]) {
        setAuthError('Username already exists!')
        return
      }
      users[username] = password
      localStorage.setItem('users', JSON.stringify(users))
      setCurrentUser(username)
      localStorage.setItem('currentUser', username)
    } else {
      if (users[username] && users[username] === password) {
        setCurrentUser(username)
        localStorage.setItem('currentUser', username)
      } else {
        setAuthError('Invalid username or password!')
      }
    }
    setUsername('')
    setPassword('')
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
    setTodos([])
  }

  const addTodo = (e) => {
    e.preventDefault()
    if (!task || !date) return
    const newTodo = { id: Date.now(), task, date, done: false }
    setTodos([...todos, newTodo].sort((a, b) => new Date(a.date) - new Date(b.date)))
    setTask('')
    setDate('')
  }

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.done).length;
    const pending = total - completed;
    return { total, completed, pending };
  }, [todos]);

  // If not logged in, show Auth UI
  if (!currentUser) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo-icon auth-logo"></div>
            <h2>ToDo Flow</h2>
            <p>{authMode === 'login' ? 'Welcome back! Please login to your account.' : 'Create an account to start managing tasks.'}</p>
          </div>
          
          <form onSubmit={handleAuth} className="task-form">
            {authError && <div className="auth-error">{authError}</div>}
            <div className="form-group">
              <label>Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="Enter username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter password"
              />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '16px' }}>
              {authMode === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <div className="auth-footer">
            {authMode === 'login' ? (
              <p>Don't have an account? <span onClick={() => { setAuthMode('signup'); setAuthError(''); }} className="auth-link">Sign up</span></p>
            ) : (
              <p>Already have an account? <span onClick={() => { setAuthMode('login'); setAuthError(''); }} className="auth-link">Sign in</span></p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Dashboard UI
  return (
    <div className="dashboard-container">
      {/* Sidebar Section */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="logo-icon"></div>
          <h2>ToDo Flow</h2>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <span className="icon">📊</span> My Task
          </a>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
          <button onClick={logout} className="nav-item logout-btn" style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span className="icon">🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="topbar">
          <div className="topbar-title">
            <h1>Overview</h1>
            <p className="subtitle">Manage your tasks and priorities.</p>
          </div>
          <div className="user-profile">
            <div className="avatar">{currentUser.charAt(0).toUpperCase()}</div>
            <span>{currentUser}</span>
          </div>
        </header>

        {/* Stats Widgets */}
        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon bg-blue">📝</div>
            <div className="stat-info">
              <h3>Total Tasks</h3>
              <p className="stat-value">{stats.total}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-green">✨</div>
            <div className="stat-info">
              <h3>Completed</h3>
              <p className="stat-value">{stats.completed}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon bg-orange">⏳</div>
            <div className="stat-info">
              <h3>Pending</h3>
              <p className="stat-value">{stats.pending}</p>
            </div>
          </div>
        </section>

        <section className="content-grid">
          {/* Add Task Panel */}
          <div className="panel add-task-panel">
            <div className="panel-header">
              <h2>Create New Task</h2>
            </div>
            <form onSubmit={addTodo} className="task-form">
              <div className="form-group">
                <label>Task Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Prepare Q3 Marketing Report" 
                  value={task} 
                  onChange={(e) => setTask(e.target.value)} 
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="form-input"
                />
              </div>
              <button type="submit" className="btn-primary">Add Task</button>
            </form>
          </div>

          {/* Task List Panel */}
          <div className="panel task-list-panel">
            <div className="panel-header">
              <h2>Recent Tasks</h2>
              <span className="badge">Sorted by Due Date</span>
            </div>
            
            <div className="table-container">
              {todos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>No tasks found. Create one to get started!</p>
                </div>
              ) : (
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Task Name</th>
                      <th>Due Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todos.map(todo => (
                      <tr key={todo.id} className={todo.done ? 'row-completed' : ''}>
                        <td>
                          <div 
                            className={`status-checkbox ${todo.done ? 'checked' : ''}`}
                            onClick={() => toggleTodo(todo.id)}
                          >
                            {todo.done && '✓'}
                          </div>
                        </td>
                        <td className="task-name-cell">
                          <span className={todo.done ? 'text-strike' : ''}>{todo.task}</span>
                        </td>
                        <td>
                          <span className={`date-badge ${new Date(todo.date) < new Date() && !todo.done ? 'overdue' : ''}`}>
                            {new Date(todo.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td>
                          <button className="btn-icon delete" onClick={() => deleteTodo(todo.id)}>
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
