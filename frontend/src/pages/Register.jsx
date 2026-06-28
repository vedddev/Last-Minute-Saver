import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  RiUserLine, RiMailLine, RiLockLine,
  RiSparklingFill, RiArrowRightLine, RiEyeLine, RiEyeOffLine
} from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
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
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    setError('');
    try {
      await register(name, email, password);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Try again.');
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
          <h2 className={styles.heading}>Create your account</h2>
          <p className={styles.subheading}>Start your AI-powered productivity journey</p>
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
            <label className={styles.label}>Full Name</label>
            <div className={styles.inputWrap}>
              <RiUserLine className={styles.inputIcon} size={16} />
              <input
                type="text"
                className={styles.input}
                placeholder="Jane Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
          </div>

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
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
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
              : <> Create account <RiArrowRightLine size={16} /> </>
            }
          </motion.button>
        </form>

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}