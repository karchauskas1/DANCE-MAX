import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BookOpen,
  Compass,
  GraduationCap,
  BookmarkCheck,
  Ticket,
  CreditCard,
  Megaphone,
  Flame,
  LogOut,
} from 'lucide-react';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Главная',
    items: [
      { to: '/', label: 'Дашборд', icon: <LayoutDashboard size={20} /> },
    ],
  },
  {
    title: 'Управление',
    items: [
      { to: '/schedule', label: 'Расписание', icon: <CalendarDays size={20} /> },
      { to: '/directions', label: 'Направления', icon: <Compass size={20} /> },
      { to: '/teachers', label: 'Преподаватели', icon: <GraduationCap size={20} /> },
      { to: '/courses', label: 'Спецкурсы', icon: <BookOpen size={20} /> },
      { to: '/subscriptions', label: 'Абонементы', icon: <CreditCard size={20} /> },
      { to: '/promos', label: 'Акции', icon: <Ticket size={20} /> },
    ],
  },
  {
    title: 'Клиенты',
    items: [
      { to: '/students', label: 'Ученики', icon: <Users size={20} /> },
      { to: '/bookings', label: 'Записи', icon: <BookmarkCheck size={20} /> },
    ],
  },
  {
    title: 'Коммуникации',
    items: [
      { to: '/broadcast', label: 'Рассылки', icon: <Megaphone size={20} /> },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <Flame size={22} />
        </div>
        <div className={styles.logoText}>
          <span className={styles.logoTitle}>DanceMax</span>
          <span className={styles.logoBadge}>Admin</span>
        </div>
      </div>

      <nav className={styles.nav}>
        {navSections.map((section) => (
          <div key={section.title} className={styles.section}>
            <span className={styles.sectionTitle}>{section.title}</span>
            <ul className={styles.sectionList}>
              {section.items.map((item) => {
                const isActive =
                  item.to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                    >
                      <span className={styles.navIcon}>{item.icon}</span>
                      <span className={styles.navLabel}>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <button className={styles.logoutBtn} type="button">
          <LogOut size={18} />
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
}
