
import { useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { RadioGroup } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';

interface PlanSelectorProps {
  selectedPlan: string;
  onPlanChange: (plan: string) => void;
  onContinue: () => void;
  isProcessing: boolean;
  error: string | null;
  onRetry: () => void;
}

interface PlanDetail {
  id: string;
  name: string;
  price: string;
  billingCycle: string;
  description: string;
  recommended: boolean;
}

export const PlanSelector = ({ 
  selectedPlan, 
  onPlanChange, 
  onContinue, 
  isProcessing, 
  error,
  onRetry
}: PlanSelectorProps) => {
  const planDetails: PlanDetail[] = [
    {
      id: 'mensal',
      name: 'Plano Mensal',
      price: 'R$ 97,00',
      billingCycle: 'por mês',
      description: 'Pagamento mensal recorrente',
      recommended: false
    },
    {
      id: 'semestral',
      name: 'Plano Semestral',
      price: 'R$ 87,00',
      billingCycle: '6x de R$ 87,00 no cartão',
      description: 'Pagamento único de R$ 522,00',
      recommended: false
    },
    {
      id: 'anual',
      name: 'Plano Anual',
      price: 'R$ 67,00',
      billingCycle: '12x de R$ 67,00 no cartão',
      description: 'Pagamento único de R$ 804,00',
      recommended: true
    }
  ];

  return (
    <div className="space-y-4 mt-4">
      {error && (
        <div className="bg-red-50 border border-red-300 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-red-800">
                <strong>Erro no processamento:</strong> {error}
              </p>
              <p className="text-sm text-red-700 mt-1">
                Por favor, tente novamente ou entre em contato com o suporte.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 text-xs" 
                onClick={onRetry}
              >
                Tentar novamente
              </Button>
            </div>
          </div>
        </div>
      )}
    
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">Escolha seu plano</h3>
        <RadioGroup 
          value={selectedPlan}
          onValueChange={onPlanChange} 
          className="grid gap-4 grid-cols-1 md:grid-cols-3"
        >
          {planDetails.map(plan => (
            <div 
              key={plan.id} 
              className={`relative rounded-lg border p-4 cursor-pointer transition-all duration-200 
                ${selectedPlan === plan.id 
                  ? 'ring-2 ring-teal-500 bg-teal-50 border-teal-200' 
                  : 'hover:border-teal-300'}
                ${plan.recommended ? 'ring-2 ring-teal-500' : ''}`}
              onClick={() => onPlanChange(plan.id)}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal-500 text-white text-xs py-1 px-3 rounded-full">
                  Mais popular
                </div>
              )}
              <div className="mb-2">
                <h4 className="font-medium">{plan.name}</h4>
                <div className="mt-1">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 text-sm"> {plan.billingCycle}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      <div className="bg-teal-50 border border-teal-200 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-teal-800">
              <strong>Importante:</strong> O acesso ao sistema será liberado imediatamente após a confirmação do pagamento.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-green-50 border border-green-200 rounded-md p-3">
        <ShieldCheck className="h-5 w-5 text-green-500 mr-2" />
        <p className="text-sm text-green-800">
          Pagamento seguro processado pela Stripe
        </p>
      </div>
      
      <Button 
        onClick={onContinue} 
        className="w-full mt-6 bg-teal-600 hover:bg-teal-700" 
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Continuar para o Pagamento
          </>
        )}
      </Button>
    </div>
  );
};

export default PlanSelector;
