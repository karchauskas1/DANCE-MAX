import { useState } from 'react';
import { Plus, Pencil, Trash2, X, CalendarDays, Users } from 'lucide-react';
import { FormField } from '../components/ui/FormField';
import styles from './CoursesCRUD.module.css';

interface Course {
  id: number;
  name: string;
  description: string;
  direction: string;
  teacher: string;
  startDate: string;
  endDate: string;
  lessonsCount: number;
  maxStudents: number;
  enrolledStudents: number;
  price: number;
  isActive: boolean;
}

const mockCourses: Course[] = [
  { id: 1, name: 'Бачата с нуля', description: 'Интенсивный курс для начинающих. 8 занятий за 4 недели. Научитесь базовым шагам и простым фигурам.', direction: 'Бачата', teacher: 'Анна Калинина', startDate: '10.02.2026', endDate: '07.03.2026', lessonsCount: 8, maxStudents: 16, enrolledStudents: 12, price: 6400, isActive: true },
  { id: 2, name: 'Сальса-интенсив', description: 'Продвинутый курс для танцоров среднего уровня. Комбинации, стилистика, музыкальность.', direction: 'Сальса', teacher: 'Мигель Родригес', startDate: '15.02.2026', endDate: '15.03.2026', lessonsCount: 6, maxStudents: 12, enrolledStudents: 8, price: 5400, isActive: true },
  { id: 3, name: 'Кизомба: чувственность', description: 'Мастер-класс по кизомбе. Работа с телом, связь с партнёром, импровизация.', direction: 'Кизомба', teacher: 'Дмитрий Павлов', startDate: '01.03.2026', endDate: '22.03.2026', lessonsCount: 4, maxStudents: 10, enrolledStudents: 3, price: 3600, isActive: true },
];

const directionOptions = [
  { value: 'Бачата', label: 'Бачата' },
  { value: 'Сальса', label: 'Сальса' },
  { value: 'Кизомба', label: 'Кизомба' },
  { value: 'Танго', label: 'Танго' },
];

const teacherOptions = [
  { value: '1', label: 'Анна Калинина' },
  { value: '2', label: 'Мигель Родригес' },
  { value: '3', label: 'Дмитрий Павлов' },
  { value: '4', label: 'Елена Соколова' },
];

export function CoursesCRUD() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Course | null>(null);

  function openCreate() {
    setEditItem(null);
    setShowModal(true);
  }

  function openEdit(course: Course) {
    setEditItem(course);
    setShowModal(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Спецкурсы</h1>
          <p className={styles.subtitle}>{mockCourses.length} курсов</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate} type="button">
          <Plus size={18} />
          Создать курс
        </button>
      </div>

      <div className={styles.list}>
        {mockCourses.map((course) => (
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
                    {course.direction} / {course.teacher}
                  </span>
                  <span className={styles.metaItem}>
                    <CalendarDays size={13} />
                    {course.startDate} — {course.endDate}
                  </span>
                  <span className={styles.metaItem}>
                    <Users size={13} />
                    {course.enrolledStudents}/{course.maxStudents} учеников
                  </span>
                </div>
              </div>
              <div className={styles.cardRight}>
                <div className={styles.price}>{course.price.toLocaleString('ru-RU')} ₽</div>
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
                style={{ width: `${(course.enrolledStudents / course.maxStudents) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
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
              <div className={styles.formRow}>
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
              </div>
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
                  value={editItem?.maxStudents ?? ''}
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
