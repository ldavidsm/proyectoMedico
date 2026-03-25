'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle2, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

import { StepContentTypes } from '@/components/creator-onboarding/StepContentTypes';
import { StepLanguages } from '@/components/creator-onboarding/StepLanguages';
import { StepTeachingExperience } from '@/components/creator-onboarding/StepTeachingExperience';
import { StepMotivation } from '@/components/creator-onboarding/StepMotivation';
import { StepLegalDeclarations } from '@/components/creator-onboarding/StepLegalDeclarations';
import {
  StepCountryProfession,
  StepEducationSpecialty,
  StepCollegeNumber,
} from '@/components/creator-onboarding/StepProfessionalProfile';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type FlowType = 'existing_profile' | 'new_user';

const STEPS_A = [
  'content_types',
  'languages',
  'teaching_experience',
  'motivation',
  'legal_declarations',
] as const;

const STEPS_B = [
  'country_profession',
  'education_specialty',
  'college_number',
  'teaching_experience',
  'content_types',
  'languages',
  'motivation',
  'legal_declarations',
] as const;

const STEP_LABELS_A: Record<string, string> = {
  content_types: 'Tipos de contenido',
  languages: 'Idiomas',
  teaching_experience: 'Experiencia docente',
  motivation: 'Motivación',
  legal_declarations: 'Declaraciones legales',
};

const STEP_LABELS_B: Record<string, string> = {
  country_profession: 'País y profesión',
  education_specialty: 'Formación y especialidad',
  college_number: 'Número de colegiado',
  teaching_experience: 'Experiencia docente',
  content_types: 'Tipos de contenido',
  languages: 'Idiomas',
  motivation: 'Motivación',
  legal_declarations: 'Declaraciones legales',
};

export function BecomeCreatorSection() {
  const { user } = useAuth();
  const router = useRouter();

  const flowType: FlowType = user?.profile_completed
    ? 'existing_profile'
    : 'new_user';

  const steps = flowType === 'existing_profile' ? STEPS_A : STEPS_B;
  const stepLabels = flowType === 'existing_profile' ? STEP_LABELS_A : STEP_LABELS_B;

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [status, setStatus] = useState<'idle' | 'submitted' | 'rejected' | 'pending'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [profileData, setProfileData] = useState({
    country: '',
    profession: '',
    educationLevel: '',
    specialty: '',
    collegeNumber: '',
  });
  const updateProfileData = (data: Partial<typeof profileData>) => {
    setProfileData(prev => ({ ...prev, ...data }));
  };
  const [contentTypes, setContentTypes] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(['es']);
  const [teachingExperience, setTeachingExperience] = useState('');
  const [motivation, setMotivation] = useState<string[]>([]);
  const [legalAccepted, setLegalAccepted] = useState(false);

  // Check prior request status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_URL}/seller-requests/my-status`, {
          credentials: 'include',
        });
        if (!res.ok) { setIsLoading(false); return; }
        const data = await res.json();
        if (!data) { setIsLoading(false); return; }

        if (data.status === 'pending') setStatus('pending');
        else if (data.status === 'approved') router.push('/');
        else if (data.status === 'rejected') setStatus('rejected');
      } catch (err) {
        if (process.env.NODE_ENV === 'development') console.error('Error checking creator status:', err);
      }
      finally { setIsLoading(false); }
    };
    checkStatus();
  }, [router]);

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'country_profession':
        return !!profileData.country && !!profileData.profession;
      case 'education_specialty':
        return !!profileData.educationLevel;
      case 'college_number':
        return !!profileData.collegeNumber;
      case 'content_types':
        return contentTypes.length > 0;
      case 'languages':
        return languages.length > 0;
      case 'teaching_experience':
        return !!teachingExperience;
      case 'motivation':
        return motivation.length > 0;
      case 'legal_declarations':
        return legalAccepted;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canProceed()) {
      toast.error('Por favor completa este paso antes de continuar');
      return;
    }
    if (isLastStep) {
      handleSubmit();
    } else {
      setCurrentStepIndex(i => i + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        flow_type: flowType,
        content_types: contentTypes,
        languages,
        teaching_experience: teachingExperience,
        motivation,
        legal_accepted: legalAccepted,
        bio: motivation.join(', '),
      };

      if (flowType === 'new_user') {
        payload.country = profileData.country;
        payload.profession = profileData.profession;
        payload.education_level = profileData.educationLevel;
        payload.specialty = profileData.specialty;
        payload.college_number = profileData.collegeNumber;
        payload.education = profileData.educationLevel;
      }

      const res = await fetch(`${API_URL}/seller-requests/`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al enviar solicitud');
      }

      setStatus('submitted');
      toast.success('Solicitud enviada con éxito');
    } catch (err: any) {
      toast.error(err.message || 'Error al enviar la solicitud');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Special states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'submitted' || status === 'pending') {
    return <ApplicationSubmitted />;
  }

  if (status === 'rejected') {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Solicitud no aprobada</h2>
        <p className="text-gray-600 mb-6">
          Tu solicitud anterior no fue aprobada. Puedes volver a intentarlo con más información o documentación.
        </p>
        <Button
          onClick={() => setStatus('idle')}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          Volver a solicitar
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Conviértete en Instructor</h1>
        <p className="text-gray-600">
          {flowType === 'existing_profile'
            ? 'Tu perfil profesional ya está verificado. Solo necesitamos algunos datos más.'
            : 'Completa tu perfil profesional y solicita acceso como instructor.'}
        </p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Paso {currentStepIndex + 1} de {steps.length}</span>
          <span>{stepLabels[currentStep]}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-600 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex gap-1.5 mt-3 flex-wrap">
          {steps.map((step, i) => (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                i < currentStepIndex
                  ? 'bg-purple-600'
                  : i === currentStepIndex
                    ? 'bg-purple-400'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <Card className="p-6 mb-6">
        {currentStep === 'country_profession' && (
          <StepCountryProfession data={profileData} onChange={updateProfileData} />
        )}
        {currentStep === 'education_specialty' && (
          <StepEducationSpecialty data={profileData} onChange={updateProfileData} />
        )}
        {currentStep === 'college_number' && (
          <StepCollegeNumber data={profileData} onChange={updateProfileData} />
        )}
        {currentStep === 'content_types' && (
          <StepContentTypes selected={contentTypes} onChange={setContentTypes} />
        )}
        {currentStep === 'languages' && (
          <StepLanguages selected={languages} onChange={setLanguages} />
        )}
        {currentStep === 'teaching_experience' && (
          <StepTeachingExperience selected={teachingExperience} onChange={setTeachingExperience} />
        )}
        {currentStep === 'motivation' && (
          <StepMotivation selected={motivation} onChange={setMotivation} />
        )}
        {currentStep === 'legal_declarations' && (
          <StepLegalDeclarations accepted={legalAccepted} onChange={setLegalAccepted} />
        )}
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStepIndex(i => i - 1)}
          disabled={currentStepIndex === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button
          onClick={handleNext}
          disabled={isSubmitting || !canProceed()}
          className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
        >
          {isSubmitting
            ? 'Enviando...'
            : isLastStep
              ? 'Enviar solicitud'
              : 'Siguiente'}
          {!isLastStep && <ArrowRight className="w-4 h-4" />}
        </Button>
      </div>

      {/* Benefits — only on first step */}
      {currentStepIndex === 0 && (
        <div className="mt-10 grid grid-cols-3 gap-4">
          {[
            { title: 'Comisión del 80%', desc: 'Recibes el 80% de cada venta' },
            { title: 'Pagos mensuales', desc: 'A partir de 50€ acumulados' },
            { title: 'Soporte dedicado', desc: 'Equipo de creadores a tu lado' },
          ].map(b => (
            <Card key={b.title} className="p-4 text-center">
              <p className="font-semibold text-sm mb-1">{b.title}</p>
              <p className="text-xs text-gray-500">{b.desc}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicationSubmitted() {
  return (
    <div className="max-w-lg mx-auto text-center py-12">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="w-12 h-12 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold mb-2">¡Solicitud enviada!</h2>
      <p className="text-gray-600 mb-6">
        Nuestro equipo revisará tu solicitud en 2-3 días hábiles.
        Te notificaremos por email y en la plataforma.
      </p>
      <Card className="p-6 text-left mb-6">
        <h3 className="font-semibold mb-4">¿Qué sigue?</h3>
        <div className="space-y-3">
          {[
            { n: 1, title: 'Verificación de credenciales', desc: '2-3 días hábiles' },
            { n: 2, title: 'Notificación por email', desc: 'Te avisamos del resultado' },
            { n: 3, title: 'Acceso como instructor', desc: 'Empieza a crear tus cursos' },
          ].map(step => (
            <div key={step.n} className="flex gap-3">
              <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-semibold text-xs">{step.n}</span>
              </div>
              <div>
                <p className="font-medium text-sm">{step.title}</p>
                <p className="text-xs text-gray-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
