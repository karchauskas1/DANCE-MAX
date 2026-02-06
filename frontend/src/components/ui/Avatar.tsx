import { useMemo } from 'react';
import styles from './Avatar.module.css';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  src?: string;
  name: string;
  size?: AvatarSize;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export default function Avatar({
  src,
  name,
  size = 'md',
  className,
}: AvatarProps) {
  const initials = useMemo(() => getInitials(name), [name]);

  const classNames = [styles.avatar, styles[size], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} aria-label={name} role="img">
      {src ? (
        <img className={styles.image} src={src} alt={name} loading="lazy" />
      ) : (
        <span className={styles.initials}>{initials}</span>
      )}
    </div>
  );
}
