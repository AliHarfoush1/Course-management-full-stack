import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { IMAGE_BASE_URL } from '../utils/api';
import { BookOpen, Video, Lock, Unlock, Play, CheckCircle, MessageSquare, Trash2, Edit3, Award, AlertTriangle } from 'lucide-react';

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchProfile } = useAuth();
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [reviews, setReviews] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Lesson Player state
  const [activeLesson, setActiveLesson] = useState(null);
  
  // Reviews state (Only for students)
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);

  // Custom confirmation modal state
  const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null });

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({ show: true, title, message, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal({ show: false, title: '', message: '', onConfirm: null });
  };

  const confirmAction = async () => {
    const action = confirmModal.onConfirm;
    closeConfirm();
    if (action) await action();
  };

  const isEnrolled = user && user.role === 'STUDENT' && user.enrolledCourses?.some(c => {
    if (typeof c === 'string') return c === id;
    if (c && typeof c === 'object') {
      const courseId = c._id || c.id || c;
      return String(courseId) === String(id);
    }
    return String(c) === String(id);
  });
  const isInstructorOrAdmin = user && (user.role === 'INSTRUCTOR' || user.role === 'ADMIN');
  const canAccessContent = isEnrolled || isInstructorOrAdmin;
  const currentUserId = user?._id || user?.id || user?.userId;

  const normalizeReviews = (payload) => {
    const raw = payload?.data?.reviews || payload?.data?.review || payload?.data || payload?.reviews || payload?.review || payload || [];
    return Array.isArray(raw) ? raw : [];
  };

  const getReviewUserId = (review) => {
    if (!review) return '';
    if (typeof review.user === 'string') return review.user;
    if (typeof review.student === 'string') return review.student;
    if (typeof review.createdBy === 'string') return review.createdBy;
    if (typeof review.author === 'string') return review.author;
    return (
      review.user?._id ||
      review.user?.id ||
      review.student?._id ||
      review.student?.id ||
      review.createdBy?._id ||
      review.createdBy?.id ||
      review.author?._id ||
      review.author?.id ||
      review.userId ||
      review.studentId ||
      review.createdById ||
      ''
    );
  };

  const isMyReview = (review) => {
    const reviewUserId = getReviewUserId(review);
    return currentUserId && reviewUserId && String(reviewUserId) === String(currentUserId);
  };

  const canManageReview = (review) => {
    return Boolean(user && (isMyReview(review) || user.role === 'ADMIN'));
  };

  const getReviewUserName = (review) => {
    if (review?.userName) return review.userName;
    if (review?.user && typeof review.user === 'object') {
      return `${review.user.firstName || ''} ${review.user.lastName || ''}`.trim() || review.user.email || 'Student';
    }
    return 'Student';
  };

  const getReviewDate = (review) => {
    const value = review?.createdAt || review?.updatedAt || review?.Timestamp || review?.timestamp;
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : '';
  };

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1) Fetch course details & content
      const contentRes = await api.get(`/courses/${id}/content`);
      if (contentRes.data && contentRes.data.data) {
        setCourse(contentRes.data.data.course);
        setModules(contentRes.data.data.modules || []);
        
        // Set first lesson of first module as active if enrolled
        if (contentRes.data.data.modules?.length > 0 && contentRes.data.data.modules[0].lessons?.length > 0) {
          setActiveLesson(contentRes.data.data.modules[0].lessons[0]);
        }
      }

      // 2) Fetch reviews for everyone, but only enrolled students can create/update/delete
      try {
        const reviewsRes = await api.get(`/courses/${id}/reviews`);
        const normalizedReviews = normalizeReviews(reviewsRes.data);
        setReviews(normalizedReviews);
        
        // Check if current student already left a review
        const myReview = currentUserId
          ? normalizedReviews.find((r) => isMyReview(r))
          : null;

        if (myReview) {
          setRating(Number(myReview.rating) || 0);
          setComment(myReview.comment || '');
          setIsEditingReview(true);
        } else {
          setIsEditingReview(false);
          setRating(0);
          setComment('');
        }
      } catch (revErr) {
        console.log('Could not fetch reviews:', revErr.response?.data?.message || revErr.message);
        setReviews([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) {
      return navigate('/login');
    }
    
    try {
      setLoading(true);
      await api.post(`/courses/${id}/enroll`);
      await fetchProfile(); // refresh user's enrolledCourses list
      await fetchCourseData();
    } catch (err) {
      setError(err.response?.data?.message || 'Enrollment failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnenroll = async () => {
    showConfirm(
      'Unenroll from Course',
      'Are you sure you want to unenroll? All your learning progress for this course will be reset.',
      async () => {
        try {
          setLoading(true);
          await api.delete(`/courses/${id}/unenroll`);
          await fetchProfile();
          await fetchCourseData();
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to unenroll.');
        } finally {
          setLoading(false);
        }
      }
    );
  };

  // Add or Edit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);
    
    if (rating === 0) {
      return setReviewError('Please select a rating from 1 to 5.');
    }
    
    setReviewLoading(true);

    try {
      if (isEditingReview) {
        // PATCH `/api/courses/:courseId/reviews` (Note: Backend review router matches /courses/:courseId/reviews for update)
        const res = await api.patch(`/courses/${id}/reviews`, { rating, comment });
        // Refresh reviews list
        fetchCourseData();
      } else {
        // POST `/api/courses/:courseId/reviews`
        const res = await api.post(`/courses/${id}/reviews`, { rating, comment });
        setIsEditingReview(true);
        fetchCourseData();
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleStartEditReview = (review) => {
    setRating(Number(review.rating) || 0);
    setComment(review.comment || '');
    setIsEditingReview(true);
    setReviewError(null);

    const formElement = document.getElementById('review-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleReviewDelete = async () => {
    showConfirm(
      'Delete Review',
      'Are you sure you want to delete your feedback review? This action cannot be undone.',
      async () => {
        setReviewLoading(true);
        try {
          await api.delete(`/courses/${id}/reviews`);
          setComment('');
          setRating(0);
          setIsEditingReview(false);
          fetchCourseData();
        } catch (err) {
          setReviewError(err.response?.data?.message || 'Failed to delete review.');
        } finally {
          setReviewLoading(false);
        }
      }
    );
  };

  if (loading && !course) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '400px', justifyContent: 'center', alignItems: 'center' }}>
        <div className="pulse-glow" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading course...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container" style={{ marginTop: '3rem' }}>
        <div className="glassmorphism card" style={{ padding: '3rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <p style={{ color: '#ff6b6b', marginBottom: '1.5rem', fontSize: '1.1rem' }}>{error || 'Course not found'}</p>
          <Link to="/" className="btn btn-primary">Back to Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0 5rem 0' }}>
      
      {/* Back button */}
      <Link to="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
        &larr; Back to all courses
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Video Player, Info, and Modules */}
        <main>
          {/* Active Lesson Player */}
          {canAccessContent && activeLesson ? (
            <div className="glassmorphism card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem' }}>
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                {/* Embed video or show standard iframe, or just a mockup video layer */}
                {activeLesson.videoUrl ? (
                  <iframe
                    src={activeLesson.videoUrl.replace('watch?v=', 'embed/')}
                    title={activeLesson.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>
                    <Play size={48} style={{ marginBottom: '1rem' }} />
                    <p>No video available for this lesson</p>
                  </div>
                )}
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{activeLesson.title}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{activeLesson.content || 'No detailed content description for this lesson.'}</p>
              </div>
            </div>
          ) : (
            /* Mockup image placeholder for preview */
            <div className="glassmorphism card" style={{ padding: 0, overflow: 'hidden', marginBottom: '2rem', border: '1px solid var(--card-border)' }}>
              <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', overflow: 'hidden' }}>
                <img
                  src={course.avatar ? `${IMAGE_BASE_URL}${course.avatar}` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                  alt={course.name}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }}
                />
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
                  <Lock size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Course Content is Locked</h3>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', fontSize: '0.95rem' }}>
                    {user ? 'Enroll in this course to get full access to all lessons and learning materials.' : 'Sign in and enroll in this course to start learning.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* About Course */}
          <div className="glassmorphism card" style={{ marginBottom: '2rem', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>About this Course</h2>
            <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{course.description}</p>
          </div>

          {/* Curriculum / Course Modules */}
          <div className="glassmorphism card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Course Curriculum</h2>
            
            {modules.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No modules or lessons have been added yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {modules.map((module, mIdx) => (
                  <div key={module._id} style={{ border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem 1.25rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                        Module {mIdx + 1}: {module.title}
                      </h4>
                      <span className="badge badge-student" style={{ fontSize: '0.7rem' }}>
                        {module.lessons?.length || 0} Lessons
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {module.lessons && module.lessons.length > 0 ? (
                        module.lessons.map((lesson) => {
                          const isActive = activeLesson && activeLesson._id === lesson._id;
                          return (
                            <button
                              key={lesson._id}
                              disabled={!canAccessContent}
                              onClick={() => setActiveLesson(lesson)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '0.85rem 1.25rem',
                                background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                border: 'none',
                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                                width: '100%',
                                textAlign: 'left',
                                cursor: canAccessContent ? 'pointer' : 'default',
                                transition: 'var(--transition-fast)'
                              }}
                            >
                              {canAccessContent ? (
                                <Play size={16} style={{ color: isActive ? 'var(--primary)' : 'var(--text-muted)' }} />
                              ) : (
                                <Lock size={16} style={{ color: 'var(--text-muted)' }} />
                              )}
                              
                              <div style={{ flex: 1 }}>
                                <span style={{ fontSize: '0.95rem', fontWeight: isActive ? 600 : 400 }}>{lesson.title}</span>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          No lessons in this module.
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* Right Side: Sticky Checkout / Action Panel */}
        <aside style={{ position: 'sticky', top: '6.5rem' }}>
          <div className="glassmorphism card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: '1px solid var(--card-border)' }}>
            <img
              src={course.avatar ? `${IMAGE_BASE_URL}${course.avatar}` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
              alt={course.name}
              style={{ width: '100%', borderRadius: 'var(--radius-md)', objectFit: 'cover', height: '180px' }}
            />
            
            <div>
              <span className="badge badge-student" style={{ marginBottom: '0.5rem' }}>{course.level || 'Self-paced'}</span>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.25rem 0' }}>{course.name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Instructor ID: {course.instructor}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Price:</span>
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--success)' }}>
                {course.price === 0 ? 'Free' : `$${course.price}`}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {user && user.role === 'STUDENT' && isEnrolled ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', justifyContent: 'center', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
                    <CheckCircle size={18} /> Enrolled
                  </div>
                  <button onClick={handleUnenroll} className="btn btn-danger" style={{ width: '100%' }}>
                    Unenroll Course
                  </button>
                </>
              ) : isInstructorOrAdmin ? (
                <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: 'var(--radius-md)', color: '#c084fc', fontWeight: 600 }}>
                  Instructor/Admin View
                </div>
              ) : (
                <button onClick={handleEnroll} className="btn btn-primary" style={{ width: '100%', height: '3rem' }}>
                  {user ? 'Enroll Now' : 'Sign In to Enroll'}
                </button>
              )}
            </div>

            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', fontWeight: 600 }}>This course includes:</h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li>✓ Full lifetime access</li>
                <li>✓ Access on mobile and desktop</li>
                <li>✓ Video modules & lessons</li>
                <li>✓ Self-paced learning</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* Reviews Section */}
      <section className="glassmorphism card" style={{ marginTop: '3rem', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={22} className="gradient-text" /> Reviews & Feedback
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '3rem', alignItems: 'start' }}>
            {/* Add/Edit Review Form */}
            {user && user.role === 'STUDENT' && isEnrolled ? (
              <form id="review-form" onSubmit={handleReviewSubmit} style={{ borderRight: '1px solid var(--card-border)', paddingRight: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h4 style={{ fontSize: '1.1rem' }}>{isEditingReview ? 'Edit Your Review' : 'Add Your Review'}</h4>
                
                {reviewError && (
                  <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ff6b6b', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
                    {reviewError}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Rating</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((value) => {
                      const active = value <= (hoverRating || rating);
                      return (
                        <button
                          type="button"
                          key={value}
                          onClick={() => setRating(value)}
                          onMouseEnter={() => setHoverRating(value)}
                          onMouseLeave={() => setHoverRating(0)}
                          className={`rating-choice ${active ? 'active' : ''}`}
                          aria-label={`Rate ${value} out of 5`}
                        >
                          {value}
                        </button>
                      );
                    })}
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginLeft: '0.25rem' }}>
                      {rating ? `${rating}/5 selected` : 'Choose a score'}
                    </span>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Your Feedback Comment</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us what you liked or disliked about this course..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', resize: 'none' }}
                    required
                  ></textarea>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.65rem 0' }} disabled={reviewLoading}>
                    {reviewLoading ? 'Saving...' : isEditingReview ? 'Update Review' : 'Add Review'}
                  </button>
                  {isEditingReview && (
                    <button
                      type="button"
                      onClick={handleReviewDelete}
                      className="btn btn-danger"
                      style={{ padding: '0 0.75rem' }}
                      disabled={reviewLoading}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  )}
                </div>
              </form>
            ) : (
              <div style={{ borderRight: '1px solid var(--card-border)', paddingRight: '2rem', color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                {!user
                  ? 'Login and enroll in this course to leave feedback.'
                  : user.role !== 'STUDENT'
                    ? 'Only students can add or update course reviews.'
                    : 'Enroll in this course to leave feedback.'}
              </div>
            )}

            {/* Reviews List */}
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Course Reviews ({reviews.length})</h4>
              
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.95rem' }}>No reviews have been left for this course yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {reviews.map((rev) => (
                    <div key={rev._id || rev.id || `${getReviewUserId(rev)}-${rev.rating}`} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', gap: '1rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{getReviewUserName(rev)}</span>
                        <span className="rating-pill">
                          <Award size={14} /> {rev.rating}/5
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{rev.comment || 'No comment provided.'}</p>
                      {getReviewDate(rev) && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                          {getReviewDate(rev)}
                        </span>
                      )}

                      {canManageReview(rev) && (
                        <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
                          <button
                            type="button"
                            onClick={() => handleStartEditReview(rev)}
                            className="btn btn-secondary"
                            style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                            disabled={reviewLoading}
                          >
                            <Edit3 size={15} /> Update
                          </button>
                          <button
                            type="button"
                            onClick={handleReviewDelete}
                            className="btn btn-danger"
                            style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                            disabled={reviewLoading}
                          >
                            <Trash2 size={15} /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
      </section>

      {confirmModal.show && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="glassmorphism modal-content" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <AlertTriangle size={22} style={{ color: '#ff6b6b' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem' }}>{confirmModal.title}</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>{confirmModal.message}</p>
            <div className="confirm-actions">
              <button type="button" className="btn btn-secondary" onClick={closeConfirm}>Cancel</button>
              <button type="button" className="btn btn-danger" onClick={confirmAction}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Spin Keyframes for loading */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CourseDetails;
