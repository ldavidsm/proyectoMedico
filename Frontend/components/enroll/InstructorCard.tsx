import { Card } from "../ui/card";

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
    <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg mb-4">Instructor</h3>
        
        <div className="flex gap-4 mb-4">
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
            <img
              src={instructor.imageUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop"}
              alt={instructor.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-base font-medium text-gray-900 mb-1">{instructor.name}</p>
            <p className="text-sm text-gray-600 mb-1">{instructor.title}</p>
            <p className="text-sm text-gray-500">{instructor.location}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>{instructor.description}</p>
          <p>{instructor.additionalInfo}</p>
        </div>
      </div>
    </Card>
  );
}
