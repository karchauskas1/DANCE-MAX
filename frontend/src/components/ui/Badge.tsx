import { type ReactNode } from 'react';
import styles from './Badge.module.css';

type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'error'
  | 'bachata'
  | 'salsa'
  | 'kizomba';

type BadgeSize = 'sm' | 'md';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
}: BadgeProps) {
  const classNames = [styles.badge, styles[variant], styles[size]]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classNames}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}
