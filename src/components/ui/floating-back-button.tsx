import type { MouseEvent as ReactMouseEvent } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import { LiquidButton } from '@/components/ui/liquid-glass-button';

type FloatingBackButtonProps = {
  label?: string;
  onClick: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
};

function FloatingBackButton({
  label = 'Volver',
  onClick,
  ariaLabel = label,
}: FloatingBackButtonProps) {
  return (
    <div className="fixed left-3 top-3 z-50 sm:left-4 sm:top-4">
      <LiquidButton
        aria-label={ariaLabel}
        className="rounded-full !px-4 !py-3 shadow-2xl"
        onClick={onClick}
        size="lg"
        variant="cool"
        type="button"
      >
        <span className="flex items-center gap-2">
          <FaArrowLeft />
          <span>{label}</span>
        </span>
      </LiquidButton>
    </div>
  );
}

export default FloatingBackButton;
