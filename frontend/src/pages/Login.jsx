import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import styles from './Auth.module.css';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login }               = useAuth();
  const navigate                = useNavigate();
  const location                = useLocation();
  const registered              = location.state?.registered;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout backTo="/">
      <h1 className={styles.heading}>Log in</h1>
      <p className={styles.switchText}>
        Don&apos;t have an account?{' '}
        <Link to="/register" className={styles.link}>Create an account</Link>
      </p>

      <form onSubmit={handleSubmit} className={styles.form}>
        {registered && (
          <motion.div
            className={styles.successBanner}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            Account created! Please sign in.
          </motion.div>
        )}

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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
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

        <div className={styles.forgotRow}>
          <a href="#" className={styles.forgotLink} onClick={(e) => e.preventDefault()}>
            Forgot password?
          </a>
        </div>

        <motion.button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? <span className={styles.spinner} /> : 'Log in'}
        </motion.button>
      </form>
    </AuthLayout>
  );
}
