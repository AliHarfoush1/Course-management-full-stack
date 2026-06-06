import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { IMAGE_BASE_URL } from '../utils/api';
import { Search, SlidersHorizontal, ArrowUpDown, BookOpen, Clock, Tag } from 'lucide-react';

const LandingPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('');

  // Fetch courses with debounce or on submit
  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (search) params.search = search;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;

      const response = await api.get('/courses', { params });
      
      if (response.data && response.data.data) {
        setCourses(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [sort]); // Fetch immediately when sort changes

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleResetFilters = () => {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSort('');
    // Trigger fetch by resetting
    setTimeout(() => fetchCourses(), 0);
  };

  return (
    <div style={{ paddingBottom: '5rem' }}>
      {/* Hero Section */}
      <section className="pulse-glow" style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
        borderBottom: '1px solid var(--card-border)',
        padding: '5rem 0 4rem 0',
        textAlign: 'center',
        marginBottom: '3rem'
      }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: 800 }}>
            Master New Skills <br />
            <span className="gradient-text">Anytime, Anywhere</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginBottom: '2.5rem', fontFamily: 'var(--font-secondary)' }}>
            Explore high-quality video courses, lessons, and modules created by industry experts.
          </p>

          {/* Large Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="What do you want to learn today?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '3rem', height: '3.25rem', borderRadius: 'var(--radius-md)', fontSize: '1.05rem' }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem', height: '3.25rem' }}>
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Main Catalog Section */}
      <div className="container">
        <div className="dashboard-layout">
          {/* Sidebar Filters */}
          <aside className="glassmorphism card" style={{ height: 'fit-content', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
              <SlidersHorizontal size={20} className="gradient-text" />
              <h3 style={{ fontSize: '1.2rem' }}>Filters</h3>
            </div>

            {/* Price Filter */}
            <div>
              <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Price Range</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                />
                <span style={{ color: 'var(--text-muted)' }}>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', padding: '0.5rem 0.75rem' }}
                />
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontWeight: 600 }}>Sort By</label>
              <div style={{ position: 'relative' }}>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="form-input"
                  style={{ width: '100%', appearance: 'none', paddingRight: '2rem', background: 'rgba(255,255,255,0.03)' }}
                >
                  <option value="" style={{ background: 'var(--bg-secondary)' }}>Default</option>
                  <option value="price" style={{ background: 'var(--bg-secondary)' }}>Price: Low to High</option>
                  <option value="-price" style={{ background: 'var(--bg-secondary)' }}>Price: High to Low</option>
                  <option value="name" style={{ background: 'var(--bg-secondary)' }}>Name: A to Z</option>
                </select>
                <ArrowUpDown size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Filter buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button onClick={fetchCourses} className="btn btn-primary" style={{ width: '100%' }}>
                Apply Filters
              </button>
              <button onClick={handleResetFilters} className="btn btn-secondary" style={{ width: '100%' }}>
                Reset All
              </button>
            </div>
          </aside>

          {/* Course List Area */}
          <main className="dashboard-content">
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', height: '400px', justifyContent: 'center', alignItems: 'center' }}>
                <div className="pulse-glow" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }}></div>
                <p style={{ color: 'var(--text-secondary)' }}>Loading courses...</p>
              </div>
            ) : error ? (
              <div className="glassmorphism card" style={{ padding: '3rem', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <p style={{ color: '#ff6b6b', marginBottom: '1.5rem', fontSize: '1.1rem' }}>{error}</p>
                <button onClick={fetchCourses} className="btn btn-primary">Try Again</button>
              </div>
            ) : courses.length === 0 ? (
              <div className="glassmorphism card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
                <BookOpen size={48} style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.4rem' }}>No Courses Found</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>We couldn't find any courses matching your search criteria.</p>
                <button onClick={handleResetFilters} className="btn btn-primary">Browse All Courses</button>
              </div>
            ) : (
              <div className="course-grid">
                {courses.map((course) => (
                  <article key={course.id || course._id} className="glassmorphism card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}>
                    <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', overflow: 'hidden' }}>
                      <img
                        src={course.avatar ? `${IMAGE_BASE_URL}${course.avatar}` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                        alt={course.name}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition-normal)' }}
                        className="course-cover-img"
                      />
                      <span className="badge badge-student" style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(9, 9, 11, 0.75)', backdropFilter: 'blur(4px)' }}>
                        {course.level || 'Beginner'}
                      </span>
                    </div>

                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>{course.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {course.description}
                        </p>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '1rem', marginBottom: '1.25rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            <Clock size={14} />
                            Self-paced
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--success)', fontWeight: 700, fontSize: '1.15rem' }}>
                            <Tag size={16} />
                            {course.price === 0 ? 'Free' : `$${course.price}`}
                          </span>
                        </div>

                        <Link to={`/courses/${course.id || course._id}`} className="btn btn-primary" style={{ width: '100%' }}>
                          View Details
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
      
      {/* Styles for course card zoom effect */}
      <style>{`
        .course-grid article:hover .course-cover-img {
          transform: scale(1.05);
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
