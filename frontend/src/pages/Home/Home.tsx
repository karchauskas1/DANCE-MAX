import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';
import { useTodayLessons, useDirections, useTeachers } from '../../api/queries';
import Skeleton from '../../components/ui/Skeleton';
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

export default function Home() {
  const navigate = useNavigate();
  const { data: lessons, isLoading: lessonsLoading } = useTodayLessons();
  const { data: directions, isLoading: directionsLoading } = useDirections();
  const { data: teachers, isLoading: teachersLoading } = useTeachers();

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
          {lessonsLoading ? (
            <>
              <Skeleton width="100%" height="60px" borderRadius="12px" />
              <Skeleton width="100%" height="60px" borderRadius="12px" />
              <Skeleton width="100%" height="60px" borderRadius="12px" />
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
                <span className={styles.lessonTime}>{lesson.startTime}</span>
                <span className={styles.lessonTitle}>{lesson.direction.name}</span>
                <span className={styles.lessonTeacher}>{lesson.teacher.name}</span>
              </motion.div>
            ))
          ) : (
            <p style={{ opacity: 0.6, textAlign: 'center', padding: '16px 0' }}>
              Нет занятий сегодня
            </p>
          )}
        </motion.div>
      </motion.section>

      {/* Направления */}
      <motion.section className={styles.section} variants={itemVariants}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Направления</h2>
          <ArrowRight size={20} className={styles.sectionArrow} />
        </div>
        <div className={styles.horizontalScroll}>
          {directionsLoading ? (
            <>
              <Skeleton width="120px" height="48px" borderRadius="12px" />
              <Skeleton width="120px" height="48px" borderRadius="12px" />
              <Skeleton width="120px" height="48px" borderRadius="12px" />
              <Skeleton width="120px" height="48px" borderRadius="12px" />
            </>
          ) : directions && directions.length > 0 ? (
            directions.map((dir) => (
              <div
                key={dir.id}
                className={styles.scrollCard}
                onClick={() => navigate(`/direction/${dir.slug}`)}
                style={{ cursor: 'pointer' }}
              >
                <span>{dir.name}</span>
              </div>
            ))
          ) : null}
        </div>
      </motion.section>

      {/* Преподаватели */}
      <motion.section className={styles.section} variants={itemVariants}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Преподаватели</h2>
          <ArrowRight size={20} className={styles.sectionArrow} />
        </div>
        <div className={styles.horizontalScroll}>
          {teachersLoading ? (
            <>
              <Skeleton width="120px" height="48px" borderRadius="12px" />
              <Skeleton width="120px" height="48px" borderRadius="12px" />
              <Skeleton width="120px" height="48px" borderRadius="12px" />
              <Skeleton width="120px" height="48px" borderRadius="12px" />
            </>
          ) : teachers && teachers.length > 0 ? (
            teachers.map((teacher) => (
              <div
                key={teacher.id}
                className={styles.scrollCard}
                onClick={() => navigate(`/teacher/${teacher.slug}`)}
                style={{ cursor: 'pointer' }}
              >
                <span>{teacher.name}</span>
              </div>
            ))
          ) : null}
        </div>
      </motion.section>
    </motion.div>
  );
}
