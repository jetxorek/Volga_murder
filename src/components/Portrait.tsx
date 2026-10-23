import { useState } from 'react';
import { ASSETS } from '../assets';
import { Placeholder } from './Placeholder';

type PortraitProps = {
  portraitId: string;
  size?: number;
};

/**
 * Портрет персонажа по ID из ASSETS. Если ассет не зарегистрирован
 * или файл не загрузился — показывает Placeholder (onError fallback).
 */
export function Portrait({ portraitId, size = 64 }: PortraitProps) {
  const [failed, setFailed] = useState(false);
  const asset = ASSETS.portraits[portraitId];

  if (!asset || failed) {
    return <Placeholder label={portraitId} aspect="square" />;
  }

  return (
    <img
      src={asset.path}
      alt={asset.alt}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{ borderRadius: '50%', objectFit: 'cover', display: 'block' }}
    />
  );
}
