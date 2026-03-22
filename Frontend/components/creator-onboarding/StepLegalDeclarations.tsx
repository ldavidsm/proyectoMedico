'use client';
import { useState } from 'react';
import { LEGAL_DOCUMENTS, PLATFORM_METADATA } from '@/lib/creator-onboarding-data';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  accepted: boolean;
  onChange: (accepted: boolean) => void;
}

export function StepLegalDeclarations({ accepted, onChange }: Props) {
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-semibold mb-1">
          Declaraciones legales
        </h3>
        <p className="text-gray-500 text-sm">
          Lee y acepta los siguientes documentos para completar tu solicitud.
        </p>
      </div>

      {/* Info comisión */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
        <p className="text-sm text-teal-800 font-medium mb-1">
          Modelo de comisiones
        </p>
        <p className="text-sm text-teal-700">
          Tú recibes el <strong>{PLATFORM_METADATA.creatorRate * 100}%</strong> de
          cada venta. HealthLearn retiene el{' '}
          <strong>{PLATFORM_METADATA.commissionRate * 100}%</strong>. Pagos
          mensuales a partir de {PLATFORM_METADATA.minimumPayout}
          {PLATFORM_METADATA.payoutCurrency}.
        </p>
      </div>

      {/* Documentos */}
      <div className="space-y-3">
        {LEGAL_DOCUMENTS.map(doc => (
          <div key={doc.id} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900 text-sm">{doc.title}</p>
                <p className="text-xs text-gray-400">Versión {doc.version}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="text-purple-600 hover:text-purple-700"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                {expandedDoc === doc.id
                  ? <ChevronUp className="w-4 h-4 text-gray-400" />
                  : <ChevronDown className="w-4 h-4 text-gray-400" />
                }
              </div>
            </button>

            {expandedDoc === doc.id && (
              <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                <ul className="mt-3 space-y-2">
                  {doc.summaryPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="text-purple-500 flex-shrink-0 mt-0.5">&#8226;</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Checkbox de aceptación global */}
      <button
        type="button"
        onClick={() => onChange(!accepted)}
        className={`w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
          accepted
            ? 'border-purple-600 bg-purple-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className={`w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center ${
          accepted
            ? 'border-purple-600 bg-purple-600'
            : 'border-gray-300'
        }`}>
          {accepted && <span className="text-white text-xs">✓</span>}
        </div>
        <p className="text-sm text-gray-700">
          He leído y acepto los Términos y Condiciones, la Política
          de Calidad, la Política de Privacidad y el Código de
          Conducta Profesional de HealthLearn.
        </p>
      </button>
    </div>
  );
}
