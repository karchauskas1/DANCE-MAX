import { motion } from 'framer-motion';
import { Tag, Gift, TicketPercent } from 'lucide-react';
import styles from './Promotions.module.css';

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

const mockPromotions = [
  {
    id: 1,
    title: 'Приведи друга',
    description: 'Получите скидку 20% на следующий абонемент за каждого приведенного друга.',
    validUntil: '28 февраля',
    discount: '-20%',
  },
  {
    id: 2,
    title: 'Первое занятие бесплатно',
    description: 'Попробуйте любое направление бесплатно. Без обязательств.',
    validUntil: 'Бессрочно',
    discount: 'Бесплатно',
  },
  {
    id: 3,
    title: 'Утренний абонемент',
    description: 'Скидка 30% на абонементы для занятий до 14:00.',
    validUntil: '31 марта',
    discount: '-30%',
  },
];

export default function Promotions() {
  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.title} variants={itemVariants}>
        <Tag size={24} className={styles.titleIcon} />
        Акции
      </motion.h1>

      {/* Promotion Cards */}
      <motion.div
        className={styles.list}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {mockPromotions.map((promo) => (
          <motion.div key={promo.id} className={styles.card} variants={itemVariants}>
            <div className={styles.cardHeader}>
              <Gift size={20} className={styles.cardIcon} />
              <span className={styles.discount}>{promo.discount}</span>
            </div>
            <h3 className={styles.cardTitle}>{promo.title}</h3>
            <p className={styles.cardDescription}>{promo.description}</p>
            <span className={styles.validity}>
              Действует до: {promo.validUntil}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Promo Code Input */}
      <motion.section className={styles.promoSection} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>
          <TicketPercent size={18} className={styles.sectionIcon} />
          Есть промокод?
        </h2>
        <div className={styles.promoInput}>
          <input
            type="text"
            className={styles.input}
            placeholder="Введите промокод"
            readOnly
          />
          <button className={styles.applyButton}>Применить</button>
        </div>
      </motion.section>
    </motion.div>
  );
}
