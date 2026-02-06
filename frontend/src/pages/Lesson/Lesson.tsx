import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Users, BarChart3, User, CalendarCheck } from 'lucide-react';
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

const mockLesson = {
  id: '1',
  direction: 'Hip-Hop',
  title: 'Hip-Hop Начинающие',
  date: '17 января, среда',
  time: '18:00 - 19:30',
  teacher: { name: 'Алексей К.', photo: '' },
  room: 'Зал 1',
  spotsTotal: 15,
  spotsLeft: 5,
  level: 'Начинающий',
  description: 'Изучаем базовые движения и грув. Подходит для тех, кто только начинает свой путь в танцах.',
};

export default function Lesson() {
  const { id } = useParams<{ id: string }>();
  const lesson = { ...mockLesson, id: id || mockLesson.id };

  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Direction Badge */}
      <motion.div variants={itemVariants}>
        <span className={styles.badge}>{lesson.direction}</span>
      </motion.div>

      {/* Title */}
      <motion.h1 className={styles.title} variants={itemVariants}>
        {lesson.title}
      </motion.h1>

      {/* Date & Time */}
      <motion.div className={styles.infoRow} variants={itemVariants}>
        <Clock size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>{lesson.date}</span>
          <span className={styles.infoValue}>{lesson.time}</span>
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
            {lesson.spotsLeft} из {lesson.spotsTotal}
          </span>
        </div>
      </motion.div>

      {/* Level */}
      <motion.div className={styles.infoRow} variants={itemVariants}>
        <BarChart3 size={18} className={styles.infoIcon} />
        <div className={styles.infoContent}>
          <span className={styles.infoLabel}>Уровень</span>
          <span className={styles.infoValue}>{lesson.level}</span>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>Описание</h2>
        <p className={styles.description}>{lesson.description}</p>
      </motion.div>

      {/* Book Button */}
      <motion.div className={styles.actions} variants={itemVariants}>
        <button className={styles.bookButton}>
          <CalendarCheck size={18} />
          Записаться
        </button>
      </motion.div>
    </motion.div>
  );
}
