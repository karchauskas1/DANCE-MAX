import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export default function Skeleton({
  width,
  height = 16,
  borderRadius,
  className,
}: SkeletonProps) {
  const classNames = [styles.skeleton, className].filter(Boolean).join(' ');

  return (
    <span
      className={classNames}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: borderRadius ?? undefined,
      }}
      aria-hidden="true"
    />
  );
}
