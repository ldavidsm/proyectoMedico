"use client";
import { useState, useEffect } from "react";
import { PaymentForm } from "./PaymentForm";
import { CourseSummaryCard } from "./CourseSummaryCard";
import { InstructorCard } from "./InstructorCard";
import { Button } from "../ui/button";
import { CourseResponse } from "@/lib/course-service";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CourseEnrollmentProps {
  courseId: string;
}

export function CourseEnrollmentPage({ courseId }: CourseEnrollmentProps) {
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
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
            {hasOffers ? (
              <PaymentForm
                onSubmit={(data) => console.log("Pago:", data)}
                price={price ?? 0}
                currency="€"
                legalConsent={legalConsent}
                onConsentChange={setLegalConsent}
              />
            ) : (
              <div className="bg-white border border-gray-200 rounded-lg p-8 text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Inscripción</h2>
                <p className="text-gray-600">
                  Este curso no tiene ofertas de pago disponibles en este momento.
                </p>
                <Button size="lg" className="px-8">
                  Contactar
                </Button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-8 space-y-4">
              <CourseSummaryCard
                course={summaryData}
                disabled={!Object.values(legalConsent).every(Boolean)}
              />
              <InstructorCard instructor={instructorData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
