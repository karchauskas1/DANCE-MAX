import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Star, Inbox } from 'lucide-react';
import { useTeachers, useDirections } from '../../api/queries';
import { FormField } from '../components/FormField';
import styles from './TeachersCRUD.module.css';
import type { Teacher } from '../../types';

export function TeachersCRUD() {
  const { data: teachersData, isLoading } = useTeachers();
  const { data: directionsData } = useDirections();

  const teachers = teachersData ?? [];

  // Формируем опции направлений из реальных данных
  const directionOptions = (directionsData ?? []).map((d) => ({
    value: d.name,
    label: d.name,
  }));

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
          <p className={styles.subtitle}>{teachers.length} преподавателей</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate} type="button">
          <Plus size={16} />
          Добавить
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loadingText}>Загрузка...</div>
      ) : teachers.length === 0 ? (
        <div className={styles.emptyState}>
          <Inbox size={32} className={styles.emptyIcon} />
          <span className={styles.emptyText}>Нет данных</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {teachers.map((teacher) => (
            <div key={teacher.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div className={styles.photoPlaceholder}>
                  {teacher.photoUrl ? (
                    <img src={teacher.photoUrl} alt={teacher.name} className={styles.photoImg} />
                  ) : (
                    <span className={styles.photoInitials}>
                      {teacher.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  )}
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
                  {teacher.experienceYears} лет опыта
                </div>
                <div className={styles.cardBio}>{teacher.bio}</div>
                <div className={styles.tags}>
                  {teacher.directions.map((d) => (
                    <span key={d.id} className={styles.tag}>{d.name}</span>
                  ))}
                </div>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.cardMeta}>
                  {teacher.specializations.join(', ') || '—'}
                </span>
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
                value={editItem?.experienceYears ?? ''}
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
                    const isSelected = editItem?.directions.some((dir) => dir.name === d.value) ?? false;
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
