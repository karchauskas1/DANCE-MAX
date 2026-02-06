import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
import styles from './Teachers.module.css';

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

const mockTeachers = [
  { id: 1, slug: 'alexey-k', name: 'Алексей К.', directions: ['Hip-Hop', 'Popping'], experience: '8 лет' },
  { id: 2, slug: 'maria-s', name: 'Мария С.', directions: ['Contemporary', 'Jazz-Funk'], experience: '6 лет' },
  { id: 3, slug: 'olga-p', name: 'Ольга П.', directions: ['Stretching', 'Contemporary'], experience: '10 лет' },
  { id: 4, slug: 'dmitry-v', name: 'Дмитрий В.', directions: ['Vogue', 'Dancehall'], experience: '5 лет' },
  { id: 5, slug: 'anna-m', name: 'Анна М.', directions: ['Breaking', 'Hip-Hop'], experience: '7 лет' },
  { id: 6, slug: 'ivan-r', name: 'Иван Р.', directions: ['Dancehall', 'Vogue'], experience: '4 года' },
];

export default function Teachers() {
  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h1 className={styles.title} variants={itemVariants}>
        <GraduationCap size={24} className={styles.titleIcon} />
        Преподаватели
      </motion.h1>

      <motion.div
        className={styles.list}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {mockTeachers.map((teacher) => (
          <motion.div key={teacher.id} className={styles.card} variants={itemVariants}>
            <div className={styles.avatar} />
            <div className={styles.cardInfo}>
              <h3 className={styles.cardName}>{teacher.name}</h3>
              <span className={styles.cardDirections}>
                {teacher.directions.join(', ')}
              </span>
              <span className={styles.cardExperience}>
                Опыт: {teacher.experience}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}
