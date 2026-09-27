import { loadStripe, Stripe } from '@stripe/stripe-js';

// Default demo publishable test key placeholder or env var
const STRIPE_PK_ENV = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = (customPk?: string): Promise<Stripe | null> => {
  const pk = customPk || STRIPE_PK_ENV;
  if (!pk) {
    return Promise.resolve(null);
  }
  if (!stripePromise) {
    stripePromise = loadStripe(pk);
  }
  return stripePromise;
};

export interface PaymentDetails {
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
  postalCode: string;
  saveCard?: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  paymentMethod: string;
  last4: string;
  amount: number;
  timestamp: string;
  mode: 'simulated' | 'stripe_live';
  receiptUrl?: string;
  error?: string;
}

/**
 * Validate standard card fields
 */
export function validateCardDetails(details: PaymentDetails): { valid: boolean; error?: string } {
  const cleanNum = details.cardNumber.replace(/\s+/g, '');
  if (cleanNum.length < 15 || cleanNum.length > 19 || !/^\d+$/.test(cleanNum)) {
    return { valid: false, error: 'Numéro de carte bancaire invalide (16 chiffres requis).' };
  }
  if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(details.expiryDate.trim())) {
    return { valid: false, error: "Date d'expiration invalide (format MM/AA requis)." };
  }
  if (!/^\d{3,4}$/.test(details.cvc.trim())) {
    return { valid: false, error: 'Cryptogramme CVC invalide (3 ou 4 chiffres).' };
  }
  if (!details.cardHolder.trim() || details.cardHolder.trim().length < 3) {
    return { valid: false, error: 'Nom du titulaire requis.' };
  }
  return { valid: true };
}

/**
 * Simulated Payment Engine (Instant authorization with 3D Secure simulation)
 */
export async function processSimulatedPayment(
  details: PaymentDetails, 
  amount: number,
  serviceTitle: string
): Promise<PaymentResult> {
  const validation = validateCardDetails(details);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Realistic network delay for authorization & 3D Secure
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const cleanNum = details.cardNumber.replace(/\s+/g, '');
  const last4 = cleanNum.slice(-4);
  const txId = 'pi_sim_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);

  return {
    success: true,
    transactionId: txId,
    paymentMethod: `CB / Visa •••• ${last4}`,
    last4,
    amount,
    timestamp: new Date().toISOString(),
    mode: 'simulated',
    receiptUrl: `#receipt-${txId}`
  };
}

/**
 * Stripe Payment Intent simulator / live initiator
 */
export async function createStripePaymentIntent(amount: number, serviceTitle: string, customerEmail: string) {
  // If backend endpoint /api/create-payment-intent is available:
  try {
    const res = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // in cents
        currency: 'eur',
        description: `Réservation soin: ${serviceTitle} - Un Moment pour Soi`,
        customerEmail
      })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // If backend proxy not configured yet, fallback seamlessly to simulation
  }

  return {
    clientSecret: 'pi_test_secret_' + Math.random().toString(36).substring(2),
    publishableKey: STRIPE_PK_ENV || 'pk_test_placeholder_unmomentpoursoi'
  };
}
