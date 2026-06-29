import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import styles from './Auth.module.css';

export default function Register() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { register }            = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(name.trim(), email, password);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout backTo="/">
      <h1 className={styles.heading}>Create an account</h1>
      <p className={styles.switchText}>
        Already have an account?{' '}
        <Link to="/login" className={styles.link}>Log in</Link>
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && (
          <motion.div
            className={styles.errorBanner}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            {error}
          </motion.div>
        )}

        <div className={styles.field}>
          <input
            type="text"
            className={styles.input}
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        </div>

        <div className={styles.field}>
          <input
            type="email"
            className={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>

        <div className={styles.field}>
          <div className={styles.inputWrap}>
            <input
              type={showPw ? 'text' : 'password'}
              className={`${styles.input} ${styles.inputWithIcon}`}
              placeholder="Password (min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPw((s) => !s)}
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <RiEyeOffLine size={17} /> : <RiEyeLine size={17} />}
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? <span className={styles.spinner} /> : 'Create account'}
        </motion.button>
      </form>
    </AuthLayout>
  );
}
