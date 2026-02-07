import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, CalendarDays, Users, Inbox, Loader2 } from 'lucide-react';
import { useCourses, useDirections, useTeachers, useCreateCourse, useUpdateCourse, useDeleteCourse } from '../../api/queries';
import { FormField } from '../components/FormField';
import styles from './CoursesCRUD.module.css';
import type { SpecialCourse } from '../../types';

export function CoursesCRUD() {
  const { data: coursesData, isLoading } = useCourses();
  const { data: directionsData } = useDirections();
  const { data: teachersData } = useTeachers();

  const courses = coursesData ?? [];

  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();

  // Формируем опции из реальных данных
  const directionOptions = (directionsData ?? []).map((d) => ({
    value: String(d.id),
    label: d.name,
  }));

  const teacherOptions = (teachersData ?? []).map((t) => ({
    value: String(t.id),
    label: t.name,
  }));

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<SpecialCourse | null>(null);

  // Поля формы
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [directionId, setDirectionId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lessonsCount, setLessonsCount] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [price, setPrice] = useState('');

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setDescription(editItem.description);
      setDirectionId(editItem.direction ? String(editItem.direction.id) : '');
      setTeacherId(editItem.teacher ? String(editItem.teacher.id) : '');
      setStartDate(editItem.startDate);
      setEndDate('');
      setLessonsCount(String(editItem.lessonsCount));
      setMaxParticipants(String(editItem.maxParticipants));
      setPrice(String(editItem.price));
    }
  }, [editItem]);

  function resetForm() {
    setName('');
    setDescription('');
    setDirectionId('');
    setTeacherId('');
    setStartDate('');
    setEndDate('');
    setLessonsCount('');
    setMaxParticipants('');
    setPrice('');
  }

  function openCreate() {
    setEditItem(null);
    resetForm();
    setShowModal(true);
  }

  function openEdit(course: SpecialCourse) {
    setEditItem(course);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditItem(null);
    resetForm();
  }

  async function handleSubmit() {
    const payload = {
      name,
      description,
      direction_id: directionId ? Number(directionId) : undefined,
      teacher_id: teacherId ? Number(teacherId) : undefined,
      start_date: startDate,
      end_date: endDate || undefined,
      lessons_count: Number(lessonsCount) || 0,
      max_participants: Number(maxParticipants) || 0,
      price: Number(price) || 0,
    };

    if (editItem) {
      await updateMutation.mutateAsync({ id: editItem.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    closeModal();
  }

  async function handleDelete(course: SpecialCourse) {
    if (!window.confirm(`Удалить курс "${course.name}"?`)) return;
    await deleteMutation.mutateAsync({ id: course.id });
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Спецкурсы</h1>
          <p className={styles.subtitle}>{courses.length} курсов</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate} type="button">
          <Plus size={16} />
          Создать
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loadingText}>Загрузка...</div>
      ) : courses.length === 0 ? (
        <div className={styles.emptyState}>
          <Inbox size={32} className={styles.emptyIcon} />
          <span className={styles.emptyText}>Нет данных</span>
        </div>
      ) : (
        <div className={styles.list}>
          {courses.map((course) => (
            <div key={course.id} className={styles.card}>
              <div className={styles.cardMain}>
                <div className={styles.cardInfo}>
                  <div className={styles.cardTitleRow}>
                    <h3 className={styles.cardName}>{course.name}</h3>
                    <span className={`${styles.statusBadge} ${course.isActive ? styles.statusActive : styles.statusInactive}`}>
                      {course.isActive ? 'Активен' : 'Завершён'}
                    </span>
                  </div>
                  <p className={styles.cardDesc}>{course.description}</p>
                  <div className={styles.cardMeta}>
                    <span className={styles.metaItem}>
                      {course.direction?.name ?? '—'} / {course.teacher?.name ?? '—'}
                    </span>
                    <span className={styles.metaItem}>
                      <CalendarDays size={13} />
                      {course.startDate}
                    </span>
                    <span className={styles.metaItem}>
                      <Users size={13} />
                      {course.currentParticipants}/{course.maxParticipants}
                    </span>
                  </div>
                </div>
                <div className={styles.cardRight}>
                  <div className={styles.price}>{course.price.toLocaleString('ru-RU')} &#8381;</div>
                  <div className={styles.lessonsCount}>{course.lessonsCount} занятий</div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.cardActionBtn}
                      onClick={() => openEdit(course)}
                      type="button"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      className={styles.cardActionBtnDanger}
                      onClick={() => handleDelete(course)}
                      disabled={deleteMutation.isPending}
                      type="button"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${course.maxParticipants > 0 ? (course.currentParticipants / course.maxParticipants) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal -- bottom-sheet style on mobile */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editItem ? 'Редактировать курс' : 'Новый спецкурс'}
              </h2>
              <button
                className={styles.modalClose}
                onClick={closeModal}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <FormField
                label="Название"
                type="text"
                value={name}
                onChange={setName}
                placeholder="Бачата с нуля"
                required
              />
              <FormField
                label="Описание"
                type="textarea"
                value={description}
                onChange={setDescription}
                placeholder="Описание курса..."
                required
              />
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
              <div className={styles.formRow}>
                <FormField
                  label="Дата начала"
                  type="date"
                  value={startDate}
                  onChange={setStartDate}
                  required
                />
                <FormField
                  label="Дата окончания"
                  type="date"
                  value={endDate}
                  onChange={setEndDate}
                  required
                />
              </div>
              <div className={styles.formRow}>
                <FormField
                  label="Кол-во занятий"
                  type="number"
                  value={lessonsCount}
                  onChange={setLessonsCount}
                  placeholder="8"
                  required
                />
                <FormField
                  label="Макс. учеников"
                  type="number"
                  value={maxParticipants}
                  onChange={setMaxParticipants}
                  placeholder="16"
                  required
                />
              </div>
              <FormField
                label="Стоимость (руб.)"
                type="number"
                value={price}
                onChange={setPrice}
                placeholder="6400"
                required
              />
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
                {editItem ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
