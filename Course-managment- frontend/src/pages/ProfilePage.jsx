import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { IMAGE_BASE_URL } from '../utils/api';
import { User, Mail, Upload, CheckCircle, AlertTriangle, Shield } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!firstName || !lastName) {
      return setError('First name and last name are required.');
    }

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      setLoading(true);
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setAvatar(null);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ marginTop: '3rem' }}>
        <div className="glassmorphism card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p>Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 0 5rem 0', display: 'flex', justifyContent: 'center' }}>
      <div className="glassmorphism card" style={{ maxWidth: '600px', width: '100%', padding: '2.5rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={28} className="gradient-text" /> Account Settings
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Manage your personal public details and profile image.
        </p>

        {success && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#a7f3d0', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ff6b6b', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)' }}>
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              <img
                src={avatarPreview || (user.avatar ? `${IMAGE_BASE_URL}${user.avatar}` : '/uploads/profile.jpg')}
                alt="Avatar"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
                onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'; }}
              />
              <label htmlFor="profile-avatar" style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', padding: '0.3rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Upload size={14} style={{ color: 'white' }} />
                <input
                  id="profile-avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <div>
              <span className={`badge badge-${user.role.toLowerCase()}`} style={{ marginBottom: '0.25rem' }}>{user.role}</span>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Profile Avatar</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Click the camera icon to select a new image.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address (Immutable)</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={user.email}
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.5rem', background: 'rgba(255,255,255,0.01)', borderStyle: 'dashed', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                disabled
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '3rem', marginTop: '1.25rem' }} disabled={loading}>
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
