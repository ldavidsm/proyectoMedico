import { Wand2, FileText, Video, Image, BarChart, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const tools = [
  {
    icon: Video,
    title: 'Editor de video',
    description: 'Edita y mejora tus videos de clase con herramientas profesionales',
    status: 'available',
  },
  {
    icon: FileText,
    title: 'Creador de cuestionarios',
    description: 'Crea evaluaciones interactivas para tus estudiantes',
    status: 'available',
  },
  {
    icon: Image,
    title: 'Banco de imágenes',
    description: 'Accede a miles de imágenes médicas y de salud',
    status: 'available',
  },
  {
    icon: Wand2,
    title: 'Generador de contenido IA',
    description: 'Asistente de IA para crear descripciones y materiales del curso',
    status: 'beta',
  },
  {
    icon: BarChart,
    title: 'Análisis avanzado',
    description: 'Herramientas detalladas de análisis y reportes',
    status: 'available',
  },
  {
    icon: Users,
    title: 'Gestión de estudiantes',
    description: 'Administra y comunícate con tus estudiantes eficientemente',
    status: 'available',
  },
];

export function ToolsSection() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Herramientas</h1>
        <p className="text-gray-600">
          Recursos y herramientas para crear contenido de calidad
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Icon className="w-6 h-6 text-purple-600" />
                </div>
                {tool.status === 'beta' && (
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                    Beta
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-2">{tool.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{tool.description}</p>
              <Button
                variant="outline"
                className="w-full hover:bg-purple-50 hover:border-purple-600"
              >
                Abrir herramienta
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="mt-12">
        <Card className="p-8 bg-gradient-to-r from-purple-50 to-purple-100">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white rounded-lg">
              <Wand2 className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">
                ¿Necesitas una herramienta específica?
              </h3>
              <p className="text-gray-600">
                Déjanos saber qué necesitas y trabajaremos en desarrollarla
              </p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              Solicitar herramienta
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
