import { useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  ShieldAlert,
  UserCheck,
  Shield,
  Search,
  Trash2,
  UserX,
  LogOut,
  UserPlus,
  X,
  Lock,
  Mail,
  User,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, blockedUsers: 0, adminCount: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const fetchStats = async () => {
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get(`/admin/users?search=${search}&role=${roleFilter}&status=${statusFilter}`);
      setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter]);

  const handleToggleStatus = async (id, currentStatus, email) => {
    if (email === 'admin@auth.com') {
      alert('Primary admin account cannot be blocked!');
      return;
    }
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    await API.patch(`/admin/users/${id}`, { status: newStatus });
    fetchUsers();
    fetchStats();
  };

  const handleDelete = async (id, email) => {
    if (email === 'admin@auth.com') {
      alert('Primary admin account cannot be deleted!');
      return;
    }
    if (window.confirm('Are you sure you want to delete this user?')) {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
      fetchStats();
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);

    try {
      await API.post('/admin/users', newUserData);
      setShowAddModal(false);
      setNewUserData({ name: '', email: '', password: '', role: 'user' });
      fetchUsers();
      fetchStats();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="admin-container">
      {/* Top Bar */}
      <header className="admin-header">
        <div className="nav-brand">Admin <span>Console</span></div>
        <div className="admin-user-info">
          <span>Logged in as: <strong>{user?.name}</strong></span>
          <button onClick={logout} className="btn btn-logout"><LogOut size={16} /> Logout</button>
        </div>
      </header>

      <main className="admin-main">
        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <Users className="stat-icon icon-blue" />
            <div><h3>{stats.totalUsers}</h3><p>Total Users</p></div>
          </div>
          <div className="stat-card">
            <UserCheck className="stat-icon icon-green" />
            <div><h3>{stats.activeUsers}</h3><p>Active Users</p></div>
          </div>
          <div className="stat-card">
            <ShieldAlert className="stat-icon icon-red" />
            <div><h3>{stats.blockedUsers}</h3><p>Blocked Users</p></div>
          </div>
          <div className="stat-card">
            <Shield className="stat-icon icon-purple" />
            <div><h3>{stats.adminCount}</h3><p>Administrators</p></div>
          </div>
        </div>

        {/* Controls: Search, Filter & Add User */}
        <div className="table-controls">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="controls-right">
            <div className="filter-group">
              <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <button onClick={() => setShowAddModal(true)} className="btn-add-user">
              <UserPlus size={16} /> Add User
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Registered Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSuperAdmin = u.email === 'admin@auth.com' || u.role === 'admin';
                return (
                  <tr key={u._id}>
                    <td className="user-cell">
                      <div className="avatar-small">{u.name.charAt(0).toUpperCase()}</div>
                      <span>{u.name}</span>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      {isSuperAdmin ? (
                        <span className="badge-super-admin">
                          <Shield size={12} /> ADMIN
                        </span>
                      ) : (
                        <span className="badge-static-user">
                          USER
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${u.status === 'active' ? 'status-active' : 'status-blocked'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      {isSuperAdmin ? (
                        <span style={{ fontSize: '12px', color: 'var(--yellow-primary)', fontWeight: 600 }}>
                          Protected
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleToggleStatus(u._id, u.status, u.email)}
                            className={`btn-icon ${u.status === 'active' ? 'btn-warn' : 'btn-success'}`}
                            title={u.status === 'active' ? 'Block User' : 'Activate User'}
                          >
                            {u.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(u._id, u.email)}
                            className="btn-icon btn-danger"
                            title="Delete User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New User</h3>
              <button className="modal-close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            {addError && <div className="alert alert-error">{addError}</div>}

            <form onSubmit={handleCreateUser}>
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-wrapper">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Enter user name"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Assign Role</label>
                <div className="input-wrapper">
                  <Shield className="input-icon" size={18} />
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-white)',
                      outline: 'none',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="user" style={{ background: '#141414', color: '#fff' }}>Standard User</option>
                    <option value="admin" style={{ background: '#141414', color: '#fff' }}>Administrator</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: 'auto', padding: '10px 22px' }}
                  disabled={addLoading}
                >
                  {addLoading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
