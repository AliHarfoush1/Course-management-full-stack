import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, { IMAGE_BASE_URL } from '../../utils/api';
import { BookOpen, Award } from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  const fetchMyCourses = async () => {
    try {
      setLoadingCourses(true);
      setCoursesError(null);
      const res = await api.get('/courses/my-courses');
      setMyCourses(res.data.data || []);
    } catch (err) {
      setCoursesError(err.response?.data?.message || 'Failed to fetch enrolled courses.');
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchMyCourses();
  }, []);

  return (
    <div className="container" style={{ padding: '3rem 0 5rem 0' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          My <span className="gradient-text">Enrolled Courses</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Access your courses, watch lessons, and track your learning progress.
        </p>
      </div>

      <div>
        {loadingCourses ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '300px', justifyContent: 'center', alignItems: 'center' }}>
            <div className="pulse-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
          </div>
        ) : coursesError ? (
          <div className="glassmorphism card" style={{ padding: '3rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <p style={{ color: '#ff6b6b', marginBottom: '1.5rem' }}>{coursesError}</p>
            <button onClick={fetchMyCourses} className="btn btn-primary">Try Again</button>
          </div>
        ) : myCourses.length === 0 ? (
          <div className="glassmorphism card" style={{ padding: '5rem 2rem', textAlign: 'center' }}>
            <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>No Enrolled Courses</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
              You haven't enrolled in any courses yet. Browse our library to start learning.
            </p>
            <Link to="/" className="btn btn-primary">Explore Courses</Link>
          </div>
        ) : (
          <div className="course-grid">
            {myCourses.map((course) => (
              <article key={course.id || course._id} className="glassmorphism card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: 0 }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', overflow: 'hidden', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
                  <img
                    src={course.avatar ? `${IMAGE_BASE_URL}${course.avatar}` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                    alt={course.name}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{course.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.description}
                    </p>
                  </div>
                  <Link to={`/courses/${course.id || course._id}`} className="btn btn-primary" style={{ width: '100%' }}>
                    Open Course
                  </Link>
                </div>
              </article>
            ))}
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

export default StudentDashboard;
