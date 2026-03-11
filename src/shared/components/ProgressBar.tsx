interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
  className?: string;
}

export function ProgressBar({ value, max, color, className = "" }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className={`bg-bg-elevated rounded h-1.5 overflow-hidden ${className}`}>
      <div
        className="h-full rounded transition-all duration-500"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}, ${color}88)`,
        }}
      />
    </div>
  );
}
