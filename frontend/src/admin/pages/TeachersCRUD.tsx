import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Upload, Star, Inbox, Loader2 } from 'lucide-react';
import { useTeachers, useDirections, useCreateTeacher, useUpdateTeacher, useDeleteTeacher } from '../../api/queries';
import { FormField } from '../components/FormField';
import styles from './TeachersCRUD.module.css';
import type { Teacher } from '../../types';

export function TeachersCRUD() {
  const { data: teachersData, isLoading } = useTeachers();
  const { data: directionsData } = useDirections();

  const teachers = teachersData ?? [];
  const allDirections = directionsData ?? [];

  const createMutation = useCreateTeacher();
  const updateMutation = useUpdateTeacher();
  const deleteMutation = useDeleteTeacher();

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Teacher | null>(null);

  // Поля формы
  const [name, setName] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [bio, setBio] = useState('');
  const [selectedDirectionIds, setSelectedDirectionIds] = useState<number[]>([]);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setExperienceYears(String(editItem.experienceYears));
      setBio(editItem.bio);
      setSelectedDirectionIds(editItem.directions.map((d) => d.id));
    }
  }, [editItem]);

  function resetForm() {
    setName('');
    setExperienceYears('');
    setBio('');
    setSelectedDirectionIds([]);
  }

  function openCreate() {
    setEditItem(null);
    resetForm();
    setShowModal(true);
  }

  function openEdit(teacher: Teacher) {
    setEditItem(teacher);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditItem(null);
    resetForm();
  }

  function toggleDirection(dirId: number) {
    setSelectedDirectionIds((prev) =>
      prev.includes(dirId) ? prev.filter((id) => id !== dirId) : [...prev, dirId],
    );
  }

  async function handleSubmit() {
    const payload = {
      name,
      bio,
      experience_years: Number(experienceYears) || 0,
      direction_ids: selectedDirectionIds,
    };

    if (editItem) {
      await updateMutation.mutateAsync({ id: editItem.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    closeModal();
  }

  async function handleDelete(teacher: Teacher) {
    if (!window.confirm(`Удалить преподавателя "${teacher.name}"?`)) return;
    await deleteMutation.mutateAsync({ id: teacher.id });
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

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
                  <button
                    className={styles.cardActionBtnDanger}
                    onClick={() => handleDelete(teacher)}
                    disabled={deleteMutation.isPending}
                    type="button"
                  >
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
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editItem ? 'Редактировать преподавателя' : 'Новый преподаватель'}
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
              {/* Photo upload placeholder */}
              <div className={styles.uploadArea}>
                <Upload size={24} className={styles.uploadIcon} />
                <span className={styles.uploadText}>Загрузить фото</span>
                <span className={styles.uploadHint}>JPG, PNG до 5 МБ</span>
              </div>

              <FormField
                label="Имя"
                type="text"
                value={name}
                onChange={setName}
                placeholder="Анна Калинина"
                required
              />
              <FormField
                label="Опыт (лет)"
                type="number"
                value={experienceYears}
                onChange={setExperienceYears}
                placeholder="8"
                required
              />
              <FormField
                label="Биография"
                type="textarea"
                value={bio}
                onChange={setBio}
                placeholder="Расскажите о преподавателе..."
                required
              />
              <div className={styles.directionsSelect}>
                <span className={styles.fieldLabel}>Направления</span>
                <div className={styles.directionTags}>
                  {allDirections.map((d) => {
                    const isSelected = selectedDirectionIds.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        className={`${styles.directionTag} ${isSelected ? styles.directionTagActive : ''}`}
                        onClick={() => toggleDirection(d.id)}
                      >
                        {d.name}
                      </button>
                    );
                  })}
                </div>
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
                {editItem ? 'Сохранить' : 'Создать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
