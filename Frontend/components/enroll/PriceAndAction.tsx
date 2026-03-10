import { Card } from "../ui/card";
import { Button } from "../ui/button";

interface PriceAndActionProps {
  price: number;
  currency: string;
  onConfirm: () => void;
  disabled: boolean;
}

export function PriceAndAction({
  price,
  currency,
  onConfirm,
  disabled,
}: PriceAndActionProps) {
  return (
    <Card className="p-6 bg-white border border-gray-200 shadow-sm">
      <div className="flex flex-col gap-6">
        {/* Precio */}
        <div>
          <p className="text-sm text-gray-600 mb-2">Total del programa</p>
          <p className="text-4xl text-gray-900 mb-1">
            {price.toLocaleString("es-ES")} {currency}
          </p>
          <p className="text-xs text-gray-500">IVA incluido</p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Mensaje de advertencia si falta confirmación */}
        {disabled && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 leading-relaxed">
              Debe aceptar todas las confirmaciones obligatorias para continuar
            </p>
          </div>
        )}

        {/* Botón */}
        <Button
          onClick={onConfirm}
          disabled={disabled}
          size="lg"
          className="w-full"
        >
          Proceder al pago
        </Button>

        {/* Microcopy tranquilizador */}
        <div className="text-xs text-gray-500 leading-relaxed">
          <p>
            El pago se realizará de forma segura a través de nuestro proveedor
            de pagos. En el siguiente paso podrá elegir el método de pago
            disponible.
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200"></div>

        {/* Info adicional */}
        <div className="text-xs text-gray-500 space-y-2">
          <p>Sin compromisos. Cancela en cualquier momento.</p>
        </div>
      </div>
    </Card>
  );
}
