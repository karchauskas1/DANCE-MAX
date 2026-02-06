import { useState } from 'react';
import { addDays } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from 'lucide-react';
import { CalendarGrid } from '../components/ui/CalendarGrid';
import type { CalendarLesson } from '../components/ui/CalendarGrid';
import { FormField } from '../components/ui/FormField';
import styles from './ScheduleMgmt.module.css';

const today = new Date();

const mockLessons: CalendarLesson[] = [
  { id: 1, title: 'Бачата', teacher: 'Анна К.', startTime: '10:00', endTime: '11:00', date: today, color: '#FF5C35', studentsCount: 8, maxStudents: 12 },
  { id: 2, title: 'Сальса', teacher: 'Мигель Р.', startTime: '12:00', endTime: '13:30', date: today, color: '#FFB84D', studentsCount: 15, maxStudents: 15 },
  { id: 3, title: 'Кизомба', teacher: 'Дмитрий П.', startTime: '14:00', endTime: '15:00', date: today, color: '#A78BFA', studentsCount: 6, maxStudents: 10 },
  { id: 4, title: 'Танго', teacher: 'Елена С.', startTime: '18:00', endTime: '19:30', date: today, color: '#F472B6', studentsCount: 11, maxStudents: 14 },
  { id: 5, title: 'Бачата (продв.)', teacher: 'Анна К.', startTime: '19:30', endTime: '21:00', date: today, color: '#FF5C35', studentsCount: 10, maxStudents: 10 },
  { id: 6, title: 'Сальса (нач.)', teacher: 'Мигель Р.', startTime: '10:00', endTime: '11:00', date: addDays(today, 1), color: '#FFB84D', studentsCount: 5, maxStudents: 15 },
  { id: 7, title: 'Кизомба', teacher: 'Дмитрий П.', startTime: '15:00', endTime: '16:00', date: addDays(today, 2), color: '#A78BFA', studentsCount: 3, maxStudents: 10 },
  { id: 8, title: 'Бачата', teacher: 'Анна К.', startTime: '11:00', endTime: '12:00', date: addDays(today, 3), color: '#FF5C35', studentsCount: 9, maxStudents: 12 },
];

const directionOptions = [
  { value: 'bachata', label: 'Бачата' },
  { value: 'salsa', label: 'Сальса' },
  { value: 'kizomba', label: 'Кизомба' },
  { value: 'tango', label: 'Танго' },
];

const teacherOptions = [
  { value: '1', label: 'Анна К.' },
  { value: '2', label: 'Мигель Р.' },
  { value: '3', label: 'Дмитрий П.' },
  { value: '4', label: 'Елена С.' },
];

const levelOptions = [
  { value: 'beginner', label: 'Начинающие' },
  { value: 'intermediate', label: 'Средний' },
  { value: 'advanced', label: 'Продвинутые' },
];

export function ScheduleMgmt() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Расписание</h1>
        <div className={styles.headerActions}>
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
          <button
            className={styles.createBtn}
            onClick={() => setShowModal(true)}
            type="button"
          >
            <Plus size={18} />
            Создать занятие
          </button>
        </div>
      </div>

      <CalendarGrid
        currentDate={currentDate}
        lessons={mockLessons}
        onLessonClick={(lesson) => {
          console.log('Lesson clicked:', lesson.id);
        }}
      />

      {/* Modal */}
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
