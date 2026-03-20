import { ReactNode } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: 'danger' | 'success';
  extra?: ReactNode;
}

export function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', onConfirm, onCancel, tone = 'success', extra }: Props): JSX.Element | null {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <Card className="w-full max-w-md">
        <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-text">{message}</p>
        {extra}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onCancel}>No</Button>
          <Button variant={tone} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </Card>
    </div>
  );
}
