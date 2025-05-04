
export interface PaymentResponse {
  clientSecret: string;
  customerId: string;
  paymentType: 'payment' | 'subscription';
  priceId?: string;
  amount: number;
}
