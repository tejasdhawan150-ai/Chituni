import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">This page doesn&apos;t exist</h1>
      <p className="mt-2 text-muted-foreground">But your dream job might. Let&apos;s get you back on track.</p>
      <Button className="mt-6" variant="dark" asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
}
