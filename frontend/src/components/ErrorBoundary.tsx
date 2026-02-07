import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import styles from './ErrorBoundary.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Глобальный ErrorBoundary. Перехватывает ошибки рендера и показывает
 * дружелюбный экран вместо белой страницы.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Можно отправить в Sentry или другой сервис мониторинга
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleRetry = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.iconWrap}>
            <AlertTriangle size={32} strokeWidth={2} />
          </div>
          <h1 className={styles.title}>Что-то пошло не так</h1>
          <p className={styles.message}>
            Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу
            — обычно это помогает.
          </p>
          <button
            className={styles.retryBtn}
            onClick={this.handleRetry}
            type="button"
          >
            <RotateCcw size={18} />
            Попробовать снова
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Функциональная обёртка для использования ErrorBoundary в качестве
 * `errorElement` в react-router. Рендерит экран ошибки напрямую.
 */
export function ErrorBoundaryFallback() {
  return (
    <div className={styles.container}>
      <div className={styles.iconWrap}>
        <AlertTriangle size={32} strokeWidth={2} />
      </div>
      <h1 className={styles.title}>Что-то пошло не так</h1>
      <p className={styles.message}>
        Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу
        — обычно это помогает.
      </p>
      <button
        className={styles.retryBtn}
        onClick={() => window.location.reload()}
        type="button"
      >
        <RotateCcw size={18} />
        Попробовать снова
      </button>
    </div>
  );
}
