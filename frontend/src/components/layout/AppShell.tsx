import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './Header';
import BottomNav from './BottomNav';
import { useAuth } from '../../hooks/useAuth';
import styles from './AppShell.module.css';

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function AppShell() {
  const location = useLocation();
  const { isLoading: authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className={styles.splash}>
        <span className={styles.splashTitle}>DanceMax</span>
        <span className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <div className={styles.glowTop} />
      <div className={styles.glowSide} />
      <Header />
      <main className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
