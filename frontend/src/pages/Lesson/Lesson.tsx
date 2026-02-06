import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Users, BarChart3, User, CalendarCheck, X } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useLessonDetail, useCreateBooking, useCancelBooking } from '../../api/queries';
import Skeleton from '../../components/ui/Skeleton';
import styles from './Lesson.module.css';

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

const levelLabels: Record<string, string> = {
  beginner: 'Начинающий',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
  all: 'Все уровни',
};

export default function Lesson() {
  const { id } = useParams<{ id: string }>();
  const { data: lesson, isLoading, isError } = useLessonDetail(Number(id));
  const createBooking = useCreateBooking();
  const cancelBooking = useCancelBooking();

  if (isLoading) {
    return (
      <div className={styles.page} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Skeleton width="80px" height="28px" borderRadius="14px" />
        <Skeleton width="100%" height="32px" borderRadius="8px" />
        <Skeleton width="100%" height="48px" borderRadius="8px" />
        <Skeleton width="100%" height="48px" borderRadius="8px" />
        <Skeleton width="100%" height="48px" borderRadius="8px" />
        <Skeleton width="100%" height="48px" borderRadius="8px" />
        <Skeleton width="100%" height="48px" borderRadius="8px" />
        <Skeleton width="100%" height="80px" borderRadius="8px" />
        <Skeleton width="100%" height="48px" borderRadius="24px" />
      </div>
    );
  }

  if (isError || !lesson) {
    return (
      <div className={styles.page} style={{ textAlign: 'center', padding: '48px 0' }}>
        <p style={{ opacity: 0.6 }}>Занятие не найдено</p>
      </div>
    );
  }

  const spotsLeft = lesson.maxSpots - lesson.currentSpots;
  const isFull = spotsLeft <= 0;
  const formattedDate = format(new Date(lesson.date), 'd MMMM, EEEE', { locale: ru });

  const handleBook = () => {
    createBooking.mutate(lesson.id);
  };

  const handleCancel = () => {
    cancelBooking.mutate(lesson.id);
  };

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Direction Badge */}
      <motion.div variants={itemVariants}>
        <span className={styles.badge}>{lesson.direction.name}</span>
      </motion.div>

      {/* Title */}
      <motion.h1 className={styles.title} variants={itemVariants}>
        {lesson.direction.name}
      </motion.h1>

      {/* Date & Time */}
      <motion.div className={styles.infoRow} variants={itemVariants}>
        <Clock size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>{formattedDate}</span>
          <span className={styles.infoValue}>{lesson.startTime} - {lesson.endTime}</span>
        </div>
      </motion.div>

      {/* Teacher */}
      <motion.div className={styles.infoRow} variants={itemVariants}>
        <User size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Преподаватель</span>
          <span className={styles.infoValue}>{lesson.teacher.name}</span>
        </div>
      </motion.div>

      {/* Room */}
      <motion.div className={styles.infoRow} variants={itemVariants}>
        <MapPin size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Зал</span>
          <span className={styles.infoValue}>{lesson.room}</span>
        </div>
      </motion.div>

      {/* Spots */}
      <motion.div className={styles.infoRow} variants={itemVariants}>
        <Users size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Свободные места</span>
          <span className={styles.infoValue}>
            {spotsLeft} из {lesson.maxSpots}
          </span>
        </div>
      </motion.div>

      {/* Level */}
      <motion.div className={styles.infoRow} variants={itemVariants}>
        <BarChart3 size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Уровень</span>
          <span className={styles.infoValue}>{levelLabels[lesson.level] || lesson.level}</span>
        </div>
      </motion.div>

      {/* Cancelled notice */}
      {lesson.isCancelled && (
        <motion.div className={styles.section} variants={itemVariants}>
          <p style={{ color: 'var(--tg-theme-destructive-text-color, #e53935)', fontWeight: 600 }}>
            Занятие отменено{lesson.cancelReason ? `: ${lesson.cancelReason}` : ''}
          </p>
        </motion.div>
      )}

      {/* Book / Cancel Button */}
      <motion.div className={styles.actions} variants={itemVariants}>
        {lesson.isBooked ? (
          <button
            className={styles.bookButton}
            onClick={handleCancel}
            disabled={cancelBooking.isPending}
            style={{ background: 'var(--tg-theme-destructive-text-color, #e53935)' }}
          >
            <X size={18} />
            {cancelBooking.isPending ? 'Отмена...' : 'Отменить запись'}
          </button>
        ) : (
          <button
            className={styles.bookButton}
            onClick={handleBook}
            disabled={isFull || lesson.isCancelled || createBooking.isPending}
          >
            <CalendarCheck size={18} />
            {createBooking.isPending
              ? 'Запись...'
              : isFull
                ? 'Мест нет'
                : 'Записаться'}
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
