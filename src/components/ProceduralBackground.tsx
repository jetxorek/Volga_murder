type ProceduralBackgroundProps = {
  backgroundId: string;
};

/**
 * SVG-фон по backgroundId. Нуар 1930-х: тёмные тона, туман, силуэты.
 * Если id неизвестен — нейтральный тёмный фон (DefaultScene).
 */
export function ProceduralBackground({ backgroundId }: ProceduralBackgroundProps) {
  return (
    <svg
      viewBox="0 0 800 450"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={backgroundId}
      data-testid={`procedural-${backgroundId}`}
      style={{ width: '100%', display: 'block' }}
    >
      {renderScene(backgroundId)}
    </svg>
  );
}

function renderScene(id: string) {
  switch (id) {
    case 'bg_embankment':   return <Embankment />;
    case 'bg_pier':         return <Pier />;
    case 'bg_deck_evening': return <DeckEvening />;
    case 'bg_deck_night':   return <DeckNight />;
    case 'bg_salon':        return <Salon night={false} day={false} />;
    case 'bg_salon_night':  return <Salon night day={false} />;
    case 'bg_salon_day':    return <Salon night={false} day />;
    case 'bg_cabin_simon':  return <CabinSimon />;
    case 'bg_cabin_lina':   return <CabinLina />;
    case 'bg_cabin_jeanne': return <CabinJeanne />;
    case 'bg_cabin_vanskaya': return <CabinVanskaya />;
    case 'bg_cabin_louise': return <CabinLouise />;
    case 'bg_cabin_otterborn': return <CabinOtterborn />;
    case 'bg_infirmary':    return <Infirmary />;
    case 'bg_deck_day':     return <DeckDay />;
    case 'bg_corridor':     return <Corridor />;
    case 'bg_court':        return <Court />;
    case 'bg_office':       return <Office />;
    case 'bg_credits':      return <Credits />;
    default:                return <DefaultScene />;
  }
}

/* ── Общие приёмы: туман — rgba(255,255,255,…) / rgba(0,0,0,…), остальное — var(--color-*) ── */

function Mist({ cx, cy, rx, ry, opacity = 0.06 }: { cx: number; cy: number; rx: number; ry: number; opacity?: number }) {
  return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#e8e6e1" opacity={opacity} />;
}

function Embankment() {
  return (
    <g>
      <defs>
        <linearGradient id="emb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#3d3454" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#emb-sky)" />
      <rect y="300" width="800" height="150" fill="#0e0e1a" />
      <rect y="300" width="800" height="4" fill="var(--color-border)" opacity="0.3" />
      <circle cx="620" cy="80" r="28" fill="#e8e6e1" opacity="0.85" />
      <circle cx="620" cy="80" r="40" fill="#e8e6e1" opacity="0.15" />
      <rect x="120" y="270" width="220" height="40" fill="#08080f" />
      <rect x="160" y="230" width="140" height="40" fill="#08080f" />
      <rect x="200" y="200" width="20" height="30" fill="#08080f" />
      <rect x="240" y="200" width="20" height="30" fill="#08080f" />
      <circle cx="180" cy="250" r="3" fill="var(--color-accent)" opacity="0.9" />
      <circle cx="220" cy="250" r="3" fill="var(--color-accent)" opacity="0.7" />
      <circle cx="280" cy="250" r="3" fill="var(--color-accent)" opacity="0.8" />
      <Mist cx={400} cy={310} rx={380} ry={18} />
    </g>
  );
}

function Pier() {
  return (
    <g>
      <defs>
        <linearGradient id="pier-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#23232f" />
          <stop offset="100%" stopColor="#2c2a38" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#pier-sky)" />
      <rect y="280" width="800" height="170" fill="#0c0c16" />
      {/* Пароход у причала */}
      <rect x="300" y="200" width="440" height="80" fill="#07070d" />
      <rect x="360" y="150" width="300" height="50" fill="#07070d" />
      <rect x="430" y="105" width="22" height="45" fill="#07070d" />
      <rect x="500" y="105" width="22" height="45" fill="#07070d" />
      <circle cx="420" cy="175" r="3" fill="var(--color-accent)" opacity="0.8" />
      <circle cx="520" cy="175" r="3" fill="var(--color-accent)" opacity="0.6" />
      <circle cx="610" cy="175" r="3" fill="var(--color-accent)" opacity="0.8" />
      {/* Дебаркадер и трап */}
      <rect x="40" y="260" width="280" height="20" fill="#0a0810" />
      <rect x="70" y="280" width="14" height="90" fill="#0a0810" />
      <rect x="250" y="280" width="14" height="90" fill="#0a0810" />
      <polygon points="300,262 330,262 380,300 350,300" fill="#0a0810" />
      {/* Фонарь причала */}
      <rect x="120" y="180" width="6" height="80" fill="#05040a" />
      <circle cx="123" cy="172" r="8" fill="var(--color-accent)" opacity="0.85" />
      <circle cx="123" cy="172" r="20" fill="var(--color-accent)" opacity="0.12" />
      <Mist cx={400} cy={292} rx={400} ry={20} />
      <Mist cx={200} cy={250} rx={220} ry={14} opacity={0.05} />
    </g>
  );
}

function DeckEvening() {
  return (
    <g>
      <defs>
        <linearGradient id="de-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2038" />
          <stop offset="100%" stopColor="#4a3a4e" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#de-sky)" />
      <rect y="240" width="800" height="120" fill="#141424" />
      <rect y="240" width="800" height="3" fill="var(--color-border)" opacity="0.25" />
      <circle cx="150" cy="90" r="22" fill="#e8e6e1" opacity="0.5" />
      {/* Перила */}
      <rect y="350" width="800" height="100" fill="#0b0a12" />
      <rect x="0" y="330" width="800" height="6" fill="#05040a" />
      <rect x="60" y="336" width="6" height="60" fill="#05040a" />
      <rect x="220" y="336" width="6" height="60" fill="#05040a" />
      <rect x="380" y="336" width="6" height="60" fill="#05040a" />
      <rect x="540" y="336" width="6" height="60" fill="#05040a" />
      <rect x="700" y="336" width="6" height="60" fill="#05040a" />
      {/* Шезлонг */}
      <polygon points="480,410 620,410 640,370 560,360 480,390" fill="#070610" />
      <rect x="470" y="405" width="8" height="30" fill="#070610" />
      <rect x="610" y="405" width="8" height="30" fill="#070610" />
      <Mist cx={400} cy={250} rx={380} ry={14} opacity={0.05} />
    </g>
  );
}

function DeckNight() {
  return (
    <g>
      <rect width="800" height="450" fill="#06060e" />
      <rect y="300" width="800" height="150" fill="#030308" />
      {/* Звёзды */}
      <circle cx="90" cy="60" r="1.5" fill="#e8e6e1" opacity="0.7" />
      <circle cx="200" cy="110" r="1.5" fill="#e8e6e1" opacity="0.5" />
      <circle cx="320" cy="50" r="1.5" fill="#e8e6e1" opacity="0.8" />
      <circle cx="450" cy="90" r="1.5" fill="#e8e6e1" opacity="0.5" />
      <circle cx="560" cy="40" r="1.5" fill="#e8e6e1" opacity="0.7" />
      <circle cx="700" cy="120" r="1.5" fill="#e8e6e1" opacity="0.6" />
      <circle cx="760" cy="60" r="1.5" fill="#e8e6e1" opacity="0.5" />
      <circle cx="640" cy="160" r="1.5" fill="#e8e6e1" opacity="0.4" />
      {/* Перила */}
      <rect x="0" y="330" width="800" height="6" fill="#0a0912" />
      <rect x="100" y="336" width="6" height="50" fill="#0a0912" />
      <rect x="300" y="336" width="6" height="50" fill="#0a0912" />
      <rect x="500" y="336" width="6" height="50" fill="#0a0912" />
      <rect x="700" y="336" width="6" height="50" fill="#0a0912" />
      {/* Силуэт человека у борта */}
      <circle cx="410" cy="270" r="14" fill="#000000" opacity="0.9" />
      <rect x="396" y="284" width="28" height="52" fill="#000000" opacity="0.9" />
      <Mist cx={400} cy={310} rx={390} ry={16} opacity={0.05} />
    </g>
  );
}

function Salon({ night, day }: { night: boolean; day: boolean }) {
  const wall = night ? '#120a0e' : day ? '#241d20' : '#1a0f14';
  const windowFill = night ? '#0d1420' : day ? '#3a4250' : '#1e2a3a';
  const lampOpacity = night ? 0.75 : 0.4;
  return (
    <g>
      <rect width="800" height="450" fill={wall} />
      <rect width="800" height="60" fill={night ? '#0a0508' : '#0e080c'} />
      <rect y="380" width="800" height="70" fill="#0a0608" />
      <rect x="80" y="100" width="160" height="180" fill={windowFill} />
      <rect x="320" y="100" width="160" height="180" fill={windowFill} />
      <rect x="560" y="100" width="160" height="180" fill={windowFill} />
      <rect x="80" y="100" width="160" height="180" fill="none" stroke="var(--color-border)" strokeWidth="4" />
      <rect x="320" y="100" width="160" height="180" fill="none" stroke="var(--color-border)" strokeWidth="4" />
      <rect x="560" y="100" width="160" height="180" fill="none" stroke="var(--color-border)" strokeWidth="4" />
      <ellipse cx="400" cy="40" rx="50" ry="10" fill="var(--color-accent)" opacity={lampOpacity} />
      <ellipse cx="400" cy="40" rx="90" ry="20" fill="var(--color-accent)" opacity={lampOpacity / 4} />
      <rect x="120" y="300" width="80" height="70" fill="#0a0608" />
      <rect x="360" y="300" width="80" height="70" fill="#0a0608" />
      <rect x="600" y="300" width="80" height="70" fill="#0a0608" />
      {day && <rect x="80" y="280" width="640" height="100" fill="rgba(255,255,255,0.04)" />}
    </g>
  );
}

function CabinSimon() {
  return (
    <g>
      <rect width="800" height="450" fill="#12100e" />
      <rect y="360" width="800" height="90" fill="#0a0808" />
      {/* Иллюминатор */}
      <circle cx="620" cy="140" r="46" fill="#141c2a" />
      <circle cx="620" cy="140" r="46" fill="none" stroke="var(--color-border)" strokeWidth="6" />
      <rect x="617" y="94" width="6" height="92" fill="var(--color-border)" opacity="0.6" />
      {/* Койка */}
      <rect x="60" y="250" width="320" height="30" fill="#0d0b09" />
      <rect x="60" y="280" width="10" height="80" fill="#0d0b09" />
      <rect x="370" y="280" width="10" height="80" fill="#0d0b09" />
      <rect x="70" y="230" width="120" height="24" fill="#181411" />
      {/* Чемодан */}
      <rect x="440" y="330" width="110" height="60" fill="#0b0908" />
      <rect x="440" y="352" width="110" height="6" fill="var(--color-border)" opacity="0.4" />
      {/* Лампа */}
      <circle cx="200" cy="120" r="6" fill="var(--color-accent)" opacity="0.8" />
      <circle cx="200" cy="120" r="18" fill="var(--color-accent)" opacity="0.12" />
    </g>
  );
}

function CabinLina() {
  return (
    <g>
      <rect width="800" height="450" fill="#1c1016" />
      <rect y="370" width="800" height="80" fill="#100a0e" />
      {/* Койка с пологом */}
      <rect x="80" y="220" width="300" height="60" fill="#241019" />
      <rect x="80" y="180" width="300" height="10" fill="#0d080c" />
      <rect x="80" y="190" width="8" height="120" fill="#0d080c" />
      <rect x="372" y="190" width="8" height="120" fill="#0d080c" />
      {/* Туалетный столик */}
      <rect x="500" y="230" width="150" height="110" fill="#0f0a0d" />
      <rect x="520" y="120" width="110" height="110" fill="#2a3242" opacity="0.5" />
      <rect x="520" y="120" width="110" height="110" fill="none" stroke="var(--color-accent)" strokeWidth="3" opacity="0.5" />
      {/* Шкатулка */}
      <rect x="530" y="250" width="60" height="36" fill="#3a1e2a" />
      <rect x="530" y="262" width="60" height="4" fill="var(--color-accent)" opacity="0.5" />
      {/* Ткани/драпировка */}
      <polygon points="700,0 800,0 800,300 740,300" fill="#2a1420" opacity="0.7" />
      <circle cx="400" cy="60" r="8" fill="var(--color-accent)" opacity="0.7" />
      <circle cx="400" cy="60" r="22" fill="var(--color-accent)" opacity="0.1" />
    </g>
  );
}

function CabinJeanne() {
  return (
    <g>
      <rect width="800" height="450" fill="#101218" />
      <rect y="360" width="800" height="90" fill="#0a0b10" />
      {/* Окно со шторой */}
      <rect x="520" y="90" width="150" height="170" fill="#1a2434" />
      <rect x="520" y="90" width="150" height="170" fill="none" stroke="var(--color-border)" strokeWidth="4" />
      <polygon points="500,80 560,80 540,300 500,300" fill="#181c26" />
      {/* Койка */}
      <rect x="70" y="260" width="280" height="28" fill="#0c0d12" />
      <rect x="70" y="288" width="8" height="72" fill="#0c0d12" />
      <rect x="342" y="288" width="8" height="72" fill="#0c0d12" />
      {/* Стол и книга */}
      <rect x="420" y="320" width="140" height="10" fill="#0c0d12" />
      <rect x="470" y="330" width="8" height="30" fill="#0c0d12" />
      <rect x="450" y="306" width="56" height="14" fill="#22283a" />
      <rect x="476" y="306" width="4" height="14" fill="var(--color-border)" opacity="0.5" />
      <circle cx="180" cy="120" r="5" fill="var(--color-accent)" opacity="0.7" />
    </g>
  );
}

function CabinVanskaya() {
  return (
    <g>
      <rect width="800" height="450" fill="#110f0d" />
      <rect y="360" width="800" height="90" fill="#0a0908" />
      {/* Распятие на стене */}
      <rect x="392" y="70" width="16" height="90" fill="#2a231c" />
      <rect x="368" y="96" width="64" height="14" fill="#2a231c" />
      {/* Койка, застеленная аккуратно */}
      <rect x="90" y="250" width="260" height="26" fill="#0d0c0a" />
      <rect x="90" y="276" width="8" height="84" fill="#0d0c0a" />
      <rect x="342" y="276" width="8" height="84" fill="#0d0c0a" />
      <rect x="100" y="236" width="90" height="16" fill="#161411" />
      {/* Комод и платок */}
      <rect x="520" y="270" width="150" height="90" fill="#0d0c0a" />
      <rect x="520" y="300" width="150" height="4" fill="var(--color-border)" opacity="0.35" />
      <polygon points="560,258 640,258 650,272 550,272" fill="#241a20" />
      {/* Лампада */}
      <circle cx="400" cy="185" r="4" fill="var(--color-accent)" opacity="0.8" />
      <circle cx="400" cy="185" r="12" fill="var(--color-accent)" opacity="0.12" />
    </g>
  );
}

function CabinLouise() {
  return (
    <g>
      <rect width="800" height="450" fill="#0e0d0c" />
      <rect y="370" width="800" height="80" fill="#080706" />
      {/* Узкая койка */}
      <rect x="60" y="270" width="200" height="22" fill="#0c0b0a" />
      <rect x="60" y="292" width="6" height="78" fill="#0c0b0a" />
      <rect x="254" y="292" width="6" height="78" fill="#0c0b0a" />
      <rect x="66" y="256" width="60" height="16" fill="#141210" />
      {/* Табурет и Библия */}
      <rect x="330" y="330" width="70" height="8" fill="#0c0b0a" />
      <rect x="338" y="338" width="6" height="32" fill="#0c0b0a" />
      <rect x="386" y="338" width="6" height="32" fill="#0c0b0a" />
      <rect x="340" y="316" width="44" height="12" fill="#1c1712" />
      {/* Свеча */}
      <rect x="560" y="300" width="8" height="30" fill="#1a1712" />
      <circle cx="564" cy="292" r="5" fill="var(--color-accent)" opacity="0.85" />
      <circle cx="564" cy="292" r="16" fill="var(--color-accent)" opacity="0.1" />
      {/* Полка */}
      <rect x="500" y="180" width="160" height="6" fill="#0c0b0a" />
    </g>
  );
}

function CabinOtterborn() {
  return (
    <g>
      <rect width="800" height="450" fill="#131016" />
      <rect y="360" width="800" height="90" fill="#0b090d" />
      {/* Письменный стол */}
      <rect x="420" y="280" width="260" height="12" fill="#0e0c10" />
      <rect x="440" y="292" width="10" height="70" fill="#0e0c10" />
      <rect x="650" y="292" width="10" height="70" fill="#0e0c10" />
      {/* Стопка блокнотов */}
      <rect x="470" y="252" width="70" height="10" fill="#241f2c" />
      <rect x="474" y="242" width="70" height="10" fill="#2b2434" />
      <rect x="470" y="232" width="70" height="10" fill="#241f2c" />
      {/* Перо и чернильница */}
      <rect x="590" y="262" width="16" height="18" fill="#08070a" />
      <line x1="598" y1="262" x2="626" y2="230" stroke="var(--color-border)" strokeWidth="3" />
      {/* Койка */}
      <rect x="70" y="260" width="240" height="26" fill="#0d0b10" />
      <rect x="70" y="286" width="8" height="74" fill="#0d0b10" />
      <rect x="302" y="286" width="8" height="74" fill="#0d0b10" />
      <circle cx="200" cy="110" r="6" fill="var(--color-accent)" opacity="0.75" />
      <circle cx="200" cy="110" r="18" fill="var(--color-accent)" opacity="0.1" />
    </g>
  );
}

function Infirmary() {
  return (
    <g>
      <rect width="800" height="450" fill="#0f1211" />
      <rect y="360" width="800" height="90" fill="#090b0a" />
      {/* Кушетка */}
      <rect x="120" y="250" width="300" height="26" fill="#141816" />
      <rect x="120" y="276" width="10" height="84" fill="#141816" />
      <rect x="410" y="276" width="10" height="84" fill="#141816" />
      <rect x="132" y="232" width="80" height="20" fill="#1b201e" />
      {/* Шкаф с медикаментами */}
      <rect x="560" y="140" width="150" height="220" fill="#0c0f0e" />
      <rect x="560" y="140" width="150" height="220" fill="none" stroke="var(--color-border)" strokeWidth="4" />
      <rect x="560" y="250" width="150" height="4" fill="var(--color-border)" opacity="0.5" />
      <rect x="586" y="170" width="18" height="44" fill="#18222a" />
      <rect x="616" y="180" width="18" height="34" fill="#22182a" opacity="0.8" />
      {/* Лампа — тусклая */}
      <circle cx="300" cy="90" r="6" fill="var(--color-accent)" opacity="0.45" />
      <circle cx="300" cy="90" r="20" fill="var(--color-accent)" opacity="0.08" />
    </g>
  );
}

function DeckDay() {
  return (
    <g>
      <defs>
        <linearGradient id="dd-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a3f48" />
          <stop offset="100%" stopColor="#4a4f58" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#dd-sky)" />
      <rect y="250" width="800" height="110" fill="#232830" />
      <rect y="250" width="800" height="3" fill="var(--color-border)" opacity="0.3" />
      {/* Облачность */}
      <ellipse cx="200" cy="80" rx="120" ry="18" fill="rgba(255,255,255,0.08)" />
      <ellipse cx="560" cy="120" rx="150" ry="20" fill="rgba(255,255,255,0.06)" />
      {/* Палуба */}
      <rect y="360" width="800" height="90" fill="#17161c" />
      <rect x="0" y="340" width="800" height="6" fill="#0d0c11" />
      <rect x="120" y="346" width="6" height="40" fill="#0d0c11" />
      <rect x="320" y="346" width="6" height="40" fill="#0d0c11" />
      <rect x="520" y="346" width="6" height="40" fill="#0d0c11" />
      <rect x="700" y="346" width="6" height="40" fill="#0d0c11" />
      {/* Труба парохода */}
      <rect x="640" y="180" width="30" height="120" fill="#0b0a0f" />
      <rect x="640" y="200" width="30" height="14" fill="var(--color-border)" opacity="0.3" />
    </g>
  );
}

function Corridor() {
  return (
    <g>
      <rect width="800" height="450" fill="#0e0c10" />
      <polygon points="0,0 800,0 500,200 300,200" fill="#16121a" />
      <polygon points="0,450 800,450 500,250 300,250" fill="#0a080c" />
      <polygon points="0,0 300,200 300,250 0,450" fill="#1a1520" />
      <polygon points="800,0 500,200 500,250 800,450" fill="#1a1520" />
      <rect x="300" y="200" width="200" height="50" fill="#050308" />
      <rect x="60" y="120" width="40" height="200" fill="#050308" />
      <rect x="180" y="140" width="35" height="160" fill="#050308" />
      <rect x="700" y="120" width="40" height="200" fill="#050308" />
      <rect x="585" y="140" width="35" height="160" fill="#050308" />
      <circle cx="400" cy="130" r="6" fill="var(--color-accent)" opacity="0.8" />
      <circle cx="400" cy="130" r="20" fill="var(--color-accent)" opacity="0.15" />
    </g>
  );
}

function Court() {
  return (
    <g>
      <rect width="800" height="450" fill="#12100d" />
      <rect y="380" width="800" height="70" fill="#0a0908" />
      {/* Стены-панели */}
      <rect x="40" y="60" width="120" height="280" fill="#181511" />
      <rect x="640" y="60" width="120" height="280" fill="#181511" />
      {/* Эстрада судьи */}
      <rect x="300" y="120" width="200" height="120" fill="#0d0c0a" />
      <rect x="310" y="80" width="180" height="40" fill="#141210" />
      {/* Силуэт судьи */}
      <circle cx="400" cy="150" r="20" fill="#050404" />
      <rect x="376" y="170" width="48" height="60" fill="#050404" />
      {/* Скамьи */}
      <rect x="120" y="300" width="220" height="16" fill="#0c0b09" />
      <rect x="140" y="316" width="10" height="50" fill="#0c0b09" />
      <rect x="310" y="316" width="10" height="50" fill="#0c0b09" />
      <rect x="470" y="300" width="220" height="16" fill="#0c0b09" />
      <rect x="490" y="316" width="10" height="50" fill="#0c0b09" />
      <rect x="660" y="316" width="10" height="50" fill="#0c0b09" />
      {/* Свет сверху */}
      <polygon points="340,0 460,0 500,120 300,120" fill="rgba(255,255,255,0.05)" />
    </g>
  );
}

function Office() {
  return (
    <g>
      <rect width="800" height="450" fill="#101113" />
      <rect y="370" width="800" height="80" fill="#0a0b0c" />
      {/* Окно со шторами */}
      <rect x="520" y="80" width="180" height="200" fill="#1c2430" />
      <rect x="520" y="80" width="180" height="200" fill="none" stroke="var(--color-border)" strokeWidth="5" />
      <rect x="500" y="70" width="30" height="230" fill="#15161a" />
      <rect x="690" y="70" width="30" height="230" fill="#15161a" />
      {/* Писательский стол */}
      <rect x="100" y="280" width="320" height="16" fill="#0d0e10" />
      <rect x="120" y="296" width="12" height="80" fill="#0d0e10" />
      <rect x="390" y="296" width="12" height="80" fill="#0d0e10" />
      {/* Машинка — силуэт */}
      <rect x="180" y="240" width="120" height="40" fill="#07080a" />
      <rect x="200" y="222" width="80" height="18" fill="#07080a" />
      {/* Папки на стеллаже */}
      <rect x="60" y="90" width="220" height="10" fill="#0d0e10" />
      <rect x="80" y="52" width="16" height="38" fill="#1a1d24" />
      <rect x="102" y="46" width="16" height="44" fill="#221d1a" />
      <rect x="124" y="56" width="16" height="34" fill="#1a1d24" />
      <rect x="146" y="50" width="16" height="40" fill="#1d221a" />
      {/* Лампа на столе */}
      <circle cx="360" cy="250" r="6" fill="var(--color-accent)" opacity="0.8" />
      <circle cx="360" cy="250" r="18" fill="var(--color-accent)" opacity="0.12" />
    </g>
  );
}

function Credits() {
  return (
    <g>
      <defs>
        <linearGradient id="cr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#232a3a" />
          <stop offset="100%" stopColor="#4a4050" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#cr-sky)" />
      <rect y="280" width="800" height="170" fill="#14161f" />
      {/* Рассветное свечение */}
      <circle cx="400" cy="240" r="60" fill="rgba(255,255,255,0.08)" />
      <circle cx="400" cy="240" r="26" fill="rgba(255,255,255,0.25)" />
      {/* Пароход вдали */}
      <rect x="560" y="252" width="120" height="18" fill="#0a0a10" />
      <rect x="590" y="236" width="60" height="16" fill="#0a0a10" />
      <rect x="608" y="220" width="10" height="16" fill="#0a0a10" />
      <rect x="628" y="220" width="10" height="16" fill="#0a0a10" />
      {/* Отблеск воды */}
      <rect x="360" y="290" width="80" height="3" fill="rgba(255,255,255,0.12)" />
      <rect x="370" y="310" width="60" height="3" fill="rgba(255,255,255,0.08)" />
      <Mist cx={400} cy={285} rx={400} ry={22} opacity={0.08} />
      <Mist cx={250} cy={320} rx={260} ry={16} opacity={0.05} />
    </g>
  );
}

function DefaultScene() {
  return (
    <g>
      <defs>
        <linearGradient id="def-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#101018" />
          <stop offset="100%" stopColor="#1a1a24" />
        </linearGradient>
      </defs>
      <rect width="800" height="450" fill="url(#def-sky)" />
      <Mist cx={400} cy={340} rx={400} ry={24} opacity={0.05} />
      <Mist cx={300} cy={380} rx={300} ry={16} opacity={0.04} />
    </g>
  );
}
