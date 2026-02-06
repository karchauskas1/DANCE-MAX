import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, CalendarCheck, History, CreditCard, Info, Wallet, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useBalance } from '../../api/queries';
import Skeleton from '../../components/ui/Skeleton';
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

const quickLinks = [
  { to: '/bookings', label: 'Мои записи', icon: CalendarCheck },
  { to: '/history', label: 'История', icon: History },
  { to: '/payment', label: 'Абонементы', icon: CreditCard },
  { to: '/about', label: 'О студии', icon: Info },
];

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: balanceData, isLoading: balanceLoading } = useBalance();

  const isLoading = authLoading || balanceLoading;

  const displayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(' ')
    : '';

  const initials = user
    ? [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase()
    : '';

  const balance = balanceData?.balance ?? user?.balance ?? 0;
  const activeSubscriptions = balanceData?.activeSubscriptions?.length ?? 0;

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Avatar & Name */}
      <motion.div className={styles.header} variants={itemVariants}>
        {isLoading ? (
          <>
            <Skeleton width="72px" height="72px" borderRadius="50%" />
            <Skeleton width="160px" height="24px" borderRadius="8px" />
          </>
        ) : (
          <>
            {user?.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={displayName}
                className={styles.avatar}
                style={{ borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div className={styles.avatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700 }}>
                {initials}
              </div>
            )}
            <h1 className={styles.name}>{displayName}</h1>
          </>
        )}
      </motion.div>

      {/* Balance Widget */}
      <motion.div className={styles.balanceCard} variants={itemVariants}>
        {isLoading ? (
          <>
            <Skeleton width="120px" height="20px" borderRadius="8px" />
            <Skeleton width="80px" height="32px" borderRadius="8px" />
          </>
        ) : (
          <>
            <div className={styles.balanceHeader}>
              <Wallet size={20} className={styles.balanceIcon} />
              <span className={styles.balanceLabel}>Баланс</span>
            </div>
            <span className={styles.balanceValue}>
              {balance} занятий
            </span>
          </>
        )}
      </motion.div>

      {/* Active Subscriptions */}
      {!isLoading && activeSubscriptions > 0 && (
        <motion.section className={styles.section} variants={itemVariants}>
          <h2 className={styles.sectionTitle}>Активные абонементы</h2>
          <div className={styles.subscriptionCard}>
            <span className={styles.subscriptionName}>
              Активных абонементов: {activeSubscriptions}
            </span>
          </div>
        </motion.section>
      )}

      {/* Admin Panel Link */}
      {user?.isAdmin && (
        <motion.section className={styles.section} variants={itemVariants}>
          <Link to="/admin" className={styles.linkItem} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={20} className={styles.linkIcon} />
            <span className={styles.linkLabel}>Админ-панель</span>
            <ChevronRight size={18} className={styles.linkArrow} />
          </Link>
        </motion.section>
      )}

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
