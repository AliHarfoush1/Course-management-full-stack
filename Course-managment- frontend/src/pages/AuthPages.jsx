import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Mail, Lock, User, Upload, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [notVerified, setNotVerified] = useState(false);

  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      setSuccess('Email verified successfully. You can now sign in.');
    }
    if (searchParams.get('reset') === '1') {
      setSuccess('Password updated successfully. You can now sign in.');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setNotVerified(false);
    
    if (!email || !password) {
      return setError('Please fill in all fields.');
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      setSuccess('Logged in successfully!');
      
      // Redirect based on role
      setTimeout(() => {
        if (user.role === 'ADMIN') navigate('/admin');
        else if (user.role === 'INSTRUCTOR') navigate('/instructor');
        else navigate('/');
      }, 800);
    } catch (err) {
      setError(err.message);
      // Backend returns 403 if email is not verified
      if (err.message.toLowerCase().includes('verify your email')) {
        setNotVerified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await api.post('/resend-verification-email', { email });
      setSuccess('Verification email resent! Please check your inbox.');
      setNotVerified(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 4.5rem)', padding: '2rem 1rem' }}>
      <div className="glassmorphism card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Enter your credentials to access your account
        </p>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ff6b6b', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#a7f3d0', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          {notVerified && (
            <button
              type="button"
              onClick={handleResendEmail}
              className="btn btn-secondary"
              style={{ width: '100%', marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.3)' }}
              disabled={loading}
            >
              Resend Verification Email
            </button>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '3rem', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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

    if (!firstName || !lastName || !email || !password) {
      return setError('Please fill in all fields.');
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }

    const formData = new FormData();
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    formData.append('email', email);
    formData.append('password', password);
    if (avatar) {
      formData.append('avatar', avatar);
    }

    try {
      setLoading(true);
      const res = await register(formData);
      setSuccess(
        res.message ||
        'Account created successfully. We sent a verification email to your inbox. Please verify your email, then sign in.'
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 4.5rem)', padding: '2rem 1rem' }}>
      <div className="glassmorphism card" style={{ maxWidth: '500px', width: '100%', padding: '2.5rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>Create Account</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Join us today to start learning new skills
        </p>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ff6b6b', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#a7f3d0', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px' }}>
              <img
                src={avatarPreview || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
                alt="Avatar Preview"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)' }}
              />
              <label htmlFor="avatar-upload" style={{ position: 'absolute', bottom: 0, right: 0, background: 'var(--primary)', padding: '0.35rem', borderRadius: '50%', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <Upload size={16} style={{ color: 'white' }} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Upload Avatar (Optional)</span>
          </div>

          <div className="name-grid">
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          {success && (
            <div style={{ marginTop: '1rem', padding: '1rem', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.08)' }}>
              <strong style={{ display: 'block', marginBottom: '0.35rem' }}>Check your email</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '0.9rem' }}>
                A verification link has been sent to {email}. Open it to activate your account. If you do not see it, check Spam/Junk.
              </p>
              <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>Go to Login</Link>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '3rem', marginTop: '1.25rem' }} disabled={loading || !!success}>
            {loading ? 'Creating Account...' : success ? 'Verification Email Sent' : 'Sign Up'}
          </button>
        </form>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) return setError('Please enter your email.');

    try {
      setLoading(true);
      const res = await api.post('/forget-password', { email });
      setSuccess(
        res.data.message ||
        'Password reset link sent. Open the latest email to enter your new password on the reset page.'
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 4.5rem)', padding: '2rem 1rem' }}>
      <div className="glassmorphism card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem 2rem' }}>
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Sign In
        </Link>

        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Forgot Password</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ff6b6b', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#a7f3d0', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '3rem', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!password || !confirmPassword) {
      return setError('Please fill in all fields.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (password.length < 8) {
      return setError('Password must be at least 8 characters.');
    }

    try {
      setLoading(true);
      const res = await api.patch(`/reset-password/${token}`, { password, confirmPassword });
      setSuccess(res.data.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login?reset=1');
      }, 1800);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Link might be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 4.5rem)', padding: '2rem 1rem' }}>
      <div className="glassmorphism card" style={{ maxWidth: '450px', width: '100%', padding: '2.5rem 2rem' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Reset Password</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Enter and confirm your new password below.
        </p>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ff6b6b', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#a7f3d0', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                style={{ width: '100%', paddingLeft: '2.75rem' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '3rem', marginTop: '1rem' }} disabled={loading}>
            {loading ? 'Updating password...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [statusState, setStatusState] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  const verifyEmail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/verify-email/${token}`);
      setStatusState('success');
      setMessage(res.data.message || 'Email verified successfully! Redirecting you to login...');
      setTimeout(() => navigate('/login?verified=1'), 1800);
    } catch (err) {
      setStatusState('error');
      setMessage(err.response?.data?.message || 'Verification link expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 4.5rem)', padding: '2rem 1rem' }}>
      <div className="glassmorphism card" style={{ maxWidth: '450px', width: '100%', padding: '3rem 2rem', textAlign: 'center' }}>
        {statusState === 'verifying' && (
          <div>
            <div className="pulse-glow" style={{ width: '60px', height: '60px', borderRadius: '50%', border: '4px solid var(--primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem auto' }}></div>
            <h2>Verifying Email</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Please wait while we verify your email token...</p>
          </div>
        )}

        {statusState === 'success' && (
          <div>
            <CheckCircle size={60} style={{ color: 'var(--success)', marginBottom: '1.5rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Email Verified!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{message}</p>
            <Link to="/login?verified=1" className="btn btn-primary" style={{ width: '100%' }}>
              Go to Sign In
            </Link>
          </div>
        )}

        {statusState === 'error' && (
          <div>
            <AlertTriangle size={60} style={{ color: 'var(--error)', marginBottom: '1.5rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Verification Failed</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{message}</p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
