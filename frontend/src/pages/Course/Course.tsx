import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import Skeleton from '../../components/ui/Skeleton';
import { useCourse } from '../../api/queries';
import styles from './Course.module.css';

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

export default function Course() {
  const { id } = useParams<{ id: string }>();
  const { data: course, isLoading } = useCourse(id ? Number(id) : undefined);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Skeleton width="100%" height={180} borderRadius="12px" />
        <Skeleton width="70%" height={28} />
        <Skeleton width="100%" height={60} />
        <Skeleton width="100%" height={40} />
        <Skeleton width="100%" height={40} />
        <Skeleton width="100%" height={40} />
        <Skeleton width="100%" height={40} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className={styles.page}>
        <p>Курс не найден</p>
      </div>
    );
  }

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Image */}
      <motion.div className={styles.image} variants={itemVariants} />

      {/* Title */}
      <motion.h1 className={styles.title} variants={itemVariants}>
        {course.name}
      </motion.h1>

      {/* Description */}
      {course.description && (
        <motion.p className={styles.description} variants={itemVariants}>
          {course.description}
        </motion.p>
      )}

      {/* Info rows */}
      <motion.div className={styles.infoRow} variants={itemVariants}>
        <Calendar size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Дата старта</span>
          <span className={styles.infoValue}>
            {format(new Date(course.startDate), 'd MMMM yyyy', { locale: ru })}
          </span>
        </div>
      </motion.div>

      <motion.div className={styles.infoRow} variants={itemVariants}>
        <Clock size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Занятий</span>
          <span className={styles.infoValue}>{course.lessonsCount}</span>
        </div>
      </motion.div>

      {course.teacher && (
        <motion.div className={styles.infoRow} variants={itemVariants}>
          <User size={18} className={styles.infoIcon} />
          <div className={styles.infoContent}>
            <span className={styles.infoLabel}>Преподаватель</span>
            <span className={styles.infoValue}>{course.teacher.name}</span>
          </div>
        </motion.div>
      )}

      <motion.div className={styles.infoRow} variants={itemVariants}>
        <CreditCard size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Стоимость</span>
          <span className={styles.infoValue}>
            {(course.price / 100).toLocaleString('ru-RU')} ₽ / {course.lessonsCount} занятий
          </span>
        </div>
      </motion.div>

      {course.direction && (
        <motion.div className={styles.infoRow} variants={itemVariants}>
          <Calendar size={18} className={styles.infoIcon} />
          <div className={styles.infoContent}>
            <span className={styles.infoLabel}>Направление</span>
            <span className={styles.infoValue}>{course.direction.name}</span>
          </div>
        </motion.div>
      )}

      {/* Enroll Button */}
      <motion.div className={styles.actions} variants={itemVariants}>
        <div className={styles.spotsInfo}>
          {course.spotsLeft > 0
            ? `Осталось ${course.spotsLeft} мест`
            : 'Мест нет'}
        </div>
        <button
          className={styles.enrollButton}
          disabled={course.spotsLeft <= 0}
        >
          Записаться
        </button>
      </motion.div>
    </motion.div>
  );
}
