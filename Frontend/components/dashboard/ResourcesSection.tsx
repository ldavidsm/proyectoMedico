import { BookOpen, Video, FileText, Headphones, Award, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const guides = [
  {
    icon: BookOpen,
    title: 'Guía completa del instructor',
    description: 'Todo lo que necesitas saber para crear cursos exitosos',
    duration: '45 min lectura',
    type: 'PDF',
  },
  {
    icon: Video,
    title: 'Cómo grabar videos profesionales',
    description: 'Tips y técnicas para crear contenido de video de alta calidad',
    duration: '30 min',
    type: 'Video',
  },
  {
    icon: FileText,
    title: 'Plantillas de curso',
    description: 'Estructuras probadas para diferentes tipos de cursos',
    duration: '15 min',
    type: 'Plantilla',
  },
  {
    icon: Headphones,
    title: 'Mejora tu audio',
    description: 'Guía práctica para obtener la mejor calidad de sonido',
    duration: '20 min',
    type: 'Video',
  },
  {
    icon: Award,
    title: 'Estrategias de marketing',
    description: 'Cómo promocionar tus cursos y aumentar inscripciones',
    duration: '1 hora',
    type: 'Curso',
  },
  {
    icon: FileText,
    title: 'Mejores prácticas pedagógicas',
    description: 'Métodos de enseñanza efectivos para el aprendizaje online',
    duration: '35 min',
    type: 'PDF',
  },
];

const webinars = [
  {
    title: 'Masterclass: Creación de cursos atractivos',
    speaker: 'Dra. Ana Martínez',
    date: '15 de Enero, 2026',
    time: '18:00 CET',
    status: 'upcoming',
  },
  {
    title: 'Q&A: Monetización de cursos',
    speaker: 'Carlos Rodríguez',
    date: '22 de Enero, 2026',
    time: '19:00 CET',
    status: 'upcoming',
  },
  {
    title: 'Engagement de estudiantes',
    speaker: 'María López',
    date: '5 de Enero, 2026',
    time: '17:00 CET',
    status: 'recorded',
  },
];

const faqs = [
  {
    question: '¿Cuánto tiempo tarda en aprobarse mi curso?',
    answer:
      'El proceso de revisión generalmente toma de 2 a 3 días hábiles. Nuestro equipo revisa el contenido para asegurar la calidad y cumplimiento de las directrices.',
  },
  {
    question: '¿Qué equipo necesito para grabar mis cursos?',
    answer:
      'Lo básico incluye: una cámara (puede ser la de tu smartphone), un micrófono USB de calidad, buena iluminación y un espacio tranquilo. No necesitas equipo profesional para empezar.',
  },
  {
    question: '¿Cómo recibo mis pagos?',
    answer:
      'Los pagos se procesan mensualmente y se depositan directamente en tu cuenta bancaria. Recibirás un informe detallado de tus ganancias cada mes.',
  },
  {
    question: '¿Puedo ofrecer certificados a mis estudiantes?',
    answer:
      'Sí, puedes crear certificados personalizados que se entregan automáticamente cuando los estudiantes completan tu curso.',
  },
];

export function ResourcesSection() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Recursos</h1>
        <p className="text-gray-600">
          Aprende, crece y mejora tus habilidades como instructor
        </p>
      </div>

      <Tabs defaultValue="guides" className="mb-6">
        <TabsList>
          <TabsTrigger value="guides">Guías y tutoriales</TabsTrigger>
          <TabsTrigger value="webinars">Webinars</TabsTrigger>
          <TabsTrigger value="community">Comunidad</TabsTrigger>
          <TabsTrigger value="faq">Preguntas frecuentes</TabsTrigger>
        </TabsList>

        <TabsContent value="guides" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide, index) => {
              const Icon = guide.icon;
              return (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {guide.type}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{guide.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{guide.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{guide.duration}</span>
                    <Button size="sm" variant="ghost" className="text-purple-600">
                      <Download className="w-4 h-4 mr-1" />
                      Acceder
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="webinars" className="mt-6">
          <div className="space-y-4">
            {webinars.map((webinar, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{webinar.title}</h3>
                      {webinar.status === 'upcoming' && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          Próximamente
                        </span>
                      )}
                      {webinar.status === 'recorded' && (
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          Grabación disponible
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">Por {webinar.speaker}</p>
                    <p className="text-sm text-gray-500">
                      {webinar.date} · {webinar.time}
                    </p>
                  </div>
                  <Button
                    className={
                      webinar.status === 'upcoming'
                        ? 'bg-purple-600 hover:bg-purple-700 text-white'
                        : ''
                    }
                    variant={webinar.status === 'recorded' ? 'outline' : 'default'}
                  >
                    {webinar.status === 'upcoming' ? 'Registrarse' : 'Ver grabación'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="community" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Foro de instructores</h3>
              <p className="text-gray-600 mb-4">
                Conecta con otros instructores, comparte experiencias y aprende de la
                comunidad
              </p>
              <Button variant="outline" className="w-full">
                Unirse al foro
              </Button>
            </Card>

            <Card className="p-6">
              <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
                <Headphones className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Soporte dedicado</h3>
              <p className="text-gray-600 mb-4">
                ¿Necesitas ayuda? Nuestro equipo está disponible para asistirte
              </p>
              <Button variant="outline" className="w-full">
                Contactar soporte
              </Button>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="p-6">
                <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">¿No encuentras lo que buscas?</p>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Ver todas las preguntas frecuentes
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}
