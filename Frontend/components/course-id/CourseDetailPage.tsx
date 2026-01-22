"use client"; // Asegúrate de incluir esto si usas Next.js App Router

import { useState, useEffect } from 'react';
import { 
  Clock, Monitor, GraduationCap, FileText, Users, Download, 
  MessageSquare, Video, ChevronDown, ChevronUp, Check, 
  BookOpen
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { useAuth } from '@/context/AuthContext';
import { LoginModal } from '@/components/auth/login-modal';
import { ProfessionalProfileForm } from './ProfessionalProfileForm';
import { ContentBlocker } from '../ContentBlocker';
import { ProfileCompletedModal } from './ProfileCompletedModal';

// Datos del curso de ejemplo
const courseData = {
  category: 'Neurología',
  subcategory: 'Avanzado · Actualización clínica',
  title: 'Abordaje Integral de Cefaleas y Migrañas: Del Diagnóstico al Tratamiento Personalizado',
  description: 'Programa avanzado para dominar el diagnóstico diferencial y manejo terapéutico de cefaleas primarias y secundarias, integrando evidencia científica actual y protocolos clínicos validados.',
  instructor: {
    name: 'Dra. Elena Martínez Sánchez',
    specialty: 'Neuróloga · Especialista en Cefaleas',
    country: 'España',
    bio: 'Neuróloga con más de 15 años de experiencia en unidades especializadas de cefaleas. Coordinadora de la Unidad de Cefaleas del Hospital Universitario La Paz. Investigadora en nuevos tratamientos para migraña crónica y autora de más de 40 publicaciones científicas en revistas internacionales.',
    experience: 'Docente en múltiples programas de formación continuada y postgrado en neurología.',
    education: 'Licenciada en Medicina por la Universidad Complutense de Madrid. Especialista en Neurología vía MIR. Máster en Cefaleas y Dolor Orofacial por la Universidad de Barcelona.',
    awards: 'Premio Nacional de Investigación en Cefaleas 2019. Reconocimiento a la Excelencia Docente por la Sociedad Española de Neurología 2021.',
    publications: 45,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop'
  },
  duration: '40 horas',
  estimatedTime: '8 semanas',
  modality: 'Online · Clases grabadas',
  price: 890,
  targetAudience: [
    'Médicos especialistas en Neurología',
    'Médicos de Atención Primaria',
    'Médicos residentes de Neurología (R3-R4)',
    'Profesionales sanitarios con experiencia en manejo del dolor'
  ],
  notFor: 'Este curso requiere formación médica previa. No está dirigido a estudiantes de medicina de grado.',
  learningOutcomes: [
    'Dominar el diagnóstico diferencial entre cefaleas primarias y secundarias mediante criterios ICHD-3',
    'Implementar protocolos de tratamiento agudo y preventivo basados en evidencia',
    'Integrar nuevos fármacos anti-CGRP en la práctica clínica habitual',
    'Identificar banderas rojas y criterios de derivación urgente',
    'Diseñar planes terapéuticos personalizados según perfil del paciente',
    'Manejar migraña crónica y cefalea por uso excesivo de analgésicos'
  ],
  includes: [
    { icon: Video, text: '32 clases grabadas en alta calidad' },
    { icon: FileText, text: 'Más de 200 páginas de material descargable' },
    { icon: Users, text: '12 casos clínicos interactivos resueltos' },
    { icon: Download, text: 'Algoritmos diagnósticos y protocolos actualizados' },
    { icon: MessageSquare, text: 'Foro privado con la profesora durante 3 meses' },
    { icon: BookOpen, text: 'Material bibliográfico y referencias científicas' }
  ],
  modules: [
    { number: 1, title: 'Clasificación y fisiopatología de cefaleas', hours: 6 },
    { number: 2, title: 'Diagnóstico clínico y exploratorio', hours: 5 },
    { number: 3, title: 'Migraña: actualización en tratamiento agudo', hours: 6 },
    { number: 4, title: 'Tratamientos preventivos: clásicos y nuevos anti-CGRP', hours: 7 },
    { number: 5, title: 'Cefalea tensional y otras cefaleas primarias', hours: 4 },
    { number: 6, title: 'Cefalea por uso excesivo de medicación', hours: 4 },
    { number: 7, title: 'Banderas rojas y cefaleas secundarias', hours: 5 },
    { number: 8, title: 'Casos clínicos complejos y situaciones especiales', hours: 3 }
  ],
  certification: {
    type: 'Certificado de Aprovechamiento',
    hours: '40 horas formativas',
    issuer: 'Emitido por MedFormaPro Academy',
    note: 'Este certificado acredita la realización del curso, pero no sustituye titulaciones oficiales ni habilita para ejercer competencias reguladas.'
  },
  faqs: [
    {
      question: '¿Necesito ser neurólogo para realizar este curso?',
      answer: 'No necesariamente. El curso está diseñado para neurólogos, pero también es muy útil para médicos de atención primaria con experiencia clínica que manejan habitualmente pacientes con cefaleas. Se requiere titulación en medicina.'
    },
    {
      question: '¿Cómo accedo al contenido?',
      answer: 'Una vez inscrito, recibirá un correo con sus credenciales de acceso a la plataforma. Podrá acceder desde cualquier dispositivo (ordenador, tablet, móvil) las 24 horas del día, los 7 días de la semana.'
    },
    {
      question: '¿Tiene validez oficial el certificado?',
      answer: 'El certificado acredita la realización del curso y puede incluirse en su currículum formativo. No es una acreditación oficial homologada por organismos reguladores, sino un certificado de aprovechamiento académico emitido por nuestra institución.'
    },
    {
      question: '¿Puedo fraccionar el pago?',
      answer: 'Actualmente ofrecemos opciones de pago fraccionado para cursos superiores a 500€. Contacte con nuestro equipo para conocer las condiciones específicas.'
    },
    {
      question: '¿El contenido es aplicable en mi país?',
      answer: 'El curso se basa en guías clínicas internacionales y evidencia científica universal. Los principios diagnósticos y terapéuticos son aplicables globalmente, aunque deberá adaptar prescripciones según la disponibilidad de fármacos en su región.'
    },
    {
      question: '¿Cuánto tiempo tengo para completar el curso?',
      answer: 'El acceso es ilimitado. Puede tomarse el tiempo que necesite y revisar el contenido cuantas veces quiera, sin fecha de caducidad.'
    }
  ],
  // Condiciones del programa
  programConditions: {
    content_access: {
      type: 'unlimited' as const
    },
    estimated_duration: '8 semanas',
    delivery_mode: 'recorded' as const,
    pace: 'flexible' as const,
    mentoring: 'forum' as const,
    mentoring_duration: '3 meses',
    live_sessions: false,
    certificate: true,
    certificate_condition: 'al completar el programa',
    materials: ['downloadable' as const, 'clinical_cases' as const, 'bibliography' as const],
    language: 'Español',
    level: 'Avanzado'
  }
};


export function CourseDetailPage({ params }: { params: { id: string } }) {
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const { user, isAuthenticated, isProfileCompleted, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<any>({
  title: "Abordaje Integral de Cefaleas",
  is_protected: true,
  requires_professional_profile: true
});
  
  // Estados para modales
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [isProfileCompletedModalOpen, setIsProfileCompletedModalOpen] = useState(false);
  
  const [loadingCourse, setLoadingCourse] = useState(true);

  // Fetch inicial del curso
  useEffect(() => {
    // Si el ID es el nombre de la carpeta [id] o undefined, no hagas la petición
  if (!params.id || params.id.includes("[id]")) {
    setLoadingCourse(false); // Deja de cargar para mostrar la maqueta
    return;
  }
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:8000/courses/${params.id}`);
        const data = await response.json();
        setCourse(data);
      } catch (error) {
        console.error("Error cargando curso:", error);
      } finally {
        setLoadingCourse(false);
      }
    };
    fetchCourse();
  }, [params.id]);

  // Lógica de protección
  
  const isProtected = course?.is_protected ?? true;
  const requiresProfile = course?.requires_professional_profile ?? true;

  const getBlockerConfig = () => {
    if (authLoading || !isProtected) return { show: false, type: null };
    if (!isAuthenticated) return { show: true, type: 'login' };
    if (requiresProfile && !isProfileCompleted) return { show: true, type: 'profile' };
    return { show: false, type: null };
  };
  const handleEnrollClick = () => {
  // 1. Si no está logueado, abrimos el login
  if (!isAuthenticated) {
    setIsLoginModalOpen(true);
    return;
  }}

  const { show: showBlocker, type: blockerType } = getBlockerConfig();

  const proceedWithEnrollment = () => {
    alert('Redirigiendo a pasarela de pago...');
  };

  if (loadingCourse) return <div className="p-20 text-center animate-pulse">Cargando curso...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO DEL CURSO */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{courseData.category}</Badge>
                <Badge variant="outline">{courseData.subcategory}</Badge>
              </div>
              <h1 className="text-3xl lg:text-4xl mb-4 text-slate-900 font-bold">{courseData.title}</h1>
              <p className="text-lg text-slate-600 mb-6 leading-relaxed">{courseData.description}</p>
              
              <div className="flex items-center gap-4 mb-6">
                <img src={courseData.instructor.image} alt={courseData.instructor.name} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                <div>
                  <div className="font-medium text-slate-900">{courseData.instructor.name}</div>
                  <div className="text-sm text-slate-600">{courseData.instructor.specialty}</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>{courseData.duration}</span></div>
                <div className="flex items-center gap-2"><Monitor className="w-4 h-4" /><span>{courseData.modality}</span></div>
                <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4" /><span>Nivel Avanzado</span></div>
              </div>
            </div>

           {/* COLUMNA DERECHA (INSCRIPCIÓN) */}
<div className="lg:col-span-1">
  {isAuthenticated && (
    <Card className="border shadow-lg lg:sticky lg:top-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <CardContent className="p-6">
        <h3 className="text-lg mb-4 font-semibold text-slate-900">Inscripción al programa</h3>
        
        <Button 
          className="w-full mb-4 py-6 text-lg bg-blue-600 hover:bg-blue-700 transition-all" 
          onClick={handleEnrollClick}
        >
          {requiresProfile && !isProfileCompleted ? "Completar perfil" : "Inscribirme"}
        </Button>

        <div className="space-y-3 text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" /> 
            <span>Acceso inmediato</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-600" /> 
            <span>Certificado incluido</span>
          </div>
        </div>

        <Separator className="my-4" />
        
        <div className="text-center">
          <p className="text-sm text-slate-500 italic">Inversión única</p>
          <div className="text-3xl font-black text-slate-900">{courseData.price}€</div>
        </div>
      </CardContent>
    </Card>
  )}
        </div>
          </div>
        </div>
      </section>

      {/* CUERPO DEL CURSO */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-12 relative min-h-[500px]">
            
            {showBlocker && (
              <ContentBlocker 
                type={blockerType as 'login' | 'profile'} 
                onAction={blockerType === 'login' ? () => setIsLoginModalOpen(true) : () => setIsProfileFormOpen(true)}
              />
            )}

            <div className={showBlocker ? "blur-md pointer-events-none select-none opacity-40 transition-all duration-700" : "transition-all duration-700"}>
              {/* Secciones de Audiencia, Aprendizaje y Programa (Igual que antes) */}
              <section id="audiencia">
                <h2 className="text-2xl font-bold mb-6 text-slate-900">Para quién es este curso</h2>
                <Card><CardContent className="p-6">
                  {courseData.targetAudience.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 mb-3">
                      <Check className="w-5 h-5 text-blue-600 shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </CardContent></Card>
              </section>
              {/* ... Resto de secciones ... */}
            </div>
          </div>
        </div>
      </div>

      {/* CTA MÓVIL CONDICIONAL */}
{isAuthenticated && (
  <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-full">
    <div className="font-bold text-xl text-slate-900">{courseData.price}€</div>
    <Button onClick={handleEnrollClick} className="bg-blue-600">
      {requiresProfile && !isProfileCompleted ? "Completar Perfil" : "Inscribirme"}
    </Button>
  </div>
)}

      {/* MODALES */}
      {isLoginModalOpen && (
        <LoginModal 
          open={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
        />
      )}
      
      {isProfileFormOpen && (
        <ProfessionalProfileForm 
          onClose={() => setIsProfileFormOpen(false)} 
          onComplete={() => {
            setIsProfileFormOpen(false);
            setIsProfileCompletedModalOpen(true);
          }} 
        />
      )}

      {isProfileCompletedModalOpen && (
        <ProfileCompletedModal 
          onClose={() => setIsProfileCompletedModalOpen(false)} 
          onEnroll={proceedWithEnrollment}
        />
      )}
    </div>
  );
}