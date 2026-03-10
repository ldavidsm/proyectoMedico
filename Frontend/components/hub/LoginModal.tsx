import { X } from 'lucide-react';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export function LoginModal({ open, onClose, children }: LoginModalProps) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6">
        {/* Header */}
        <div className="flex items-center justify-end mb-2">
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        {children}
      </div>
    </>
  );
}
