export interface FontOption {
  name: string;
  family: string;
  category: 'serif' | 'sans' | 'display' | 'gothic';
  description: string;
}

export const EDITORIAL_FONTS: FontOption[] = [
  {
    name: 'Playfair Display',
    family: "'Playfair Display', Georgia, serif",
    category: 'serif',
    description: 'Titulares clásicos de prensa de alto contraste'
  },
  {
    name: 'Newsreader',
    family: "'Newsreader', 'Times New Roman', serif",
    category: 'serif',
    description: 'Diseñada específicamente para lectura continua de noticias'
  },
  {
    name: 'Cormorant Garamond',
    family: "'Cormorant Garamond', Garamond, serif",
    category: 'serif',
    description: 'Elegancia renacentista para suplementos y cultura'
  },
  {
    name: 'Merriweather',
    family: "'Merriweather', Georgia, serif",
    category: 'serif',
    description: 'Serif robusta con excelente legibilidad en pantalla'
  },
  {
    name: 'Libre Baskerville',
    family: "'Libre Baskerville', Baskerville, serif",
    category: 'serif',
    description: 'Tridimensionalidad y rigor británico tradicional'
  },
  {
    name: 'Cinzel',
    family: "'Cinzel', serif",
    category: 'display',
    description: 'Inscripciones romanas ideales para cabeceras y finanzas'
  },
  {
    name: 'UnifrakturMaguntia (Gótica)',
    family: "'UnifrakturMaguntia', serif",
    category: 'gothic',
    description: 'Letra gótica clásica para cabeceras históricas de diario'
  },
  {
    name: 'Oswald',
    family: "'Oswald', Impact, sans-serif",
    category: 'sans',
    description: 'Condensada de fuerte impacto visual para tabloides y kickers'
  },
  {
    name: 'Inter',
    family: "'Inter', system-ui, sans-serif",
    category: 'sans',
    description: 'Sans contemporánea y nítida para pies de foto e infografías'
  }
];

export interface TypographyPreset {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform?: 'none' | 'uppercase' | 'capitalize';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

export const TYPOGRAPHY_PRESETS: TypographyPreset[] = [
  {
    id: 'titular-catastrofe',
    name: 'Gran Titular de Portada (8 Columnas)',
    fontFamily: "'Playfair Display', serif",
    fontSize: 42,
    lineHeight: 1.1,
    letterSpacing: -0.8,
    textTransform: 'none'
  },
  {
    id: 'titular-tabloide',
    name: 'Titular Tabloide Compacto',
    fontFamily: "'Oswald', sans-serif",
    fontSize: 38,
    lineHeight: 1.05,
    letterSpacing: -0.5,
    textTransform: 'uppercase'
  },
  {
    id: 'antetitulo-kicker',
    name: 'Antetítulo / Kicker Sección',
    fontFamily: "'Oswald', sans-serif",
    fontSize: 12,
    lineHeight: 1.2,
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  {
    id: 'subtitulo-bajada',
    name: 'Bajada / Subtítulo Explicativo',
    fontFamily: "'Newsreader', serif",
    fontSize: 18,
    lineHeight: 1.35,
    letterSpacing: 0,
    textTransform: 'none'
  },
  {
    id: 'cuerpo-periodistico',
    name: 'Cuerpo de Noticia Columnada',
    fontFamily: "'Newsreader', serif",
    fontSize: 14,
    lineHeight: 1.55,
    letterSpacing: 0,
    textAlign: 'justify'
  },
  {
    id: 'cita-editorial',
    name: 'Cita Destacada / Frase Clave',
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 20,
    lineHeight: 1.35,
    letterSpacing: 0
  },
  {
    id: 'pie-de-foto',
    name: 'Pie de Foto & Crédito',
    fontFamily: "'Inter', sans-serif",
    fontSize: 11,
    lineHeight: 1.4,
    letterSpacing: 0
  }
];
