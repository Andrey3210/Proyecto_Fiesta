import type { CSSProperties } from 'react';

import {
  hexToRgba,
  participantAvatarToSrc,
  type ParticipantAvatar,
} from '@/lib/participant-avatars';

type ParticipantAvatarProps = {
  avatar: ParticipantAvatar;
  seed: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
};

export function ParticipantAvatarImage({ avatar, seed, alt, className, style }: ParticipantAvatarProps) {
  return (
    <img
      alt={alt}
      className={className}
      src={participantAvatarToSrc(avatar, seed)}
      style={style}
    />
  );
}

type ParticipantAvatarBadgeProps = ParticipantAvatarProps & {
  backgroundColor: string;
  sizeClassName?: string;
};

export function ParticipantAvatarBadge({
  avatar,
  seed,
  alt,
  className,
  style,
  backgroundColor,
  sizeClassName = 'h-12 w-12',
}: ParticipantAvatarBadgeProps) {
  return (
    <span
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 shadow-lg ${sizeClassName} ${className ?? ''}`}
      style={{
        backgroundColor: hexToRgba(backgroundColor, 0.28),
        boxShadow: `0 0 0 1px ${hexToRgba(backgroundColor, 0.5)}, 0 0 18px ${hexToRgba(backgroundColor, 0.22)}`,
        ...style,
      }}
    >
      <ParticipantAvatarImage
        avatar={avatar}
        seed={seed}
        alt={alt}
        className="h-[92%] w-[92%] object-contain"
      />
    </span>
  );
}
