"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PaymentForm } from "./PaymentForm";
import { CourseSummaryCard } from "./CourseSummaryCard";
import { InstructorCard } from "./InstructorCard";
import { Button } from "../ui/button";
import { CourseResponse } from "@/lib/course-service";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CourseEnrollmentProps {
  courseId: string;
}

export function CourseEnrollmentPage({ courseId }: CourseEnrollmentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [legalConsent, setLegalConsent] = useState({
    conditionsReviewed: false,
    understandsNature: false,
    acceptsResponsibility: false,
  });

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        const response = await fetch(`${API_URL}/courses/${courseId}`, {
          credentials: "include",
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
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  const handlePaymentSubmit = async (paymentData: any) => {
    if (!course?.offers?.[0]) {
      toast.error("No hay oferta disponible para este curso");
      return;
    }

    try {
      setIsSubmitting(true);

      const firstOffer = course.offers[0];

      // 1. Create order
      const orderRes = await fetch(`${API_URL}/orders/`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: courseId,
          offer_id: firstOffer.id,
        }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.detail || "Error al crear la orden");
      }

      const order = await orderRes.json();

      // 2. If price > 0, simulate payment confirmation (until Stripe)
      if (firstOffer.price_base > 0) {
        const payRes = await fetch(`${API_URL}/orders/${order.id}/pay`, {
          method: "POST",
          credentials: "include",
        });
        if (!payRes.ok) throw new Error("Error al procesar el pago");
      }

      // 3. Redirect to course player
      toast.success("¡Inscripción completada! Comenzando el curso...");
      setTimeout(() => {
        router.push(`/course/${courseId}/learn`);
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || "Error al procesar la inscripción");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600 text-lg">Cargando datos de inscripción...</p>
        </div>
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">404</h1>
          <p className="text-gray-600 text-lg">Curso no encontrado</p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  // Derive values from API data
  const firstOffer = course.offers?.[0];
  const price = firstOffer?.price_base ?? null;
  const hasOffers = course.offers && course.offers.length > 0;
  const isFree = price === 0 || price === null;
  const allConsented = Object.values(legalConsent).every(Boolean);

  const summaryData = {
    title: course.title,
    instructor: { name: course.seller_id },
    modality: "Online",
    duration: `${course.modules?.length ?? 0} módulos`,
    price: price ?? 0,
    currency: "€",
    enrolledCount: 0,
  };

  const instructorData = {
    name: course.seller_id,
    title: course.category ?? "Instructor",
    location: "",
    description: course.short_description ?? "",
    additionalInfo: "",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            {isFree || !hasOffers ? (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isFree ? "Inscripción gratuita" : "Inscripción"}
                </h2>
                <p className="text-gray-600">
                  {isFree
                    ? "Este curso es completamente gratuito. ¡Inscríbete y comienza a aprender!"
                    : "Este curso no tiene ofertas de pago disponibles en este momento."}
                </p>
                {isFree && hasOffers ? (
                  <button
                    onClick={() => handlePaymentSubmit({})}
                    disabled={isSubmitting || !allConsented}
                    className="w-full py-3 bg-teal-500 hover:bg-teal-600 disabled:opacity-50
                      disabled:cursor-not-allowed text-white rounded-lg font-medium
                      transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Inscribirse gratis"
                    )}
                  </button>
                ) : !hasOffers ? (
                  <Button size="lg" className="px-8">
                    Contactar
                  </Button>
                ) : null}
                {isFree && !allConsented && (
                  <p className="text-sm text-amber-600">
                    Acepta las confirmaciones obligatorias para continuar
                  </p>
                )}

                {/* Legal consent for free courses */}
                {isFree && hasOffers && (
                  <div className="text-left space-y-3 mt-6 pt-6 border-t">
                    <h3 className="font-medium text-gray-900">Confirmación obligatoria</h3>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={legalConsent.conditionsReviewed}
                        onChange={() =>
                          setLegalConsent(p => ({ ...p, conditionsReviewed: !p.conditionsReviewed }))
                        }
                        className="mt-1"
                      />
                      <span className="text-sm text-gray-700">
                        Confirmo que he revisado las condiciones del programa.
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={legalConsent.understandsNature}
                        onChange={() =>
                          setLegalConsent(p => ({ ...p, understandsNature: !p.understandsNature }))
                        }
                        className="mt-1"
                      />
                      <span className="text-sm text-gray-700">
                        Entiendo que el curso tiene carácter formativo y no sustituye titulaciones oficiales.
                      </span>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={legalConsent.acceptsResponsibility}
                        onChange={() =>
                          setLegalConsent(p => ({
                            ...p,
                            acceptsResponsibility: !p.acceptsResponsibility,
                          }))
                        }
                        className="mt-1"
                      />
                      <span className="text-sm text-gray-700">
                        Acepto que la aplicación práctica de los contenidos es responsabilidad de mi
                        ejercicio profesional.
                      </span>
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <PaymentForm
                onSubmit={handlePaymentSubmit}
                price={price ?? 0}
                currency="€"
                isSubmitting={isSubmitting}
                legalConsent={legalConsent}
                onConsentChange={setLegalConsent}
              />
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-8 space-y-4">
              <CourseSummaryCard
                course={summaryData}
                disabled={!allConsented}
              />
              <InstructorCard instructor={instructorData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
