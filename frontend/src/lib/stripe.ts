import Stripe from "stripe";

// Singleton Stripe client. Do not pin apiVersion; rely on SDK defaults.
let _stripe: Stripe | null = null;

export const stripe = (() => {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("Missing STRIPE_SECRET_KEY in environment");
  }
  _stripe = new Stripe(key);
  return _stripe;
})();
