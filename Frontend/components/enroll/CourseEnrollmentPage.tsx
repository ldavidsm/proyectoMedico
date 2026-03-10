"use client";
import { useState, useEffect } from "react";
import { PaymentForm } from "./PaymentForm";
import { CourseSummaryCard } from "./CourseSummaryCard";
import { InstructorCard } from "./InstructorCard";

interface CourseEnrollmentProps {
  courseId: string;
}

export function CourseEnrollmentPage({ courseId }: CourseEnrollmentProps) {
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [legalConsent, setLegalConsent] = useState({
    conditionsReviewed: false,
    understandsNature: false,
    acceptsResponsibility: false,
  });

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        // Intentamos traer datos reales del backend
        const response = await fetch(`http://localhost:8000/courses/${courseId}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
        } else {
          throw new Error("Curso no encontrado");
        }
      } catch (error) {
        console.log("Usando datos de prueba (Mock Data)");
        // Si falla (porque el curso no existe en DB), usamos tus datos de ejemplo
        setCourse({
          title: "Intervención en Crisis y Trauma Complejo",
          price: 890,
          currency: "€",
          modality: "Online asincrónico",
          duration: "120 horas",
          instructor: {
            name: "Dra. Elena Martínez Sánchez",
            title: "Neuróloga",
            location: "España",
            description: "Experta en neurología..."
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [courseId]);

  if (loading) return <div className="p-20 text-center">Cargando datos de facturación...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <PaymentForm
              onSubmit={(data) => console.log("Pago:", data)}
              price={course?.price}
              currency={course?.currency}
              legalConsent={legalConsent}
              onConsentChange={setLegalConsent}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-8 space-y-4">
              <CourseSummaryCard
                course={course}
                disabled={!Object.values(legalConsent).every(Boolean)}
              />
              <InstructorCard instructor={course?.instructor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}