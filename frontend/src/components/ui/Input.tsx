import { type ReactNode, type ChangeEvent, useId } from 'react';
import styles from './Input.module.css';

interface InputProps {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  error?: string;
  placeholder?: string;
  icon?: ReactNode;
}

export default function Input({
  label,
  value,
  onChange,
  type = 'text',
  error,
  placeholder,
  icon,
}: InputProps) {
  const id = useId();
  const hasValue = value.length > 0;
  const hasIcon = Boolean(icon);

  return (
    <div className={styles.wrapper}>
      <div
        className={[styles.field, hasIcon ? styles.hasIcon : '']
          .filter(Boolean)
          .join(' ')}
      >
        {icon && <span className={styles.iconSlot}>{icon}</span>}
        <input
          id={id}
          className={[
            styles.input,
            hasValue ? styles.filled : '',
            error ? styles.inputError : '',
          ]
            .filter(Boolean)
            .join(' ')}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder ?? label}
          autoComplete="off"
        />
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
