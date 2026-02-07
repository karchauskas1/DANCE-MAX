import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children?: React.ReactNode;
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'date' | 'time' | 'color';
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  options?: { value: string; label: string }[];
  disabled?: boolean;
}

export function FormField({
  label,
  error,
  required,
  children,
  type = 'text',
  value,
  onChange,
  placeholder,
  options,
  disabled,
}: FormFieldProps) {
  const id = `field-${label.replace(/\s/g, '-').toLowerCase()}`;

  function renderInput() {
    if (children) return children;

    const baseProps = {
      id,
      disabled,
      className: `${styles.input} ${error ? styles.inputError : ''}`,
    };

    if (type === 'textarea') {
      return (
        <textarea
          {...baseProps}
          className={`${styles.textarea} ${error ? styles.inputError : ''}`}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      );
    }

    if (type === 'select') {
      return (
        <select
          {...baseProps}
          className={`${styles.select} ${error ? styles.inputError : ''}`}
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
        >
          <option value="" disabled>
            {placeholder ?? 'Выберите...'}
          </option>
          {options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    }

    if (type === 'color') {
      return (
        <div className={styles.colorWrap}>
          <input
            type="color"
            id={id}
            disabled={disabled}
            className={styles.colorInput}
            value={String(value ?? '#FF5C35')}
            onChange={(e) => onChange?.(e.target.value)}
          />
          <span className={styles.colorValue}>{String(value ?? '#FF5C35')}</span>
        </div>
      );
    }

    return (
      <input
        {...baseProps}
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required}>*</span>}
      </label>
      {renderInput()}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
