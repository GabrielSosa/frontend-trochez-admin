// Confirmation dialog backed by a global `<ConfirmHost>` component mounted by the
// root layout. Call sites stay async/await and receive a boolean.
//
// The host registers itself with `setConfirmHandler` on mount. Calls that arrive
// before mount are queued and flushed when the host attaches.

let handler = null;
const pending = [];

export function setConfirmHandler(fn) {
  handler = fn;
  while (pending.length) {
    const { opts, resolve } = pending.shift();
    Promise.resolve(handler(opts)).then(resolve);
  }
}

function ask(opts) {
  if (handler) return Promise.resolve(handler(opts));
  return new Promise((resolve) => pending.push({ opts, resolve }));
}

export function confirmAction({
  title = '¿Estás seguro?',
  message = '',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default'
} = {}) {
  return ask({ title, message, confirmText, cancelText, variant });
}

export function confirmDelete({
  title = '¿Eliminar este avalúo?',
  message = 'Esta acción no se puede deshacer.'
} = {}) {
  return ask({
    title,
    message,
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    variant: 'destructive'
  });
}

export function confirmDuplicate({
  title = '¿Duplicar este avalúo?',
  message = 'Se creará una copia exacta del avalúo seleccionado.'
} = {}) {
  return ask({
    title,
    message,
    confirmText: 'Duplicar',
    cancelText: 'Cancelar',
    variant: 'default'
  });
}

export function confirmCancel({
  title = '¿Descartar cambios?',
  message = 'Los cambios sin guardar se perderán.'
} = {}) {
  return ask({
    title,
    message,
    confirmText: 'Descartar',
    cancelText: 'Seguir editando',
    variant: 'destructive'
  });
}
