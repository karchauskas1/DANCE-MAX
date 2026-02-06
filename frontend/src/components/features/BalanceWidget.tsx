import { Wallet } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import styles from './BalanceWidget.module.css';

interface BalanceWidgetProps {
  balance: number;
  onTopUp?: () => void;
}

function pluralizeLessons(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'занятие';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'занятия';
  return 'занятий';
}

export default function BalanceWidget({
  balance,
  onTopUp,
}: BalanceWidgetProps) {
  return (
    <div className={styles.card}>
      {/* Decorative ambient glow */}
      <div className={styles.glow} />
      <div className={styles.glowSecondary} />

      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Wallet size={18} strokeWidth={2} />
          </div>
          <span className={styles.label}>Баланс</span>
        </div>

        <div className={styles.valueRow}>
          <span className={styles.value}>
            <AnimatedNumber value={balance} duration={1000} />
          </span>
          <span className={styles.unit}>{pluralizeLessons(balance)}</span>
        </div>

        {onTopUp && (
          <button
            className={styles.topUpBtn}
            onClick={onTopUp}
            type="button"
          >
            Пополнить
          </button>
        )}
      </div>
    </div>
  );
}
