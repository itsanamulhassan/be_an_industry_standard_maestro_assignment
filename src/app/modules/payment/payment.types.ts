import Stripe from "stripe";

export interface CreatePaymentIntentProps {
  amount: number;
  metadata?: Stripe.MetadataParam;
  email: string;
}

export interface CreateCustomerProps {
  email?: string;
  name?: string;
}

export interface CreateStripeIntentProps {
  rider: string;
  driver: string;
  ride: string;
  amount: number;
  savePaymentMethod: boolean;
  email: string;
}
