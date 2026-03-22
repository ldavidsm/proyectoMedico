export const CONTENT_TYPES = [
  {
    id: 'video_courses',
    label: 'Cursos en vídeo',
    description: 'Formaciones estructuradas con contenido audiovisual',
    icon: '🎬',
  },
  {
    id: 'live_webinars',
    label: 'Webinars en directo',
    description: 'Sesiones en tiempo real con interacción',
    icon: '📡',
  },
  {
    id: 'articles',
    label: 'Artículos y guías',
    description: 'Contenido escrito y recursos descargables',
    icon: '📝',
  },
  {
    id: 'practical_cases',
    label: 'Casos prácticos',
    description: 'Análisis de casos clínicos reales',
    icon: '🔬',
  },
  {
    id: 'certifications',
    label: 'Programas de certificación',
    description: 'Itinerarios formativos con acreditación oficial',
    icon: '🏆',
  },
];

export const LANGUAGES = [
  { code: 'es', name: 'Español', nativeName: 'Español' },
  { code: 'en', name: 'Inglés', nativeName: 'English' },
  { code: 'ca', name: 'Catalán', nativeName: 'Català' },
  { code: 'pt', name: 'Portugués', nativeName: 'Português' },
  { code: 'fr', name: 'Francés', nativeName: 'Français' },
  { code: 'de', name: 'Alemán', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italiano', nativeName: 'Italiano' },
];

export const TEACHING_EXPERIENCE_OPTIONS = [
  'Más de 10 años impartiendo formación',
  'Entre 5 y 10 años de experiencia docente',
  'Entre 1 y 5 años enseñando',
  'Menos de 1 año (iniciando en docencia)',
  'Sin experiencia previa formal en docencia',
];

export const MOTIVATION_OPTIONS = [
  'Compartir conocimientos con otros profesionales',
  'Contribuir a la formación continua del sector',
  'Generar ingresos adicionales',
  'Posicionarme como referente en mi especialidad',
  'Desarrollar mi marca personal profesional',
  'Ampliar mi red de contactos profesionales',
];

export const PROFESSIONS = [
  { id: 'medico', label: 'Médico/a', requiresSpecialty: true },
  { id: 'enfermero', label: 'Enfermero/a', requiresSpecialty: true },
  { id: 'fisioterapeuta', label: 'Fisioterapeuta', requiresSpecialty: false },
  { id: 'psicologo', label: 'Psicólogo/a', requiresSpecialty: true },
  { id: 'farmaceutico', label: 'Farmacéutico/a', requiresSpecialty: false },
  { id: 'nutricionista', label: 'Nutricionista / Dietista', requiresSpecialty: false },
  { id: 'terapeuta_ocupacional', label: 'Terapeuta ocupacional', requiresSpecialty: false },
  { id: 'logopeda', label: 'Logopeda', requiresSpecialty: false },
  { id: 'dentista', label: 'Odontólogo/a', requiresSpecialty: true },
  { id: 'veterinario', label: 'Veterinario/a', requiresSpecialty: true },
  { id: 'biologo', label: 'Biólogo/a sanitario/a', requiresSpecialty: false },
  { id: 'quimico', label: 'Químico/a clínico/a', requiresSpecialty: false },
  { id: 'otro', label: 'Otro profesional sanitario', requiresSpecialty: false },
];

export const EDUCATION_LEVELS = [
  { id: 'grado', label: 'Grado / Licenciatura' },
  { id: 'master', label: 'Máster' },
  { id: 'doctorado', label: 'Doctorado' },
  { id: 'posdoctorado', label: 'Posdoctorado' },
];

export const SPECIALTIES_BY_PROFESSION: Record<string, string[]> = {
  medico: [
    'Alergología', 'Anestesiología y Reanimación', 'Anatomía Patológica',
    'Angiología y Cirugía Vascular', 'Bioquímica Clínica', 'Cardiología',
    'Cirugía Cardiovascular', 'Cirugía General y del Aparato Digestivo',
    'Cirugía Oral y Maxilofacial', 'Cirugía Ortopédica y Traumatología',
    'Cirugía Pediátrica', 'Cirugía Plástica, Estética y Reparadora',
    'Cirugía Torácica', 'Dermatología Médico-Quirúrgica y Venereología',
    'Endocrinología y Nutrición', 'Farmacología Clínica', 'Gastroenterología',
    'Genética Médica', 'Geriatría', 'Hematología y Hemoterapia',
    'Inmunología', 'Medicina Aeroespacial', 'Medicina del Trabajo',
    'Medicina de Urgencias y Emergencias', 'Medicina Familiar y Comunitaria',
    'Medicina Física y Rehabilitación', 'Medicina Intensiva', 'Medicina Interna',
    'Medicina Nuclear', 'Medicina Preventiva y Salud Pública',
    'Microbiología y Parasitología', 'Nefrología', 'Neumología',
    'Neurocirugía', 'Neurofisiología Clínica', 'Neurología',
    'Obstetricia y Ginecología', 'Oftalmología', 'Oncología Médica',
    'Oncología Radioterápica', 'Otorrinolaringología',
    'Pediatría y sus Áreas Específicas', 'Psiquiatría', 'Radiodiagnóstico',
    'Reumatología', 'Urología', 'Medicina General (sin especialidad)',
  ],
  enfermero: [
    'Enfermería Familiar y Comunitaria', 'Enfermería Geriátrica',
    'Enfermería de Salud Mental', 'Enfermería del Trabajo',
    'Enfermería Obstétrico-Ginecológica (Matrona)', 'Enfermería Pediátrica',
    'Enfermería de Cuidados Médico-Quirúrgicos',
    'Enfermería de Urgencias y Emergencias',
    'Enfermería General (sin especialidad)',
  ],
  psicologo: [
    'Psicología Clínica', 'Psicología General Sanitaria', 'Neuropsicología',
    'Psicología de la Salud', 'Psicología Educativa', 'Psicología Forense',
    'Psicología del Deporte', 'Psicología Organizacional',
    'Psicoterapia', 'Psicología General (sin especialidad)',
  ],
  dentista: [
    'Cirugía Oral', 'Endodoncia', 'Odontopediatría', 'Ortodoncia',
    'Periodoncia', 'Prostodoncia', 'Implantología', 'Estética Dental',
    'Patología Oral', 'Odontología General (sin especialidad)',
  ],
  veterinario: [
    'Animales de Compañía', 'Équidos', 'Porcino', 'Rumiantes',
    'Aves', 'Acuicultura', 'Seguridad Alimentaria',
    'Salud Pública Veterinaria', 'Medicina y Cirugía Animal',
    'Veterinaria General (sin especialidad)',
  ],
};

export const COLLEGE_NUMBER_FORMATS: Record<string, {
  pattern: string;
  minLength: number;
  maxLength: number;
  example: string;
}> = {
  ES: { pattern: '^[0-9]{8,12}$', minLength: 8, maxLength: 12, example: 'Ej: 280512345' },
  MX: { pattern: '^[0-9]{7,8}$', minLength: 7, maxLength: 8, example: 'Ej: 1234567' },
  AR: { pattern: '^[A-Z0-9]{6,10}$', minLength: 6, maxLength: 10, example: 'Ej: MN123456' },
  default: { pattern: '^[A-Z0-9]{4,15}$', minLength: 4, maxLength: 15, example: 'Ej: ABC123456' },
};

export const COUNTRIES = [
  { code: 'ES', name: 'España', collegeLabel: 'Número de colegiado/a' },
  { code: 'MX', name: 'México', collegeLabel: 'Cédula profesional' },
  { code: 'AR', name: 'Argentina', collegeLabel: 'Matrícula profesional' },
  { code: 'CO', name: 'Colombia', collegeLabel: 'Registro médico' },
  { code: 'CL', name: 'Chile', collegeLabel: 'Registro único nacional' },
  { code: 'PE', name: 'Perú', collegeLabel: 'Número de colegiatura' },
  { code: 'UY', name: 'Uruguay', collegeLabel: 'Registro profesional' },
  { code: 'VE', name: 'Venezuela', collegeLabel: 'Número de colegiado/a' },
  { code: 'US', name: 'Estados Unidos', collegeLabel: 'License number' },
  { code: 'PT', name: 'Portugal', collegeLabel: 'Número de ordem' },
  { code: 'BR', name: 'Brasil', collegeLabel: 'Registro profissional' },
  { code: 'IT', name: 'Italia', collegeLabel: 'Numero di iscrizione' },
  { code: 'default', name: 'Otro', collegeLabel: 'Número de registro' },
];

export const LEGAL_DOCUMENTS = [
  {
    id: 'toc_creator_v2.1',
    title: 'Términos y Condiciones para Creadores de Contenido',
    version: '2.1',
    url: '#',
    summaryPoints: [
      'Propiedad intelectual: Usted retiene los derechos de su contenido',
      'La plataforma obtiene licencia no exclusiva para distribuir su contenido',
      'Comisión del 20% sobre las ventas brutas',
      'Pagos mensuales con umbral mínimo de 50€',
      'Responsabilidad sobre la calidad y veracidad del contenido publicado',
    ],
  },
  {
    id: 'cqp_v1.3',
    title: 'Política de Calidad de Contenidos',
    version: '1.3',
    url: '#',
    summaryPoints: [
      'Todo contenido debe estar basado en evidencia científica actual',
      'Obligatorio citar fuentes y referencias bibliográficas',
      'Prohibido contenido que contradiga consensos científicos establecidos',
      'Proceso de revisión por pares antes de la publicación',
      'La plataforma se reserva el derecho de retirar contenido inadecuado',
    ],
  },
  {
    id: 'pp_v3.0',
    title: 'Política de Privacidad',
    version: '3.0',
    url: '#',
    summaryPoints: [
      'Cumplimiento con RGPD y normativa de protección de datos',
      'Sus datos personales y profesionales serán tratados confidencialmente',
      'Información compartida con estudiantes: nombre, especialidad y biografía',
      'Derecho de acceso, rectificación y supresión de datos',
      'No compartimos datos con terceros sin consentimiento explícito',
    ],
  },
  {
    id: 'coc_v1.2',
    title: 'Código de Conducta Profesional',
    version: '1.2',
    url: '#',
    summaryPoints: [
      'Mantener los más altos estándares éticos profesionales',
      'Respetar la confidencialidad de pacientes en casos clínicos',
      'Interacción profesional y respetuosa con estudiantes',
      'Declarar conflictos de interés cuando corresponda',
      'Actualización continua del contenido publicado',
    ],
  },
];

export const PLATFORM_METADATA = {
  commissionRate: 0.20,
  creatorRate: 0.80,
  minimumPayout: 50,
  payoutCurrency: 'EUR',
  supportEmail: 'creadores@healthlearn.com',
};
