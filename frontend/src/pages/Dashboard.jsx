import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, CheckCircle, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">MERN <span>Portal</span></div>
        <button onClick={logout} className="btn btn-logout"><LogOut size={16} /> Logout</button>
      </nav>

      <div className="dashboard-content">
        <div className="profile-card">
          <div className="avatar-large">{user?.name?.charAt(0).toUpperCase()}</div>
          <h2>Welcome, {user?.name}!</h2>
          <p className="badge badge-user">{user?.role?.toUpperCase()}</p>

          <div className="profile-details">
            <div className="detail-item">
              <Mail size={18} /> <span>{user?.email}</span>
            </div>
            <div className="detail-item">
              <CheckCircle size={18} className="text-success" /> <span>Account Status: <strong>{user?.status}</strong></span>
            </div>
            <div className="detail-item">
              <Shield size={18} /> <span>Role: <strong>{user?.role}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


