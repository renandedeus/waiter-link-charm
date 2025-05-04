
import React from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';

interface PaymentFormStatusProps {
  message: string | null;
  isSuccess: boolean;
}

const PaymentFormStatus = ({ message, isSuccess }: PaymentFormStatusProps) => {
  if (!message) return null;
  
  return (
    <Alert variant={isSuccess ? "default" : "destructive"} className={isSuccess ? "bg-green-50 border-green-200" : ""}>
      <AlertDescription className="flex items-center gap-2">
        {isSuccess ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5" />
        )}
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default PaymentFormStatus;
