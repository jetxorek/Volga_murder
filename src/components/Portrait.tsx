import { ASSETS } from '../assets';
import { Placeholder } from './Placeholder';

type PortraitProps = {
  portraitId: string;
  size?: number;
};

/** Портрет персонажа по ID из ASSETS. Если нет — Placeholder. */
export function Portrait({ portraitId, size = 64 }: PortraitProps) {
  const asset = ASSETS.portraits[portraitId];
  if (!asset) {
    return <Placeholder label={portraitId} aspect="square" />;
  }
  return (
    <img
      src={asset.path}
      alt={asset.alt}
      width={size}
      height={size}
      style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }}
    />
  );
}
