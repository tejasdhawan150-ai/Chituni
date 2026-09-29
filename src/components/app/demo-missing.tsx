import Link from "next/link";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shown in demo mode when an item was created on a different server instance and is no longer available. */
export function DemoMissing({ thing, href, cta }: { thing: string; href: string; cta: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-5 py-24 text-center">
      <div className="grid size-11 place-items-center rounded-xl bg-accent text-accent-foreground">
        <RefreshCw className="size-5" />
      </div>
      <h1 className="mt-4 text-xl font-semibold tracking-tight">This {thing} is no longer available</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        You&apos;re using the demo, which keeps data only temporarily. Please start again — it only takes a moment.
      </p>
      <Button className="mt-6" asChild>
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}
