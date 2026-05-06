import type { MouseEvent as ReactMouseEvent } from 'react';
import { FaArrowLeft } from 'react-icons/fa';

import { LiquidButton } from '@/components/ui/liquid-glass-button';

type FloatingBackButtonProps = {
  label?: string;
  onClick: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  ariaLabel?: string;
};

function FloatingBackButton({
  label,
  onClick,
  ariaLabel = label ?? 'Volver',
}: FloatingBackButtonProps) {
  const showLabel = typeof label === 'string' && label.length > 0;

  return (
    <div className="fixed left-3 top-3 z-50 sm:left-4 sm:top-4">
      <LiquidButton
        aria-label={ariaLabel}
        className={`rounded-full shadow-2xl ${
          showLabel ? '!px-4 !py-3' : '!h-12 !w-12 !px-0 !py-0'
        }`}
        onClick={onClick}
        size="lg"
        variant="cool"
        type="button"
      >
        <span className={`flex items-center justify-center ${showLabel ? 'gap-2' : ''}`}>
          <FaArrowLeft />
          {showLabel ? <span>{label}</span> : null}
        </span>
      </LiquidButton>
    </div>
  );
}

export default FloatingBackButton;
