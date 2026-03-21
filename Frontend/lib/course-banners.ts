// Banco de imagenes medicas por categoria
// Fuente: Unsplash (free for commercial use, no attribution required)
// Formato: ?w=800&q=80 para optimizar tamano

export const CATEGORY_BANNERS: Record<string, string[]> = {
  "Cardiología": [
    "https://images.unsplash.com/photo-1628348068343-c6a848d2b6dd?w=800&q=80",
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
  ],
  "Neurología": [
    "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800&q=80",
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  ],
  "Pediatría": [
    "https://images.unsplash.com/photo-1581056771107-24ca5f033842?w=800&q=80",
    "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&q=80",
  ],
  "Cirugía General": [
    "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&q=80",
    "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?w=800&q=80",
  ],
  "Medicina Interna": [
    "https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=800&q=80",
    "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&q=80",
  ],
  "Oncología": [
    "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800&q=80",
    "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=800&q=80",
  ],
  "Psiquiatría": [
    "https://images.unsplash.com/photo-1620147461831-a97b99ade1d3?w=800&q=80",
    "https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=800&q=80",
  ],
  "Dermatología": [
    "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=800&q=80",
    "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&q=80",
  ],
  "Oftalmología": [
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80",
    "https://images.unsplash.com/photo-1616596080839-35a030c45f5d?w=800&q=80",
  ],
  "Ginecología y Obstetricia": [
    "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80",
    "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&q=80",
  ],
  "Medicina de Urgencias": [
    "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800&q=80",
    "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=800&q=80",
  ],
  "Radiología": [
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80",
    "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800&q=80",
  ],
  "Anestesiología": [
    "https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80",
    "https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&q=80",
  ],
};

// Imagenes genericas de medicina para cursos sin categoria asignada
export const GENERIC_MEDICAL_BANNERS = [
  "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&q=80",
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
  "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80",
];

/**
 * Obtiene el banner por defecto para un curso segun su categoria.
 * Usa el ID del curso para elegir de forma determinista entre las
 * opciones (mismo curso siempre muestra la misma imagen).
 */
export function getDefaultBanner(
  category: string | undefined,
  courseId: string
): string {
  const banners = category && CATEGORY_BANNERS[category]
    ? CATEGORY_BANNERS[category]
    : GENERIC_MEDICAL_BANNERS;

  const index = courseId.charCodeAt(0) % banners.length;
  return banners[index];
}
