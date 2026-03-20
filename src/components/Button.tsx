import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'success';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const styles: Record<Variant, string> = {
  primary: 'bg-accent text-white',
  secondary: 'bg-bgSecondary text-text border border-borderTone',
  danger: 'bg-danger text-white',
  success: 'bg-success text-bg'
};

export function Button({ variant = 'primary', className = '', ...props }: Props): JSX.Element {
  return (
    <button
      className={`min-h-11 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
