import { useState, useMemo } from 'react';
import { addDays } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Inbox,
  Loader2,
} from 'lucide-react';
import { useLessons, useDirections, useTeachers, useCreateLesson, useDeleteLesson } from '../../api/queries';
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

  const createMutation = useCreateLesson();
  const deleteMutation = useDeleteLesson();

  // Формируем опции из реальных данных
  const directionOptions = (directionsData ?? []).map((d) => ({
    value: String(d.id),
    label: d.name,
  }));

  const teacherOptions = (teachersData ?? []).map((t) => ({
    value: String(t.id),
    label: t.name,
  }));

  // Поля формы
  const [directionId, setDirectionId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [level, setLevel] = useState('beginner');
  const [maxStudents, setMaxStudents] = useState('');

  function resetForm() {
    setDirectionId('');
    setTeacherId('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setLevel('beginner');
    setMaxStudents('');
  }

  function closeModal() {
    setShowModal(false);
    resetForm();
  }

  async function handleSubmit() {
    const payload = {
      direction_id: Number(directionId),
      teacher_id: Number(teacherId),
      date,
      start_time: startTime,
      end_time: endTime,
      level,
      max_spots: Number(maxStudents) || 12,
    };

    await createMutation.mutateAsync(payload);
    closeModal();
  }

  async function handleLessonClick(lessonId: number) {
    if (!window.confirm('Отменить это занятие?')) return;
    await deleteMutation.mutateAsync({ id: lessonId });
  }

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

  const isSaving = createMutation.isPending;

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
            onLessonClick={(lesson) => handleLessonClick(lesson.id)}
          />
        </div>
      )}

      {/* Modal -- bottom-sheet style on mobile */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Создать занятие</h2>
              <button
                className={styles.modalClose}
                onClick={closeModal}
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
                  value={directionId}
                  onChange={setDirectionId}
                  options={directionOptions}
                  required
                />
                <FormField
                  label="Преподаватель"
                  type="select"
                  value={teacherId}
                  onChange={setTeacherId}
                  options={teacherOptions}
                  required
                />
                <FormField
                  label="Дата"
                  type="date"
                  value={date}
                  onChange={setDate}
                  required
                />
                <FormField
                  label="Время начала"
                  type="time"
                  value={startTime}
                  onChange={setStartTime}
                  required
                />
                <FormField
                  label="Время окончания"
                  type="time"
                  value={endTime}
                  onChange={setEndTime}
                  required
                />
                <FormField
                  label="Уровень"
                  type="select"
                  value={level}
                  onChange={setLevel}
                  options={levelOptions}
                  required
                />
                <FormField
                  label="Макс. учеников"
                  type="number"
                  value={maxStudents}
                  onChange={setMaxStudents}
                  placeholder="12"
                  required
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.cancelBtn}
                onClick={closeModal}
                type="button"
              >
                Отмена
              </button>
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={isSaving}
                type="button"
              >
                {isSaving && <Loader2 size={16} className={styles.spinner} />}
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
