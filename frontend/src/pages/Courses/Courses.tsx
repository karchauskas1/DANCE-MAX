import { motion } from 'framer-motion';
import { BookOpen, Clock, User } from 'lucide-react';
import styles from './Courses.module.css';

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

const mockCourses = [
  {
    id: 1,
    title: 'Интенсив по Hip-Hop',
    teacher: 'Алексей К.',
    dates: '20-25 января',
    lessons: 6,
    price: 4500,
  },
  {
    id: 2,
    title: 'Спецкурс Contemporary: импровизация',
    teacher: 'Мария С.',
    dates: '1-15 февраля',
    lessons: 8,
    price: 6000,
  },
  {
    id: 3,
    title: 'Vogue Intensive',
    teacher: 'Дмитрий В.',
    dates: '10-12 февраля',
    lessons: 3,
    price: 2500,
  },
  {
    id: 4,
    title: 'Stretching: глубокая растяжка',
    teacher: 'Ольга П.',
    dates: '5-28 февраля',
    lessons: 12,
    price: 8000,
  },
];

export default function Courses() {
  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.title} variants={itemVariants}>
        <BookOpen size={24} className={styles.titleIcon} />
        Спецкурсы и интенсивы
      </motion.h1>

      <motion.div
        className={styles.list}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {mockCourses.map((course) => (
          <motion.div key={course.id} className={styles.card} variants={itemVariants}>
            <div className={styles.cardImage} />
            <div className={styles.cardBody}>
              <h3 className={styles.cardTitle}>{course.title}</h3>
              <div className={styles.cardMeta}>
                <span className={styles.metaItem}>
                  <User size={14} />
                  {course.teacher}
                </span>
                <span className={styles.metaItem}>
                  <Clock size={14} />
                  {course.dates}
                </span>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.lessonsCount}>{course.lessons} занятий</span>
                <span className={styles.price}>{course.price.toLocaleString('ru-RU')} руб.</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
