// Domain glossary added on top of the generic Spanish dictionary so the
// spellchecker stops flagging common Costa Rican automotive terms used in
// avalúos. Lowercase entries; the matcher is case-insensitive.

export const AUTOMOTIVE_GLOSSARY = [
  // Mecánica básica
  'cárter', 'carter', 'culata', 'block', 'cigüeñal', 'cigueñal', 'pistones', 'pistón',
  'biela', 'bielas', 'bujías', 'bujía', 'bujes', 'buje', 'tijeretas', 'tijereta',
  'rótulas', 'rótula', 'rotulas', 'mangueta', 'tirantes', 'tensor', 'tensores',
  'polea', 'poleas', 'distribución', 'distribucion', 'cadenilla', 'cremallera',
  'compensadores', 'compensador', 'estabilizadoras', 'estabilizadora',
  'amortiguadores', 'amortiguador', 'horquilla', 'horquillas',

  // Combustible y motor
  'inyector', 'inyectores', 'inyección', 'inyeccion', 'turbo', 'turbocompresor',
  'intercooler', 'múltiple', 'multiple', 'múltiples', 'colector', 'colectores',
  'admisión', 'admision', 'escape', 'catalizador', 'silenciador', 'mofle',
  'cilindrada', 'cilindrado', 'gasolina', 'diésel', 'diesel', 'gasoil',
  'pcv', 'egr', 'maf', 'map', 'tps', 'iac', 'iat',

  // Refrigeración
  'coolant', 'radiador', 'termostato', 'termostatos', 'enfriador', 'manguera',
  'mangueras', 'bomba', 'agua',

  // Eléctrico
  'alternador', 'arrancador', 'marcha', 'solenoide', 'batería', 'bateria',
  'halógenos', 'halogenos', 'halógeno', 'fusible', 'fusibles', 'cableado',
  'arnés', 'arnes',

  // Transmisión / dirección
  'caja', 'transmisión', 'transmision', 'embrague', 'clutch', 'volante',
  'diferencial', 'cardán', 'cardan', 'eje', 'ejes', 'flecha', 'flechas',
  'crucetas', 'cruceta', 'homocinéticas', 'homocineticas', 'palier', 'palieres',
  'servodirección', 'servodireccion',

  // Frenos y suspensión
  'mordazas', 'mordaza', 'discos', 'disco', 'pastillas', 'pastilla', 'tambor',
  'tambores', 'balatas', 'balata', 'bandas', 'banda', 'abs',

  // Carrocería e interior
  'parabrisas', 'guardafangos', 'guardafango', 'guardabarros', 'capó', 'capo',
  'maletero', 'baúl', 'baul', 'cofre', 'paragolpes', 'parachoques', 'bumper',
  'bumpers', 'bómper', 'bompers', 'faldones', 'faldón', 'estribos', 'estribo',
  'camanance', 'camanances', 'aros', 'aro', 'rines', 'rin', 'llantas', 'llanta',
  'salpicadera', 'salpicaderas', 'tapicería', 'tapiceria', 'panorámico',
  'panoramico', 'rack', 'racks', 'sunroof', 'spoiler', 'estriberas',

  // Documentación / trámites CR
  'riteve', 'dekra', 'marchamo', 'derecho', 'circulación', 'circulacion',
  'placas', 'placa', 'cédula', 'cedula', 'jurídica', 'juridica', 'gravámenes',
  'gravamen', 'anotaciones', 'levantamientos', 'levantamiento', 'titulación',
  'titulacion',

  // Modelos / marcas frecuentes (en uso conversacional)
  'pickup', 'pick-up', 'crossover', 'minivan', 'suv', 'camioncito', 'panel',
  'cuadracicleta', 'cuatrimoto', 'cuadraciclo',

  // Estado / observaciones
  'avalúo', 'avalúos', 'avaluo', 'avaluos', 'fuga', 'fugas', 'humedad',
  'picadura', 'picaduras', 'rayado', 'rayados', 'óxido', 'oxido', 'corrosión',
  'corrosion', 'abolladura', 'abolladuras', 'golpe', 'golpes', 'chillido',
  'chillidos', 'desgaste', 'desgastes',

  // Geográficos CR
  'cartago', 'heredia', 'puntarenas', 'guanacaste', 'limón', 'limon',
  'desamparados', 'escazú', 'escazu', 'curridabat', 'tibás', 'tibas',
  'goicoechea', 'moravia', 'guadalupe', 'pavas', 'hatillo', 'sabanilla',
  'alajuelita', 'aserrí', 'aserri', 'turrialba', 'paraíso', 'paraiso',
  'liberia', 'nicoya', 'pérez', 'zeledón', 'zeledon',

  // Otros frecuentes en avalúos
  'trochez', 'sales-force', 'salesforce', 'op', 'cabina', 'doble', 'simple',
  'extendida', 'mecánica', 'mecanica', 'automática', 'automatica', 'manual',
  'cuatro', 'tracción', 'traccion', '4x4', '4x2', 'awd'
];
