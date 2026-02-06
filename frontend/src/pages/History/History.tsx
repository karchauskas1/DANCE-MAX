import { motion } from 'framer-motion';
import { Receipt, TrendingUp, TrendingDown } from 'lucide-react';
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

const mockTransactions = [
  { id: 1, type: 'debit' as const, title: 'Hip-Hop Начинающие', date: '18 янв, 18:00', amount: -1 },
  { id: 2, type: 'credit' as const, title: 'Пополнение баланса', date: '17 янв, 12:30', amount: 4800 },
  { id: 3, type: 'debit' as const, title: 'Stretching', date: '16 янв, 10:00', amount: -1 },
  { id: 4, type: 'debit' as const, title: 'Contemporary', date: '15 янв, 19:00', amount: -1 },
  { id: 5, type: 'credit' as const, title: 'Абонемент на 8 занятий', date: '10 янв, 14:00', amount: 8 },
  { id: 6, type: 'debit' as const, title: 'Vogue', date: '9 янв, 20:00', amount: -1 },
  { id: 7, type: 'debit' as const, title: 'Hip-Hop Продвинутые', date: '8 янв, 18:00', amount: -1 },
  { id: 8, type: 'credit' as const, title: 'Пополнение баланса', date: '5 янв, 09:00', amount: 2400 },
];

export default function History() {
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

      <motion.div
        className={styles.list}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {mockTransactions.map((tx) => (
          <motion.div key={tx.id} className={styles.row} variants={itemVariants}>
            <div className={`${styles.indicator} ${tx.type === 'credit' ? styles.indicatorPlus : styles.indicatorMinus}`}>
              {tx.type === 'credit' ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
            </div>
            <div className={styles.rowInfo}>
              <span className={styles.rowTitle}>{tx.title}</span>
              <span className={styles.rowDate}>{tx.date}</span>
            </div>
            <span className={`${styles.rowAmount} ${tx.type === 'credit' ? styles.amountPlus : styles.amountMinus}`}>
              {tx.type === 'credit' ? '+' : ''}{typeof tx.amount === 'number' && Math.abs(tx.amount) > 1
                ? `${tx.amount.toLocaleString('ru-RU')} руб.`
                : `${tx.amount} занятие`}
            </span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
