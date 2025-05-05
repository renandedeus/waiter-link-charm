import { useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PlanSelectorProps {
  selectedPlan: string;
  selectedInstallments: number;
  onPlanChange: (plan: string) => void;
  onInstallmentsChange: (installments: number) => void;
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
  maxInstallments: number;
}

export const PlanSelector = ({ 
  selectedPlan, 
  selectedInstallments,
  onPlanChange, 
  onInstallmentsChange,
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
      recommended: false,
      maxInstallments: 1
    },
    {
      id: 'semestral',
      name: 'Plano Semestral',
      price: 'R$ 87,00',
      billingCycle: '6x de R$ 87,00 no cartão',
      description: 'Pagamento único de R$ 522,00',
      recommended: false,
      maxInstallments: 6
    },
    {
      id: 'anual',
      name: 'Plano Anual',
      price: 'R$ 67,00',
      billingCycle: '12x de R$ 67,00 no cartão',
      description: 'Pagamento único de R$ 804,00',
      recommended: true,
      maxInstallments: 12
    }
  ];

  const currentPlan = planDetails.find(plan => plan.id === selectedPlan) || planDetails[0];
  const hasInstallmentOptions = currentPlan.maxInstallments > 1;
  
  // Generate installment options based on the selected plan
  const installmentOptions = [];
  for (let i = 1; i <= currentPlan.maxInstallments; i++) {
    let totalAmount = 0;
    
    if (currentPlan.id === 'semestral') {
      totalAmount = 522;
    } else if (currentPlan.id === 'anual') {
      totalAmount = 804;
    }
    
    const installmentAmount = (totalAmount / i).toFixed(2).replace('.', ',');
    
    installmentOptions.push({
      value: i,
      label: i === 1 
        ? `À vista - R$ ${totalAmount},00` 
        : `${i}x de R$ ${installmentAmount}`
    });
  }

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
              className={`relative rounded-lg border p-4 cursor-pointer transition-all
                ${selectedPlan === plan.id ? 'bg-[#f0fdf4] border-green-500 font-medium' : 'hover:border-gray-400'}
                ${plan.recommended ? 'ring-2 ring-primary' : ''}`}
              onClick={() => onPlanChange(plan.id)}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-white text-xs py-1 px-3 rounded-full">
                  Mais popular
                </div>
              )}
              <RadioGroupItem 
                value={plan.id} 
                id={plan.id}
                className="absolute right-4 top-4"
              />
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
      
      {/* Installment options section - Only shown for semestral and anual plans */}
      {hasInstallmentOptions && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <h4 className="font-medium mb-3">Opções de parcelamento</h4>
          <p className="text-sm text-gray-600 mb-3">
            Escolha em quantas vezes deseja pagar:
          </p>
          <Select
            value={selectedInstallments.toString()}
            onValueChange={(value) => onInstallmentsChange(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione o número de parcelas" />
            </SelectTrigger>
            <SelectContent>
              {installmentOptions.map(option => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 mt-3">
            <Checkbox id="creditcard" defaultChecked disabled />
            <Label htmlFor="creditcard" className="text-sm text-gray-600">
              Pagamento via cartão de crédito
            </Label>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-800">
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
        className="w-full mt-6" 
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
