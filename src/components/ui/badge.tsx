import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap [&_svg]:size-3", {
  variants: {
    variant: {
      default: "border-transparent bg-accent text-accent-foreground",
      outline: "bg-card text-foreground",
      success: "border-transparent bg-emerald-50 text-emerald-700",
      warning: "border-transparent bg-amber-50 text-amber-700",
      danger: "border-transparent bg-rose-50 text-rose-700",
      muted: "border-transparent bg-muted text-muted-foreground",
      dark: "border-transparent bg-foreground text-background",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
