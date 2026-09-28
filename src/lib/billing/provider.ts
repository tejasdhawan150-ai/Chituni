import type { Currency, PlanId } from "@/config/pricing";

/** Payment provider boundary — Stripe today; Razorpay/Paddle can implement the same interface. */
export interface PaymentProvider {
  readonly name: string;
  createCheckoutSession(input: {
    userId: string;
    email: string;
    plan: Exclude<PlanId, "free">;
    currency: Currency;
    customerId: string | null;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string }>;
  createPortalSession(input: { customerId: string; returnUrl: string }): Promise<{ url: string }>;
}
