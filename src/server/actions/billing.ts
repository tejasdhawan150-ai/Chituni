"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CURRENCIES } from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { isStripeConfigured, stripeProvider } from "@/lib/billing/stripe";
import { run, UserFacingError } from "../context";

export async function checkoutAction(input: { plan: "pro" | "career"; currency?: string }) {
  const res = await run(async ({ user, repo }) => {
    const { plan, currency } = z.object({ plan: z.enum(["pro", "career"]), currency: z.enum(CURRENCIES).default("INR") }).parse(input);
    if (user.isDemo || !isStripeConfigured()) throw new UserFacingError("Payments are not configured in this environment. Add your Stripe keys to enable checkout.");
    const sub = await repo.getSubscription(user.id);
    const { url } = await stripeProvider.createCheckoutSession({
      userId: user.id,
      email: user.email,
      plan,
      currency,
      customerId: sub.stripeCustomerId,
      successUrl: `${siteConfig.url}/settings/billing?success=1`,
      cancelUrl: `${siteConfig.url}/pricing?canceled=1`,
    });
    return { url };
  });
  if (res.ok) redirect(res.data.url);
  return res;
}

export async function billingPortalAction() {
  const res = await run(async ({ user, repo }) => {
    const sub = await repo.getSubscription(user.id);
    if (!sub.stripeCustomerId || !isStripeConfigured()) throw new UserFacingError("No billing account found.");
    return stripeProvider.createPortalSession({ customerId: sub.stripeCustomerId, returnUrl: `${siteConfig.url}/settings/billing` });
  });
  if (res.ok) redirect(res.data.url);
  return res;
}
