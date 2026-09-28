import "server-only";
import Stripe from "stripe";
import { PLANS, type Currency, type PlanId } from "@/config/pricing";
import type { PaymentProvider } from "./provider";

let client: Stripe | null = null;

export function isStripeConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set.");
  client ??= new Stripe(key, { appInfo: { name: "DreamJobResume" } });
  return client;
}

export function stripePriceId(plan: Exclude<PlanId, "free">, currency: Currency): string {
  const envName = PLANS[plan].stripePriceEnv[currency];
  const id = envName ? process.env[envName] : undefined;
  if (!id) throw new Error(`No Stripe price configured for ${plan}/${currency}.`);
  return id;
}

/** Reverse lookup used by the webhook to map a Stripe price back to a plan. */
export function planFromPriceId(priceId: string): { plan: PlanId; currency: Currency } | null {
  for (const plan of Object.values(PLANS)) {
    for (const [currency, envName] of Object.entries(plan.stripePriceEnv)) {
      if (envName && process.env[envName] === priceId) return { plan: plan.id, currency: currency as Currency };
    }
  }
  return null;
}

export const stripeProvider: PaymentProvider = {
  name: "stripe",
  async createCheckoutSession({ userId, email, plan, currency, customerId, successUrl, cancelUrl }) {
    const session = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: stripePriceId(plan, currency), quantity: 1 }],
      ...(customerId ? { customer: customerId } : { customer_email: email }),
      client_reference_id: userId,
      metadata: { userId, plan },
      subscription_data: { metadata: { userId, plan } },
      allow_promotion_codes: true,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { url: session.url };
  },
  async createPortalSession({ customerId, returnUrl }) {
    const session = await getStripe().billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
    return { url: session.url };
  },
};
