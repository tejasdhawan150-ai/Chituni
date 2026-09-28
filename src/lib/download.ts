"use client";

/** Trigger a file download from a same-origin API route without client-side navigation. */
export function downloadFile(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
