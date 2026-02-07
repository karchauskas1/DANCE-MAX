import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.ts';
import styles from './AdminShell.module.css';

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * Обёртка для админских маршрутов.
 *
 * - Если авторизация ещё загружается — показываем спиннер.
 * - Если пользователь не админ — редирект на /profile.
 * - Если админ — рендерим children.
 */
export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.guardLoading}>
        <span className={styles.guardSpinner} />
      </div>
    );
  }

  if (!user?.isAdmin) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}
