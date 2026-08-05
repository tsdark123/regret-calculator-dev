import React from 'react';
import {
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';

interface MobileStepCardProps {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const MobileStepCard: React.FC<MobileStepCardProps> = ({
  step,
  title,
  description,
  children,
  footer,
  className,
}) => {
  return (
    <div
      className={
        'bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl backdrop-blur-sm flex flex-col h-full overflow-hidden ' +
        (className || '')
      }
    >
      <DialogHeader hideCloseButton>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold text-sm ring-1 ring-[var(--primary)]/20">
            {step}
          </div>
          <div>
            <h2 className="text-lg leading-none font-semibold text-[var(--text-main)]">{title}</h2>
            {description && <p className="text-sm text-[var(--text-muted)]">{description}</p>}
          </div>
        </div>
      </DialogHeader>
      <DialogBody className="flex-1 overflow-y-auto min-h-0">{children}</DialogBody>
      {footer && <DialogFooter>{footer}</DialogFooter>}
    </div>
  );
};
