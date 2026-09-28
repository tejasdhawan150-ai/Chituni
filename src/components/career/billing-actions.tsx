"use client";
import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { billingPortalAction, checkoutAction } from "@/server/actions/billing";
import { unwrap } from "@/lib/action-client";
import type { Currency, PlanId } from "@/config/pricing";

export function CheckoutButton({ plan, currency, current, label, featured }: { plan: PlanId; currency: Currency; current: PlanId; label: string; featured?: boolean }) {
  const [pending, setPending] = React.useState(false);
  if (plan === current) {
    return (
      <Button className="w-full" size="lg" variant="outline" disabled>
        Current plan
      </Button>
    );
  }
  if (plan === "free") {
    return (
      <Button className="w-full" size="lg" variant="ghost" disabled>
        Included
      </Button>
    );
  }
  return (
    <Button
      className="w-full"
      size="lg"
      variant={featured ? "dark" : "outline"}
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const res = await checkoutAction({ plan, currency });
        if (res && !res.ok) {
          unwrap(res);
          setPending(false);
        }
      }}
    >
      {pending && <LoaderCircle className="animate-spin" />} {label}
    </Button>
  );
}

export function ManageBillingButton() {
  const [pending, setPending] = React.useState(false);
  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        const res = await billingPortalAction();
        if (res && !res.ok) {
          unwrap(res);
          setPending(false);
        }
      }}
    >
      {pending && <LoaderCircle className="animate-spin" />} Manage billing
    </Button>
  );
}
