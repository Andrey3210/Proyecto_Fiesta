export type ImpostorCategoryKey =
  | 'animales'
  | 'lugares'
  | 'comidas'
  | 'profesiones'
  | 'objetos'
  | 'peliculas_series'
  | 'videojuegos'
  | 'deportes'
  | 'musica'
  | 'personajes_famosos'
  | 'superheroes_villanos'
  | 'mitologia'
  | 'marcas_conocidas'
  | 'farandula_peruana';

export type ImpostorSecret = {
  answer: string;
  clue: string;
};

type ImpostorCategoryMeta = {
  label: string;
  description: string;
  accent: string;
  panel: string;
  emoji: string;
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
  'peliculas_series',
  'videojuegos',
  'deportes',
  'musica',
  'personajes_famosos',
  'superheroes_villanos',
  'mitologia',
  'marcas_conocidas',
  'farandula_peruana',
] as const satisfies readonly ImpostorCategoryKey[];

const categoryMeta: Record<ImpostorCategoryKey, ImpostorCategoryMeta> = {
  animales: {
    label: 'Animales',
    description: 'Un animal simple y facil de imaginar.',
    accent: '#22c55e',
    panel: 'from-emerald-500/20 via-lime-500/14 to-teal-500/10',
    emoji: '\u{1F43E}',
    words: [
      { answer: 'Delfin', clue: 'Marino' },
      { answer: 'Lobo', clue: 'Aullido' },
      { answer: 'Gato', clue: 'Felino' },
      { answer: 'Elefante', clue: 'Trompa' },
      { answer: 'Panda', clue: 'Bambu' },
      { answer: 'Tortuga', clue: 'Lenta' },
      { answer: 'Aguila', clue: 'Altura' },
      { answer: 'Camaleon', clue: 'Color' },
    ],
  },
  lugares: {
    label: 'Lugares',
    description: 'Sitios conocidos, de ciudad o viaje.',
    accent: '#38bdf8',
    panel: 'from-sky-500/20 via-cyan-500/14 to-indigo-500/10',
    emoji: '\u{1F5FA}',
    words: [
      { answer: 'Playa', clue: 'Arena' },
      { answer: 'Montana', clue: 'Altura' },
      { answer: 'Aeropuerto', clue: 'Avion' },
      { answer: 'Biblioteca', clue: 'Libros' },
      { answer: 'Cine', clue: 'Pantalla' },
      { answer: 'Mercado', clue: 'Puestos' },
      { answer: 'Hospital', clue: 'Salud' },
      { answer: 'Estadio', clue: 'Cancha' },
    ],
  },
  comidas: {
    label: 'Comidas',
    description: 'Sabores cotidianos y antojos ricos.',
    accent: '#f59e0b',
    panel: 'from-amber-500/20 via-orange-500/14 to-rose-500/10',
    emoji: '\u{1F355}',
    words: [
      { answer: 'Pizza', clue: 'Queso' },
      { answer: 'Hamburguesa', clue: 'Pan' },
      { answer: 'Sushi', clue: 'Arroz' },
      { answer: 'Tacos', clue: 'Tortilla' },
      { answer: 'Ceviche', clue: 'Pescado' },
      { answer: 'Pasta', clue: 'Italia' },
      { answer: 'Helado', clue: 'Frio' },
      { answer: 'Chocolate', clue: 'Dulce' },
    ],
  },
  profesiones: {
    label: 'Profesiones',
    description: 'Trabajos y oficios faciles de reconocer.',
    accent: '#a855f7',
    panel: 'from-fuchsia-500/20 via-violet-500/14 to-pink-500/10',
    emoji: '\u{1F9D1}\u200D\u{1F4BC}',
    words: [
      { answer: 'Medico', clue: 'Salud' },
      { answer: 'Profesor', clue: 'Clase' },
      { answer: 'Chef', clue: 'Cocina' },
      { answer: 'Bombero', clue: 'Fuego' },
      { answer: 'Arquitecto', clue: 'Plano' },
      { answer: 'Periodista', clue: 'Noticias' },
      { answer: 'Abogado', clue: 'Ley' },
      { answer: 'Piloto', clue: 'Avion' },
    ],
  },
  objetos: {
    label: 'Objetos',
    description: 'Cosas de uso diario.',
    accent: '#fb7185',
    panel: 'from-rose-500/20 via-pink-500/14 to-fuchsia-500/10',
    emoji: '\u{1F9F1}',
    words: [
      { answer: 'Telefono', clue: 'Llamar' },
      { answer: 'Camara', clue: 'Foto' },
      { answer: 'Bicicleta', clue: 'Pedales' },
      { answer: 'Silla', clue: 'Sentarse' },
      { answer: 'Mochila', clue: 'Espalda' },
      { answer: 'Reloj', clue: 'Hora' },
      { answer: 'Lampara', clue: 'Luz' },
      { answer: 'Espejo', clue: 'Reflejo' },
    ],
  },
  peliculas_series: {
    label: 'Peliculas y series',
    description: 'Titulos que todo el mundo reconoce.',
    accent: '#f472b6',
    panel: 'from-pink-500/20 via-fuchsia-500/14 to-rose-500/10',
    emoji: '\u{1F3AC}',
    words: [
      { answer: 'Titanic', clue: 'Barco' },
      { answer: 'Harry Potter', clue: 'Mago' },
      { answer: 'Avatar', clue: 'Azul' },
      { answer: 'Friends', clue: 'Amigos' },
      { answer: 'Breaking Bad', clue: 'Quimica' },
      { answer: 'Spider-Man', clue: 'Arana' },
      { answer: 'Star Wars', clue: 'Galaxia' },
      { answer: 'El Chavo del 8', clue: 'Barril' },
    ],
  },
  videojuegos: {
    label: 'Videojuegos',
    description: 'Juegos y sagas que todos ubican.',
    accent: '#14b8a6',
    panel: 'from-teal-500/20 via-cyan-500/14 to-emerald-500/10',
    emoji: '\u{1F3AE}',
    words: [
      { answer: 'Minecraft', clue: 'Bloques' },
      { answer: 'Free Fire', clue: 'Battle' },
      { answer: 'FIFA', clue: 'Futbol' },
      { answer: 'Mario Kart', clue: 'Carreras' },
      { answer: 'Pokemon', clue: 'Captura' },
      { answer: 'Fortnite', clue: 'Construir' },
      { answer: 'GTA', clue: 'Ciudad' },
      { answer: 'Zelda', clue: 'Aventura' },
    ],
  },
  deportes: {
    label: 'Deportes',
    description: 'Actividades, equipos y competencia.',
    accent: '#0ea5e9',
    panel: 'from-sky-500/20 via-cyan-500/14 to-blue-500/10',
    emoji: '\u{1F3DF}',
    words: [
      { answer: 'Futbol', clue: 'Gol' },
      { answer: 'Basquet', clue: 'Canasta' },
      { answer: 'Voley', clue: 'Red' },
      { answer: 'Tenis', clue: 'Raqueta' },
      { answer: 'Boxeo', clue: 'Guantes' },
      { answer: 'Natacion', clue: 'Agua' },
      { answer: 'Ciclismo', clue: 'Bicicleta' },
      { answer: 'Atletismo', clue: 'Pista' },
    ],
  },
  musica: {
    label: 'Musica',
    description: 'Artistas, ritmos y canciones.',
    accent: '#8b5cf6',
    panel: 'from-violet-500/20 via-fuchsia-500/14 to-pink-500/10',
    emoji: '\u{1F3B5}',
    words: [
      { answer: 'Bad Bunny', clue: 'Conejo' },
      { answer: 'Shakira', clue: 'Caderas' },
      { answer: 'Coldplay', clue: 'Banda' },
      { answer: 'Rock', clue: 'Guitarra' },
      { answer: 'Salsa', clue: 'Baile' },
      { answer: 'Reggaeton', clue: 'Perreo' },
      { answer: 'Rap', clue: 'Rimas' },
      { answer: 'Cumbia', clue: 'Tambor' },
    ],
  },
  personajes_famosos: {
    label: 'Personajes famosos',
    description: 'Celebridades, actores y figuras conocidas.',
    accent: '#f43f5e',
    panel: 'from-rose-500/20 via-pink-500/14 to-fuchsia-500/10',
    emoji: '\u{2B50}',
    words: [
      { answer: 'Messi', clue: 'Argentina' },
      { answer: 'Cristiano', clue: 'Portugal' },
      { answer: 'Beyonce', clue: 'Queen' },
      { answer: 'Elon Musk', clue: 'Tesla' },
      { answer: 'Taylor Swift', clue: 'Giras' },
      { answer: 'Shakira', clue: 'Barranquilla' },
      { answer: 'Mr Beast', clue: 'Retos' },
      { answer: 'Barbie', clue: 'Rosado' },
    ],
  },
  superheroes_villanos: {
    label: 'Superheroes y villanos',
    description: 'Heroes, capas y enemigos epicos.',
    accent: '#22c55e',
    panel: 'from-emerald-500/20 via-lime-500/14 to-teal-500/10',
    emoji: '\u{1F9B8}',
    words: [
      { answer: 'Batman', clue: 'Murcielago' },
      { answer: 'Superman', clue: 'Krypton' },
      { answer: 'Spider-Man', clue: 'Arana' },
      { answer: 'Joker', clue: 'Risa' },
      { answer: 'Thanos', clue: 'Chasquido' },
      { answer: 'Iron Man', clue: 'Armadura' },
      { answer: 'Wonder Woman', clue: 'Lazo' },
      { answer: 'Loki', clue: 'Truco' },
    ],
  },
  mitologia: {
    label: 'Mitologia',
    description: 'Dioses, monstruos y leyendas.',
    accent: '#f59e0b',
    panel: 'from-amber-500/20 via-orange-500/14 to-rose-500/10',
    emoji: '\u{26A1}',
    words: [
      { answer: 'Zeus', clue: 'Rayo' },
      { answer: 'Poseidon', clue: 'Mar' },
      { answer: 'Hades', clue: 'Inframundo' },
      { answer: 'Thor', clue: 'Martillo' },
      { answer: 'Medusa', clue: 'Piedra' },
      { answer: 'Anubis', clue: 'Chacal' },
      { answer: 'Hercules', clue: 'Fuerza' },
      { answer: 'Pegaso', clue: 'Alas' },
    ],
  },
  marcas_conocidas: {
    label: 'Marcas conocidas',
    description: 'Marcas que aparecen en todas partes.',
    accent: '#38bdf8',
    panel: 'from-sky-500/20 via-cyan-500/14 to-indigo-500/10',
    emoji: '\u{1F3F7}',
    words: [
      { answer: 'Nike', clue: 'Just Do It' },
      { answer: 'Adidas', clue: 'Tres' },
      { answer: 'Coca-Cola', clue: 'Refresco' },
      { answer: 'Apple', clue: 'Manzana' },
      { answer: 'Samsung', clue: 'Tecnologia' },
      { answer: "McDonald's", clue: 'Hamburguesa' },
      { answer: 'Netflix', clue: 'Series' },
      { answer: 'Google', clue: 'Buscar' },
    ],
  },
  farandula_peruana: {
    label: 'Farandula peruana',
    description: 'Nombres muy conocidos en Peru.',
    accent: '#fb7185',
    panel: 'from-rose-500/20 via-pink-500/14 to-fuchsia-500/10',
    emoji: '\u{1F1F5}\u{1F1EA}',
    words: [
      { answer: 'Gisela Valcarcel', clue: 'Television' },
      { answer: 'Magaly Medina', clue: 'Ampay' },
      { answer: 'Andres Wiese', clue: 'Actor' },
      { answer: 'Yahaira Plasencia', clue: 'Salsa' },
      { answer: 'Johanna San Miguel', clue: 'Comedia' },
      { answer: 'Ethel Pozo', clue: 'Show' },
      { answer: 'Milett Figueroa', clue: 'Modelo' },
      { answer: 'Tilsa Lozano', clue: 'Portada' },
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
