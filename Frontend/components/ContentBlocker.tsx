"use client";

import { LogIn, User, ShieldCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface ContentBlockerProps {
  type: 'login' | 'profile';
  onAction: () => void;
}

export function ContentBlocker({ type, onAction }: ContentBlockerProps) {
  const isLogin = type === 'login';

  return (
    <div className="absolute inset-0 z-[40] flex items-start justify-center pt-24 px-4 pb-20 bg-gradient-to-b from-white/10 via-white/90 to-white backdrop-blur-[4px] pointer-events-auto">
      <Card className="max-w-md w-full border-2 shadow-2xl animate-in fade-in zoom-in duration-300 sticky top-40 z-[50]">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-6">
            {isLogin ? (
              <LogIn className="w-10 h-10 text-purple-600" />
            ) : (
              <User className="w-10 h-10 text-purple-600" />
            )}
          </div>

          <h3 className="text-2xl font-bold mb-3 text-slate-900 leading-tight">
            {isLogin ? "Inicie sesión para continuar" : "Complete su perfil profesional"}
          </h3>

          <p className="text-slate-600 mb-8 leading-relaxed">
            {isLogin
              ? "Acceda a su cuenta para explorar el programa completo del curso, bibliografía y casos clínicos disponibles."
              : "Para ver el contenido completo, es necesario verificar su condición de profesional sanitario."}
          </p>

          {!isLogin && (
            <>
              <div className="flex items-start gap-3 bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6 text-left">
                <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-sm text-purple-800">
                  <p className="font-semibold mb-1">¿Por qué se requiere el perfil?</p>
                  <p className="leading-snug">
                    Este curso contiene contenido clínico avanzado dirigido exclusivamente a profesionales sanitarios verificados.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                <span>Solo toma ~2 minutos completarlo</span>
              </div>
            </>
          )}

          <Button 
            onClick={(e) => {
              e.preventDefault();
              onAction();
            }} 
            size="lg" 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-200 relative z-[60]"
          >
            {isLogin ? (
              <><LogIn className="w-5 h-5 mr-2" /> Acceder a la plataforma</>
            ) : (
              <><User className="w-5 h-5 mr-2" /> Completar mi perfil</>
            )}
          </Button>

          {isLogin && (
            <p className="mt-6 text-sm text-slate-500">
              ¿No tiene una cuenta? <span className="text-purple-600 font-medium cursor-pointer hover:underline">Regístrese gratis</span>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}