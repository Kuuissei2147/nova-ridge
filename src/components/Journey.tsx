import { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useSectionProgress } from '../hooks/useSectionProgress';

// sticky 区間の進捗:0 = 固定開始、1 = 固定解除(スクロールし切った)
const measureJourney = (rect: DOMRect, viewportHeight: number) =>
  -rect.top / (rect.height - viewportHeight);

// ヒーローと体験セクションの間の「接近」区間。
// sticky な画面の中で、スクロールに合わせて見出しが
// CHASE THE WHITE. → ENTER THE UNKNOWN. へと入れ替わる。
export default function Journey() {
  const ref = useRef<HTMLElement>(null);
  const progress = useSectionProgress(ref, measureJourney);

  // 前半:白を追う。後半:未知の中へ。
  const firstOpacity = useTransform(progress, [0.05, 0.35], [1, 0]);
  const firstY = useTransform(progress, [0.05, 0.35], [0, -70]);
  const secondOpacity = useTransform(progress, [0.45, 0.72], [0, 1]);
  const secondY = useTransform(progress, [0.45, 0.72], [70, 0]);

  return (
    <section className="journey" ref={ref} aria-label="山への接近">
      <div className="journey-sticky">
        <motion.div className="journey-line" style={{ opacity: firstOpacity, y: firstY }}>
          <h2>CHASE THE WHITE.</h2>
          <p>白を追え。</p>
        </motion.div>
        <motion.div className="journey-line" style={{ opacity: secondOpacity, y: secondY }}>
          <h2>ENTER THE UNKNOWN.</h2>
          <p>未知の、中へ。</p>
        </motion.div>
      </div>
    </section>
  );
}
