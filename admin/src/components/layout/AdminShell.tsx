import { Outlet } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { Sidebar } from './Sidebar';
import styles from './AdminShell.module.css';

export function AdminShell() {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Поиск по панели..."
            />
            <kbd className={styles.searchKbd}>Ctrl+K</kbd>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.notificationBtn} type="button">
              <Bell size={20} />
              <span className={styles.notificationDot} />
            </button>
            <div className={styles.adminAvatar}>
              <span className={styles.adminAvatarText}>A</span>
            </div>
          </div>
        </header>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
