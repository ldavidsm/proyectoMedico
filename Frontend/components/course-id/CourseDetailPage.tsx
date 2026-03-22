"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Clock, GraduationCap, ChevronDown, ChevronUp, Check,
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
import { CourseResponse } from '@/lib/course-service';
import { ReviewsSection } from '@/components/reviews/ReviewsSection';
import { RelatedCourses } from './RelatedCourses';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function CourseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [expandedModule, setExpandedModule] = useState<number | null>(null);
  const { isAuthenticated, isProfileCompleted, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Estados para modales
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [isProfileCompletedModalOpen, setIsProfileCompletedModalOpen] = useState(false);

  const [loadingCourse, setLoadingCourse] = useState(true);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [courseProgress, setCourseProgress] = useState<number>(0);

  // Fetch inicial del curso
  useEffect(() => {
    if (!params.id) {
      setLoadingCourse(false);
      return;
    }
    const fetchCourse = async () => {
      try {
        const response = await fetch(`${API_URL}/courses/${params.id}`, {
          credentials: 'include',
        });
        if (response.status === 404) {
          setNotFound(true);
          return;
        }
        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }
        const data: CourseResponse = await response.json();
        setCourse(data);
      } catch (error) {
        console.error("Error cargando curso:", error);
        setNotFound(true);
      } finally {
        setLoadingCourse(false);
      }
    };
    fetchCourse();
  }, [params.id]);

  // Check if user has purchased this course (for review eligibility)
  useEffect(() => {
    if (!isAuthenticated || !params.id) return;
    fetch(`${API_URL}/orders/my-orders`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then((orders: any[]) => {
        const purchased = orders.some(
          (o: any) => o.course_id === params.id && o.status === 'paid'
        );
        setHasPurchased(purchased);
      })
      .catch(() => {});
  }, [params.id, isAuthenticated]);

  // Fetch course progress if purchased
  useEffect(() => {
    if (!isAuthenticated || !hasPurchased || !params.id) return;
    fetch(`${API_URL}/courses/${params.id}/progress/`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) setCourseProgress(data.percentage);
      })
      .catch(() => {});
  }, [params.id, isAuthenticated, hasPurchased]);

  // Lógica de protección
  const isProtected = true;
  const requiresProfile = true;

  const getBlockerConfig = () => {
    if (authLoading || !isProtected) return { show: false, type: null };
    if (!isAuthenticated) return { show: true, type: 'login' };
    if (requiresProfile && !isProfileCompleted) return { show: true, type: 'profile' };
    return { show: false, type: null };
  };

  const handleEnrollClick = () => {
    if (!isAuthenticated) {
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      setIsLoginModalOpen(true);
      return;
    }
    if (requiresProfile && !isProfileCompleted) {
      setIsProfileFormOpen(true);
      return;
    }
    router.push(`/course/${params.id}/enroll`);
  };

  const { show: showBlocker, type: blockerType } = getBlockerConfig();

  const proceedWithEnrollment = () => {
    alert('Redirigiendo a pasarela de pago...');
  };

  // Loading state
  if (loadingCourse) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 text-lg">Cargando curso...</p>
        </div>
      </div>
    );
  }

  // 404 state
  if (notFound || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-slate-900">404</h1>
          <p className="text-slate-600 text-lg">Curso no encontrado</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  // Derive display values from API data
  const firstOffer = course.offers?.[0];
  const price = firstOffer?.price_base;
  const totalModules = course.modules?.length ?? 0;
  const totalBlocks = course.modules?.reduce((acc, m) => acc + (m.blocks?.length ?? 0), 0) ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HERO DEL CURSO */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap gap-2 mb-4">
                {course.category && <Badge variant="secondary">{course.category}</Badge>}
                {course.level && <Badge variant="outline">{course.level}</Badge>}
              </div>
              <h1 className="text-3xl lg:text-4xl mb-4 text-slate-900 font-bold">{course.title}</h1>
              {course.subtitle && (
                <p className="text-xl text-slate-700 mb-3 font-medium">{course.subtitle}</p>
              )}
              {course.short_description && (
                <p className="text-lg text-slate-600 mb-6 leading-relaxed">{course.short_description}</p>
              )}

              {course.banner_url && (
                <img
                  src={course.banner_url}
                  alt={course.title}
                  className="w-full rounded-lg mb-6 object-cover max-h-80"
                />
              )}

              <div className="flex flex-wrap gap-6 text-sm text-slate-600">
                {totalModules > 0 && (
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    <span>{totalModules} módulos</span>
                  </div>
                )}
                {totalBlocks > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{totalBlocks} lecciones</span>
                  </div>
                )}
                {course.level && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Nivel {course.level}</span>
                  </div>
                )}
              </div>
            </div>

            {/* COLUMNA DERECHA (INSCRIPCIÓN) */}
            <div className="lg:col-span-1">
              {isAuthenticated && (
                <Card className="border shadow-lg lg:sticky lg:top-8 animate-in fade-in slide-in-from-right-4 duration-500">
                  <CardContent className="p-6">
                    {hasPurchased ? (
                      <>
                        <div className="flex items-center gap-2 mb-4">
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-700">Ya inscrito</span>
                        </div>

                        {/* Progress indicator */}
                        {courseProgress > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-slate-600">Progreso</span>
                              <span className="font-medium text-slate-900">{courseProgress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-teal-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${courseProgress}%` }}
                              />
                            </div>
                          </div>
                        )}

                        <Button
                          className="w-full mb-4 py-6 text-lg bg-green-600 hover:bg-green-700 transition-all"
                          onClick={() => router.push(`/course/${params.id}/learn`)}
                        >
                          {courseProgress === 100 ? "Repasar curso" : "Continuar aprendiendo"}
                        </Button>

                        {/* Certificate section */}
                        {courseProgress === 100 && (
                          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-lg p-4 text-center">
                            <div className="text-2xl mb-2">🎓</div>
                            <h4 className="font-semibold text-teal-800 mb-1">¡Curso completado!</h4>
                            <p className="text-sm text-teal-700 mb-3">
                              Felicidades, has completado todas las lecciones de este curso.
                            </p>
                            <Button
                              variant="outline"
                              className="w-full border-teal-300 text-teal-700 hover:bg-teal-100"
                              onClick={() => alert("La generación de certificados estará disponible próximamente.")}
                            >
                              Descargar certificado
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg mb-4 font-semibold text-slate-900">Inscripción al programa</h3>
                        <Button
                          className="w-full mb-4 py-6 text-lg bg-blue-600 hover:bg-blue-700 transition-all"
                          onClick={handleEnrollClick}
                        >
                          {requiresProfile && !isProfileCompleted ? "Completar perfil" : "Inscribirme"}
                        </Button>
                      </>
                    )}

                    {!hasPurchased && (
                      <div className="space-y-3 text-sm text-slate-700">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span>Acceso inmediato</span>
                        </div>
                        {firstOffer?.certificate_included && (
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>Certificado incluido</span>
                          </div>
                        )}
                      </div>
                    )}

                    {!hasPurchased && price != null && (
                      <>
                        <Separator className="my-4" />
                        <div className="text-center">
                          <p className="text-sm text-slate-500 italic">Inversión única</p>
                          <div className="text-3xl font-black text-slate-900">{price}€</div>
                        </div>
                      </>
                    )}
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
                onAction={blockerType === 'login' ? () => {
                  sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                  setIsLoginModalOpen(true);
                } : () => setIsProfileFormOpen(true)}
              />
            )}

            <div className={showBlocker ? "blur-md pointer-events-none select-none opacity-40 transition-all duration-700" : "transition-all duration-700"}>

              {/* Descripción detallada */}
              {course.long_description && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 text-slate-900">Descripción del curso</h2>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-slate-700 whitespace-pre-line leading-relaxed">{course.long_description}</p>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Público objetivo */}
              {course.target_audience && course.target_audience.length > 0 && (
                <section id="audiencia">
                  <h2 className="text-2xl font-bold mb-6 text-slate-900">Para quién es este curso</h2>
                  <Card>
                    <CardContent className="p-6">
                      {course.target_audience.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 mb-3">
                          <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <span className="text-slate-700">{item}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Requisitos */}
              {course.requirements && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 text-slate-900">Requisitos</h2>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-slate-700">{course.requirements}</p>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Qué aprenderás */}
              {course.learning_goals && course.learning_goals.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 text-slate-900">Qué aprenderás</h2>
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        {course.learning_goals.map((goal, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <span className="text-slate-700">{goal}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Programa (Módulos) */}
              {course.modules && course.modules.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 text-slate-900">Programa del curso</h2>
                  <div className="space-y-3">
                    {course.modules
                      .sort((a, b) => a.order - b.order)
                      .map((mod, i) => (
                        <Card key={mod.id || i}>
                          <CardContent className="p-0">
                            <button
                              className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                              onClick={() => setExpandedModule(expandedModule === i ? null : i)}
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-blue-600 bg-blue-50 w-8 h-8 rounded-full flex items-center justify-center">
                                  {i + 1}
                                </span>
                                <span className="font-medium text-slate-900">{mod.title}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                {mod.blocks && (
                                  <span className="text-sm text-slate-500">{mod.blocks.length} lecciones</span>
                                )}
                                {expandedModule === i ? (
                                  <ChevronUp className="w-5 h-5 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-slate-400" />
                                )}
                              </div>
                            </button>
                            {expandedModule === i && (
                              <div className="px-4 pb-4 border-t">
                                {mod.description && (
                                  <p className="text-sm text-slate-600 mt-3 mb-3">{mod.description}</p>
                                )}
                                {mod.blocks && mod.blocks.length > 0 && (
                                  <ul className="space-y-2 mt-2">
                                    {mod.blocks
                                      .sort((a, b) => a.order - b.order)
                                      .map((block, j) => (
                                        <li key={block.id || j} className="flex items-center gap-3 text-sm text-slate-700">
                                          <span className="w-2 h-2 bg-blue-400 rounded-full shrink-0" />
                                          <span>{block.title}</span>
                                          {block.duration && (
                                            <span className="text-slate-400 ml-auto">{block.duration}</span>
                                          )}
                                        </li>
                                      ))}
                                  </ul>
                                )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </section>
              )}

              {/* Bibliografía */}
              {course.bibliography && course.bibliography.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold mb-6 text-slate-900">Bibliografía</h2>
                  <Card>
                    <CardContent className="p-6">
                      <ul className="space-y-3">
                        {course.bibliography.map((bib, i) => (
                          <li key={bib.id || i} className="flex items-start gap-3 text-slate-700">
                            <BookOpen className="w-4 h-4 shrink-0 mt-1 text-slate-400" />
                            <div>
                              <span>{bib.reference_text}</span>
                              {bib.doi_url && (
                                <a
                                  href={bib.doi_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 text-blue-600 hover:underline text-sm"
                                >
                                  DOI
                                </a>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </section>
              )}
            </div>

            {/* Reviews section — outside blur blocker */}
            <ReviewsSection
              courseId={params.id}
              ratingAvg={course.rating_avg ?? 0}
              ratingCount={course.rating_count ?? 0}
              hasPurchased={hasPurchased}
            />
          </div>
        </div>
      </div>

      {/* Related Courses */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <RelatedCourses courseId={params.id} category={course.category} />
      </div>

      {/* CTA MÓVIL CONDICIONAL */}
      {isAuthenticated && !hasPurchased && price != null && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50 flex items-center justify-between shadow-2xl animate-in slide-in-from-bottom-full">
          <div className="font-bold text-xl text-slate-900">{price}€</div>
          <Button onClick={handleEnrollClick} className="bg-blue-600">
            {requiresProfile && !isProfileCompleted ? "Completar Perfil" : "Inscribirme"}
          </Button>
        </div>
      )}
      {isAuthenticated && hasPurchased && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50 flex justify-center shadow-2xl animate-in slide-in-from-bottom-full">
          <Button
            onClick={() => router.push(`/course/${params.id}/learn`)}
            className="bg-green-600 hover:bg-green-700 w-full"
          >
            Continuar aprendiendo
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
