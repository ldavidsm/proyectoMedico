'use client';

import { useState, useEffect } from 'react';
import { Star, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { ReviewForm } from './ReviewForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Review {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_name: string | null;
}

interface ReviewsSectionProps {
  courseId: string;
  ratingAvg: number;
  ratingCount: number;
  hasPurchased: boolean;
}

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${cls} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewsSection({ courseId, ratingAvg, ratingCount, hasPurchased }: ReviewsSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localRatingAvg, setLocalRatingAvg] = useState(ratingAvg);
  const [localRatingCount, setLocalRatingCount] = useState(ratingCount);

  useEffect(() => {
    // Fetch all reviews
    fetch(`${API_URL}/courses/${courseId}/reviews/`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then(setReviews)
      .catch(() => {});

    // Check if current user already reviewed
    if (isAuthenticated) {
      fetch(`${API_URL}/courses/${courseId}/reviews/me`, { credentials: 'include' })
        .then(r => r.ok ? r.json() : null)
        .then(setMyReview)
        .catch(() => {});
    }
  }, [courseId, isAuthenticated]);

  const handleReviewSuccess = (review: Review) => {
    if (isEditing) {
      // Update existing review in list
      setReviews(prev => prev.map(r => r.id === review.id ? review : r));
    } else {
      // Add new review to list
      setReviews(prev => [review, ...prev]);
      setLocalRatingCount(prev => prev + 1);
    }
    setMyReview(review);
    setShowForm(false);
    setIsEditing(false);

    // Recalculate local average
    const allRatings = isEditing
      ? reviews.map(r => r.id === review.id ? review.rating : r.rating)
      : [...reviews.map(r => r.rating), review.rating];
    if (allRatings.length > 0) {
      setLocalRatingAvg(allRatings.reduce((a, b) => a + b, 0) / allRatings.length);
    }
  };

  const canReview = isAuthenticated && hasPurchased && !myReview;

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6 text-slate-900">Valoraciones</h2>

      {/* Overall rating summary */}
      <Card className="mb-6">
        <CardContent className="p-6">
          {localRatingCount > 0 ? (
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900">{localRatingAvg.toFixed(1)}</div>
                <StarRating rating={Math.round(localRatingAvg)} size="lg" />
                <p className="text-sm text-slate-500 mt-1">{localRatingCount} valoraciones</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-500">Este curso aún no tiene valoraciones</p>
          )}
        </CardContent>
      </Card>

      {/* Review form for buyers */}
      {canReview && !showForm && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-sm text-slate-700 mb-3">Has completado este curso. Comparte tu experiencia.</p>
            <Button onClick={() => setShowForm(true)} className="bg-purple-600 hover:bg-purple-700">
              Escribir reseña
            </Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <ReviewForm
              courseId={courseId}
              existingReview={isEditing && myReview ? { rating: myReview.rating, comment: myReview.comment } : undefined}
              onSuccess={handleReviewSuccess}
              onCancel={() => { setShowForm(false); setIsEditing(false); }}
            />
          </CardContent>
        </Card>
      )}

      {/* My review (if exists) */}
      {myReview && !showForm && (
        <Card className="mb-4 border-purple-200 bg-purple-50/30">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm font-medium text-slate-900">Tu reseña</p>
                <StarRating rating={myReview.rating} />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setIsEditing(true); setShowForm(true); }}
                className="text-purple-600 hover:text-purple-700"
              >
                <Pencil className="w-3.5 h-3.5 mr-1" />
                Editar
              </Button>
            </div>
            {myReview.comment && (
              <p className="text-sm text-slate-700 mt-2">{myReview.comment}</p>
            )}
            <p className="text-xs text-slate-400 mt-2">
              {new Date(myReview.created_at).toLocaleDateString('es-ES')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* All reviews list */}
      {reviews.filter(r => r.user_id !== user?.id).length > 0 && (
        <div className="space-y-3">
          {reviews
            .filter(r => r.user_id !== user?.id)
            .map((review) => (
              <Card key={review.id}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-600">
                      {(review.user_name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {review.user_name || 'Usuario'}
                      </p>
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-slate-700 mt-2">{review.comment}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(review.created_at).toLocaleDateString('es-ES')}
                  </p>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {reviews.length === 0 && !canReview && (
        <p className="text-sm text-slate-500">No hay reseñas todavía.</p>
      )}
    </section>
  );
}
