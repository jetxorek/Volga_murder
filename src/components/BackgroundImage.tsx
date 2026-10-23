import { ASSETS } from '../assets';
import { Placeholder } from './Placeholder';

type BackgroundImageProps = {
  backgroundId: string;
};

/** Фон сцены по ID из ASSETS. Если нет — Placeholder. */
export function BackgroundImage({ backgroundId }: BackgroundImageProps) {
  const asset = ASSETS.backgrounds[backgroundId];
  if (!asset) {
    return <Placeholder label={`Фон: ${backgroundId}`} aspect="wide" />;
  }
  return (
    <img
      src={asset.path}
      alt={asset.alt}
      style={{ width: '100%', display: 'block', borderRadius: 'var(--radius)' }}
    />
  );
}
