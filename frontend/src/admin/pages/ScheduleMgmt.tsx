import { useState, useMemo } from 'react';
import { addDays } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Inbox,
} from 'lucide-react';
import { useLessons, useDirections, useTeachers } from '../../api/queries';
import { CalendarGrid } from '../components/CalendarGrid';
import type { CalendarLesson } from '../components/CalendarGrid';
import { FormField } from '../components/FormField';
import styles from './ScheduleMgmt.module.css';

const levelOptions = [
  { value: 'beginner', label: 'Начинающие' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутые' },
];

export function ScheduleMgmt() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

  const { data: lessonsData, isLoading } = useLessons();
  const { data: directionsData } = useDirections();
  const { data: teachersData } = useTeachers();

  // Формируем опции из реальных данных
  const directionOptions = (directionsData ?? []).map((d) => ({
    value: d.slug,
    label: d.name,
  }));

  const teacherOptions = (teachersData ?? []).map((t) => ({
    value: String(t.id),
    label: t.name,
  }));

  // Маппим Lesson[] -> CalendarLesson[]
  const calendarLessons: CalendarLesson[] = useMemo(() => {
    return (lessonsData ?? []).map((lesson) => ({
      id: lesson.id,
      title: lesson.direction?.name ?? '—',
      teacher: lesson.teacher?.name ?? '—',
      startTime: lesson.startTime,
      endTime: lesson.endTime,
      date: new Date(lesson.date),
      color: lesson.direction?.color ?? '#FF5C35',
      studentsCount: lesson.currentSpots,
      maxStudents: lesson.maxSpots,
    }));
  }, [lessonsData]);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Расписание</h1>
        <button
          className={styles.createBtn}
          onClick={() => setShowModal(true)}
          type="button"
        >
          <Plus size={16} />
          <span className={styles.createBtnLabel}>Создать</span>
        </button>
      </div>

      <div className={styles.weekNav}>
        <button
          className={styles.navBtn}
          onClick={() => setCurrentDate(addDays(currentDate, -7))}
          type="button"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          className={styles.todayBtn}
          onClick={() => setCurrentDate(new Date())}
          type="button"
        >
          Сегодня
        </button>
        <button
          className={styles.navBtn}
          onClick={() => setCurrentDate(addDays(currentDate, 7))}
          type="button"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loadingText}>Загрузка...</div>
      ) : calendarLessons.length === 0 ? (
        <div className={styles.emptyState}>
          <Inbox size={32} className={styles.emptyIcon} />
          <span className={styles.emptyText}>Нет занятий в расписании</span>
        </div>
      ) : (
        <div className={styles.calendarScroll}>
          <CalendarGrid
            currentDate={currentDate}
            lessons={calendarLessons}
            onLessonClick={() => {}}
          />
        </div>
      )}

      {/* Modal -- bottom-sheet style on mobile */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Создать занятие</h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <FormField
                  label="Направление"
                  type="select"
                  options={directionOptions}
                  required
                />
                <FormField
                  label="Преподаватель"
                  type="select"
                  options={teacherOptions}
                  required
                />
                <FormField label="Дата" type="date" required />
                <FormField label="Время начала" type="time" required />
                <FormField label="Время окончания" type="time" required />
                <FormField
                  label="Уровень"
                  type="select"
                  options={levelOptions}
                  required
                />
                <FormField
                  label="Макс. учеников"
                  type="number"
                  placeholder="12"
                  required
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowModal(false)}
                type="button"
              >
                Отмена
              </button>
              <button className={styles.submitBtn} type="button">
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
