/**
 * Sistema de notificaciones Toast
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

class ToastManager {
  private container: HTMLElement | null = null;

  constructor() {
    this.initContainer();
  }

  private initContainer(): void {
    // Crear contenedor si no existe
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  private getIcon(type: ToastType): string {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  public show(options: ToastOptions): void {
    this.initContainer();

    const {
      title,
      message,
      type = 'info',
      duration = 4000
    } = options;

    // Crear elemento toast
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = this.getIcon(type);

    toast.innerHTML = `
      <div class="toast-icon">${icon}</div>
      <div class="toast-content">
        ${title ? `<div class="toast-title">${title}</div>` : ''}
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Cerrar">×</button>
    `;

    // Agregar al contenedor
    this.container?.appendChild(toast);

    // Event listener para cerrar
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn?.addEventListener('click', () => {
      this.remove(toast);
    });

    // Auto-remover después de duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }
  }

  private remove(toast: HTMLElement): void {
    toast.classList.add('removing');
    setTimeout(() => {
      toast.remove();
    }, 300); // Tiempo de la animación
  }

  // Métodos de conveniencia
  public success(message: string, title?: string): void {
    this.show({ message, ...(title && { title }), type: 'success' });
  }

  public error(message: string, title?: string): void {
    this.show({ message, ...(title && { title }), type: 'error' });
  }

  public warning(message: string, title?: string): void {
    this.show({ message, ...(title && { title }), type: 'warning' });
  }

  public info(message: string, title?: string): void {
    this.show({ message, ...(title && { title }), type: 'info' });
  }
}

// Exportar instancia única
export const toast = new ToastManager();
