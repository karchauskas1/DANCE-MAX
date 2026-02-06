import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Check, TicketPercent } from 'lucide-react';
import styles from './Payment.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const mockPlans = [
  { id: 1, lessons: 4, price: 2400, pricePerLesson: 600, popular: false },
  { id: 2, lessons: 8, price: 4800, pricePerLesson: 600, popular: true },
  { id: 3, lessons: 16, price: 8000, pricePerLesson: 500, popular: false },
];

export default function Payment() {
  const [selectedPlan, setSelectedPlan] = useState<number>(2);

  const plan = mockPlans.find((p) => p.id === selectedPlan);
  const total = plan?.price ?? 0;

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.title} variants={itemVariants}>
        <CreditCard size={24} className={styles.titleIcon} />
        Абонементы
      </motion.h1>

      {/* Plan Cards */}
      <motion.div
        className={styles.plans}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {mockPlans.map((p) => (
          <motion.button
            key={p.id}
            className={`${styles.planCard} ${selectedPlan === p.id ? styles.planCardSelected : ''}`}
            onClick={() => setSelectedPlan(p.id)}
            variants={itemVariants}
          >
            {p.popular && <span className={styles.popularBadge}>Популярный</span>}
            <span className={styles.planLessons}>{p.lessons}</span>
            <span className={styles.planLessonsLabel}>занятий</span>
            <span className={styles.planPrice}>
              {p.price.toLocaleString('ru-RU')} руб.
            </span>
            <span className={styles.planPerLesson}>
              {p.pricePerLesson} руб./занятие
            </span>
            {selectedPlan === p.id && (
              <div className={styles.checkMark}>
                <Check size={16} />
              </div>
            )}
          </motion.button>
        ))}
      </motion.div>

      {/* Promo Code */}
      <motion.section className={styles.section} variants={itemVariants}>
        <div className={styles.promoRow}>
          <TicketPercent size={18} className={styles.promoIcon} />
          <input
            type="text"
            className={styles.promoInput}
            placeholder="Промокод"
            readOnly
          />
          <button className={styles.promoButton}>OK</button>
        </div>
      </motion.section>

      {/* Total */}
      <motion.div className={styles.totalRow} variants={itemVariants}>
        <span className={styles.totalLabel}>Итого</span>
        <span className={styles.totalValue}>
          {total.toLocaleString('ru-RU')} руб.
        </span>
      </motion.div>

      {/* Pay Button */}
      <motion.div className={styles.actions} variants={itemVariants}>
        <button className={styles.payButton}>Оплатить</button>
      </motion.div>
    </motion.div>
  );
}
