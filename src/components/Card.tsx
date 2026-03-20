import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps): JSX.Element {
  return <section className={`rounded-2xl border border-borderTone bg-card p-4 shadow-card ${className}`}>{children}</section>;
}
