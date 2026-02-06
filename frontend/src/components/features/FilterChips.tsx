import styles from './FilterChips.module.css';

interface FilterOption {
  id: string | number;
  label: string;
}

interface FilterChipsProps {
  filters: FilterOption[];
  selectedId: string | number | null;
  onSelect: (id: string | number | null) => void;
  showAll?: boolean;
}

export default function FilterChips({
  filters,
  selectedId,
  onSelect,
  showAll = true,
}: FilterChipsProps) {
  const isAllSelected = selectedId === null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.track}>
        {showAll && (
          <button
            className={`${styles.chip} ${isAllSelected ? styles.selected : ''}`}
            onClick={() => onSelect(null)}
            type="button"
          >
            Все
          </button>
        )}
        {filters.map((filter) => {
          const isActive = selectedId === filter.id;
          return (
            <button
              key={filter.id}
              className={`${styles.chip} ${isActive ? styles.selected : ''}`}
              onClick={() => onSelect(filter.id)}
              type="button"
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
