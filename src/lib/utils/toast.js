import { toast } from 'svelte-sonner';

export function showSuccess(message, opts = {}) {
  return toast.success(message, { duration: 3500, ...opts });
}

export function showError(message, opts = {}) {
  return toast.error(message, { duration: 5000, ...opts });
}

export function showWarning(message, opts = {}) {
  return toast.warning(message, { duration: 4500, ...opts });
}

export function showInfo(message, opts = {}) {
  return toast.info(message, { duration: 3500, ...opts });
}

export function showToast(message, opts = {}) {
  return toast(message, { duration: 4000, ...opts });
}
