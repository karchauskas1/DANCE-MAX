import { useState, useMemo } from 'react';
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchPlaceholder?: string;
  searchKey?: keyof T;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
}

type SortDir = 'asc' | 'desc' | null;

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchPlaceholder = 'Поиск...',
  searchKey,
  pageSize = 10,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    if (!search || !searchKey) return data;
    const q = search.toLowerCase();
    return data.filter((row) => {
      const val = row[searchKey as string];
      return String(val ?? '').toLowerCase().includes(q);
    });
  }, [data, search, searchKey]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null || bVal == null) return 0;
      const cmp = String(aVal).localeCompare(String(bVal), 'ru', { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  function handleSort(key: string) {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') {
        setSortKey(null);
        setSortDir(null);
      }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  }

  function renderSortIcon(key: string) {
    if (sortKey !== key) return <ChevronsUpDown size={14} />;
    if (sortDir === 'asc') return <ChevronUp size={14} />;
    return <ChevronDown size={14} />;
  }

  return (
    <div className={styles.wrapper}>
      {searchKey && (
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              className={styles.searchInput}
            />
          </div>
          <span className={styles.resultCount}>
            {filtered.length} записей
          </span>
        </div>
      )}

      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${styles.th} ${col.sortable ? styles.thSortable : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable ? () => handleSort(col.key) : undefined}
                >
                  <span className={styles.thContent}>
                    {col.header}
                    {col.sortable && (
                      <span className={styles.sortIcon}>
                        {renderSortIcon(col.key)}
                      </span>
                    )}
                  </span>
                </th>
              ))}
              {actions && <th className={styles.th} style={{ width: '80px' }}>Действия</th>}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  className={styles.emptyCell}
                  colSpan={columns.length + (actions ? 1 : 0)}
                >
                  Нет данных
                </td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr
                  key={idx}
                  className={`${styles.tr} ${onRowClick ? styles.trClickable : ''}`}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={styles.td}>
                      {col.render
                        ? col.render(row)
                        : String(row[col.key] ?? '')}
                    </td>
                  ))}
                  {actions && (
                    <td className={styles.td} onClick={(e) => e.stopPropagation()}>
                      <div className={styles.actionsCell}>{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>
            {page * pageSize + 1}--{Math.min((page + 1) * pageSize, sorted.length)} из {sorted.length}
          </span>
          <div className={styles.pageButtons}>
            <button
              className={styles.pageBtn}
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              type="button"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className={styles.pageBtn}
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              type="button"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
