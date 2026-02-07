import { motion } from 'framer-motion';
import { MapPin, Phone, Instagram, Clock, Heart, Navigation } from 'lucide-react';
import styles from './About.module.css';

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

const studioInfo = {
  name: 'Dance MAX',
  description:
    'Dance MAX -- это современная танцевальная студия в центре города. Мы предлагаем занятия по самым популярным направлениям для любого уровня подготовки. Наша миссия -- сделать танцы доступными и вдохновить каждого на движение.',
  address: 'г. Москва, ул. Большая Дмитровка, д. 7/5, стр. 1',
  phone: '+7 (999) 123-45-67',
  instagram: '@dancemax_studio',
  workingHours: [
    { days: 'Пн - Пт', hours: '9:00 - 22:00' },
    { days: 'Сб', hours: '10:00 - 20:00' },
    { days: 'Вс', hours: '10:00 - 18:00' },
  ],
};

export default function About() {
  return (
    <motion.div
      className={styles.page}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Title */}
      <motion.div className={styles.header} variants={itemVariants}>
        <Heart size={32} className={styles.headerIcon} />
        <h1 className={styles.title}>О студии</h1>
        <span className={styles.studioName}>{studioInfo.name}</span>
      </motion.div>

      {/* Description */}
      <motion.section className={styles.section} variants={itemVariants}>
        <p className={styles.description}>{studioInfo.description}</p>
      </motion.section>

      {/* Address & Map */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>
          <MapPin size={18} className={styles.sectionIcon} />
          Как добраться
        </h2>
        <p className={styles.infoText}>{studioInfo.address}</p>
        <div className={styles.mapWrapper}>
          <iframe
            className={styles.mapIframe}
            src="https://yandex.ru/map-widget/v1/?pt=37.611914,55.762575&z=16&l=map"
            allowFullScreen
            title="Dance MAX на карте"
          />
        </div>
        <a
          className={styles.directionsButton}
          href="https://yandex.ru/maps/?rtext=~55.762575,37.611914&rtt=auto"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Navigation size={18} className={styles.directionsIcon} />
          <span>Проложить маршрут</span>
        </a>
      </motion.section>

      {/* Contacts */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>Контакты</h2>
        <div className={styles.contactList}>
          <div className={styles.contactRow}>
            <Phone size={18} className={styles.contactIcon} />
            <span className={styles.contactValue}>{studioInfo.phone}</span>
          </div>
          <div className={styles.contactRow}>
            <Instagram size={18} className={styles.contactIcon} />
            <span className={styles.contactValue}>{studioInfo.instagram}</span>
          </div>
        </div>
      </motion.section>

      {/* Working Hours */}
      <motion.section className={styles.section} variants={itemVariants}>
        <h2 className={styles.sectionTitle}>
          <Clock size={18} className={styles.sectionIcon} />
          Часы работы
        </h2>
        <div className={styles.hoursList}>
          {studioInfo.workingHours.map((item) => (
            <div key={item.days} className={styles.hoursRow}>
              <span className={styles.hoursDays}>{item.days}</span>
              <span className={styles.hoursTime}>{item.hours}</span>
            </div>
          ))}
        </div>
      </motion.section>
    </motion.div>
  );
}
