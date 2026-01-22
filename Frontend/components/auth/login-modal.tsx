import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Login } from "./auth-login";

interface LoginModalProps {
  children?: React.ReactNode; // Opcional, por si quieres usarlo como botón
  open?: boolean;             // Para controlarlo desde fuera
  onClose?: (open: boolean) => void; // Para avisar fuera cuando se cierra
}

export function LoginModal({ children, open, onClose }: LoginModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      {children && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-none bg-white">
        <Login onSuccess={() => onClose?.(false)} />
      </DialogContent>
    </Dialog>
  );
}