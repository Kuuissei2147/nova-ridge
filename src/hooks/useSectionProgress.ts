import { useEffect } from 'react';
import type { RefObject } from 'react';
import { useMotionValue } from 'framer-motion';
import type { MotionValue } from 'framer-motion';

// 要素のスクロール進捗(0〜1)を MotionValue として返す小さなフック。
// framer-motion の useScroll({ target }) の代わり。
// measure には「要素の矩形とビューポート高さから進捗を計算する関数」を渡す。
// (コンポーネントの外で定義した安定した関数を渡すこと)
export function useSectionProgress(
  ref: RefObject<HTMLElement | null>,
  measure: (rect: DOMRect, viewportHeight: number) => number,
): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(() => {
    const update = () => {
      const el = ref.current;
      if (!el) return;
      const p = measure(el.getBoundingClientRect(), window.innerHeight);
      progress.set(Math.min(1, Math.max(0, p)));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [ref, measure, progress]);

  return progress;
}
