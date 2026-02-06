import { type ReactNode } from 'react';
import styles from './Card.module.css';

type CardVariant = 'default' | 'elevated' | 'interactive';
type CardPadding = 'sm' | 'md' | 'lg';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: CardVariant;
  padding?: CardPadding;
  onClick?: () => void;
}

const paddingMap: Record<CardPadding, string> = {
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
};

export default function Card({
  children,
  className,
  variant = 'default',
  padding = 'md',
  onClick,
}: CardProps) {
  const classNames = [
    styles.card,
    styles[variant],
    paddingMap[padding],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const Tag = variant === 'interactive' ? 'button' : 'div';

  return (
    <Tag className={classNames} onClick={onClick}>
      {children}
    </Tag>
  );
}
