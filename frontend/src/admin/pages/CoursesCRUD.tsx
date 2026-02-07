import { useState } from 'react';
import { Plus, Pencil, Trash2, X, CalendarDays, Users, Inbox } from 'lucide-react';
import { useCourses, useDirections, useTeachers } from '../../api/queries';
import { FormField } from '../components/FormField';
import styles from './CoursesCRUD.module.css';
import type { SpecialCourse } from '../../types';

export function CoursesCRUD() {
  const { data: coursesData, isLoading } = useCourses();
  const { data: directionsData } = useDirections();
  const { data: teachersData } = useTeachers();

  const courses = coursesData ?? [];

  // Формируем опции из реальных данных
  const directionOptions = (directionsData ?? []).map((d) => ({
    value: d.name,
    label: d.name,
  }));

  const teacherOptions = (teachersData ?? []).map((t) => ({
    value: String(t.id),
    label: t.name,
  }));

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<SpecialCourse | null>(null);

  function openCreate() {
    setEditItem(null);
    setShowModal(true);
  }

  function openEdit(course: SpecialCourse) {
    setEditItem(course);
    setShowModal(true);
  }

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
                    <button className={styles.cardActionBtnDanger} type="button">
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
        <div className={styles.modalBackdrop} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editItem ? 'Редактировать курс' : 'Новый спецкурс'}
              </h2>
              <button
                className={styles.modalClose}
                onClick={() => setShowModal(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <FormField
                label="Название"
                type="text"
                value={editItem?.name ?? ''}
                placeholder="Бачата с нуля"
                required
              />
              <FormField
                label="Описание"
                type="textarea"
                value={editItem?.description ?? ''}
                placeholder="Описание курса..."
                required
              />
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
              <div className={styles.formRow}>
                <FormField label="Дата начала" type="date" required />
                <FormField label="Дата окончания" type="date" required />
              </div>
              <div className={styles.formRow}>
                <FormField
                  label="Кол-во занятий"
                  type="number"
                  value={editItem?.lessonsCount ?? ''}
                  placeholder="8"
                  required
                />
                <FormField
                  label="Макс. учеников"
                  type="number"
                  value={editItem?.maxParticipants ?? ''}
                  placeholder="16"
                  required
                />
              </div>
              <FormField
                label="Стоимость (руб.)"
                type="number"
                value={editItem?.price ?? ''}
                placeholder="6400"
                required
              />
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
                {editItem ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
