import { useState } from 'react';
import { ASSETS } from '../assets';
import { Placeholder } from './Placeholder';

type BackgroundImageProps = {
  backgroundId: string;
};

/**
 * Фон сцены по ID из ASSETS. Если ассет не зарегистрирован или файл
 * не загрузился — показывает Placeholder (onError fallback).
 */
export function BackgroundImage({ backgroundId }: BackgroundImageProps) {
  const [failed, setFailed] = useState(false);
  const asset = ASSETS.backgrounds[backgroundId];

  if (!asset || failed) {
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
