'use client';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AlertModalProps {
    open?: boolean;
    isOpen?: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title?: string;
    description?: string;
    message?: string;
    items?: string[];
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'info' | 'warning' | 'error' | 'success';
}

export function AlertModal({
    open,
    isOpen,
    onClose,
    onConfirm,
    title = '¿Estás seguro?',
    description,
    message,
    items,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
}: AlertModalProps) {
    const isModalOpen = open || isOpen || false;
    const modalDescription = description || message || 'Esta acción no se puede deshacer.';

    return (
        <AlertDialog open={isModalOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <div className="space-y-2">
                        <AlertDialogDescription>{modalDescription}</AlertDialogDescription>
                        {items && items.length > 0 && (
                            <ul className="list-disc list-inside text-sm text-red-600 space-y-1 mt-2">
                                {items.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        if (onConfirm) onConfirm();
                        onClose();
                    }}>{confirmLabel}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
