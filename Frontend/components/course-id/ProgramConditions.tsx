import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';

export interface ProgramConditionsData {
  // Acceso al contenido
  content_access?: {
    type: 'unlimited' | 'time_limited' | 'cohort_based';
    duration?: string; // Solo para time_limited (ej: "12 meses")
  };
  
  // Duración estimada
  estimated_duration?: string; // ej: "8 semanas", "10–12 semanas"
  
  // Modalidad
  delivery_mode?: 'recorded' | 'live' | 'mixed';
  
  // Ritmo del curso
  pace?: 'flexible' | 'flexible_recommended' | 'cohort_required';
  
  // Interacción con el profesorado
  mentoring?: 'none' | 'forum' | 'tutoring' | 'feedback';
  mentoring_duration?: string; // Solo si mentoring !== 'none'
  
  // Sesiones en directo
  live_sessions?: boolean;
  live_sessions_note?: string; // Solo si live_sessions === true
  
  // Certificación
  certificate?: boolean;
  certificate_condition?: string; // ej: "al completar el programa"
  
  // Material adicional
  materials?: Array<'downloadable' | 'clinical_cases' | 'bibliography'>;
  
  // Idioma
  language?: string; // ej: "Español"
  
  // Nivel
  level?: string; // ej: "Avanzado", "Intermedio"
}

interface ProgramConditionsProps {
  data: ProgramConditionsData;
}

interface ConditionRow {
  label: string;
  value: string;
}

export function ProgramConditions({ data }: ProgramConditionsProps) {
  const rows: ConditionRow[] = [];

  // A. Acceso al contenido
  if (data.content_access) {
    let accessText = '';
    switch (data.content_access.type) {
      case 'unlimited':
        accessText = 'Acceso ilimitado al contenido';
        break;
      case 'time_limited':
        accessText = `Acceso al contenido durante ${data.content_access.duration}`;
        break;
      case 'cohort_based':
        accessText = 'Acceso al contenido durante el periodo del programa';
        break;
    }
    if (accessText) {
      rows.push({ label: 'Acceso al contenido', value: accessText });
    }
  }

  // B. Duración estimada
  if (data.estimated_duration) {
    rows.push({ label: 'Duración estimada', value: data.estimated_duration });
  }

  // C. Modalidad
  if (data.delivery_mode) {
    let modeText = '';
    switch (data.delivery_mode) {
      case 'recorded':
        modeText = 'Online · Clases grabadas';
        break;
      case 'live':
        modeText = 'Online · Sesiones en directo';
        break;
      case 'mixed':
        modeText = 'Online · Mixto';
        break;
    }
    if (modeText) {
      rows.push({ label: 'Modalidad', value: modeText });
    }
  }

  // D. Ritmo del curso
  if (data.pace) {
    let paceText = '';
    switch (data.pace) {
      case 'flexible':
        paceText = 'Flexible';
        break;
      case 'flexible_recommended':
        paceText = 'Flexible (recomendado)';
        break;
      case 'cohort_required':
        paceText = 'Cohorte con calendario definido';
        break;
    }
    if (paceText) {
      rows.push({ label: 'Ritmo', value: paceText });
    }
  }

  // E & F. Interacción con el profesorado
  if (data.mentoring && data.mentoring !== 'none') {
    let mentoringText = '';
    switch (data.mentoring) {
      case 'forum':
        mentoringText = 'Foro de discusión';
        break;
      case 'tutoring':
        mentoringText = 'Tutorías';
        break;
      case 'feedback':
        mentoringText = 'Feedback del profesorado';
        break;
    }
    
    // Si hay duración de mentoría, combinarla
    if (data.mentoring_duration) {
      mentoringText = `${mentoringText} durante ${data.mentoring_duration}`;
    }
    
    if (mentoringText) {
      rows.push({ label: 'Interacción con el profesorado', value: mentoringText });
    }
  }

  // G. Sesiones en directo
  if (data.live_sessions !== undefined) {
    if (data.live_sessions) {
      const liveText = data.live_sessions_note 
        ? `Incluidas (${data.live_sessions_note})`
        : 'Incluidas';
      rows.push({ label: 'Sesiones en directo', value: liveText });
    } else {
      rows.push({ label: 'Sesiones en directo', value: 'No incluidas' });
    }
  }

  // H. Certificación
  if (data.certificate !== undefined) {
    if (data.certificate) {
      const certText = data.certificate_condition
        ? `Incluida (${data.certificate_condition})`
        : 'Incluida';
      rows.push({ label: 'Certificación', value: certText });
    } else {
      rows.push({ label: 'Certificación', value: 'No incluida' });
    }
  }

  // I. Material adicional
  if (data.materials && data.materials.length > 0) {
    rows.push({ label: 'Material adicional', value: 'Incluido' });
  }

  // J. Idioma
  if (data.language) {
    rows.push({ label: 'Idioma', value: data.language });
  }

  // K. Nivel
  if (data.level) {
    rows.push({ label: 'Nivel', value: data.level });
  }

  // Si no hay filas que mostrar, no renderizar nada
  if (rows.length === 0) {
    return null;
  }

  return (
    <>
      <p className="text-slate-600 mb-4 leading-relaxed text-sm">
        A continuación se detallan las condiciones específicas de acceso, modalidad y acompañamiento del programa 
        para que pueda valorar si se ajusta a sus necesidades formativas.
      </p>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-200">
            {rows.map((row, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="font-medium text-slate-900">
                  {row.label}
                </div>
                <div className="text-slate-700">
                  {row.value}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}