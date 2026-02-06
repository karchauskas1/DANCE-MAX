import { motion } from 'framer-motion';
import { Calendar, Filter } from 'lucide-react';
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

const mockDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const mockFilters = ['Все', 'Hip-Hop', 'Contemporary', 'Stretching', 'Vogue'];

const mockLessons = [
  { id: 1, time: '10:00', title: 'Stretching', teacher: 'Ольга П.', room: 'Зал 1', spots: 5 },
  { id: 2, time: '12:00', title: 'Hip-Hop Начинающие', teacher: 'Алексей К.', room: 'Зал 2', spots: 3 },
  { id: 3, time: '14:00', title: 'Contemporary', teacher: 'Мария С.', room: 'Зал 1', spots: 8 },
  { id: 4, time: '16:00', title: 'Vogue', teacher: 'Дмитрий В.', room: 'Зал 2', spots: 2 },
  { id: 5, time: '18:00', title: 'Hip-Hop Продвинутые', teacher: 'Алексей К.', room: 'Зал 1', spots: 6 },
];

export default function Schedule() {
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
        {mockDays.map((day, index) => (
          <button
            key={day}
            className={`${styles.dayButton} ${index === 2 ? styles.dayButtonActive : ''}`}
          >
            <span className={styles.dayLabel}>{day}</span>
            <span className={styles.dayNumber}>{15 + index}</span>
          </button>
        ))}
      </motion.div>

      {/* Filter Chips */}
      <motion.div className={styles.filters} variants={itemVariants}>
        <Filter size={16} className={styles.filterIcon} />
        {mockFilters.map((filter, index) => (
          <button
            key={filter}
            className={`${styles.filterChip} ${index === 0 ? styles.filterChipActive : ''}`}
          >
            {filter}
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
        {mockLessons.map((lesson) => (
          <motion.div key={lesson.id} className={styles.lessonCard} variants={itemVariants}>
            <div className={styles.lessonTime}>{lesson.time}</div>
            <div className={styles.lessonInfo}>
              <span className={styles.lessonTitle}>{lesson.title}</span>
              <span className={styles.lessonMeta}>
                {lesson.teacher} &middot; {lesson.room}
              </span>
            </div>
            <div className={styles.lessonSpots}>
              {lesson.spots} мест
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
