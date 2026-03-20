interface Props {
  label: string;
  value: string;
}

export function StatCard({ label, value }: Props): JSX.Element {
  return (
    <div className="rounded-xl border border-borderTone bg-bgSecondary p-3">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
    </div>
  );
}
