import { useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  Compass,
  Users,
  GraduationCap,
  CreditCard,
  Percent,
  UserCheck,
  ClipboardList,
  Megaphone,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import styles from './AdminNav.module.css';

interface AdminNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const navItems: AdminNavItem[] = [
  { label: 'Главная',       path: '/admin',              icon: LayoutDashboard },
  { label: 'Расписание',    path: '/admin/schedule',     icon: CalendarDays },
  { label: 'Направления',   path: '/admin/directions',   icon: Compass },
  { label: 'Преподы',       path: '/admin/teachers',     icon: Users },
  { label: 'Курсы',         path: '/admin/courses',      icon: GraduationCap },
  { label: 'Абонементы',    path: '/admin/subscriptions', icon: CreditCard },
  { label: 'Акции',         path: '/admin/promos',       icon: Percent },
  { label: 'Ученики',       path: '/admin/students',     icon: UserCheck },
  { label: 'Записи',        path: '/admin/bookings',     icon: ClipboardList },
  { label: 'Рассылки',      path: '/admin/broadcast',    icon: Megaphone },
];

/**
 * Горизонтальная прокручиваемая навигация для мобильной админки.
 *
 * - Pill-кнопки с иконками Lucide (16px) + подпись
 * - Активная таба подсвечивается primary-цветом
 * - Скроллбар скрыт, прокрутка пальцем/мышью
 * - При переходе активная таба автоматически скроллится в видимую область
 */
export default function AdminNav() {
  const scrollRef = useRef<HTMLElement>(null);
  const location = useLocation();

  /* Авто-скролл к активной табе при смене маршрута */
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const activeEl = container.querySelector<HTMLElement>(
      `[data-active="true"]`,
    );
    if (!activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    /* Если таба частично скрыта — плавно скроллим к ней */
    const scrollLeft =
      activeRect.left -
      containerRect.left -
      containerRect.width / 2 +
      activeRect.width / 2 +
      container.scrollLeft;

    container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <nav ref={scrollRef} className={styles.nav}>
      <div className={styles.track}>
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin'}
              className={({ isActive }) =>
                `${styles.pill} ${isActive ? styles.pillActive : styles.pillInactive}`
              }
            >
              {({ isActive }) => (
                <motion.span
                  className={styles.pillInner}
                  data-active={isActive}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <Icon
                    size={16}
                    strokeWidth={isActive ? 2.2 : 1.6}
                    className={styles.pillIcon}
                  />
                  <span className={styles.pillLabel}>{item.label}</span>
                </motion.span>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
