import Link from "next/link";
import { Button } from "../components/ui/button"; // Usando tus componentes de shadcn

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-extrabold text-purple-600">HUB CENTRAL</h1>
        <p className="text-gray-600 text-lg">La plataforma donde aprendes y creas.</p>
        
        <div className="flex gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
              Ir al Login
            </Button>
          </Link>
          
          <Link href="/explorar">
            <Button variant="outline" size="lg">
              Explorar Cursos
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}