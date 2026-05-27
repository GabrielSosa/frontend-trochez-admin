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
  'cuatro', 'tracción', 'traccion', '4x4', '4x2', 'awd',

  // Marcas
  'toyota', 'nissan', 'hyundai', 'kia', 'honda', 'mazda', 'mitsubishi',
  'suzuki', 'subaru', 'isuzu', 'daihatsu', 'lexus', 'acura', 'infiniti',
  'ford', 'chevrolet', 'gmc', 'dodge', 'ram', 'jeep', 'chrysler', 'cadillac',
  'buick', 'lincoln', 'pontiac', 'tesla',
  'volkswagen', 'audi', 'bmw', 'mercedes-benz', 'mercedes', 'porsche',
  'smart', 'opel', 'seat', 'skoda', 'mini', 'mclaren',
  'peugeot', 'renault', 'citroën', 'citroen', 'fiat', 'alfa', 'romeo',
  'lancia', 'maserati', 'ferrari', 'lamborghini', 'volvo', 'saab', 'jaguar',
  'land', 'rover', 'range', 'aston', 'martin', 'bentley', 'rolls-royce',
  'rolls', 'royce',
  'changan', 'chery', 'great', 'wall', 'haval', 'jac', 'byd', 'geely',
  'mg', 'ssangyong', 'tata', 'mahindra', 'foton', 'jmc', 'dongfeng', 'baic',
  'genesis', 'dacia',

  // Modelos populares en Costa Rica
  'hilux', 'tacoma', 'tundra', 'fortuner', 'land-cruiser', 'landcruiser',
  'prado', 'rav4', 'corolla', 'camry', 'avanza', 'yaris', 'vitz', 'echo',
  'prius', 'aqua', 'sienna', 'highlander', 'sequoia', 'urban-cruiser',
  'cross', 'raize', 'rush', 'innova',
  'sentra', 'altima', 'maxima', 'versa', 'note', 'march', 'leaf', 'tiida',
  'pathfinder', 'frontier', 'navara', 'np300', 'xtrail', 'x-trail', 'rogue',
  'qashqai', 'juke', 'kicks', 'patrol', 'armada', 'murano',
  'tucson', 'creta', 'kona', 'venue', 'palisade', 'elantra', 'accent',
  'i10', 'i20', 'i25', 'i30', 'sonata', 'azera', 'genesis', 'santa', 'fe',
  'starex', 'h1', 'h100', 'porter',
  'sportage', 'sorento', 'mohave', 'soul', 'picanto', 'morning', 'rio',
  'cerato', 'forte', 'optima', 'k5', 'stinger', 'carnival', 'seltos', 'niro',
  'civic', 'accord', 'fit', 'jazz', 'city', 'odyssey', 'pilot', 'passport',
  'ridgeline', 'cr-v', 'crv', 'hr-v', 'hrv', 'br-v', 'brv', 'wr-v', 'wrv',
  'mazda3', 'mazda6', 'cx-3', 'cx3', 'cx-5', 'cx5', 'cx-7', 'cx7',
  'cx-9', 'cx9', 'cx-30', 'cx30', 'mx-5', 'mx5', 'bt-50', 'bt50', 'demio',
  'lancer', 'mirage', 'outlander', 'eclipse', 'l200', 'montero', 'asx',
  'pajero', 'xpander',
  'swift', 'celerio', 'baleno', 'ignis', 'vitara', 'grand-vitara', 'jimny',
  'sx4', 'samurai',
  'forester', 'outback', 'impreza', 'legacy', 'xv', 'wrx', 'brz', 'tribeca',
  'd-max', 'dmax', 'mu-x', 'mux', 'trooper', 'rodeo',
  'mustang', 'fiesta', 'focus', 'fusion', 'edge', 'escape', 'explorer',
  'expedition', 'ranger', 'maverick', 'bronco', 'transit', 'territory',
  'ecosport', 'f150', 'f-150', 'f250', 'f350', 'figo',
  'spark', 'aveo', 'sail', 'sonic', 'cruze', 'malibu', 'cavalier',
  'silverado', 'colorado', 'trailblazer', 'tracker', 'captiva', 'equinox',
  'tahoe', 'suburban',
  'wrangler', 'cherokee', 'compass', 'renegade', 'patriot', 'gladiator',
  'commander', 'liberty',
  'ram-1500', 'ram1500', 'ram-2500', 'caliber', 'durango', 'journey',
  'caravan', 'charger', 'challenger',
  'serie-3', 'serie-5', 'serie-7', 'x1', 'x3', 'x5', 'x6', 'x7', 'm3', 'm5',
  'clase-a', 'clase-c', 'clase-e', 'clase-s', 'glc', 'gle', 'glk', 'gla',
  'q3', 'q5', 'q7', 'q8', 'a3', 'a4', 'a5', 'a6',
  'jetta', 'gol', 'polo', 'voyage', 'amarok', 'tiguan', 'touareg', 'beetle',
  'crossfox', 'saveiro', 'passat',
  'partner', '208', '301', '308', '3008', 'expert', 'rifter',
  'logan', 'sandero', 'duster', 'kangoo', 'koleos',
  'tipo', '500', 'punto', 'panda', 'siena', 'palio', 'mobi', 'argo',
  'xc40', 'xc60', 'xc90', 'v40', 's60', 'v60',

  // Términos de modelo / variante
  'titanium', 'sport', 'luxury', 'limited', 'platinum', 'premium', 'classic',
  'highline', 'comfortline', 'trendline', 'sel', 'sli', 'gli', 'ltz', 'lt',
  'ls', 'work', 'crew', 'pickup', 'pick-up', 'doble-cabina', 'cab', 'crew-cab'
];
