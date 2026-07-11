import { useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useSectionProgress } from '../hooks/useSectionProgress';
import type { Copy } from '../i18n/content';

// 行の上端が画面の下端 95% に入ったら 0、画面の 55% まで上がったら 1
const measureRun = (rect: DOMRect, viewportHeight: number) =>
  (viewportHeight * 0.95 - rect.top) / (viewportHeight * 0.4);

interface RunProps {
  run: Copy['experiences']['runs'][number];
  statLabels: Copy['experiences']['statLabels'];
  index: number;
  active: boolean;
  onActivate: (index: number | null) => void;
}

// 各コースはスクロールに同期して1本ずつ立ち上がる。
// 行全体が <button>:ホバー/タップ/キーボードフォーカスで
// 3D側のルート発光・カメラの寄り・詳細パネルの展開が連動する。
function Run({ run, statLabels, index, active, onActivate }: RunProps) {
  const ref = useRef<HTMLElement>(null);
  const progress = useSectionProgress(ref, measureRun);
  const opacity = useTransform(progress, [0, 1], [0, 1]);
  const y = useTransform(progress, [0, 1], [70, 0]);
  const statsId = `run-stats-${run.index}`;

  return (
    <motion.article
      className={active ? 'run run-active' : 'run'}
      ref={ref}
      style={{ opacity, y }}
    >
      <button
        type="button"
        className="run-trigger"
        aria-expanded={active}
        aria-controls={statsId}
        onPointerEnter={(e) => {
          if (e.pointerType === 'mouse') onActivate(index);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') onActivate(null);
        }}
        onFocus={() => onActivate(index)}
        onBlur={() => onActivate(null)}
        onClick={() => onActivate(index)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') e.currentTarget.blur();
        }}
      >
        <span className="run-index">{run.index}</span>
        <span className="run-name">{run.name}</span>
        <span className="run-detail">
          <span className="run-grade">{run.grade}</span>
          <span className="run-text">{run.text}</span>
        </span>
      </button>

      {/* 難易度・距離・所要時間。アクティブ時に滑らかに展開する */}
      <div className="run-stats" id={statsId}>
        <div className="run-stats-inner">
          <dl>
            <div className="run-stat">
              <dt>{statLabels.difficulty}</dt>
              <dd>{run.difficulty}</dd>
            </div>
            <div className="run-stat">
              <dt>{statLabels.distance}</dt>
              <dd>{run.distance}</dd>
            </div>
            <div className="run-stat">
              <dt>{statLabels.time}</dt>
              <dd>{run.time}</dd>
            </div>
          </dl>
        </div>
      </div>
    </motion.article>
  );
}

interface ExperiencesProps {
  copy: Copy['experiences'];
  activeRoute: number | null;
  onActivate: (index: number | null) => void;
}

export default function Experiences({ copy, activeRoute, onActivate }: ExperiencesProps) {
  return (
    <section className="experiences" id="experiences">
      <div className="experiences-head">
        <motion.p
          className="section-kicker"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
        >
          {copy.kicker}
        </motion.p>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          THE MOUNTAIN
        </motion.h2>
      </div>

      <div className="runs">
        {copy.runs.map((run, i) => (
          <Run
            key={run.index}
            run={run}
            statLabels={copy.statLabels}
            index={i}
            active={activeRoute === i}
            onActivate={onActivate}
          />
        ))}
      </div>
    </section>
  );
}
