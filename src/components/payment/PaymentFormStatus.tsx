
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
    <Alert variant={isSuccess ? "default" : "destructive"} className={isSuccess ? "bg-teal-50 border-teal-200" : ""}>
      <AlertDescription className="flex items-center gap-2">
        {isSuccess ? (
          <CheckCircle className="h-5 w-5 text-teal-500" />
        ) : (
          <XCircle className="h-5 w-5" />
        )}
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default PaymentFormStatus;
