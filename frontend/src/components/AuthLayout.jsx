import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RiArrowRightLine } from 'react-icons/ri';
import styles from '../pages/Auth.module.css';

const TAGLINES = [
  'Plan Smarter, Save More Time.',
  'Your AI-Powered Productivity Partner.',
  'Last-Minute? We\'ve Got You Covered.',
];

export default function AuthLayout({ children, backTo = '/' }) {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % TAGLINES.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={styles.page}>
      <aside className={styles.hero}>
        <div className={styles.heroImage} />
        <div className={styles.heroOverlay} />

        <div className={styles.heroTop}>
          <Link to="/dashboard" className={styles.logo}>ATHENA</Link>
          <Link to={backTo} className={styles.backBtn}>
            Back to website <RiArrowRightLine size={14} />
          </Link>
        </div>

        <div className={styles.heroBottom}>
          <AnimatePresence mode="wait">
            <motion.p
              key={slide}
              className={styles.heroTagline}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
            >
              {TAGLINES[slide]}
            </motion.p>
          </AnimatePresence>

          <div className={styles.dots}>
            {TAGLINES.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.dot} ${i === slide ? styles.dotActive : styles.dotInactive}`}
                onClick={() => setSlide(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </aside>

      <div className={styles.panel}>
        <motion.div
          className={styles.panelInner}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <Link to="/dashboard" className={styles.mobileLogo}>ATHENA</Link>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
