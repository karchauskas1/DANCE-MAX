import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Flame, Heart, Moon, Music } from 'lucide-react';
import { FormField } from '../components/ui/FormField';
import styles from './DirectionsCRUD.module.css';

interface Direction {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
  lessonsCount: number;
}

const iconOptions = [
  { value: 'flame', label: 'Flame', component: <Flame size={18} /> },
  { value: 'heart', label: 'Heart', component: <Heart size={18} /> },
  { value: 'moon', label: 'Moon', component: <Moon size={18} /> },
  { value: 'music', label: 'Music', component: <Music size={18} /> },
];

const mockDirections: Direction[] = [
  { id: 1, name: 'Бачата', slug: 'bachata', description: 'Чувственный доминиканский танец с элементами латины', color: '#FF5C35', icon: 'flame', isActive: true, lessonsCount: 24 },
  { id: 2, name: 'Сальса', slug: 'salsa', description: 'Энергичный кубинский танец для всех уровней', color: '#FFB84D', icon: 'music', isActive: true, lessonsCount: 18 },
  { id: 3, name: 'Кизомба', slug: 'kizomba', description: 'Мягкий и плавный африканский танец', color: '#A78BFA', icon: 'moon', isActive: true, lessonsCount: 12 },
  { id: 4, name: 'Танго', slug: 'tango', description: 'Страстный аргентинский танец с драматической музыкой', color: '#F472B6', icon: 'heart', isActive: false, lessonsCount: 8 },
];

export function DirectionsCRUD() {
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Direction | null>(null);
  const [selectedIcon, setSelectedIcon] = useState('flame');
  const [selectedColor, setSelectedColor] = useState('#FF5C35');

  function openCreate() {
    setEditItem(null);
    setSelectedIcon('flame');
    setSelectedColor('#FF5C35');
    setShowModal(true);
  }

  function openEdit(dir: Direction) {
    setEditItem(dir);
    setSelectedIcon(dir.icon);
    setSelectedColor(dir.color);
    setShowModal(true);
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Направления</h1>
          <p className={styles.subtitle}>{mockDirections.length} направлений</p>
        </div>
        <button className={styles.createBtn} onClick={openCreate} type="button">
          <Plus size={18} />
          Добавить направление
        </button>
      </div>

      <div className={styles.grid}>
        {mockDirections.map((dir) => (
          <div key={dir.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div
                className={styles.cardIcon}
                style={{ background: `${dir.color}15`, color: dir.color }}
              >
                {iconOptions.find((i) => i.value === dir.icon)?.component}
              </div>
              <div className={styles.cardActions}>
                <button
                  className={styles.cardActionBtn}
                  onClick={() => openEdit(dir)}
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
              <span className={styles.cardLessons}>{dir.lessonsCount} занятий</span>
              <span className={`${styles.statusBadge} ${dir.isActive ? styles.statusActive : styles.statusInactive}`}>
                {dir.isActive ? 'Активно' : 'Скрыто'}
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
                {editItem ? 'Редактировать направление' : 'Новое направление'}
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
                placeholder="Бачата"
                required
              />
              <FormField
                label="Slug"
                type="text"
                value={editItem?.slug ?? ''}
                placeholder="bachata"
                required
              />
              <FormField
                label="Описание"
                type="textarea"
                value={editItem?.description ?? ''}
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
