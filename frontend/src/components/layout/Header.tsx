import { Bell, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.css';

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <svg viewBox="0 0 24 24" fill="none" width="22" height="22">
            <path
              d="M15.5 8.5c0 1.38-1.12 2.5-2.5 2.5S10.5 9.88 10.5 8.5 11.62 6 13 6s2.5 1.12 2.5 2.5z"
              fill="white"
              opacity="0.9"
            />
            <path
              d="M8 16.5c0-2.21 2.69-4 6-4s6 1.79 6 4"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M7.5 11c-1.93 0-3.5-1.57-3.5-3.5S5.57 4 7.5 4"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M5 17c0-1.38 1.12-2.5 2.5-2.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
          </svg>
        </div>
        <div className={styles.logoText}>
          Dance<span className={styles.logoAccent}>Max</span>
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.notifBtn} aria-label="Уведомления">
          <Bell size={20} strokeWidth={1.8} />
          <span className={styles.notifDot} />
        </button>
        <button
          className={styles.profileBtn}
          aria-label="Профиль"
          onClick={() => navigate('/profile')}
        >
          <UserCircle size={26} strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}
