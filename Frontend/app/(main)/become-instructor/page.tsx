import type { Metadata } from 'next';
import { BecomeCreatorSection } from '@/components/dashboard/BecomeCreatorSection';

export const metadata: Metadata = {
  title: 'Hazte instructor',
  description: 'Comparte tu conocimiento médico con profesionales de la salud de todo el mundo.',
};

export default function BecomeInstructorPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <BecomeCreatorSection />
        </div>
    );
}
