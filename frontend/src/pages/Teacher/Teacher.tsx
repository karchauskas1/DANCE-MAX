import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Briefcase, Calendar } from 'lucide-react';
import styles from './Teacher.module.css';

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

const mockTeacher = {
  slug: 'alexey-k',
  name: 'Алексей К.',
  bio: 'Профессиональный танцор и хореограф. Победитель множества баттлов и фестивалей. Преподает Hip-Hop и Popping с акцентом на музыкальность и грув.',
  specializations: ['Hip-Hop', 'Popping', 'Locking'],
  experience: '8 лет',
};

const mockLessons = [
  { id: 1, title: 'Hip-Hop Начинающие', time: 'Пн, 18:00', spots: 5 },
  { id: 2, title: 'Popping', time: 'Ср, 19:00', spots: 3 },
  { id: 3, title: 'Hip-Hop Продвинутые', time: 'Пт, 20:00', spots: 8 },
];

export default function Teacher() {
  const { slug } = useParams<{ slug: string }>();
  const teacher = { ...mockTeacher, slug: slug || mockTeacher.slug };

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Photo & Name */}
      <motion.div className={styles.header} variants={itemVariants}>
        <div className={styles.photo} />
        <h1 className={styles.name}>{teacher.name}</h1>
      </motion.div>

      {/* Bio */}
      <motion.section className={styles.section} variants={itemVariants}>
        <p className={styles.bio}>{teacher.bio}</p>
      </motion.section>

      {/* Specializations */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>
          <Award size={18} className={styles.sectionIcon} />
          Специализации
        </h2>
        <div className={styles.tags}>
          {teacher.specializations.map((spec) => (
            <span key={spec} className={styles.tag}>{spec}</span>
          ))}
        </div>
      </motion.section>

      {/* Experience */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>
          <Briefcase size={18} className={styles.sectionIcon} />
          Опыт
        </h2>
        <p className={styles.experienceValue}>{teacher.experience}</p>
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
