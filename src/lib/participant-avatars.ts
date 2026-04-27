export type ParticipantAvatar =
  | 'orange'
  | 'purple'
  | 'blue'
  | 'gray'
  | 'black'
  | 'yellow'
  | 'green'
  | 'pink'
  | 'cyan'
  | 'red'
  | 'lime'
  | 'brown'
  | 'indigo'
  | 'teal'
  | 'amber'
  | 'slate'
  | 'violet'
  | 'rose'
  | 'mint'
  | 'sand';

type AvatarProfile = {
  color: string;
  baseColor: string;
  top?: string;
  sides?: string;
  face?: string;
  eyes?: string;
  mouth?: string;
  texture?: string;
};

const avatarTheme: Record<ParticipantAvatar, AvatarProfile> = {
  orange: { color: '#f4511e', baseColor: 'f4511e', top: 'bulb01', sides: 'square', face: 'square04', eyes: 'robocop', mouth: 'grill02', texture: 'dots' },
  purple: { color: '#8e24aa', baseColor: '8e24aa', top: 'glowingBulb02', sides: 'squareAssymetric', face: 'square01', eyes: 'roundFrame01', mouth: 'diagram', texture: 'circuits' },
  blue: { color: '#3949ab', baseColor: '3949ab', top: 'antennaCrooked', sides: 'cables01', face: 'square02', eyes: 'robocop', mouth: 'smile02', texture: 'grunge01' },
  gray: { color: '#757575', baseColor: '757575', top: 'glowingBulb02', sides: 'antenna02', face: 'round02', eyes: 'round', mouth: 'grill03', texture: 'dirty01' },
  black: { color: '#202020', baseColor: '202020', top: 'pyramid', sides: 'round', face: 'round01', eyes: 'frame1', mouth: 'bite', texture: 'camo01' },
  yellow: { color: '#ffb300', baseColor: 'ffb300', top: 'lights', sides: 'square', face: 'square03', eyes: 'glow', mouth: 'grill01', texture: 'circuits' },
  green: { color: '#00897b', baseColor: '00897b', top: 'horns', sides: 'squareAssymetric', face: 'square04', eyes: 'robocop', mouth: 'grill02', texture: 'dots' },
  pink: { color: '#d81b60', baseColor: 'd81b60', top: 'glowingBulb01', sides: 'cables02', face: 'square01', eyes: 'hearts', mouth: 'bite', texture: 'grunge02' },
  cyan: { color: '#00acc1', baseColor: '00acc1', top: 'radar', sides: 'cables01', face: 'square02', eyes: 'sensor', mouth: 'smile01', texture: 'circuits' },
  red: { color: '#e53935', baseColor: 'e53935', top: 'horns', sides: 'square', face: 'round01', eyes: 'dizzy', mouth: 'square02', texture: 'dirty02' },
  lime: { color: '#c0ca33', baseColor: 'c0ca33', top: 'bulb01', sides: 'antenna01', face: 'square04', eyes: 'frame2', mouth: 'smile02', texture: 'dots' },
  brown: { color: '#6d4c41', baseColor: '6d4c41', top: 'pyramid', sides: 'round', face: 'round02', eyes: 'happy', mouth: 'grill02', texture: 'camo02' },
  indigo: { color: '#5e35b1', baseColor: '5e35b1', top: 'glowingBulb01', sides: 'antenna02', face: 'square03', eyes: 'roundFrame02', mouth: 'diagram', texture: 'grunge01' },
  teal: { color: '#00838f', baseColor: '00838f', top: 'antenna', sides: 'cables02', face: 'square01', eyes: 'eva', mouth: 'bite', texture: 'circuits' },
  amber: { color: '#fb8c00', baseColor: 'fb8c00', top: 'lights', sides: 'squareAssymetric', face: 'square04', eyes: 'bulging', mouth: 'grill01', texture: 'dirty01' },
  slate: { color: '#546e7a', baseColor: '546e7a', top: 'radar', sides: 'round', face: 'round02', eyes: 'shade01', mouth: 'smile01', texture: 'grunge02' },
  violet: { color: '#6d28d9', baseColor: '6d28d9', top: 'bulb01', sides: 'antenna01', face: 'square02', eyes: 'round', mouth: 'diagram', texture: 'dots' },
  rose: { color: '#e91e63', baseColor: 'e91e63', top: 'glowingBulb02', sides: 'square', face: 'round01', eyes: 'hearts', mouth: 'grill03', texture: 'camo01' },
  mint: { color: '#43a047', baseColor: '43a047', top: 'antennaCrooked', sides: 'cables01', face: 'square03', eyes: 'robocop', mouth: 'smile02', texture: 'circuits' },
  sand: { color: '#f9c74f', baseColor: 'f9c74f', top: 'lights', sides: 'squareAssymetric', face: 'square01', eyes: 'frame1', mouth: 'square01', texture: 'dirty02' },
};

export const participantAvatarOrder: ParticipantAvatar[] = [
  'orange',
  'purple',
  'blue',
  'gray',
  'black',
  'yellow',
  'green',
  'pink',
  'cyan',
  'red',
  'lime',
  'brown',
  'indigo',
  'teal',
  'amber',
  'slate',
  'violet',
  'rose',
  'mint',
  'sand',
];

export const participantAvatarToColor = (avatar: ParticipantAvatar) => avatarTheme[avatar].color;

export const participantAvatarToSrc = (avatar: ParticipantAvatar, seed: string) => {
  const profile = avatarTheme[avatar];
  const params = new URLSearchParams({
    seed,
    baseColor: profile.baseColor,
    backgroundColor: 'transparent',
  });

  if (profile.top) params.set('top', profile.top);
  if (profile.sides) params.set('sides', profile.sides);
  if (profile.face) params.set('face', profile.face);
  if (profile.eyes) params.set('eyes', profile.eyes);
  if (profile.mouth) params.set('mouth', profile.mouth);
  if (profile.texture) params.set('texture', profile.texture);

  return `https://api.dicebear.com/9.x/bottts/svg?${params.toString()}`;
};

export const hexToRgba = (hex: string, alpha: number) => {
  const normalized = hex.replace('#', '');
  const expanded =
    normalized.length === 3
      ? normalized
          .split('')
          .map((character) => character + character)
          .join('')
      : normalized;

  const red = Number.parseInt(expanded.slice(0, 2), 16);
  const green = Number.parseInt(expanded.slice(2, 4), 16);
  const blue = Number.parseInt(expanded.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
};
