import type { Metadata } from "next";
import { PricingCards } from "@/components/marketing/pricing-cards";
import { FaqSection } from "@/components/marketing/faq";

export const metadata: Metadata = {
  title: "Pricing — Free, Pro & Career Plans",
  description: "Start free with 1 resume and 2 job analyses. Pro ₹499/month for unlimited tailoring. Career ₹999/month adds cover letters, LinkedIn optimization and interview prep.",
  alternates: { canonical: "/pricing" },
};

const FAQS = [
  { q: "Can I cancel anytime?", a: "Yes. Manage or cancel your subscription from Settings → Billing. You keep access until the end of the billing period." },
  { q: "What payment methods do you accept?", a: "Cards and other methods supported by our payment provider in your region. Prices are shown in INR; more currencies are coming." },
  { q: "What counts as a job analysis?", a: "Each job description you paste and analyze counts as one. Free includes 2 per month; Pro and Career are unlimited." },
  { q: "Is my data private?", a: "Your profile and resumes are private to your account and protected with row-level security. We never sell your data." },
];

export default function PricingPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pb-10 pt-16 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-balance text-5xl font-semibold tracking-tight">Simple pricing for serious applicants</h1>
          <p className="mt-4 text-lg text-muted-foreground">Start free. Upgrade when you&apos;re applying every week.</p>
        </div>
        <div className="mt-14">
          <PricingCards />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Prices in INR. ATS scores are internal matching estimates, not guarantees.</p>
      </section>
      <FaqSection faqs={FAQS} />
    </>
  );
}
