import { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useSectionProgress } from '../hooks/useSectionProgress';
import { audio } from '../audio/engine';

const STATS = [
  { label: '標高', value: '2,840m' },
  { label: '気温', value: '−8°C' },
  { label: '積雪', value: '210cm' },
];

// Staggered entrance for the hero lines.
const rise = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 * i, duration: 1.1, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

// ヒーロー自身がどれだけ画面外へスクロールしたか(0=画面いっぱい、1=完全に通過)
const measureHero = (rect: DOMRect) => -rect.top / rect.height;

export default function Hero() {
  // スクロールでテキストを浮かせながらフェードアウトし、画面は山に明け渡す。
  const ref = useRef<HTMLElement>(null);
  const progress = useSectionProgress(ref, measureHero);
  const opacity = useTransform(progress, [0, 0.6], [1, 0]);
  const y = useTransform(progress, [0, 0.6], [0, -80]);

  return (
    <section className="hero" ref={ref}>
      <motion.div className="hero-inner" style={{ opacity, y }}>
        <motion.p className="hero-kicker" variants={rise} initial="hidden" animate="visible" custom={0}>
          山脈の、最果てへ。
        </motion.p>

        <motion.h1 className="hero-title" variants={rise} initial="hidden" animate="visible" custom={1}>
          NOVA
          <br />
          RIDGE
        </motion.h1>

        <motion.div className="hero-copy" variants={rise} initial="hidden" animate="visible" custom={2}>
          <p className="hero-tagline">CHASE THE WHITE.</p>
          <p className="hero-sub">白を追え。ありふれた冬の、その先へ。</p>
        </motion.div>

        <motion.div className="hero-bottom" variants={rise} initial="hidden" animate="visible" custom={3}>
          <dl className="stats">
            {STATS.map((s) => (
              <div className="stat" key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>

          <a className="cta" href="#experiences" onClick={() => audio.playClick()}>
            山を探索する
            <span className="cta-line" aria-hidden="true" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
