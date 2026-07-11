import { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useSectionProgress } from '../hooks/useSectionProgress';
import { audio } from '../audio/engine';
import type { Copy } from '../i18n/content';

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

interface HeroProps {
  copy: Copy['hero'];
}

export default function Hero({ copy }: HeroProps) {
  // スクロールでテキストを浮かせながらフェードアウトし、画面は山に明け渡す。
  const ref = useRef<HTMLElement>(null);
  const progress = useSectionProgress(ref, measureHero);
  const opacity = useTransform(progress, [0, 0.6], [1, 0]);
  const y = useTransform(progress, [0, 0.6], [0, -80]);

  return (
    <section className="hero" ref={ref}>
      <motion.div className="hero-inner" style={{ opacity, y }}>
        <motion.p className="hero-kicker" variants={rise} initial="hidden" animate="visible" custom={0}>
          {copy.kicker}
        </motion.p>

        <motion.h1 className="hero-title" variants={rise} initial="hidden" animate="visible" custom={1}>
          NOVA
          <br />
          RIDGE
        </motion.h1>

        <motion.div className="hero-copy" variants={rise} initial="hidden" animate="visible" custom={2}>
          <p className="hero-tagline">{copy.tagline}</p>
          <p className="hero-sub">{copy.sub}</p>
        </motion.div>

        <motion.div className="hero-bottom" variants={rise} initial="hidden" animate="visible" custom={3}>
          <dl className="stats">
            {copy.stats.map((s) => (
              <div className="stat" key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>

          <a className="cta" href="#experiences" onClick={() => audio.playClick()}>
            {copy.cta}
            <span className="cta-line" aria-hidden="true" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
