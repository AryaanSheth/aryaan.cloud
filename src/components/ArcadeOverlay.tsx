import { useEffect, useRef, useState } from 'react';

/* ─── config ─── */
const GHOST_CONFIGS = [
  { color: '#FF0000', glow: 'rgba(255,0,0,0.45)'      },
  { color: '#FFB8FF', glow: 'rgba(255,184,255,0.45)'  },
  { color: '#00FFFF', glow: 'rgba(0,255,255,0.45)'    },
  { color: '#FFB852', glow: 'rgba(255,184,82,0.45)'   },
] as const;

// Spread entities across screen quadrants so they start far apart
const START_ZONES = [
  { fx: 0.08,  fy: 0.12 },  // Blinky  — top-left
  { fx: 0.72,  fy: 0.10 },  // Pinky   — top-right
  { fx: 0.08,  fy: 0.62 },  // Inky    — bottom-left
  { fx: 0.72,  fy: 0.60 },  // Clyde   — bottom-right
  { fx: 0.44,  fy: 0.36 },  // Pac-Man — centre
];

const ENTITY_W   = 80;   // px — ghost width  (display size)
const ENTITY_H   = 90;   // px — ghost height
const PAC_SIZE   = 76;   // px — pac-man diameter
const STEP_PX    = 6;    // pixels moved per frame (grid step)
const FPS        = 12;   // retro update rate

// Stable scattered dot positions
const DOTS = Array.from({ length: 32 }, (_, i) => ({
  left:  `${((i * 41 + 13) % 84) + 7}vw`,
  top:   `${((i * 29 + 7)  % 74) + 12}vh`,
  delay: `${((i * 0.37) % 4).toFixed(2)}s`,
}));

/* ─── retro entity ─── */
type Dir = -1 | 0 | 1;
interface RetroE {
  x: number; y: number;   // current px position
  dx: Dir;   dy: Dir;     // cardinal direction (only one non-zero at a time)
  facing: 1 | -1;         // last horizontal facing (for sprite flip)
  steps: number;
  maxSteps: number;
  speed: number;
}

const DIRS: [Dir, Dir][] = [[ 1,0],[-1,0],[0, 1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
function randDir(): [Dir, Dir] { return DIRS[Math.floor(Math.random() * DIRS.length)]!; }

function mkEntity(speedBase: number, zone?: { fx: number; fy: number }): RetroE {
  const [dx, dy] = randDir();
  const x = zone
    ? (zone.fx * window.innerWidth)  + (Math.random() - 0.5) * 80
    : Math.random() * (window.innerWidth  - ENTITY_W);
  const y = zone
    ? (zone.fy * window.innerHeight) + (Math.random() - 0.5) * 80
    : Math.random() * (window.innerHeight - ENTITY_H);
  return {
    x: Math.max(0, Math.min(x, window.innerWidth  - ENTITY_W)),
    y: Math.max(0, Math.min(y, window.innerHeight - ENTITY_H)),
    dx, dy,
    facing: dx >= 0 ? 1 : -1,
    steps: 0,
    // Long straight runs so each entity sweeps a large chunk of screen
    maxSteps: 55 + Math.floor(Math.random() * 75),
    speed: speedBase + Math.random() * 2,
  };
}

function stepRetroE(e: RetroE) {
  const maxX = window.innerWidth  - ENTITY_W;
  const maxY = window.innerHeight - ENTITY_H;

  e.x += e.dx * e.speed;
  e.y += e.dy * e.speed;
  e.steps++;

  // Bounce — pick a new cardinal direction aimed away from the wall
  if (e.x <= 0)    { e.x = 0;    e.dx =  1; e.dy = 0; e.steps = 0; }
  if (e.x >= maxX) { e.x = maxX; e.dx = -1; e.dy = 0; e.steps = 0; }
  if (e.y <= 0)    { e.y = 0;    e.dx = 0;  e.dy =  1 as Dir; e.steps = 0; }
  if (e.y >= maxY) { e.y = maxY; e.dx = 0;  e.dy = -1 as Dir; e.steps = 0; }

  // Periodic direction change — new long straight run
  if (e.steps >= e.maxSteps) {
    const [dx, dy] = randDir();
    e.dx = dx; e.dy = dy;
    e.steps = 0;
    e.maxSteps = 55 + Math.floor(Math.random() * 75);
  }

  if (e.dx !== 0) e.facing = e.dx > 0 ? 1 : -1;
}

/* ─── SVG components ─── */
function GhostSvg({ color, w, h }: { color: string; w: number; h: number }) {
  return (
    <svg viewBox="0 0 14 16" width={w} height={h} aria-hidden>
      <path
        d="M1,16 L1,7 C1,3 3,1 7,1 C11,1 13,3 13,7 L13,16
           Q11.5,13.5 10,16 Q8.5,13.5 7,16
           Q5.5,13.5  4,16 Q2.5,13.5  1,16 Z"
        fill={color}
      />
      <ellipse cx="4.5" cy="7"   rx="2"   ry="2.5" fill="white" />
      <ellipse cx="9.5" cy="7"   rx="2"   ry="2.5" fill="white" />
      <circle  cx="5.2" cy="7.5" r="1.2"           fill="#1a1aff" />
      <circle  cx="10.2" cy="7.5" r="1.2"          fill="#1a1aff" />
    </svg>
  );
}

function PacManSvg({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden>
      <path className="pac-upper" d="M1,10 A9,9 0 0,1 19,10 L10,10 Z" fill="#FFD700" />
      <path className="pac-lower" d="M1,10 A9,9 0 0,0 19,10 L10,10 Z" fill="#FFD700" />
    </svg>
  );
}

function Invader({ color = 'rgba(255,255,255,0.2)' }: { color?: string }) {
  return (
    <svg viewBox="0 0 11 8" width="24" height="18" aria-hidden>
      <rect x="3" y="0" width="1" height="1" fill={color}/>
      <rect x="7" y="0" width="1" height="1" fill={color}/>
      <rect x="2" y="1" width="7" height="1" fill={color}/>
      <rect x="1" y="2" width="9" height="1" fill={color}/>
      <rect x="0" y="3" width="2" height="1" fill={color}/>
      <rect x="2" y="3" width="7" height="1" fill={color}/>
      <rect x="9" y="3" width="2" height="1" fill={color}/>
      <rect x="1" y="4" width="9" height="1" fill={color}/>
      <rect x="0" y="5" width="3" height="1" fill={color}/>
      <rect x="8" y="5" width="3" height="1" fill={color}/>
      <rect x="0" y="6" width="1" height="1" fill={color}/>
      <rect x="2" y="6" width="1" height="1" fill={color}/>
      <rect x="8" y="6" width="1" height="1" fill={color}/>
      <rect x="10" y="6" width="1" height="1" fill={color}/>
    </svg>
  );
}

function PacIcon({ color = '#FFD700' }: { color?: string }) {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden>
      <path d="M10,10 L19,5 A9,9 0 1,0 19,15 Z" fill={color} />
    </svg>
  );
}

function ScoreTicker() {
  const [score, setScore] = useState(0);
  useEffect(() => {
    const id = setInterval(
      () => setScore(s => (s >= 99999 ? 0 : s + Math.floor(Math.random() * 350 + 50))),
      120,
    );
    return () => clearInterval(id);
  }, []);
  return <>{String(score).padStart(6, '0')}</>;
}

/* ─── main ─── */
export default function ArcadeOverlay() {
  const [coinVisible, setCoinVisible] = useState(true);
  const ghostEls = useRef<(HTMLDivElement | null)[]>([]);
  const pacEl    = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = setInterval(() => setCoinVisible(v => !v), 550);
    return () => clearInterval(id);
  }, []);

  // Retro stepped movement — setInterval at 8 fps, cardinal directions only
  useEffect(() => {
    const ghosts = GHOST_CONFIGS.map((_, i) => mkEntity(STEP_PX + i, START_ZONES[i]));
    const pac    = mkEntity(STEP_PX + 2, START_ZONES[4]);

    const tick = () => {
      ghosts.forEach((g, i) => {
        stepRetroE(g);
        const el = ghostEls.current[i];
        if (!el) return;
        const flip = g.facing < 0 ? ' scaleX(-1)' : '';
        el.style.transform = `translate(${Math.round(g.x)}px, ${Math.round(g.y)}px)${flip}`;
      });

      stepRetroE(pac);
      if (pacEl.current) {
        const flip = pac.facing < 0 ? ' scaleX(-1)' : '';
        pacEl.current.style.transform =
          `translate(${Math.round(pac.x)}px, ${Math.round(pac.y)}px)${flip}`;
      }
    };

    const id = setInterval(tick, 1000 / FPS);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="screen-glass" aria-hidden />

      {/* Scattered pac-dots */}
      <div className="pac-dots-field" aria-hidden>
        {DOTS.map((d, i) => (
          <span key={i} className="pac-dot"
            style={{ left: d.left, top: d.top, animationDelay: d.delay }}
          />
        ))}
      </div>

      {/* Pac-Man */}
      <div ref={pacEl} className="arcade-entity pac-entity" aria-hidden>
        <PacManSvg size={PAC_SIZE} />
      </div>

      {/* Ghosts */}
      {GHOST_CONFIGS.map((cfg, i) => (
        <div
          key={i}
          ref={el => { ghostEls.current[i] = el; }}
          className="arcade-entity ghost-entity"
          style={{ filter: `drop-shadow(0 0 12px ${cfg.glow})` }}
          aria-hidden
        >
          <GhostSvg color={cfg.color} w={ENTITY_W} h={ENTITY_H} />
        </div>
      ))}

      {/* HUD */}
      <div className="arcade-hud" aria-hidden>
        <div className="arcade-hud-col">
          <span className="arcade-label">1UP</span>
          <span className="arcade-value"><ScoreTicker /></span>
        </div>
        <div className="arcade-hud-col">
          <span className="arcade-label">HI-SCORE</span>
          <span className="arcade-value" style={{ color: '#ff6188' }}>099999</span>
        </div>
        <div className="arcade-hud-col">
          <span className="arcade-label">CREDIT</span>
          <span className="arcade-value">0</span>
        </div>
      </div>

      {/* Corners */}
      <div className="screen-corners" aria-hidden>
        <span className="corner corner-tl"><Invader /></span>
        <span className="corner corner-tr"><Invader /></span>
        <span className="corner corner-bl"><PacIcon /></span>
        <span className="corner corner-br"><PacIcon color="#ff6188" /></span>
      </div>

      <p className="arcade-coin"   aria-hidden style={{ opacity: coinVisible ? 1 : 0 }}>— INSERT COIN —</p>
      <p className="arcade-player" aria-hidden>PLAYER 1</p>
    </>
  );
}
