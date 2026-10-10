import { useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { Users, ShieldAlert, UserCheck, Shield, Search, Trash2, UserX, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, blockedUsers: 0, adminCount: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

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

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    await API.patch(`/admin/users/${id}`, { status: newStatus });
    fetchUsers();
    fetchStats();
  };

  const handleToggleRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    await API.patch(`/admin/users/${id}`, { role: newRole });
    fetchUsers();
    fetchStats();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await API.delete(`/admin/users/${id}`);
      fetchUsers();
      fetchStats();
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

        {/* Controls: Search & Filter */}
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
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="user-cell">
                    <div className="avatar-small">{u.name.charAt(0).toUpperCase()}</div>
                    <span>{u.name}</span>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <button
                      onClick={() => handleToggleRole(u._id, u.role)}
                      className={`badge-btn ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}
                      title="Click to toggle role"
                    >
                      {u.role.toUpperCase()}
                    </button>
                  </td>
                  <td>
                    <span className={`status-pill ${u.status === 'active' ? 'status-active' : 'status-blocked'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button
                      onClick={() => handleToggleStatus(u._id, u.status)}
                      className={`btn-icon ${u.status === 'active' ? 'btn-warn' : 'btn-success'}`}
                      title={u.status === 'active' ? 'Block User' : 'Activate User'}
                    >
                      {u.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button
                      onClick={() => handleDelete(u._id)}
                      className="btn-icon btn-danger"
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
