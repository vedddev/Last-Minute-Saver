import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiMailLine, RiLockLine, RiSparklingFill,
  RiEyeLine, RiEyeOffLine, RiArrowRightLine
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import styles from './Auth.module.css';

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const { login }               = useAuth();
  const navigate                = useNavigate();

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
    <div className={styles.page}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      <div className={styles.orb3} />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className={styles.cardHeader}>
          <div className={styles.logoMark}>
            <RiSparklingFill size={20} />
          </div>
          <h1 className={styles.brand}>Athena AI</h1>
          <h2 className={styles.heading}>Welcome back</h2>
          <p className={styles.subheading}>Sign in to your workspace</p>
        </div>

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
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrap}>
              <RiMailLine className={styles.inputIcon} size={16} />
              <input
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWrap}>
              <RiLockLine className={styles.inputIcon} size={16} />
              <input
                type={showPw ? 'text' : 'password'}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPw(s => !s)}
              >
                {showPw ? <RiEyeOffLine size={15} /> : <RiEyeLine size={15} />}
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading
              ? <span className={styles.spinner} />
              : <> Sign in <RiArrowRightLine size={16} /> </>
            }
          </motion.button>
        </form>

        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" className={styles.link}>Create one free</Link>
        </p>
      </motion.div>
    </div>
  );
}