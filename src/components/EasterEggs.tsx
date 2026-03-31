import { useEffect, useRef, useState } from 'react';

/* ─── data ─── */
const TRICKS = [
  'KICKFLIP', '900°', 'MCTWIST', 'DARKSLIDE',
  'NOSEGRIND', 'HEELFLIP', 'VARIAL FLIP', 'INDY GRAB',
  'CROOKED GRIND', 'LASER FLIP', '720°', 'HOSPITAL FLIP',
  'HARDFLIP', 'NOLLIE FLIP', 'IMPOSSIBLE', 'PRESSURE FLIP',
  'BLUNTSLIDE', 'CINCO', 'LATE KICKFLIP', '1080°',
];

const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

const COLORS = ['#FF0000','#FFB8FF','#00FFFF','#FFB852','#FFD700','#ff6188','#fc9867'];

const MARQUEE_TEXT =
  '★ WELCOME TO ARYAAN\'S PAGE ★ AIM: sk8r_aryaan ★ BEST VIEWED IN INTERNET EXPLORER 6.0 AT 800×600 ★ SIGN MY GUESTBOOK ★ NO HOTLINKING PLZ ★ LAST UPDATED 03.31.2003 ★ PLEASE DON\'T STEAL MY LAYOUTS ★ UNDER CONSTRUCTION 🚧 ★ THIS SITE IS FRAMES-FREE ★ THANKS 4 VISITING ★ ADD ME ON MSN ★ CLICK HERE TO ENTER ★ SITE OF THE MONTH ★ '.repeat(2);

/* ─── component ─── */
export default function EasterEggs() {
  const [trick,   setTrick]   = useState<{ text: string; x: number; y: number; id: number } | null>(null);
  const [konami,  setKonami]  = useState(false);
  const [visits,  setVisits]  = useState(0);
  const [aimOpen, setAimOpen] = useState(false);

  const konamiSeq  = useRef<string[]>([]);
  const rafRef     = useRef<number>(0);
  const trickTimer = useRef<ReturnType<typeof setTimeout>>();
  const trickId    = useRef(0);

  /* visitor counter */
  useEffect(() => {
    const n = parseInt(localStorage.getItem('_vc') || '0') + 1;
    localStorage.setItem('_vc', String(n));
    setVisits(n);
  }, []);

  /* AIM popup — appears after ~10 seconds */
  useEffect(() => {
    const t = setTimeout(() => setAimOpen(true), 10000);
    return () => clearTimeout(t);
  }, []);

  /* pixel cursor trail — canvas, zero React re-renders */
  useEffect(() => {
    const cvs = document.createElement('canvas');
    cvs.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9994;';
    cvs.width  = window.innerWidth;
    cvs.height = window.innerHeight;
    document.body.appendChild(cvs);
    const ctx = cvs.getContext('2d')!;

    const trail: { x: number; y: number; color: string; born: number }[] = [];

    const onMove = (e: MouseEvent) => {
      trail.push({
        x: e.clientX,
        y: e.clientY,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
        born: Date.now(),
      });
    };
    window.addEventListener('mousemove', onMove);

    const draw = () => {
      ctx.clearRect(0, 0, cvs.width, cvs.height);
      const now = Date.now();
      for (let i = trail.length - 1; i >= 0; i--) {
        const p = trail[i]!;
        const age = now - p.born;
        if (age > 480) { trail.splice(i, 1); continue; }
        ctx.globalAlpha = (1 - age / 480) * 0.7;
        ctx.fillStyle   = p.color;
        ctx.fillRect(p.x - 3, p.y - 3, 6, 6);
      }
      ctx.globalAlpha   = 1;
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    const onResize = () => { cvs.width = window.innerWidth; cvs.height = window.innerHeight; };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(rafRef.current);
      document.body.removeChild(cvs);
    };
  }, []);

  /* THPS-style trick name popups */
  useEffect(() => {
    const schedule = () => {
      trickTimer.current = setTimeout(() => {
        const t = TRICKS[Math.floor(Math.random() * TRICKS.length)]!;
        const x = 6  + Math.random() * 52;
        const y = 12 + Math.random() * 65;
        setTrick({ text: t, x, y, id: trickId.current++ });
        setTimeout(() => setTrick(null), 2400);
        schedule();
      }, 7000 + Math.random() * 9000);
    };
    schedule();
    return () => clearTimeout(trickTimer.current);
  }, []);

  /* Konami code */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      konamiSeq.current = [...konamiSeq.current, e.key].slice(-KONAMI.length);
      if (konamiSeq.current.join(',') === KONAMI.join(',')) {
        setKonami(true);
        setTimeout(() => setKonami(false), 3800);
        konamiSeq.current = [];
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      {/* ── Scrolling marquee ── */}
      <div className="y2k-marquee" aria-hidden>
        <span className="y2k-marquee-track">{MARQUEE_TEXT}</span>
      </div>

      {/* ── AIM away-message popup ── */}
      {aimOpen && (
        <div className="aim-window">
          <div className="aim-titlebar">
            <span className="aim-titlebar-text">💬 Instant Message</span>
            <button className="aim-x" onClick={() => setAimOpen(false)} aria-label="Close">✕</button>
          </div>
          <div className="aim-screenname">sk8r_aryaan</div>
          <div className="aim-chat">
            <div className="aim-away-line">
              <span className="aim-away-dot">●</span>
              <strong>sk8r_aryaan</strong>&nbsp;is&nbsp;<em>away</em>.
            </div>
            <div className="aim-auto-response">
              Auto Response: "grindin rails + code. back l8r ✌"
            </div>
            <div className="aim-timestamp">3:47 PM</div>
          </div>
          <div className="aim-input-mock-row">
            <div className="aim-input-mock" />
          </div>
          <div className="aim-button-row">
            <button className="aim-btn">Send</button>
            <button className="aim-btn">Warn</button>
            <button className="aim-btn" onClick={() => setAimOpen(false)}>Close</button>
          </div>
        </div>
      )}

      {/* ── THPS trick popup ── */}
      {trick && (
        <div
          key={trick.id}
          style={{
            position: 'fixed',
            left: `${trick.x}vw`,
            top:  `${trick.y}vh`,
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '10px',
            color: '#FFD700',
            textShadow: '0 0 12px rgba(255,215,0,0.9), 0 0 24px rgba(255,215,0,0.4)',
            zIndex: 9994,
            pointerEvents: 'none',
            animation: 'trick-pop 2.4s ease-out forwards',
            whiteSpace: 'nowrap',
          }}
        >
          {trick.text}
        </div>
      )}

      {/* ── Konami overlay ── */}
      {konami && (
        <div className="konami-overlay">
          <div className="konami-stars">★ ★ ★ ★ ★</div>
          <div className="konami-title">CHEAT CODE<br />ACTIVATED</div>
          <div className="konami-perks">
            + INFINITE LIVES<br />
            + UNLIMITED CONTINUES<br />
            + GOD MODE ENABLED
          </div>
          <div className="konami-code">↑↑↓↓←→←→BA</div>
        </div>
      )}

      {/* ── Y2K visitor counter ── */}
      <div className="visitor-counter" aria-hidden>
        <span className="visitor-label">YOU ARE VISITOR</span>
        <span className="visitor-number">#{String(visits).padStart(6, '0')}</span>
      </div>

      <style>{`
        /* ── Marquee ── */
        .y2k-marquee {
          position: fixed;
          top: 52px;
          left: 0;
          right: 0;
          overflow: hidden;
          height: 16px;
          z-index: 9992;
          pointer-events: none;
          display: flex;
          align-items: center;
          border-bottom: 1px solid rgba(255, 215, 0, 0.07);
        }

        .y2k-marquee-track {
          white-space: nowrap;
          font-family: 'Press Start 2P', monospace;
          font-size: 5px;
          color: rgba(255, 215, 0, 0.32);
          letter-spacing: 0.04em;
          animation: marquee-scroll 70s linear infinite;
          will-change: transform;
        }

        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        /* ── AIM window ── */
        .aim-window {
          position: fixed;
          bottom: 5.5rem;
          left: 1.4rem;
          width: 220px;
          background: #07070d;
          border: 1px solid rgba(0, 255, 255, 0.28);
          z-index: 9996;
          font-family: 'IBM Plex Mono', monospace;
          box-shadow:
            0 0 0 1px rgba(0,0,0,0.8),
            0 0 24px rgba(0, 255, 255, 0.12),
            0 8px 32px rgba(0,0,0,0.7);
          animation: aim-rise 0.28s ease-out;
        }

        @keyframes aim-rise {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }

        .aim-titlebar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 5px 7px;
          background: linear-gradient(90deg, rgba(0,255,255,0.1) 0%, rgba(255,100,136,0.06) 100%);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }

        .aim-titlebar-text {
          font-size: 7.5px;
          color: rgba(255,255,255,0.6);
          letter-spacing: 0.02em;
        }

        .aim-x {
          background: none;
          border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.45);
          width: 14px;
          height: 14px;
          font-size: 7px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          line-height: 1;
          flex-shrink: 0;
        }
        .aim-x:hover { background: rgba(255,100,136,0.25); color: #fff; }

        .aim-screenname {
          padding: 7px 9px 5px;
          font-size: 11px;
          font-weight: 600;
          color: #00FFFF;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          letter-spacing: 0.02em;
        }

        .aim-chat {
          padding: 9px;
          min-height: 68px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .aim-away-line {
          font-size: 7.5px;
          color: rgba(255,184,82,0.9);
          margin-bottom: 7px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .aim-away-dot {
          font-size: 5px;
          color: #fc9867;
        }

        .aim-auto-response {
          font-size: 7.5px;
          color: rgba(253,249,243,0.5);
          line-height: 1.7;
          font-style: italic;
          padding-left: 10px;
          border-left: 2px solid rgba(0,255,255,0.2);
        }

        .aim-timestamp {
          font-size: 6px;
          color: rgba(255,255,255,0.2);
          text-align: right;
          margin-top: 6px;
        }

        .aim-input-mock-row {
          padding: 5px 7px 0;
        }

        .aim-input-mock {
          height: 26px;
          border: 1px solid rgba(255,255,255,0.09);
          background: rgba(255,255,255,0.02);
        }

        .aim-button-row {
          display: flex;
          gap: 4px;
          padding: 5px 7px 7px;
        }

        .aim-btn {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 6.5px;
          padding: 3px 7px;
          background: rgba(0,255,255,0.06);
          border: 1px solid rgba(0,255,255,0.2);
          color: rgba(0,255,255,0.65);
          cursor: pointer;
          letter-spacing: 0.03em;
        }
        .aim-btn:hover {
          background: rgba(0,255,255,0.14);
          color: #00FFFF;
        }

        /* ── Trick pop ── */
        @keyframes trick-pop {
          0%   { opacity: 0; transform: scale(0.6) translateY(8px);   }
          12%  { opacity: 1; transform: scale(1.1) translateY(0);     }
          60%  { opacity: 1; transform: scale(1)   translateY(0);     }
          100% { opacity: 0; transform: scale(0.9) translateY(-12px); }
        }

        /* ── Konami ── */
        @keyframes konami-in {
          from { opacity: 0; transform: scale(1.05); }
          to   { opacity: 1; transform: scale(1);    }
        }

        .konami-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: rgba(0, 0, 0, 0.94);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1.6rem;
          font-family: 'Press Start 2P', monospace;
          pointer-events: none;
          animation: konami-in 0.2s ease-out;
        }

        .konami-stars {
          font-size: 8px;
          color: #fc9867;
          letter-spacing: 0.18em;
        }

        .konami-title {
          font-size: 15px;
          color: #FFD700;
          text-shadow: 0 0 28px rgba(255,215,0,0.95), 0 0 60px rgba(255,215,0,0.3);
          text-align: center;
          line-height: 2.2;
        }

        .konami-perks {
          font-size: 8px;
          color: #00FFFF;
          text-shadow: 0 0 10px rgba(0,255,255,0.7);
          line-height: 3;
          text-align: center;
        }

        .konami-code {
          font-size: 6px;
          color: rgba(255,255,255,0.25);
          letter-spacing: 0.1em;
          margin-top: 0.4rem;
        }

        /* ── Visitor counter ── */
        .visitor-counter {
          position: fixed;
          bottom: 4.6rem;
          right: 1.5rem;
          font-family: 'Press Start 2P', monospace;
          font-size: 5.5px;
          z-index: 9993;
          pointer-events: none;
          text-align: right;
          line-height: 2.2;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .visitor-label  { color: rgba(255,255,255,0.18); letter-spacing: 0.06em; }
        .visitor-number { font-size: 8px; color: rgba(0,255,255,0.28); letter-spacing: 0.04em; }
      `}</style>
    </>
  );
}
