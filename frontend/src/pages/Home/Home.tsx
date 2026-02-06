import { motion } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';
import styles from './Home.module.css';

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

const mockLessons = [
  { id: 1, title: 'Hip-Hop Начинающие', time: '18:00', teacher: 'Алексей' },
  { id: 2, title: 'Contemporary', time: '19:00', teacher: 'Мария' },
  { id: 3, title: 'Stretching', time: '20:00', teacher: 'Ольга' },
];

const mockDirections = [
  { id: 1, name: 'Hip-Hop' },
  { id: 2, name: 'Contemporary' },
  { id: 3, name: 'Stretching' },
  { id: 4, name: 'Vogue' },
  { id: 5, name: 'Dancehall' },
];

const mockTeachers = [
  { id: 1, name: 'Алексей К.' },
  { id: 2, name: 'Мария С.' },
  { id: 3, name: 'Ольга П.' },
  { id: 4, name: 'Дмитрий В.' },
];

export default function Home() {
  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.section className={styles.hero} variants={itemVariants}>
        <Flame className={styles.heroIcon} size={40} />
        <h1 className={styles.title}>
          <span className={styles.gradientText}>Добро пожаловать</span>
        </h1>
        <p className={styles.subtitle}>Готовы танцевать?</p>
      </motion.section>

      {/* Занятия сегодня */}
      <motion.section className={styles.section} variants={itemVariants}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Занятия сегодня</h2>
          <ArrowRight size={20} className={styles.sectionArrow} />
        </div>
        <motion.div
          className={styles.lessonList}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {mockLessons.map((lesson) => (
            <motion.div
              key={lesson.id}
              className={styles.lessonCard}
              variants={itemVariants}
            >
              <span className={styles.lessonTime}>{lesson.time}</span>
              <span className={styles.lessonTitle}>{lesson.title}</span>
              <span className={styles.lessonTeacher}>{lesson.teacher}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Направления */}
      <motion.section className={styles.section} variants={itemVariants}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Направления</h2>
          <ArrowRight size={20} className={styles.sectionArrow} />
        </div>
        <div className={styles.horizontalScroll}>
          {mockDirections.map((dir) => (
            <div key={dir.id} className={styles.scrollCard}>
              <span>{dir.name}</span>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Преподаватели */}
      <motion.section className={styles.section} variants={itemVariants}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Преподаватели</h2>
          <ArrowRight size={20} className={styles.sectionArrow} />
        </div>
        <div className={styles.horizontalScroll}>
          {mockTeachers.map((teacher) => (
            <div key={teacher.id} className={styles.scrollCard}>
              <span>{teacher.name}</span>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
