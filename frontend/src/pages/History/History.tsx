import { motion } from 'framer-motion';
import { Receipt, TrendingUp, TrendingDown, RefreshCw, HandCoins } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useHistory } from '../../api/queries';
import type { TransactionType } from '../../types';
import styles from './History.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const typeIcons: Record<TransactionType, typeof TrendingUp> = {
  purchase: TrendingUp,
  deduction: TrendingDown,
  refund: RefreshCw,
  manual: HandCoins,
};

function isCredit(amount: number): boolean {
  return amount > 0;
}

export default function History() {
  const { data: transactions, isLoading, error } = useHistory();

  if (isLoading) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>
          <Receipt size={24} className={styles.titleIcon} />
          История операций
        </h1>
        <div className={styles.list}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.row} style={{ opacity: 0.4 }}>
              <div className={styles.indicator} />
              <div className={styles.rowInfo}>
                <span className={styles.rowTitle} style={{ background: 'var(--color-border)', borderRadius: 4, height: 14, width: '60%', display: 'block' }} />
                <span className={styles.rowDate} style={{ background: 'var(--color-border)', borderRadius: 4, height: 10, width: '30%', display: 'block', marginTop: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <h1 className={styles.title}>
          <Receipt size={24} className={styles.titleIcon} />
          История операций
        </h1>
        <p style={{ color: 'var(--color-error)', textAlign: 'center', marginTop: 'var(--space-2xl)' }}>
          Ошибка загрузки: {error.message}
        </p>
      </div>
    );
  }

  const list = transactions ?? [];

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.title} variants={itemVariants}>
        <Receipt size={24} className={styles.titleIcon} />
        История операций
      </motion.h1>

      {list.length === 0 ? (
        <motion.p
          variants={itemVariants}
          style={{ color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: 'var(--space-2xl)' }}
        >
          Операций пока нет
        </motion.p>
      ) : (
        <motion.div
          className={styles.list}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {list.map((tx) => {
            const credit = isCredit(tx.amount);
            const Icon = typeIcons[tx.type] ?? Receipt;
            const formattedDate = format(new Date(tx.createdAt), 'd MMM yyyy', { locale: ru });

            return (
              <motion.div key={tx.id} className={styles.row} variants={itemVariants}>
                <div className={`${styles.indicator} ${credit ? styles.indicatorPlus : styles.indicatorMinus}`}>
                  <Icon size={16} />
                </div>
                <div className={styles.rowInfo}>
                  <span className={styles.rowTitle}>{tx.description}</span>
                  <span className={styles.rowDate}>{formattedDate}</span>
                </div>
                <span className={`${styles.rowAmount} ${credit ? styles.amountPlus : styles.amountMinus}`}>
                  {credit ? '+' : ''}{tx.amount}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
