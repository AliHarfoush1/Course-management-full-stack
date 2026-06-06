import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IMAGE_BASE_URL } from '../utils/api';
import { GraduationCap, LogOut, BookOpen, User, LayoutDashboard, Award } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'INSTRUCTOR') return '/instructor';
    return '/student';
  };

  return (
    <header className="navbar-wrapper glassmorphism">
      <div className="container navbar">
        <Link to="/" className="navbar-brand">
          <GraduationCap size={32} className="gradient-text" style={{ stroke: 'url(#brand-grad)' }} />
          <span>Edu<span className="gradient-text">Stream</span></span>
          
          {/* SVG gradient definition for the icon */}
          <svg width="0" height="0">
            <linearGradient id="brand-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </svg>
        </Link>

        <nav className="navbar-links">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <BookOpen size={18} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
            Courses
          </NavLink>

          {user ? (
            <>
              {user.role === 'STUDENT' ? (
                <NavLink to="/my-courses" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Award size={18} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                  My Courses
                </NavLink>
              ) : (
                <NavLink to={getDashboardPath()} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={18} style={{ marginRight: '0.25rem', verticalAlign: 'middle' }} />
                  Dashboard
                </NavLink>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                  <img
                    src={user.avatar ? `${IMAGE_BASE_URL}${user.avatar}` : '/uploads/profile.jpg'}
                    alt={user.firstName}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                    onError={(e) => {
                      e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                    }}
                  />
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user.firstName}</span>
                  <span className={`badge badge-${user.role.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                    {user.role}
                  </span>
                </Link>

                <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '1rem', marginLeft: '1rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.25rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
