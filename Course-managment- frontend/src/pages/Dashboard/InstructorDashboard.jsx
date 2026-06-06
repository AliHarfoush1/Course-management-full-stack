import React, { useState, useEffect } from 'react';
import api, { IMAGE_BASE_URL } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { BookOpen, Plus, Edit2, Trash2, Video, List, FolderPlus, Film, Users, X, Upload, Save, CheckCircle } from 'lucide-react';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard view state
  const [activeCourse, setActiveCourse] = useState(null); // Course currently being managed
  const [manageTab, setManageTab] = useState('info'); // info, curriculum, students
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('0');
  
  // Active course info form
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('0');
  const [editCover, setEditCover] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  
  // Curriculum state
  const [courseContent, setCourseContent] = useState({ modules: [] });
  const [loadingContent, setLoadingContent] = useState(false);
  
  // Modules and Lessons CRUD Modals/Inputs
  const [showAddModule, setShowAddModule] = useState(false);
  const [moduleTitle, setModuleTitle] = useState('');
  const [editingModule, setEditingModule] = useState(null);
  
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonContentText, setLessonContentText] = useState('');
  const [lessonVideo, setLessonVideo] = useState('');
  const [editingLesson, setEditingLesson] = useState(null);

  // Student list state
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const triggerNotification = (msg, type = 'success') => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
  };

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/courses');
      setCourses(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourseName) return;

    try {
      const res = await api.post('/courses', {
        name: newCourseName,
        description: newCourseDesc,
        price: Number(newCoursePrice)
      });
      triggerNotification('Course created successfully!');
      setShowCreateModal(false);
      // Reset inputs
      setNewCourseName('');
      setNewCourseDesc('');
      setNewCoursePrice('0');
      fetchCourses();
    } catch (err) {
      triggerNotification(err.response?.data?.message || 'Failed to create course.', 'error');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course and all its modules, lessons, and reviews?')) return;
    try {
      await api.delete(`/courses/${id}`);
      triggerNotification('Course deleted successfully.');
      if (activeCourse && activeCourse.id === id) {
        setActiveCourse(null);
      }
      fetchCourses();
    } catch (err) {
      triggerNotification(err.response?.data?.message || 'Failed to delete course.', 'error');
    }
  };

  // Manage course click
  const handleManageCourse = async (courseItem) => {
    setActiveCourse(courseItem);
    setEditName(courseItem.name);
    setEditDesc(courseItem.description);
    setEditPrice(courseItem.price.toString());
    setCoverPreview(courseItem.avatar ? `${IMAGE_BASE_URL}${courseItem.avatar}` : '');
    setManageTab('info');
    fetchCurriculum(courseItem.id || courseItem._id);
  };

  const fetchCurriculum = async (courseId) => {
    try {
      setLoadingContent(true);
      const res = await api.get(`/courses/${courseId}/content`);
      setCourseContent(res.data.data || { modules: [] });
    } catch (err) {
      console.error('Failed to load curriculum:', err);
    } finally {
      setLoadingContent(false);
    }
  };

  const handleUpdateCourseDetails = async (e) => {
    e.preventDefault();
    try {
      // 1) Update text metadata
      await api.put(`/courses/${activeCourse.id || activeCourse._id}`, {
        name: editName,
        description: editDesc,
        price: Number(editPrice)
      });

      // 2) Update cover image if set
      if (editCover) {
        const formData = new FormData();
        formData.append('avatar', editCover);
        await api.post(`/courses/${activeCourse.id || activeCourse._id}/upload-cover`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      triggerNotification('Course details updated.');
      setEditCover(null);
      fetchCourses();
      
      // Update activeCourse details in dashboard state
      setActiveCourse(prev => ({
        ...prev,
        name: editName,
        description: editDesc,
        price: Number(editPrice)
      }));
    } catch (err) {
      triggerNotification(err.response?.data?.message || 'Update failed.', 'error');
    }
  };

  const handleCoverFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditCover(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  // Modules CRUD
  const handleAddOrEditModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle) return;
    const courseId = activeCourse.id || activeCourse._id;

    try {
      if (editingModule) {
        // PATCH `/api/courses/modules/:moduleId`
        await api.patch(`/courses/modules/${editingModule._id}`, { title: moduleTitle });
        triggerNotification('Module updated successfully.');
      } else {
        // POST `/api/courses/:courseId/modules`
        await api.post(`/courses/${courseId}/modules`, {
          title: moduleTitle,
          order: courseContent.modules.length + 1
        });
        triggerNotification('Module added successfully.');
      }
      setModuleTitle('');
      setEditingModule(null);
      setShowAddModule(false);
      fetchCurriculum(courseId);
    } catch (err) {
      triggerNotification(err.response?.data?.message || 'Failed to save module.', 'error');
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    try {
      await api.delete(`/courses/modules/${moduleId}`);
      triggerNotification('Module deleted.');
      fetchCurriculum(activeCourse.id || activeCourse._id);
    } catch (err) {
      triggerNotification('Failed to delete module.', 'error');
    }
  };

  // Lessons CRUD
  const handleAddOrEditLesson = async (e) => {
    e.preventDefault();
    if (!lessonTitle) return;
    const courseId = activeCourse.id || activeCourse._id;

    try {
      if (editingLesson) {
        // PATCH `/api/courses/lessons/:lessonId`
        await api.patch(`/courses/lessons/${editingLesson._id}`, {
          title: lessonTitle,
          content: lessonContentText,
          videoUrl: lessonVideo
        });
        triggerNotification('Lesson updated successfully.');
      } else {
        // POST `/api/courses/:moduleId/lessons`
        await api.post(`/courses/${activeModuleId}/lessons`, {
          title: lessonTitle,
          content: lessonContentText,
          videoUrl: lessonVideo,
          courseId: courseId,
          order: 1 // default order
        });
        triggerNotification('Lesson added successfully.');
      }
      setLessonTitle('');
      setLessonContentText('');
      setLessonVideo('');
      setEditingLesson(null);
      setShowAddLesson(false);
      fetchCurriculum(courseId);
    } catch (err) {
      triggerNotification(err.response?.data?.message || 'Failed to save lesson.', 'error');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Delete this lesson?')) return;
    try {
      await api.delete(`/courses/lessons/${lessonId}`);
      triggerNotification('Lesson deleted.');
      fetchCurriculum(activeCourse.id || activeCourse._id);
    } catch (err) {
      triggerNotification('Failed to delete lesson.', 'error');
    }
  };

  // Enrolled Students
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await api.get(`/courses/${activeCourse.id || activeCourse._id}/students`);
      setStudents(res.data.data || []);
    } catch (err) {
      console.error(err);
      triggerNotification('Could not load student list.', 'error');
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (activeCourse && manageTab === 'students') {
      fetchStudents();
    }
  }, [manageTab, activeCourse]);

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

      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem' }}>
            Instructor <span className="gradient-text">Studio</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Configure curricula, upload assets, and review courses.</p>
        </div>
        {!activeCourse && (
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={20} /> Create New Course
          </button>
        )}
      </div>

      {!activeCourse ? (
        /* ------------------ COURSE LIST VIEW ------------------ */
        <div>
          {loading ? (
            <div style={{ display: 'flex', height: '300px', justifyContent: 'center', alignItems: 'center' }}>
              <div className="pulse-glow" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '4px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
            </div>
          ) : error ? (
            <div className="glassmorphism card" style={{ padding: '3rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <p style={{ color: '#ff6b6b', marginBottom: '1rem' }}>{error}</p>
              <button onClick={fetchCourses} className="btn btn-primary">Retry</button>
            </div>
          ) : courses.length === 0 ? (
            <div className="glassmorphism card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <BookOpen size={44} style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }} />
              <h3>No Courses Found</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>You have not created any courses yet. Get started by clicking the button below.</p>
              <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">Create Your First Course</button>
            </div>
          ) : (
            <div className="course-grid">
              {courses.map((course) => (
                <div key={course.id || course._id} className="glassmorphism card" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
                  <div style={{ position: 'relative', width: '100%', paddingTop: '50%', overflow: 'hidden' }}>
                    <img
                      src={course.avatar ? `${IMAGE_BASE_URL}${course.avatar}` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                      alt={course.name}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{course.name}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleManageCourse(course)} className="btn btn-primary" style={{ flex: 1, padding: '0.5rem 0', fontSize: '0.9rem' }}>
                        Manage Course
                      </button>
                      <button onClick={() => handleDeleteCourse(course.id || course._id)} className="btn btn-danger" style={{ padding: '0 0.75rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ------------------ ACTIVE COURSE MANAGEMENT VIEW ------------------ */
        <div>
          {/* Back link */}
          <button onClick={() => setActiveCourse(null)} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            &larr; Back to Studio
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem' }}>
            
            {/* Sidebar menu */}
            <aside className="glassmorphism card" style={{ height: 'fit-content', padding: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', padding: '0.5rem', borderBottom: '1px solid var(--card-border)', marginBottom: '1rem' }}>
                Course Settings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <button onClick={() => setManageTab('info')} className={`sidebar-tab ${manageTab === 'info' ? 'active' : ''}`} style={{ fontSize: '0.9rem' }}>
                  <Edit2 size={16} />
                  Basic Info
                </button>
                <button onClick={() => setManageTab('curriculum')} className={`sidebar-tab ${manageTab === 'curriculum' ? 'active' : ''}`} style={{ fontSize: '0.9rem' }}>
                  <List size={16} />
                  Curriculum
                </button>
                <button onClick={() => setManageTab('students')} className={`sidebar-tab ${manageTab === 'students' ? 'active' : ''}`} style={{ fontSize: '0.9rem' }}>
                  <Users size={16} />
                  Enrolled Students
                </button>
              </div>
            </aside>

            {/* Content area */}
            <main>
              
              {/* Tab 1: Basic Info and Cover Upload */}
              {manageTab === 'info' && (
                <div className="glassmorphism card" style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Edit Course Information</h2>
                  
                  <form onSubmit={handleUpdateCourseDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    
                    {/* Cover image upload */}
                    <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
                      <img
                        src={coverPreview || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                        alt="Preview"
                        style={{ width: '180px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}
                      />
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem' }}>Course Cover Image</h4>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Upload a landscape cover for catalog preview.</p>
                        <label htmlFor="cover-uploader" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                          <Upload size={14} /> Upload Cover
                          <input id="cover-uploader" type="file" accept="image/*" onChange={handleCoverFile} style={{ display: 'none' }} />
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Course Name</label>
                      <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="form-input" required />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea rows={6} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="form-input" style={{ resize: 'none' }} required></textarea>
                    </div>

                    <div className="form-group">
                      <label>Price (USD)</label>
                      <input type="number" min="0" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="form-input" required />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '2.75rem', alignSelf: 'flex-start' }}>
                      <Save size={16} /> Save Changes
                    </button>
                  </form>
                </div>
              )}

              {/* Tab 2: Curriculum Manager */}
              {manageTab === 'curriculum' && (
                <div className="glassmorphism card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                      <h2 style={{ fontSize: '1.5rem' }}>Manage Curriculum</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Create modules and add video lessons for each.</p>
                    </div>
                    <button onClick={() => { setEditingModule(null); setModuleTitle(''); setShowAddModule(true); }} className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                      <FolderPlus size={16} /> Add Module
                    </button>
                  </div>

                  {loadingContent ? (
                    <div style={{ display: 'flex', height: '150px', justifyContent: 'center', alignItems: 'center' }}>
                      <div className="pulse-glow" style={{ width: '30px', height: '30px', borderRadius: '50%', border: '3px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                    </div>
                  ) : courseContent.modules.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed var(--card-border)', borderRadius: 'var(--radius-md)' }}>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>Your curriculum is empty. Create a module to begin adding lessons.</p>
                      <button onClick={() => { setEditingModule(null); setModuleTitle(''); setShowAddModule(true); }} className="btn btn-primary">Create Module</button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {courseContent.modules.map((mod, mIdx) => (
                        <div key={mod._id} style={{ border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.01)' }}>
                          
                          {/* Module Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--card-border)', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>M{mIdx+1}</span>
                              <h4 style={{ fontWeight: 600, fontSize: '1rem' }}>{mod.title}</h4>
                            </div>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button onClick={() => { setEditingModule(mod); setModuleTitle(mod.title); setShowAddModule(true); }} className="btn btn-secondary" style={{ padding: '0.35rem 0.5rem' }} title="Edit Module">
                                <Edit2 size={12} />
                              </button>
                              <button onClick={() => { setActiveModuleId(mod._id); setEditingLesson(null); setLessonTitle(''); setLessonContentText(''); setLessonVideo(''); setShowAddLesson(true); }} className="btn btn-secondary" style={{ padding: '0.35rem 0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem' }} title="Add Lesson">
                                <Plus size={12} /> Add Lesson
                              </button>
                              <button onClick={() => handleDeleteModule(mod._id)} className="btn btn-danger" style={{ padding: '0.35rem 0.5rem' }} title="Delete Module">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>

                          {/* Lessons under Module */}
                          <div style={{ padding: '0.5rem 1rem' }}>
                            {mod.lessons && mod.lessons.length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {mod.lessons.map((les) => (
                                  <div key={les._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(255,255,255,0.03)', background: 'rgba(255,255,255,0.005)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                      <Video size={14} style={{ color: 'var(--text-muted)' }} />
                                      <span style={{ fontSize: '0.9rem' }}>{les.title}</span>
                                      {les.videoUrl && <span style={{ fontSize: '0.7rem', color: 'var(--accent)', background: 'rgba(6, 182, 212, 0.1)', padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-sm)' }}>Video</span>}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                      <button onClick={() => { setEditingLesson(les); setLessonTitle(les.title); setLessonContentText(les.content || ''); setLessonVideo(les.videoUrl || ''); setActiveModuleId(mod._id); setShowAddLesson(true); }} className="btn btn-secondary" style={{ padding: '0.25rem 0.4rem' }}>
                                        <Edit2 size={12} />
                                      </button>
                                      <button onClick={() => handleDeleteLesson(les._id)} className="btn btn-danger" style={{ padding: '0.25rem 0.4rem' }}>
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '0.75rem 0', textAlign: 'center' }}>No lessons added. Click "Add Lesson" to start uploading curriculum content.</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Enrolled Students List */}
              {manageTab === 'students' && (
                <div className="glassmorphism card" style={{ padding: '2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Enrolled Students</h2>

                  {loadingStudents ? (
                    <div style={{ display: 'flex', height: '150px', justifyContent: 'center', alignItems: 'center' }}>
                      <div className="pulse-glow" style={{ width: '35px', height: '35px', borderRadius: '50%', border: '3px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                    </div>
                  ) : students.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No students are enrolled in this course yet.</p>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student) => (
                            <tr key={student._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                              <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{student.firstName} {student.lastName}</td>
                              <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{student.email}</td>
                              <td style={{ padding: '0.75rem 1rem' }}>
                                <span className="badge badge-student" style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>Student</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </main>
          </div>
        </div>
      )}

      {/* ------------------ MODALS ------------------ */}

      {/* A) Course Creation Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content glassmorphism">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Create New Course</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label>Course Name</label>
                <input type="text" placeholder="e.g. Complete NodeJS Developer" value={newCourseName} onChange={(e) => setNewCourseName(e.target.value)} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Course Description</label>
                <textarea rows={4} placeholder="Brief details about what the course covers..." value={newCourseDesc} onChange={(e) => setNewCourseDesc(e.target.value)} className="form-input" style={{ resize: 'none' }} required></textarea>
              </div>
              <div className="form-group">
                <label>Price (USD)</label>
                <input type="number" min="0" value={newCoursePrice} onChange={(e) => setNewCoursePrice(e.target.value)} className="form-input" required />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Course</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B) Add/Edit Module Modal */}
      {showAddModule && (
        <div className="modal-overlay">
          <div className="modal-content glassmorphism" style={{ maxWidth: '450px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>{editingModule ? 'Edit Module' : 'Create New Module'}</h3>
              <button onClick={() => setShowAddModule(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddOrEditModule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Module Title</label>
                <input type="text" placeholder="e.g. Introduction to HTML" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} className="form-input" required />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setShowAddModule(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingModule ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* C) Add/Edit Lesson Modal */}
      {showAddLesson && (
        <div className="modal-overlay">
          <div className="modal-content glassmorphism">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem' }}>{editingLesson ? 'Edit Lesson' : 'Create New Lesson'}</h3>
              <button onClick={() => setShowAddLesson(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddOrEditLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label>Lesson Title</label>
                <input type="text" placeholder="e.g. Setup Node Environment" value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} className="form-input" required />
              </div>
              <div className="form-group">
                <label>Lesson Content / Written Material</label>
                <textarea rows={4} placeholder="Written details, instructions or markdown..." value={lessonContentText} onChange={(e) => setLessonContentText(e.target.value)} className="form-input" style={{ resize: 'none' }}></textarea>
              </div>
              <div className="form-group">
                <label>Lesson Video URL (YouTube, Vimeo, etc.)</label>
                <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={lessonVideo} onChange={(e) => setLessonVideo(e.target.value)} className="form-input" />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                <button type="button" onClick={() => setShowAddLesson(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">{editingLesson ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default InstructorDashboard;
