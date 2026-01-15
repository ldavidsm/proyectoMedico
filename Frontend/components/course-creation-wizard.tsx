import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Check } from 'lucide-react';
import BasicInfoStep from './steps/basic-info-step';
import StructureStep from './steps/structure-step';
import ContentStep from './steps/content-step';
import QualityStep from './steps/quality-step';
import PricingStep from './steps/pricing-step';
import ReviewStep from './steps/review-step';

export type CourseFormData = {
 
  titulo: string;
  subtitulo: string;
  categoria: string;
  tema: string;
  subtema: string;
  nivelCurso: string;
  publicoObjetivo: string[];
  descripcionCorta: string;
  

  usarPlantilla: boolean;
  estructuraPersonalizada: string[];
  
 
  videos: Array<{
    id: string;
    seccion: string;
    titulo: string;
    archivo: File | null;
    duracion: string;
    descripcion: string;
  }>;
  presentacion: File | null;
  descripcionDetallada: {
    queAprendera: string;
    requisitos: string;
    dirigidoA: string;
    metodologia: string;
  };
  
 
  objetivosAprendizaje: string[];
  modalidades: string[];
  bibliografia: Array<{
    id: string;
    tipo: string;
    referencia: string;
    enlaceDOI: string;
  }>;
  criteriosCalidad: {
    audioClaro: boolean;
    videoHD: boolean;
    contenidoOriginal: boolean;
    casosPracticos: boolean;
  };
  

  precio: string;
  tipoAcceso: string;
  visibilidad: string;
};

const steps = [
  { id: 0, name: 'Definición', description: 'Posiciona tu curso' },
  { id: 1, name: 'Estructura', description: 'Organiza el aprendizaje' },
  { id: 2, name: 'Contenido', description: 'Sube tus materiales' },
  { id: 3, name: 'Calidad Académica', description: 'Valida los estándares' },
  { id: 4, name: 'Precio y Acceso', description: 'Define cómo se vende' },
  { id: 5, name: 'Revisión', description: 'Confirma y publica' },
];

export default function CourseCreationWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CourseFormData>({
    titulo: '',
    subtitulo: '',
    categoria: '',
    tema: '',
    subtema: '',
    nivelCurso: '',
    publicoObjetivo: [],
    descripcionCorta: '',
    usarPlantilla: false,
    estructuraPersonalizada: [],
    videos: [],
    presentacion: null,
    descripcionDetallada: {
      queAprendera: '',
      requisitos: '',
      dirigidoA: '',
      metodologia: '',
    },
    objetivosAprendizaje: [''],
    modalidades: [],
    bibliografia: [],
    criteriosCalidad: {
      audioClaro: false,
      videoHD: false,
      contenidoOriginal: false,
      casosPracticos: false,
    },
    precio: '',
    tipoAcceso: '',
    visibilidad: '',
  });

  const updateFormData = (data: Partial<CourseFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    }
  };

  const handleSubmit = () => {
    console.log('Curso enviado a revisión:', formData);
    alert('¡Curso enviado a revisión exitosamente!');
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
            H
          </div>
          <h1 className="text-2xl font-bold text-gray-900">HealthLearn - Médicos Creadores</h1>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Crear Nuevo Curso</h2>
        <p className="text-gray-600">Completa todos los pasos para crear tu curso médico</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progress} className="h-2 mb-4" />
        <div className="grid grid-cols-6 gap-2">
          {steps.map((step) => (
            <div key={step.id} className="relative">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    currentStep > step.id
                      ? 'bg-purple-600 text-white'
                      : currentStep === step.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id + 1}
                </div>
                <div className="text-center">
                  <p className={`text-xs font-medium ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {currentStep === 0 && (
            <BasicInfoStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 1 && (
            <StructureStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 2 && (
            <ContentStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 3 && (
            <QualityStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 4 && (
            <PricingStep formData={formData} updateFormData={updateFormData} />
          )}
          {currentStep === 5 && (
            <ReviewStep formData={formData} onEdit={(step) => setCurrentStep(step)} />
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          Anterior
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700">
            Siguiente
          </Button>
        ) : (
          <Button onClick={handleSubmit} className="bg-purple-600 hover:bg-purple-700">
            Enviar a Revisión
          </Button>
        )}
      </div>
    </div>
  );
}