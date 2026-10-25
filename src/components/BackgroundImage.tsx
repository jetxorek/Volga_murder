import { useState } from 'react';
import { ASSETS } from '../assets';
import { Placeholder } from './Placeholder';
import { ProceduralBackground } from './ProceduralBackground';

type BackgroundImageProps = {
  backgroundId: string;
};

/**
 * Фон сцены. Приоритет: реальный ассет (ASSETS.backgrounds) → SVG
 * (ProceduralBackground) → Placeholder (если файл ассета не загрузился).
 */
export function BackgroundImage({ backgroundId }: BackgroundImageProps) {
  const [failed, setFailed] = useState(false);
  const asset = ASSETS.backgrounds[backgroundId];

  if (!asset) {
    return <ProceduralBackground backgroundId={backgroundId} />;
  }

  if (failed) {
    return <Placeholder label={`Фон: ${backgroundId}`} aspect="wide" />;
  }

  return (
    <img
      src={asset.path}
      alt={asset.alt}
      onError={() => setFailed(true)}
      style={{ width: '100%', display: 'block', borderRadius: 'var(--radius)' }}
    />
  );
}
