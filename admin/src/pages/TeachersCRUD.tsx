import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Star } from 'lucide-react';
import { FormField } from '../components/ui/FormField';
import styles from './TeachersCRUD.module.css';

interface Teacher {
  id: number;
  name: string;
  bio: string;
  experience: number;
  directions: string[];
  isActive: boolean;
  lessonsThisMonth: number;
}

const mockTeachers: Teacher[] = [
  { id: 1, name: 'Анна Калинина', bio: 'Профессиональный хореограф с опытом преподавания бачаты и сальсы более 8 лет. Призёр международных фестивалей.', experience: 8, directions: ['Бачата', 'Сальса'], isActive: true, lessonsThisMonth: 32 },
  { id: 2, name: 'Мигель Родригес', bio: 'Кубинский танцор и преподаватель. Аутентичная сальса и руэда де касино. Весёлые и энергичные занятия.', experience: 12, directions: ['Сальса'], isActive: true, lessonsThisMonth: 24 },
  { id: 3, name: 'Дмитрий Павлов', bio: 'Сертифицированный преподаватель кизомбы. Прошёл обучение в Анголе у ведущих мастеров жанра.', experience: 5, directions: ['Кизомба'], isActive: true, lessonsThisMonth: 18 },
  { id: 4, name: 'Елена Соколова', bio: 'Преподаватель аргентинского танго с классической танцевальной базой. Нежная и выразительная техника.', experience: 10, directions: ['Танго'], isActive: false, lessonsThisMonth: 0 },
];

const directionOptions = [
  { value: 'Бачата', label: 'Бачата' },
  { value: 'Сальса', label: 'Сальса' },
  { value: 'Кизомба', label: 'Кизомба' },
  { value: 'Танго', label: 'Танго' },
];

export function TeachersCRUD() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Teacher | null>(null);

  function openCreate() {
    setEditItem(null);
    setShowModal(true);
  }

  function openEdit(teacher: Teacher) {
    setEditItem(teacher);
    setShowModal(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Преподаватели</h1>
          <p className={styles.subtitle}>{mockTeachers.length} преподавателей</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate} type="button">
          <Plus size={18} />
          Добавить преподавателя
        </button>
      </div>

      <div className={styles.grid}>
        {mockTeachers.map((teacher) => (
          <div key={teacher.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.photoPlaceholder}>
                <span className={styles.photoInitials}>
                  {teacher.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.cardActionBtn}
                  onClick={() => openEdit(teacher)}
                  type="button"
                >
                  <Pencil size={15} />
                </button>
                <button className={styles.cardActionBtnDanger} type="button">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.nameRow}>
                <span className={styles.cardName}>{teacher.name}</span>
                {!teacher.isActive && (
                  <span className={styles.inactiveBadge}>Неактивен</span>
                )}
              </div>
              <div className={styles.experience}>
                <Star size={13} />
                {teacher.experience} лет опыта
              </div>
              <div className={styles.cardBio}>{teacher.bio}</div>
              <div className={styles.tags}>
                {teacher.directions.map((d) => (
                  <span key={d} className={styles.tag}>{d}</span>
                ))}
              </div>
            </div>
            <div className={styles.cardFooter}>
              <span className={styles.cardMeta}>
                {teacher.lessonsThisMonth} занятий в этом месяце
              </span>
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
                {editItem ? 'Редактировать преподавателя' : 'Новый преподаватель'}
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
              {/* Photo upload placeholder */}
              <div className={styles.uploadArea}>
                <Upload size={24} className={styles.uploadIcon} />
                <span className={styles.uploadText}>Загрузить фото</span>
                <span className={styles.uploadHint}>JPG, PNG до 5 МБ</span>
              </div>

              <FormField
                label="Имя"
                type="text"
                value={editItem?.name ?? ''}
                placeholder="Анна Калинина"
                required
              />
              <FormField
                label="Опыт (лет)"
                type="number"
                value={editItem?.experience ?? ''}
                placeholder="8"
                required
              />
              <FormField
                label="Биография"
                type="textarea"
                value={editItem?.bio ?? ''}
                placeholder="Расскажите о преподавателе..."
                required
              />
              <div className={styles.directionsSelect}>
                <span className={styles.fieldLabel}>Направления</span>
                <div className={styles.directionTags}>
                  {directionOptions.map((d) => {
                    const isSelected = editItem?.directions.includes(d.value) ?? false;
                    return (
                      <button
                        key={d.value}
                        type="button"
                        className={`${styles.directionTag} ${isSelected ? styles.directionTagActive : ''}`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
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
                {editItem ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
