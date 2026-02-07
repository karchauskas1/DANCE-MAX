import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Flame, Heart, Moon, Music, Inbox, Loader2 } from 'lucide-react';
import { useDirections, useCreateDirection, useUpdateDirection, useDeleteDirection } from '../../api/queries';
import { FormField } from '../components/FormField';
import styles from './DirectionsCRUD.module.css';
import type { Direction } from '../../types';

const iconOptions = [
  { value: 'flame', label: 'Flame', component: <Flame size={18} /> },
  { value: 'heart', label: 'Heart', component: <Heart size={18} /> },
  { value: 'moon', label: 'Moon', component: <Moon size={18} /> },
  { value: 'music', label: 'Music', component: <Music size={18} /> },
];

export function DirectionsCRUD() {
  const { data: directionsData, isLoading } = useDirections();
  const directions = directionsData ?? [];

  const createMutation = useCreateDirection();
  const updateMutation = useUpdateDirection();
  const deleteMutation = useDeleteDirection();

  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Direction | null>(null);

  // Поля формы
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('flame');
  const [selectedColor, setSelectedColor] = useState('#FF5C35');

  // Заполняем форму при открытии редактирования
  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setSlug(editItem.slug);
      setDescription(editItem.description);
      setSelectedIcon(editItem.icon);
      setSelectedColor(editItem.color);
    }
  }, [editItem]);

  function resetForm() {
    setName('');
    setSlug('');
    setDescription('');
    setSelectedIcon('flame');
    setSelectedColor('#FF5C35');
  }

  function openCreate() {
    setEditItem(null);
    resetForm();
    setShowModal(true);
  }

  function openEdit(dir: Direction) {
    setEditItem(dir);
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
      slug,
      description,
      icon: selectedIcon,
      color: selectedColor,
    };

    if (editItem) {
      await updateMutation.mutateAsync({ id: editItem.id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    closeModal();
  }

  async function handleDelete(dir: Direction) {
    if (!window.confirm(`Удалить направление "${dir.name}"?`)) return;
    await deleteMutation.mutateAsync({ id: dir.id });
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Направления</h1>
          <p className={styles.subtitle}>{directions.length} направлений</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate} type="button">
          <Plus size={16} />
          Добавить
        </button>
      </div>

      {isLoading ? (
        <div className={styles.loadingText}>Загрузка...</div>
      ) : directions.length === 0 ? (
        <div className={styles.emptyState}>
          <Inbox size={32} className={styles.emptyIcon} />
          <span className={styles.emptyText}>Нет данных</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {directions.map((dir) => (
            <div key={dir.id} className={styles.card}>
              <div className={styles.cardTop}>
                <div
                  className={styles.cardIcon}
                  style={{ background: `${dir.color}15`, color: dir.color }}
                >
                  {iconOptions.find((i) => i.value === dir.icon)?.component ?? <Flame size={18} />}
                </div>
                <div className={styles.cardActions}>
                  <button
                    className={styles.cardActionBtn}
                    onClick={() => openEdit(dir)}
                    type="button"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    className={styles.cardActionBtnDanger}
                    onClick={() => handleDelete(dir)}
                    disabled={deleteMutation.isPending}
                    type="button"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{dir.name}</div>
                <div className={styles.cardDesc}>{dir.description}</div>
              </div>
              <div className={styles.cardFooter}>
                <div className={styles.cardMeta}>
                  <div
                    className={styles.colorDot}
                    style={{ background: dir.color }}
                  />
                  <span>{dir.slug}</span>
                </div>
                <span className={`${styles.statusBadge} ${dir.isActive ? styles.statusActive : styles.statusInactive}`}>
                  {dir.isActive ? 'Активно' : 'Скрыто'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal -- bottom-sheet on mobile */}
      {showModal && (
        <div className={styles.modalBackdrop} onClick={closeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editItem ? 'Редактировать направление' : 'Новое направление'}
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
                placeholder="Бачата"
                required
              />
              <FormField
                label="Slug"
                type="text"
                value={slug}
                onChange={setSlug}
                placeholder="bachata"
                required
              />
              <FormField
                label="Описание"
                type="textarea"
                value={description}
                onChange={setDescription}
                placeholder="Описание направления..."
                required
              />
              <FormField
                label="Цвет"
                type="color"
                value={selectedColor}
                onChange={setSelectedColor}
              />
              <div className={styles.iconSelector}>
                <span className={styles.iconSelectorLabel}>Иконка</span>
                <div className={styles.iconGrid}>
                  {iconOptions.map((ico) => (
                    <button
                      key={ico.value}
                      type="button"
                      className={`${styles.iconOption} ${selectedIcon === ico.value ? styles.iconOptionActive : ''}`}
                      onClick={() => setSelectedIcon(ico.value)}
                    >
                      {ico.component}
                    </button>
                  ))}
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
