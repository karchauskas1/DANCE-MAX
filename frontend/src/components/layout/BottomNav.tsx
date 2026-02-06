import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Calendar, User } from 'lucide-react';
import styles from './BottomNav.module.css';

interface NavItem {
  label: string;
  path: string;
  icon: typeof Home;
}

const items: NavItem[] = [
  { label: 'Главная', path: '/', icon: Home },
  { label: 'Расписание', path: '/schedule', icon: Calendar },
  { label: 'Профиль', path: '/profile', icon: User },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className={styles.nav}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive =
          item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`${styles.item} ${isActive ? styles.active : styles.inactive}`}
          >
            {isActive && (
              <motion.span
                className={styles.indicator}
                layoutId="bottomNavIndicator"
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}
            <span className={styles.iconWrap}>
              <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
            </span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
