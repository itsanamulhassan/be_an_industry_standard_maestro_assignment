import Stripe from "stripe";
import environments from "../../configurations/environments";
import { CreateCustomerProps, CreatePaymentIntentProps } from "./payment.types";

const stripe = new Stripe(environments.stripe.secret_key, {
  apiVersion: environments.stripe.api_version,
});

// ✅ Create Payment Intent
const createPaymentIntent = async ({
  amount,
  metadata = {},
  email,
}: CreatePaymentIntentProps): Promise<Stripe.PaymentIntent> => {
  const amountInCents = Math.round(amount * 100);

  return stripe.paymentIntents.create({
    amount: amountInCents,
    currency: environments.stripe.default_currency,
    metadata,
    receipt_email: email,
  });
};

// ✅ Retrieve Payment Intent
const retrievePaymentIntent = async (
  id: string
): Promise<Stripe.PaymentIntent> => {
  return stripe.paymentIntents.retrieve(id);
};

// ✅ Create Customer
const createCustomer = async ({
  email,
  name,
}: CreateCustomerProps): Promise<Stripe.Customer> => {
  return stripe.customers.create({
    email,
    name,
  });
};

// ✅ Validate Webhook Event
const constructEvent = (payload: Buffer, sigHeader: string): Stripe.Event => {
  return stripe.webhooks.constructEvent(
    payload,
    sigHeader,
    environments.stripe.webhook_secret
  );
};

export const stripeServices = {
  constructEvent,
  createCustomer,
  createPaymentIntent,
  retrievePaymentIntent,
};
