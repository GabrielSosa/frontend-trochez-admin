import Swal from 'sweetalert2';

// Configuración por defecto para los diálogos de confirmación
const defaultConfig = {
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  reverseButtons: true,
  focusCancel: true,
  allowOutsideClick: false,
  allowEscapeKey: false,
  customClass: {
    popup: 'rounded-lg shadow-xl',
    confirmButton: 'rounded-md px-4 py-2 text-sm font-medium',
    cancelButton: 'rounded-md px-4 py-2 text-sm font-medium'
  }
};

// Función para confirmar duplicación de avalúo
export async function confirmDuplicate() {
  const result = await Swal.fire({
    ...defaultConfig,
    title: 'Duplicar Avalúo',
    text: '¿Estás seguro de que deseas duplicar este avalúo? Se creará una copia con todos los datos.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Duplicar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#f59e0b', // Amarillo
    cancelButtonColor: '#6b7280', // Gris
  });
  
  return result.isConfirmed;
}

// Función para confirmar eliminación de avalúo
export async function confirmDelete() {
  const result = await Swal.fire({
    ...defaultConfig,
    title: 'Eliminar Avalúo',
    text: '¿Estás seguro de que deseas eliminar este avalúo? Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444', // Rojo
    cancelButtonColor: '#6b7280', // Gris
  });
  
  return result.isConfirmed;
}

// Función para confirmar cancelación de formulario
export async function confirmCancel() {
  const result = await Swal.fire({
    ...defaultConfig,
    title: 'Cancelar Cambios',
    text: '¿Estás seguro de que deseas cancelar? Los cambios no guardados se perderán.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, Cancelar',
    cancelButtonText: 'Continuar Editando',
    confirmButtonColor: '#6b7280', // Gris
    cancelButtonColor: '#3085d6', // Azul
  });
  
  return result.isConfirmed;
}

// Función genérica para confirmación personalizada
export async function confirmAction(options = {}) {
  const result = await Swal.fire({
    ...defaultConfig,
    ...options,
    showCancelButton: true,
  });
  
  return result.isConfirmed;
} 