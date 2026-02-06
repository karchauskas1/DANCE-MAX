import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, CalendarCheck, History, CreditCard, Info, Wallet } from 'lucide-react';
import styles from './Profile.module.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const mockUser = {
  name: 'Иван Петров',
  balance: 2400,
  subscription: 'Абонемент на 8 занятий',
  subscriptionLeft: 5,
};

const quickLinks = [
  { to: '/bookings', label: 'Мои записи', icon: CalendarCheck },
  { to: '/history', label: 'История', icon: History },
  { to: '/payment', label: 'Оплата', icon: CreditCard },
  { to: '/about', label: 'О студии', icon: Info },
];

export default function Profile() {
  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Avatar & Name */}
      <motion.div className={styles.header} variants={itemVariants}>
        <div className={styles.avatar} />
        <h1 className={styles.name}>{mockUser.name}</h1>
      </motion.div>

      {/* Balance Widget */}
      <motion.div className={styles.balanceCard} variants={itemVariants}>
        <div className={styles.balanceHeader}>
          <Wallet size={20} className={styles.balanceIcon} />
          <span className={styles.balanceLabel}>Баланс</span>
        </div>
        <span className={styles.balanceValue}>
          {mockUser.balance.toLocaleString('ru-RU')} руб.
        </span>
      </motion.div>

      {/* Active Subscription */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>Активный абонемент</h2>
        <div className={styles.subscriptionCard}>
          <span className={styles.subscriptionName}>{mockUser.subscription}</span>
          <span className={styles.subscriptionLeft}>
            Осталось: {mockUser.subscriptionLeft} занятий
          </span>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(mockUser.subscriptionLeft / 8) * 100}%` }}
            />
          </div>
        </div>
      </motion.section>

      {/* Quick Links */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>Меню</h2>
        <motion.div
          className={styles.linkList}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {quickLinks.map((link) => (
            <motion.div key={link.to} variants={itemVariants}>
              <Link to={link.to} className={styles.linkItem}>
                <link.icon size={20} className={styles.linkIcon} />
                <span className={styles.linkLabel}>{link.label}</span>
                <ChevronRight size={18} className={styles.linkArrow} />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
