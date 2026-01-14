import { useState } from 'react';
import { CheckCircle2, Upload, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';

type ApplicationStep = 'info' | 'credentials' | 'experience' | 'review' | 'submitted';

export function BecomeCreatorSection() {
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('info');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    profession: '',
    specialization: '',
    licenseNumber: '',
    licenseFile: null as File | null,
    institution: '',
    yearsExperience: '',
    expertise: '',
    teachingExperience: '',
    motivation: '',
  });

  const handleSubmit = () => {
    // Simulate submission
    setCurrentStep('submitted');
    toast.success('Solicitud enviada con éxito. Te contactaremos pronto.');
  };

  if (currentStep === 'submitted') {
    return <ApplicationSubmitted />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Conviértete en Instructor</h1>
        <p className="text-gray-600">
          Únete a nuestra comunidad de profesionales de la salud y comparte tu conocimiento
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { id: 'info', label: 'Información personal' },
            { id: 'credentials', label: 'Credenciales' },
            { id: 'experience', label: 'Experiencia' },
            { id: 'review', label: 'Revisión' },
          ].map((step, index, arr) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep === step.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:inline">
                  {step.label}
                </span>
              </div>
              {index < arr.length - 1 && (
                <div className="flex-1 h-1 bg-gray-200 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card className="p-8">
        {currentStep === 'info' && (
          <PersonalInfoStep formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 'credentials' && (
          <CredentialsStep formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 'experience' && (
          <ExperienceStep formData={formData} setFormData={setFormData} />
        )}
        {currentStep === 'review' && (
          <ReviewStep formData={formData} />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => {
              const steps: ApplicationStep[] = ['info', 'credentials', 'experience', 'review'];
              const currentIndex = steps.indexOf(currentStep);
              if (currentIndex > 0) {
                setCurrentStep(steps[currentIndex - 1]);
              }
            }}
            disabled={currentStep === 'info'}
          >
            Anterior
          </Button>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => {
              const steps: ApplicationStep[] = ['info', 'credentials', 'experience', 'review'];
              const currentIndex = steps.indexOf(currentStep);
              if (currentIndex < steps.length - 1) {
                setCurrentStep(steps[currentIndex + 1]);
              } else {
                handleSubmit();
              }
            }}
          >
            {currentStep === 'review' ? 'Enviar solicitud' : 'Siguiente'}
          </Button>
        </div>
      </Card>

      {/* Benefits Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Beneficios de ser instructor</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <BenefitCard
            title="Impacto global"
            description="Comparte tu conocimiento con profesionales de la salud en todo el mundo"
          />
          <BenefitCard
            title="Ingresos adicionales"
            description="Genera ingresos pasivos con tus cursos mientras ayudas a otros profesionales"
          />
          <BenefitCard
            title="Soporte completo"
            description="Te acompañamos en cada paso con recursos, herramientas y un equipo dedicado"
          />
        </div>
      </div>
    </div>
  );
}

function PersonalInfoStep({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Información personal</h3>
        <p className="text-gray-600 mb-6">
          Cuéntanos sobre ti y tu experiencia profesional
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Nombre completo *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Dr. Juan Pérez"
          />
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="juan.perez@ejemplo.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Teléfono *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+34 600 000 000"
          />
        </div>
        <div>
          <Label htmlFor="profession">Profesión *</Label>
          <Select
            value={formData.profession}
            onValueChange={(value) => setFormData({ ...formData, profession: value })}
          >
            <SelectTrigger id="profession">
              <SelectValue placeholder="Selecciona tu profesión" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medico">Médico</SelectItem>
              <SelectItem value="enfermero">Enfermero/a</SelectItem>
              <SelectItem value="fisioterapeuta">Fisioterapeuta</SelectItem>
              <SelectItem value="nutricionista">Nutricionista</SelectItem>
              <SelectItem value="psicologo">Psicólogo/a</SelectItem>
              <SelectItem value="farmaceutico">Farmacéutico/a</SelectItem>
              <SelectItem value="otro">Otro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="specialization">Especialización *</Label>
        <Input
          id="specialization"
          value={formData.specialization}
          onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
          placeholder="Ej: Cardiología, Nutrición Deportiva, etc."
        />
      </div>
    </div>
  );
}

function CredentialsStep({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Credenciales profesionales</h3>
        <p className="text-gray-600 mb-6">
          Verifica tu identidad profesional para garantizar la calidad de nuestra plataforma
        </p>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Información confidencial</p>
          <p>
            Tus credenciales se utilizan únicamente para verificación y se manejan con total
            confidencialidad según las normativas de protección de datos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="licenseNumber">Número de colegiado/licencia *</Label>
          <Input
            id="licenseNumber"
            value={formData.licenseNumber}
            onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
            placeholder="Ej: 123456789"
          />
        </div>
        <div>
          <Label htmlFor="institution">Institución/Universidad *</Label>
          <Input
            id="institution"
            value={formData.institution}
            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
            placeholder="Universidad donde obtuvo el título"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="licenseFile">Documento de acreditación *</Label>
        <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-1">
            Haz clic para subir o arrastra el archivo aquí
          </p>
          <p className="text-xs text-gray-500">
            PDF, JPG o PNG. Máximo 10MB. (Título, licencia o certificado de colegiación)
          </p>
          <input
            type="file"
            id="licenseFile"
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setFormData({ ...formData, licenseFile: file });
              }
            }}
          />
        </div>
        {formData.licenseFile && (
          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Archivo cargado: {formData.licenseFile.name}
          </p>
        )}
      </div>
    </div>
  );
}

function ExperienceStep({ formData, setFormData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Experiencia profesional y docente</h3>
        <p className="text-gray-600 mb-6">
          Ayúdanos a conocer tu trayectoria y motivación
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="yearsExperience">Años de experiencia profesional *</Label>
          <Select
            value={formData.yearsExperience}
            onValueChange={(value) => setFormData({ ...formData, yearsExperience: value })}
          >
            <SelectTrigger id="yearsExperience">
              <SelectValue placeholder="Selecciona..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0-2">0-2 años</SelectItem>
              <SelectItem value="3-5">3-5 años</SelectItem>
              <SelectItem value="6-10">6-10 años</SelectItem>
              <SelectItem value="10+">Más de 10 años</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="expertise">Área de expertise principal *</Label>
          <Input
            id="expertise"
            value={formData.expertise}
            onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
            placeholder="Ej: Rehabilitación deportiva"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="teachingExperience">Experiencia docente (opcional)</Label>
        <Textarea
          id="teachingExperience"
          value={formData.teachingExperience}
          onChange={(e) => setFormData({ ...formData, teachingExperience: e.target.value })}
          placeholder="Describe tu experiencia previa enseñando, dando talleres, conferencias, etc."
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="motivation">¿Por qué quieres ser instructor? *</Label>
        <Textarea
          id="motivation"
          value={formData.motivation}
          onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
          placeholder="Cuéntanos qué te motiva a compartir tu conocimiento y qué temas te gustaría enseñar"
          rows={4}
        />
      </div>
    </div>
  );
}

function ReviewStep({ formData }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Revisa tu solicitud</h3>
        <p className="text-gray-600 mb-6">
          Verifica que toda la información sea correcta antes de enviar
        </p>
      </div>

      <div className="space-y-4">
        <ReviewSection title="Información personal">
          <ReviewItem label="Nombre completo" value={formData.fullName} />
          <ReviewItem label="Email" value={formData.email} />
          <ReviewItem label="Teléfono" value={formData.phone} />
          <ReviewItem label="Profesión" value={formData.profession} />
          <ReviewItem label="Especialización" value={formData.specialization} />
        </ReviewSection>

        <ReviewSection title="Credenciales">
          <ReviewItem label="Número de licencia" value={formData.licenseNumber} />
          <ReviewItem label="Institución" value={formData.institution} />
          <ReviewItem
            label="Documento"
            value={formData.licenseFile ? formData.licenseFile.name : 'No cargado'}
          />
        </ReviewSection>

        <ReviewSection title="Experiencia">
          <ReviewItem label="Años de experiencia" value={formData.yearsExperience} />
          <ReviewItem label="Área de expertise" value={formData.expertise} />
          <ReviewItem label="Motivación" value={formData.motivation} />
        </ReviewSection>
      </div>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-semibold mb-3">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-gray-600">{label}:</span>
      <span className="font-medium">{value || '-'}</span>
    </div>
  );
}

function ApplicationSubmitted() {
  return (
    <div className="max-w-2xl mx-auto text-center py-12">
      <div className="mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">¡Solicitud enviada con éxito!</h1>
        <p className="text-gray-600 text-lg">
          Gracias por tu interés en unirte a nuestra comunidad de instructores
        </p>
      </div>

      <Card className="p-8 text-left">
        <h3 className="font-semibold text-lg mb-4">¿Qué sigue?</h3>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-semibold">1</span>
            </div>
            <div>
              <p className="font-medium">Verificación de credenciales</p>
              <p className="text-sm text-gray-600">
                Nuestro equipo revisará tu información y credenciales profesionales (2-3 días
                hábiles)
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-semibold">2</span>
            </div>
            <div>
              <p className="font-medium">Entrevista de orientación</p>
              <p className="text-sm text-gray-600">
                Te contactaremos para una breve entrevista y orientación sobre la plataforma
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 font-semibold">3</span>
            </div>
            <div>
              <p className="font-medium">Acceso a la plataforma</p>
              <p className="text-sm text-gray-600">
                Una vez aprobado, recibirás acceso completo para crear tus cursos
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="mt-8">
        <p className="text-sm text-gray-600 mb-4">
          Te hemos enviado un email de confirmación a tu correo electrónico
        </p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Volver al inicio
        </Button>
      </div>
    </div>
  );
}

function BenefitCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-6">
      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
        <CheckCircle2 className="w-6 h-6 text-purple-600" />
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </Card>
  );
}
