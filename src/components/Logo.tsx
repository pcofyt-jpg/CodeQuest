/** Знак: голова робота Кью — мятная, с янтарной антенной. */
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span className="flex items-center gap-2">
      <svg width={big ? 38 : 30} height={big ? 38 : 30} viewBox="0 0 40 40" aria-hidden="true">
        <rect x="5" y="9" width="30" height="24" rx="8" fill="var(--color-route)" />
        <circle cx="15" cy="20" r="3.5" fill="var(--color-paper)" />
        <circle cx="25" cy="20" r="3.5" fill="var(--color-paper)" />
        <path d="M20 9 V4" stroke="var(--color-route)" strokeWidth="2.5" />
        <circle cx="20" cy="4" r="2.5" fill="var(--color-sun)" />
      </svg>
      <span className={`font-display font-extrabold tracking-tight ${big ? "text-[22px]" : "text-lg"}`}>CodeQuest</span>
    </span>
  );
}
