/** Знак: три остановки маршрута, последняя — цель. */
export function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg";
  return (
    <span className="flex items-center gap-2 text-ink">
      <svg width={big ? 34 : 26} height={big ? 34 : 26} viewBox="0 0 32 32" aria-hidden="true">
        <path d="M6 24 C 6 14, 26 18, 26 8" fill="none" stroke="var(--color-route)" strokeWidth="3" strokeLinecap="round" strokeDasharray="0.1 6" />
        <circle cx="6" cy="24" r="4" fill="var(--color-ink)" />
        <circle cx="26" cy="8" r="5" fill="var(--color-sun)" stroke="var(--color-ink)" strokeWidth="2" />
      </svg>
      <span className={`font-bold tracking-tight ${big ? "text-2xl" : "text-lg"}`}>CodeQuest</span>
    </span>
  );
}
