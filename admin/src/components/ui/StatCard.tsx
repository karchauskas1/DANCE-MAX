import { TrendingUp, TrendingDown } from 'lucide-react';
import styles from './StatCard.module.css';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
  className?: string;
}

export function StatCard({ icon, label, value, trend, className }: StatCardProps) {
  return (
    <div className={`${styles.card} ${className ?? ''}`}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>{icon}</div>
        {trend && (
          <span
            className={`${styles.trend} ${
              trend.direction === 'up' ? styles.trendUp : styles.trendDown
            }`}
          >
            {trend.direction === 'up' ? (
              <TrendingUp size={14} />
            ) : (
              <TrendingDown size={14} />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
    </div>
  );
}
