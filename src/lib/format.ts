export const formatCurrencyGBP = (value: number): string =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);

export const formatNumber = (value: number): string => new Intl.NumberFormat('en-GB').format(Math.round(value));

export const formatSeconds = (seconds: number): string => {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatDuration = (totalMinutes: number): string => {
  const mins = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  if (!hours) return `${rem}m`;
  if (!rem) return `${hours}h`;
  return `${hours}h ${rem}m`;
};
