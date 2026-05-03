export type ImpostorCategoryKey =
  | 'animales'
  | 'lugares'
  | 'comidas'
  | 'profesiones'
  | 'objetos';

export type ImpostorSecret = {
  answer: string;
  clue: string;
};

type ImpostorCategoryMeta = {
  label: string;
  description: string;
  accent: string;
  panel: string;
  words: readonly ImpostorSecret[];
};

type ImpostorCategoryDefinition = ImpostorCategoryMeta & {
  key: ImpostorCategoryKey;
};

export const impostorCategoryOrder = [
  'animales',
  'lugares',
  'comidas',
  'profesiones',
  'objetos',
] as const satisfies readonly ImpostorCategoryKey[];

const categoryMeta: Record<ImpostorCategoryKey, ImpostorCategoryMeta> = {
  animales: {
    label: 'Animales',
    description: 'Pistas simples, respuestas fáciles de recordar y mucho engaño.',
    accent: '#22c55e',
    panel: 'from-emerald-500/20 via-lime-500/14 to-teal-500/10',
    words: [
      { answer: 'Delfín', clue: 'Mamífero marino muy inteligente' },
      { answer: 'Lobo', clue: 'Animal que aúlla y vive en manada' },
      { answer: 'Gato', clue: 'Felino doméstico que ama dormir' },
      { answer: 'Elefante', clue: 'Gigante de orejas enormes y gran memoria' },
      { answer: 'Panda', clue: 'Oso blanco y negro que come bambú' },
      { answer: 'Tortuga', clue: 'Reptil lento con caparazón' },
      { answer: 'Águila', clue: 'Ave rapaz que vuela muy alto' },
      { answer: 'Camaleón', clue: 'Reptil famoso por cambiar de color' },
      { answer: 'Canguro', clue: 'Marsupial que salta y lleva cría en bolsa' },
      { answer: 'Pingüino', clue: 'Ave que no vuela y vive en el frío' },
    ],
  },
  lugares: {
    label: 'Lugares',
    description: 'Sitios conocidos, de ciudad, campo o vacaciones.',
    accent: '#38bdf8',
    panel: 'from-sky-500/20 via-cyan-500/14 to-indigo-500/10',
    words: [
      { answer: 'Playa', clue: 'Lugar con arena, olas y sol' },
      { answer: 'Montaña', clue: 'Sitio alto perfecto para caminar y mirar lejos' },
      { answer: 'Aeropuerto', clue: 'Lugar donde despegan y aterrizan aviones' },
      { answer: 'Biblioteca', clue: 'Lugar silencioso lleno de libros' },
      { answer: 'Cine', clue: 'Sitio oscuro donde se ven películas gigantes' },
      { answer: 'Mercado', clue: 'Lugar lleno de puestos y compras frescas' },
      { answer: 'Hospital', clue: 'Lugar donde cuidan a las personas enfermas' },
      { answer: 'Parque', clue: 'Espacio verde para pasear y descansar' },
      { answer: 'Estadio', clue: 'Lugar enorme para ver deporte en vivo' },
      { answer: 'Museo', clue: 'Lugar donde se exhibe arte o historia' },
    ],
  },
  comidas: {
    label: 'Comidas',
    description: 'Sabores cotidianos y antojos que todos reconocen al instante.',
    accent: '#f59e0b',
    panel: 'from-amber-500/20 via-orange-500/14 to-rose-500/10',
    words: [
      { answer: 'Pizza', clue: 'Plato redondo con queso derretido' },
      { answer: 'Hamburguesa', clue: 'Pan con carne y varios extras' },
      { answer: 'Sushi', clue: 'Comida japonesa de arroz y pescado' },
      { answer: 'Tacos', clue: 'Tortilla doblada con relleno' },
      { answer: 'Ceviche', clue: 'Pescado marinado muy fresco' },
      { answer: 'Pasta', clue: 'Comida italiana de muchas formas' },
      { answer: 'Helado', clue: 'Postre frío que se derrite rápido' },
      { answer: 'Empanada', clue: 'Masa rellena que se come con la mano' },
      { answer: 'Sopa', clue: 'Plato caliente que se toma con cuchara' },
      { answer: 'Chocolate', clue: 'Dulce favorito de muchas personas' },
    ],
  },
  profesiones: {
    label: 'Profesiones',
    description: 'Oficios y trabajos que se pueden adivinar por la pista.',
    accent: '#a855f7',
    panel: 'from-fuchsia-500/20 via-violet-500/14 to-pink-500/10',
    words: [
      { answer: 'Médico', clue: 'Ayuda a cuidar la salud' },
      { answer: 'Profesor', clue: 'Enseña y explica temas' },
      { answer: 'Chef', clue: 'Dirige la cocina y crea platos' },
      { answer: 'Bombero', clue: 'Apaga incendios y rescata personas' },
      { answer: 'Arquitecto', clue: 'Diseña edificios y espacios' },
      { answer: 'Periodista', clue: 'Busca y cuenta noticias' },
      { answer: 'Abogado', clue: 'Trabaja con leyes y defensa' },
      { answer: 'Piloto', clue: 'Conduce aviones' },
      { answer: 'Mecánico', clue: 'Repara motores y máquinas' },
      { answer: 'Fotógrafo', clue: 'Captura momentos con una cámara' },
    ],
  },
  objetos: {
    label: 'Objetos',
    description: 'Cosas de uso diario que se pueden describir rápido.',
    accent: '#fb7185',
    panel: 'from-rose-500/20 via-pink-500/14 to-fuchsia-500/10',
    words: [
      { answer: 'Teléfono', clue: 'Sirve para hablar y revisar apps' },
      { answer: 'Cámara', clue: 'Captura imágenes y recuerdos' },
      { answer: 'Bicicleta', clue: 'Tiene dos ruedas y pedales' },
      { answer: 'Silla', clue: 'Mueble para sentarse' },
      { answer: 'Mochila', clue: 'Bolsa para llevar cosas en la espalda' },
      { answer: 'Reloj', clue: 'Marca la hora' },
      { answer: 'Lampara', clue: 'Da luz en una habitación' },
      { answer: 'Llaves', clue: 'Abren puertas y cerraduras' },
      { answer: 'Espejo', clue: 'Devuelve tu reflejo' },
      { answer: 'Cuaderno', clue: 'Objeto para escribir y tomar notas' },
    ],
  },
};

export const impostorCategories = impostorCategoryOrder.map((key) => ({
  key,
  ...categoryMeta[key],
})) satisfies ImpostorCategoryDefinition[];

export const impostorCategoryMap = Object.fromEntries(
  impostorCategories.map((category) => [category.key, category]),
) as unknown as Record<ImpostorCategoryKey, ImpostorCategoryDefinition>;
