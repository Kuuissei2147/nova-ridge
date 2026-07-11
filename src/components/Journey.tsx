import { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useSectionProgress } from '../hooks/useSectionProgress';
import type { Copy } from '../i18n/content';

// sticky 区間の進捗:0 = 固定開始、1 = 固定解除(スクロールし切った)
const measureJourney = (rect: DOMRect, viewportHeight: number) =>
  -rect.top / (rect.height - viewportHeight);

interface JourneyProps {
  copy: Copy['journey'];
  sectionLabel: string;
}

// ヒーローと体験セクションの間の「接近」区間。
// sticky な画面の中で、スクロールに合わせて見出しが
// CHASE THE WHITE. → ENTER THE UNKNOWN. へと入れ替わる。
// (見出しはブランド要素なので両言語で英語のまま。サブだけ切り替わる)
export default function Journey({ copy, sectionLabel }: JourneyProps) {
  const ref = useRef<HTMLElement>(null);
  const progress = useSectionProgress(ref, measureJourney);

  // 前半:白を追う。後半:未知の中へ。
  const firstOpacity = useTransform(progress, [0.05, 0.35], [1, 0]);
  const firstY = useTransform(progress, [0.05, 0.35], [0, -70]);
  const secondOpacity = useTransform(progress, [0.45, 0.72], [0, 1]);
  const secondY = useTransform(progress, [0.45, 0.72], [70, 0]);

  return (
    <section className="journey" ref={ref} aria-label={sectionLabel}>
      <div className="journey-sticky">
        <motion.div className="journey-line" style={{ opacity: firstOpacity, y: firstY }}>
          <h2>CHASE THE WHITE.</h2>
          <p>{copy.firstSub}</p>
        </motion.div>
        <motion.div className="journey-line" style={{ opacity: secondOpacity, y: secondY }}>
          <h2>ENTER THE UNKNOWN.</h2>
          <p>{copy.secondSub}</p>
        </motion.div>
      </div>
    </section>
  );
}
