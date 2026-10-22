"use client";

export function PrintButton() {
  return (
    <button type="button" className="rounded-full border border-burgundy px-4 py-2 text-sm" onClick={() => window.print()}>
      Print
    </button>
  );
}
