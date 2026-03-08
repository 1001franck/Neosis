type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastEventDetail {
  type: ToastType;
  message: string;
  duration?: number;
}

const toastTarget = new EventTarget();
const EVENT_NAME = 'app:toast';

export const toastBus = {
  emit: (detail: ToastEventDetail) => {
    toastTarget.dispatchEvent(new CustomEvent(EVENT_NAME, { detail }));
  },
  on: (handler: (detail: ToastEventDetail) => void) => {
    const listener = (event: Event) => {
      const custom = event as CustomEvent<ToastEventDetail>;
      handler(custom.detail);
    };
    toastTarget.addEventListener(EVENT_NAME, listener);
    return () => toastTarget.removeEventListener(EVENT_NAME, listener);
  },
};
