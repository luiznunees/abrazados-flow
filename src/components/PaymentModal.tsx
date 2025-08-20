import { useState } from 'react';
import { Button } from './ui/button';
import { X, Copy, Check } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const PaymentModal = ({ isOpen, onClose, onComplete }: PaymentModalProps) => {
  const [copied, setCopied] = useState(false);
  
  // Example Pix data - replace with real data in production
  const pixCode = "00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540515.005802BR5925Abrazados SAP Eventos LTDA6009Sao Paulo61080540900062070503***630445D8";

  if (!isOpen) return null;

  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePaymentComplete = () => {
    // Simulate payment verification
    setTimeout(() => {
      onComplete();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-sm w-full slide-up shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-poppins font-bold text-xl text-card-foreground">
            Pagamento via Pix
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 text-center space-y-6">
          {/* QR Code Placeholder */}
          <div className="bg-white p-4 rounded-lg mx-auto w-48 h-48 flex items-center justify-center">
            <div className="w-40 h-40 bg-black/10 rounded-lg flex items-center justify-center text-xs text-gray-600">
              QR Code
              <br />
              (Exemplo)
            </div>
          </div>

          {/* Amount */}
          <div className="text-center">
            <p className="font-inter text-sm text-muted-foreground">Valor</p>
            <p className="font-poppins font-bold text-2xl text-primary">R$ 15,00</p>
          </div>

          {/* Pix Copy & Paste */}
          <div className="space-y-2">
            <p className="font-inter text-sm text-muted-foreground">
              Ou copie o código Pix:
            </p>
            <div className="bg-muted p-3 rounded-lg break-all text-xs font-mono">
              {pixCode.substring(0, 50)}...
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyPix}
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar código Pix
                </>
              )}
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>1. Abra o app do seu banco</p>
            <p>2. Escaneie o QR Code ou cole o código</p>
            <p>3. Confirme o pagamento de R$ 15,00</p>
          </div>

          {/* Complete Button */}
          <Button
            variant="festival"
            onClick={handlePaymentComplete}
            className="w-full"
          >
            Já paguei
          </Button>

          <p className="text-xs text-muted-foreground">
            Após o pagamento, sua inscrição será confirmada automaticamente.
          </p>
        </div>
      </div>
    </div>
  );
};