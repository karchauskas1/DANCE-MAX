import { Link, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/auth.ts';
import AdminNav from './AdminNav.tsx';
import styles from './AdminShell.module.css';

/** Извлекает инициалы из имени пользователя */
function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.charAt(0) ?? '';
  const l = lastName?.charAt(0) ?? '';
  return (f + l) || 'A';
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

/**
 * Мобильный лейаут админ-панели (max-width 430px).
 *
 * Структура:
 * 1. Тёмный хедер со стрелкой «назад» + заголовок + аватар
 * 2. Горизонтальная навигация (AdminNav) — sticky под хедером
 * 3. Зона контента с page-transition анимацией через <Outlet />
 */
export default function AdminShell() {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const initials = getInitials(user?.firstName, user?.lastName);

  return (
    <div className={styles.shell}>
      {/* Декоративное свечение в правом углу хедера */}
      <div className={styles.headerGlow} />

      {/* ── Top bar ── */}
      <header className={styles.header}>
        <Link to="/profile" className={styles.backBtn} aria-label="Назад в профиль">
          <motion.span
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.9 }}
            className={styles.backIcon}
          >
            <ArrowLeft size={20} strokeWidth={2} />
          </motion.span>
        </Link>

        <div className={styles.titleGroup}>
          <Shield size={14} strokeWidth={2.4} className={styles.titleBadge} />
          <h1 className={styles.title}>Админ-панель</h1>
        </div>

        <div className={styles.avatar} title={user?.firstName}>
          {initials}
        </div>
      </header>

      {/* ── Navigation ── */}
      <AdminNav />

      {/* ── Content ── */}
      <main className={styles.content}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
