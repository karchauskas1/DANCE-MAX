import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Clock, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Skeleton from '../../components/ui/Skeleton';
import { useMyBookings, useCancelBooking } from '../../api/queries';
import styles from './Bookings.module.css';

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

type Tab = 'upcoming' | 'past';

export default function Bookings() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  const {
    data: upcomingBookings,
    isLoading: isLoadingUpcoming,
  } = useMyBookings('active');

  const {
    data: pastBookings,
    isLoading: isLoadingPast,
  } = useMyBookings('attended');

  const cancelBooking = useCancelBooking();

  const bookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;
  const isLoading = activeTab === 'upcoming' ? isLoadingUpcoming : isLoadingPast;

  const handleCancel = (bookingId: number) => {
    cancelBooking.mutate({ bookingId });
  };

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.title} variants={itemVariants}>
        <CalendarCheck size={24} className={styles.titleIcon} />
        Мои записи
      </motion.h1>

      {/* Tabs */}
      <motion.div className={styles.tabs} variants={itemVariants}>
        <button
          className={`${styles.tab} ${activeTab === 'upcoming' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Предстоящие
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'past' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Прошедшие
        </button>
      </motion.div>

      {/* Booking List */}
      {isLoading ? (
        <div className={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.card}>
              <Skeleton width="60%" height={18} />
              <Skeleton width="80%" height={14} />
              <Skeleton width="40%" height={14} />
            </div>
          ))}
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <motion.p className={styles.empty} variants={itemVariants}>
          {activeTab === 'upcoming'
            ? 'Нет предстоящих записей'
            : 'Нет прошедших записей'}
        </motion.p>
      ) : (
        <motion.div
          className={styles.list}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={activeTab}
        >
          {bookings.map((booking) => (
            <motion.div
              key={booking.id}
              className={styles.card}
              variants={itemVariants}
            >
              <h3 className={styles.cardTitle}>
                {booking.lesson.direction.name}
              </h3>
              <div className={styles.cardMeta}>
                <span className={styles.metaItem}>
                  <Clock size={14} />
                  {format(new Date(booking.lesson.date), 'd MMMM', { locale: ru })},{' '}
                  {booking.lesson.startTime}
                </span>
                <span className={styles.metaItem}>
                  <MapPin size={14} />
                  {booking.lesson.room}
                </span>
              </div>
              <span className={styles.cardTeacher}>
                {booking.lesson.teacher.name}
              </span>
              {activeTab === 'upcoming' && (
                <button
                  className={styles.cancelButton}
                  onClick={() => handleCancel(booking.id)}
                  disabled={cancelBooking.isPending}
                >
                  {cancelBooking.isPending &&
                  cancelBooking.variables?.bookingId === booking.id
                    ? 'Отмена...'
                    : 'Отменить'}
                </button>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
