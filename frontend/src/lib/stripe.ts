import Stripe from "stripe";

// Lazy-initialized Stripe client to avoid build-time errors.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY in environment");
  }
  if (_stripe) return _stripe;
  _stripe = new Stripe(key);
  return _stripe;
}
