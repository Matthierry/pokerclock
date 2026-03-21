interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  helperText?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function NumericStepper({ label, value, onChange, min, max, step, unit, helperText }: Props): JSX.Element {
  const atMin = value <= min;
  const atMax = value >= max;

  return (
    <div className="rounded-xl border border-borderTone bg-bgSecondary p-3">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-sm font-semibold text-white">{label}</p>
        {helperText ? <p className="text-xs text-muted">{helperText}</p> : null}
      </div>

      <div className="grid select-none grid-cols-[56px,1fr,56px] items-center gap-2 sm:grid-cols-[64px,1fr,64px] sm:gap-3">
        <button
          type="button"
          onClick={() => onChange(clamp(value - step, min, max))}
          disabled={atMin}
          className="h-14 rounded-xl border border-borderTone bg-bg text-3xl font-bold leading-none text-white transition disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={`Decrease ${label}`}
        >
          −
        </button>

        <div className="rounded-xl border border-borderTone bg-bg px-3 py-2 text-center">
          <p className="text-2xl font-bold text-white">{unit === '£' ? `£${value}` : value}</p>
          {unit && unit !== '£' ? <p className="text-xs uppercase tracking-wide text-muted">{unit}</p> : null}
        </div>

        <button
          type="button"
          onClick={() => onChange(clamp(value + step, min, max))}
          disabled={atMax}
          className="h-14 rounded-xl border border-borderTone bg-accent text-3xl font-bold leading-none text-white transition disabled:cursor-not-allowed disabled:opacity-35"
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
