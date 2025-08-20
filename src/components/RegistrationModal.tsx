import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, Loader2 } from 'lucide-react';
import { PaymentModal } from './PaymentModal';

interface RegistrationData {
  nome: string;
  telefone: string;
  email: string;
  cidade: string;
}

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationModal = ({ isOpen, onClose }: RegistrationModalProps) => {
  const [formData, setFormData] = useState<RegistrationData>({
    nome: '',
    telefone: '',
    email: '',
    cidade: ''
  });
  const [errors, setErrors] = useState<Partial<RegistrationData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'payment-choice' | 'success'>('form');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'entrada' | null>(null);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: Partial<RegistrationData> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(formData.telefone)) {
      newErrors.telefone = 'Formato: (11) 99999-9999';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Format phone number
    if (field === 'telefone') {
      const formatted = value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})/, '$1-$2')
        .substr(0, 15);
      setFormData(prev => ({ ...prev, telefone: formatted }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    // Simulate API call - here you would integrate with Supabase
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('payment-choice');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentChoice = (method: 'pix' | 'entrada') => {
    setPaymentMethod(method);
    
    if (method === 'pix') {
      setShowPaymentModal(true);
    } else {
      setStep('success');
    }
  };

  const handlePaymentComplete = () => {
    setShowPaymentModal(false);
    setStep('success');
  };

  const resetModal = () => {
    setFormData({ nome: '', telefone: '', email: '', cidade: '' });
    setErrors({});
    setStep('form');
    setPaymentMethod(null);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto slide-up shadow-card">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="font-poppins font-bold text-2xl text-card-foreground">
              {step === 'form' && 'Inscrição'}
              {step === 'payment-choice' && 'Pagamento'}
              {step === 'success' && 'Sucesso!'}
            </h2>
            <button
              onClick={resetModal}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form Step */}
          {step === 'form' && (
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  className={errors.nome ? 'border-destructive' : ''}
                />
                {errors.nome && (
                  <p className="text-destructive text-sm mt-1">{errors.nome}</p>
                )}
              </div>

              <div>
                <Label htmlFor="telefone">Telefone (WhatsApp)</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={errors.telefone ? 'border-destructive' : ''}
                />
                {errors.telefone && (
                  <p className="text-destructive text-sm mt-1">{errors.telefone}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  value={formData.cidade}
                  onChange={(e) => handleInputChange('cidade', e.target.value)}
                  className={errors.cidade ? 'border-destructive' : ''}
                />
                {errors.cidade && (
                  <p className="text-cidade text-sm mt-1">{errors.cidade}</p>
                )}
              </div>

              {/* Price Info */}
              <div className="bg-muted p-4 rounded-lg border border-border">
                <p className="font-inter text-sm text-muted-foreground">
                  <strong className="text-primary">Valor da inscrição: R$ 15</strong>
                </p>
                <p className="font-inter text-sm text-muted-foreground mt-1">
                  Ao concluir, você ganhará: 1 dog + 1 refrigerante na entrada, que poderá retirar diretamente lá.
                </p>
              </div>

              <Button
                type="submit"
                variant="festival"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  'Concluir Inscrição'
                )}
              </Button>
            </form>
          )}

          {/* Payment Choice Step */}
          {step === 'payment-choice' && (
            <div className="p-6 space-y-4">
              <p className="font-inter text-center text-muted-foreground mb-6">
                Como deseja pagar?
              </p>
              
              <div className="space-y-3">
                <Button
                  variant="festival"
                  size="lg"
                  className="w-full"
                  onClick={() => handlePaymentChoice('pix')}
                >
                  Pix agora
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => handlePaymentChoice('entrada')}
                >
                  Na entrada do evento
                </Button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="font-poppins font-bold text-xl mb-2">
                Inscrição concluída!
              </h3>
              <p className="font-inter text-muted-foreground mb-6">
                {paymentMethod === 'pix' 
                  ? 'No dia do evento basta dar seu nome.'
                  : 'Basta pagar na entrada e informar seu nome.'
                }
              </p>
              <p className="font-inter text-sm text-muted-foreground">
                Você receberá as informações do evento no WhatsApp e no e-mail.
              </p>
              
              <Button
                variant="festival"
                onClick={resetModal}
                className="w-full mt-6"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onComplete={handlePaymentComplete}
      />
    </>
  );
};