interface InstructorCardProps {
  instructor: {
    name: string;
    title: string;
    location: string;
    description: string;
    additionalInfo: string;
    imageUrl?: string;
  };
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
      <h3 className="font-bold text-slate-900 mb-4">Instructor</h3>

      <div className="flex gap-4 mb-4">
        <div className="w-16 h-16 bg-slate-100 rounded-xl flex-shrink-0 overflow-hidden">
          <img
            src={instructor.imageUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop"}
            alt={instructor.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-slate-900 mb-0.5">{instructor.name}</p>
          <p className="text-sm text-slate-500 mb-0.5">{instructor.title}</p>
          {instructor.location && (
            <p className="text-sm text-slate-400">{instructor.location}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
        {instructor.description && <p>{instructor.description}</p>}
        {instructor.additionalInfo && <p>{instructor.additionalInfo}</p>}
      </div>
    </div>
  );
}
