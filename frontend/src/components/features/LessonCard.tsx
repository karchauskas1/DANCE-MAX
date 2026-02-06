import type { CSSProperties } from 'react';
import { Clock, MapPin, Users, ArrowRight, Check } from 'lucide-react';
import styles from './LessonCard.module.css';

interface LessonCardProps {
  id: number;
  directionName: string;
  directionColor: string;
  lessonName: string;
  startTime: string;
  endTime: string;
  room: string;
  currentSpots: number;
  maxSpots: number;
  teacherName: string;
  teacherInitial: string;
  level: string;
  status: 'available' | 'booked' | 'full' | 'past';
  onBook?: () => void;
  onCancel?: () => void;
  onClick?: () => void;
}

const levelLabels: Record<string, string> = {
  beginner: 'Начинающие',
  intermediate: 'Средний',
  advanced: 'Продвинутый',
  all: 'Все уровни',
};

export default function LessonCard({
  directionName,
  directionColor,
  lessonName,
  startTime,
  endTime,
  room,
  currentSpots,
  maxSpots,
  teacherName,
  teacherInitial,
  level,
  status,
  onBook,
  onCancel,
  onClick,
}: LessonCardProps) {
  const spotsLeft = maxSpots - currentSpots;
  const cardStyle = { '--card-color': directionColor } as CSSProperties;

  return (
    <div
      className={`${styles.card} ${styles[status]}`}
      style={cardStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Top section: badge + info + teacher avatar */}
      <div className={styles.top}>
        <div className={styles.info}>
          <span className={styles.badge}>
            <span className={styles.badgeDot} />
            {directionName}
          </span>
          <h3 className={styles.name}>{lessonName}</h3>
          <div className={styles.time}>
            <Clock size={14} strokeWidth={2} />
            <span>
              {startTime} &mdash; {endTime}
            </span>
          </div>
          <div className={styles.meta}>
            <span className={styles.pill}>
              <MapPin size={12} strokeWidth={2} />
              {room}
            </span>
            <span className={styles.pill}>
              <Users size={12} strokeWidth={2} />
              {spotsLeft} / {maxSpots} мест
            </span>
            {level && (
              <span className={styles.pill}>
                {levelLabels[level] ?? level}
              </span>
            )}
          </div>
        </div>

        <div className={styles.teacherVisual}>
          {teacherInitial}
        </div>
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Bottom section: teacher name + action */}
      <div className={styles.bottom}>
        <div className={styles.teacher}>
          <div className={styles.teacherAvatar}>{teacherInitial}</div>
          <div>
            <div className={styles.teacherName}>{teacherName}</div>
            <div className={styles.teacherRole}>Тренер</div>
          </div>
        </div>

        {status === 'available' && (
          <button
            className={styles.bookBtn}
            onClick={(e) => {
              e.stopPropagation();
              onBook?.();
            }}
          >
            Записаться
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        )}

        {status === 'booked' && (
          <div className={styles.bookedActions}>
            <span className={styles.bookedBadge}>
              <Check size={13} strokeWidth={2.5} />
              Вы записаны
            </span>
            <button
              className={styles.cancelBtn}
              onClick={(e) => {
                e.stopPropagation();
                onCancel?.();
              }}
            >
              Отменить
            </button>
          </div>
        )}

        {status === 'full' && (
          <span className={styles.fullLabel}>Мест нет</span>
        )}
      </div>
    </div>
  );
}
