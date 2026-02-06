import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import styles from './CalendarGrid.module.css';

export interface CalendarLesson {
  id: number;
  title: string;
  teacher: string;
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  date: Date;
  color: string;
  studentsCount: number;
  maxStudents: number;
}

interface CalendarGridProps {
  currentDate: Date;
  lessons: CalendarLesson[];
  onLessonClick?: (lesson: CalendarLesson) => void;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 08:00 — 21:00

export function CalendarGrid({ currentDate, lessons, onLessonClick }: CalendarGridProps) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  function getLessonsForDay(day: Date) {
    return lessons.filter((l) => isSameDay(l.date, day));
  }

  function getTopOffset(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return ((h! - 8) * 60 + (m ?? 0)) * (60 / 60); // 60px per hour
  }

  function getHeight(startTime: string, endTime: string): number {
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const totalMin = ((eh! - sh!) * 60 + ((em ?? 0) - (sm ?? 0)));
    return totalMin * (60 / 60);
  }

  const today = new Date();

  return (
    <div className={styles.grid}>
      {/* Header row */}
      <div className={styles.header}>
        <div className={styles.timeCol} />
        {days.map((day) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={day.toISOString()}
              className={`${styles.dayHeader} ${isToday ? styles.dayHeaderToday : ''}`}
            >
              <span className={styles.dayName}>
                {format(day, 'EEE', { locale: ru })}
              </span>
              <span className={`${styles.dayNumber} ${isToday ? styles.dayNumberToday : ''}`}>
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>

      {/* Body */}
      <div className={styles.body}>
        {/* Time column */}
        <div className={styles.timeCol}>
          {HOURS.map((hour) => (
            <div key={hour} className={styles.timeLabel}>
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
        {days.map((day) => {
          const dayLessons = getLessonsForDay(day);
          const isToday = isSameDay(day, today);
          return (
            <div
              key={day.toISOString()}
              className={`${styles.dayColumn} ${isToday ? styles.dayColumnToday : ''}`}
            >
              {HOURS.map((hour) => (
                <div key={hour} className={styles.hourCell} />
              ))}
              {dayLessons.map((lesson) => (
                <button
                  key={lesson.id}
                  className={styles.lessonBlock}
                  style={{
                    top: `${getTopOffset(lesson.startTime)}px`,
                    height: `${getHeight(lesson.startTime, lesson.endTime)}px`,
                    '--lesson-color': lesson.color,
                  } as React.CSSProperties}
                  onClick={() => onLessonClick?.(lesson)}
                  type="button"
                >
                  <span className={styles.lessonTitle}>{lesson.title}</span>
                  <span className={styles.lessonMeta}>
                    <Clock size={11} />
                    {lesson.startTime}–{lesson.endTime}
                  </span>
                  <span className={styles.lessonTeacher}>{lesson.teacher}</span>
                  <span className={styles.lessonCount}>
                    {lesson.studentsCount}/{lesson.maxStudents}
                  </span>
                </button>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
