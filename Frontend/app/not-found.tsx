import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h2 className="text-4xl font-bold">404</h2>
      <p className="text-gray-600 mb-4">Ups, parece que esta página no existe.</p>
      <Link href="/">
        <Button>Volver al Inicio</Button>
      </Link>
    </div>
  )
}