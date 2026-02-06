import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Users, Calendar } from 'lucide-react';
import styles from './Direction.module.css';

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

const mockDirection = {
  slug: 'hip-hop',
  name: 'Hip-Hop',
  description:
    'Hip-Hop -- это энергичный уличный стиль, объединяющий множество подстилей. На занятиях вы изучите базу, грув, а также научитесь импровизировать и чувствовать музыку.',
  color: '#FF6B6B',
};

const mockTeachers = [
  { id: 1, name: 'Алексей К.', experience: '8 лет' },
  { id: 2, name: 'Дмитрий В.', experience: '5 лет' },
];

const mockLessons = [
  { id: 1, title: 'Hip-Hop Начинающие', time: 'Пн, 18:00', spots: 5 },
  { id: 2, title: 'Hip-Hop Продвинутые', time: 'Ср, 19:00', spots: 3 },
  { id: 3, title: 'Hip-Hop Freestyle', time: 'Пт, 20:00', spots: 8 },
];

export default function Direction() {
  const { slug } = useParams<{ slug: string }>();
  const direction = { ...mockDirection, slug: slug || mockDirection.slug };

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero */}
      <motion.div
        className={styles.hero}
        style={{ borderColor: direction.color }}
        variants={itemVariants}
      >
        <Zap size={32} style={{ color: direction.color }} />
        <h1 className={styles.title}>{direction.name}</h1>
      </motion.div>

      {/* Description */}
      <motion.section className={styles.section} variants={itemVariants}>
        <p className={styles.description}>{direction.description}</p>
      </motion.section>

      {/* Teachers */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>
          <Users size={18} className={styles.sectionIcon} />
          Преподаватели
        </h2>
        <motion.div
          className={styles.teacherList}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {mockTeachers.map((teacher) => (
            <motion.div key={teacher.id} className={styles.teacherCard} variants={itemVariants}>
              <div className={styles.teacherAvatar} />
              <div className={styles.teacherInfo}>
                <span className={styles.teacherName}>{teacher.name}</span>
                <span className={styles.teacherExp}>Опыт: {teacher.experience}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Upcoming Lessons */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>
          <Calendar size={18} className={styles.sectionIcon} />
          Ближайшие занятия
        </h2>
        <motion.div
          className={styles.lessonList}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {mockLessons.map((lesson) => (
            <motion.div key={lesson.id} className={styles.lessonCard} variants={itemVariants}>
              <div className={styles.lessonInfo}>
                <span className={styles.lessonTitle}>{lesson.title}</span>
                <span className={styles.lessonTime}>{lesson.time}</span>
              </div>
              <span className={styles.lessonSpots}>{lesson.spots} мест</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
