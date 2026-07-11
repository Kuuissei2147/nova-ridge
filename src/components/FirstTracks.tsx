import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Copy } from '../i18n/content';

interface FirstTracksProps {
  copy: Copy['firstTracks'];
  courseName: string | null; // null なら非表示
  onExit: () => void;
}

// FIRST TRACKS(滑空プレビュー)中の最小限のUI。
// 3Dの眺めが主役なので、コース名と出口だけを画面の隅に置く。
export default function FirstTracks({ copy, courseName, onExit }: FirstTracksProps) {
  const exitRef = useRef<HTMLButtonElement>(null);

  // 表示中:フォーカスを EXIT へ、Escape で終了、背景スクロールを止める。
  // 終了時は元のフォーカス位置(押した FIRST TRACKS ボタン)へ戻す
  useEffect(() => {
    if (!courseName) return;
    const previous = document.activeElement as HTMLElement | null;
    exitRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseName]);

  return (
    <AnimatePresence>
      {courseName && (
        <motion.div
          className="flyover-ui"
          role="dialog"
          aria-modal="true"
          aria-label={copy.dialog}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          onKeyDown={(e) => {
            // フォーカスをダイアログ内(唯一のボタン)に留める
            if (e.key === 'Tab') {
              e.preventDefault();
              exitRef.current?.focus();
            }
          }}
        >
          <div className="flyover-head">
            <motion.p
              className="flyover-kicker"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              FIRST TRACKS
            </motion.p>
            <motion.h2
              className="flyover-name"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              {courseName}
            </motion.h2>
          </div>

          <motion.div
            className="flyover-bottom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <button ref={exitRef} type="button" className="cta" onClick={onExit}>
              {copy.exit}
              <span className="cta-line" aria-hidden="true" />
            </button>
            <p className="flyover-hint">{copy.hint}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
