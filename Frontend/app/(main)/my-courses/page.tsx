import { MyLearning } from '@/components/profile/MyLearning';

export default function MyCoursesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto py-10 px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">
            Mi aprendizaje
          </h1>
          <p className="text-slate-500">
            Todos tus cursos y recursos en un solo lugar
          </p>
        </div>
        <MyLearning />
      </div>
    </div>
  );
}
