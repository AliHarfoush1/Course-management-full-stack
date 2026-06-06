import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import InstructorDashboard from './InstructorDashboard';
import { Users, BookOpen, CheckCircle, AlertTriangle, GraduationCap, ExternalLink, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('users'); // users, enrollments, courses
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [coursesList, setCoursesList] = useState([]);

  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const triggerNotification = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const getCourseId = (course) => String(course?._id || course?.id || course || '');

  const getCourseName = (courseRef) => {
    if (!courseRef) return 'Unknown Course';
    if (typeof courseRef === 'object') return courseRef.name || courseRef.title || getCourseId(courseRef);
    const matched = coursesList.find((course) => getCourseId(course) === String(courseRef));
    return matched?.name || String(courseRef);
  };

  const fetchCoursesForAdmin = async () => {
    try {
      const res = await api.get('/courses');
      const payload = res.data.data?.courses || res.data.data || [];
      setCoursesList(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.warn('Could not fetch courses for enrollment labels.', err);
    }
  };

  const handleRemoveEnrollment = async (studentId, courseRef) => {
    const courseId = getCourseId(courseRef);
    try {
      setLoadingUsers(true);
      try {
        await api.delete(`/courses/${courseId}/students/${studentId}`);
      } catch (firstErr) {
        await api.delete('/admin/enrollments', { data: { studentId, courseId } });
      }
      triggerNotification('Enrollment removed successfully.');
      fetchUsers();
    } catch (err) {
      triggerNotification(
        err.response?.data?.message ||
        'Backend endpoint for admin enrollment removal is not available yet.',
        'error'
      );
      setLoadingUsers(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setUsersError(null);
      const res = await api.get('/users');
      setUsersList(res.data.data || []);
    } catch (err) {
      setUsersError(err.response?.data?.message || 'Failed to fetch user directory.');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'enrollments') {
      fetchUsers();
    }
    if (activeTab === 'enrollments') {
      fetchCoursesForAdmin();
    }
  }, [activeTab]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setLoadingUsers(true);
      await api.patch(`/users/${userId}/role`, { role: newRole });
      triggerNotification(`User role updated to ${newRole}.`);
      fetchUsers();
    } catch (err) {
      triggerNotification(err.response?.data?.message || 'Failed to change role.', 'error');
      setLoadingUsers(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 0 5rem 0' }}>
      
      {/* Toast Notification */}
      {notification.show && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 1100,
          background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: 'white',
          padding: '1rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          backdropFilter: 'blur(8px)',
          fontWeight: 600
        }}>
          <CheckCircle size={18} />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Admin header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem' }}>
          Admin <span className="gradient-text">Console</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage site membership, elevate roles, and oversee courses.</p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--card-border)', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('users')}
          className="btn"
          style={{
            background: 'transparent',
            borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
            borderRadius: 0,
            color: activeTab === 'users' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            padding: '0.75rem 1rem'
          }}
        >
          <Users size={18} style={{ marginRight: '0.25rem' }} />
          User Management
        </button>
        <button
          onClick={() => setActiveTab('enrollments')}
          className="btn"
          style={{
            background: 'transparent',
            borderBottom: activeTab === 'enrollments' ? '3px solid var(--primary)' : '3px solid transparent',
            borderRadius: 0,
            color: activeTab === 'enrollments' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            padding: '0.75rem 1rem'
          }}
        >
          <GraduationCap size={18} style={{ marginRight: '0.25rem' }} />
          Student Enrollments
        </button>
        <button
          onClick={() => setActiveTab('courses')}
          className="btn"
          style={{
            background: 'transparent',
            borderBottom: activeTab === 'courses' ? '3px solid var(--primary)' : '3px solid transparent',
            borderRadius: 0,
            color: activeTab === 'courses' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600,
            padding: '0.75rem 1rem'
          }}
        >
          <BookOpen size={18} style={{ marginRight: '0.25rem' }} />
          Course Catalog Control
        </button>
      </div>

      {/* Panels */}
      <div>
        
        {/* Tab 1: User Management */}
        {activeTab === 'users' && (
          <div className="glassmorphism card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Registered Users Directory</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Promote or demote users to roles. Roles govern dashboard access policies.
            </p>

            {loadingUsers ? (
              <div style={{ display: 'flex', height: '200px', justifyContent: 'center', alignItems: 'center' }}>
                <div className="pulse-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : usersError ? (
              <div style={{ textAlign: 'center', color: '#ff6b6b', padding: '2rem' }}>
                <AlertTriangle size={32} style={{ marginBottom: '1rem' }} />
                <p>{usersError}</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '1rem' }}>User</th>
                      <th style={{ padding: '1rem' }}>Email Address</th>
                      <th style={{ padding: '1rem' }}>Current Role</th>
                      <th style={{ padding: '1rem' }}>Actions / Elevate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map((usr) => (
                      <tr key={usr._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '1rem', fontWeight: 600 }}>{usr.firstName} {usr.lastName}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{usr.email}</td>
                        <td style={{ padding: '1rem' }}>
                          <span className={`badge badge-${usr.role.toLowerCase()}`}>
                            {usr.role}
                          </span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          {usr._id === user?.id ? (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Self (No change)</span>
                          ) : (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <select
                                value={usr.role}
                                onChange={(e) => handleRoleChange(usr._id, e.target.value)}
                                className="form-input"
                                style={{ padding: '0.35rem 1.5rem 0.35rem 0.75rem', fontSize: '0.8rem', minWidth: '130px', background: 'rgba(255,255,255,0.02)' }}
                              >
                                <option value="STUDENT" style={{ background: 'var(--bg-secondary)' }}>STUDENT</option>
                                <option value="INSTRUCTOR" style={{ background: 'var(--bg-secondary)' }}>INSTRUCTOR</option>
                                <option value="ADMIN" style={{ background: 'var(--bg-secondary)' }}>ADMIN</option>
                              </select>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Student Enrollment Visibility */}
        {activeTab === 'enrollments' && (
          <div className="glassmorphism card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Student Enrolled Courses</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
              Review the courses attached to each student account. Use Open to inspect the course. Remove requires the matching admin backend endpoint.
            </p>

            {loadingUsers ? (
              <div style={{ display: 'flex', height: '200px', justifyContent: 'center', alignItems: 'center' }}>
                <div className="pulse-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
              </div>
            ) : usersError ? (
              <div style={{ textAlign: 'center', color: '#ff6b6b', padding: '2rem' }}>
                <AlertTriangle size={32} style={{ marginBottom: '1rem' }} />
                <p>{usersError}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {usersList.filter((usr) => usr.role === 'STUDENT').map((student) => {
                  const enrolled = student.enrolledCourses || [];
                  return (
                    <div key={student._id || student.id} style={{ padding: '1.25rem', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.05rem' }}>{student.firstName} {student.lastName}</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>{student.email}</p>
                        </div>
                        <span className="badge badge-student">{enrolled.length} Courses</span>
                      </div>

                      {enrolled.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No enrolled courses yet.</p>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                          {enrolled.map((courseRef) => {
                            const courseId = getCourseId(courseRef);
                            return (
                              <div key={courseId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.025)' }}>
                                <div>
                                  <strong style={{ display: 'block' }}>{getCourseName(courseRef)}</strong>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{courseId}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <a href={`/courses/${courseId}`} className="btn btn-secondary" style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}>
                                    <ExternalLink size={14} /> Open
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEnrollment(student._id || student.id, courseRef)}
                                    className="btn btn-danger"
                                    style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                                  >
                                    <Trash2 size={14} /> Remove
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reuse Instructor View for Admin Catalog CRUD */}
        {activeTab === 'courses' && (
          <div className="glassmorphism card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Administrative Course Catalog Control</h2>
            <InstructorDashboard />
          </div>
        )}

      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
