import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Filter } from 'lucide-react';
import { format, addDays, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useLessons, useDirections } from '../../api/queries';
import Skeleton from '../../components/ui/Skeleton';
import styles from './Schedule.module.css';

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

export default function Schedule() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDirection, setSelectedDirection] = useState<number | null>(null);

  const { data: directions } = useDirections();
  const { data: lessons, isLoading: lessonsLoading } = useLessons({
    date: format(selectedDate, 'yyyy-MM-dd'),
    directionId: selectedDirection || undefined,
  });

  // Generate 7 days starting from today
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.title} variants={itemVariants}>
        <Calendar size={24} className={styles.titleIcon} />
        Расписание
      </motion.h1>

      {/* Day Picker */}
      <motion.div className={styles.dayPicker} variants={itemVariants}>
        {days.map((day) => {
          const isSelected =
            format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          return (
            <button
              key={day.toISOString()}
              className={`${styles.dayButton} ${isSelected ? styles.dayButtonActive : ''}`}
              onClick={() => setSelectedDate(day)}
            >
              <span className={styles.dayLabel}>
                {isToday(day) ? 'Сег' : format(day, 'EEE', { locale: ru })}
              </span>
              <span className={styles.dayNumber}>{format(day, 'd')}</span>
            </button>
          );
        })}
      </motion.div>

      {/* Filter Chips */}
      <motion.div className={styles.filters} variants={itemVariants}>
        <Filter size={16} className={styles.filterIcon} />
        <button
          className={`${styles.filterChip} ${selectedDirection === null ? styles.filterChipActive : ''}`}
          onClick={() => setSelectedDirection(null)}
        >
          Все
        </button>
        {directions?.map((dir) => (
          <button
            key={dir.id}
            className={`${styles.filterChip} ${selectedDirection === dir.id ? styles.filterChipActive : ''}`}
            onClick={() => setSelectedDirection(dir.id)}
          >
            {dir.name}
          </button>
        ))}
      </motion.div>

      {/* Lesson List */}
      <motion.div
        className={styles.lessonList}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {lessonsLoading ? (
          <>
            <Skeleton width="100%" height="72px" borderRadius="12px" />
            <Skeleton width="100%" height="72px" borderRadius="12px" />
            <Skeleton width="100%" height="72px" borderRadius="12px" />
            <Skeleton width="100%" height="72px" borderRadius="12px" />
          </>
        ) : lessons && lessons.length > 0 ? (
          lessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              className={styles.lessonCard}
              variants={itemVariants}
              onClick={() => navigate(`/lesson/${lesson.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.lessonTime}>{lesson.startTime}</div>
              <div className={styles.lessonInfo}>
                <span className={styles.lessonTitle}>{lesson.direction.name}</span>
                <span className={styles.lessonMeta}>
                  {lesson.teacher.name} &middot; {lesson.room}
                </span>
              </div>
              <div className={styles.lessonSpots}>
                {lesson.maxSpots - lesson.currentSpots} мест
              </div>
            </motion.div>
          ))
        ) : (
          <p style={{ opacity: 0.6, textAlign: 'center', padding: '24px 0' }}>
            Нет занятий
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
