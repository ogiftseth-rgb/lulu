import { cn } from "@/lib/utils";

export function Button({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn("inline-flex items-center justify-center rounded-full bg-burgundy px-5 py-2.5 text-sm text-ivory disabled:opacity-50", className)}
      {...props}
    />
  );
}
