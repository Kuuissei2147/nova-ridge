import { useEffect, useState } from 'react';
import { useScroll } from 'framer-motion';
import Scene from './components/Scene';
import Hero from './components/Hero';
import Journey from './components/Journey';
import Experiences from './components/Experiences';
import Booking from './components/Booking';
import { audio } from './audio/engine';

export default function App() {
  // 0 at the top of the page, 1 at the bottom — drives the camera approach.
  const { scrollYProgress } = useScroll();
  // ホバー/フォーカス中のコース。3Dシーンのルート発光とカメラの寄りを駆動する
  const [activeRoute, setActiveRoute] = useState<number | null>(null);
  // 効果音・環境音。自動再生制限があるため、必ずオフで始めてクリックで開始する
  const [soundOn, setSoundOn] = useState(false);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (next) {
      void audio.enable();
    } else {
      audio.disable();
    }
  };

  // 山に近づく(=スクロールが進む)ほど風を強くする
  useEffect(() => {
    return scrollYProgress.on('change', (v) => audio.setWind(v));
  }, [scrollYProgress]);

  // コースがアクティブになった瞬間だけホバー音を鳴らす
  const activateRoute = (index: number | null) => {
    if (index !== null && index !== activeRoute) audio.playHover();
    setActiveRoute(index);
  };

  return (
    <>
      <Scene scrollProgress={scrollYProgress} activeRoute={activeRoute} />

      <header className="site-header">
        <span className="wordmark">NOVA RIDGE</span>
        <div className="header-right">
          <span className="header-meta">EST. 2041 — 北緯 64.9°</span>
          <button
            type="button"
            className="sound-toggle"
            aria-pressed={soundOn}
            aria-label="効果音の切り替え"
            onClick={toggleSound}
          >
            SOUND {soundOn ? 'ON' : 'OFF'}
          </button>
        </div>
      </header>

      <main className="content">
        <Hero />
        <Journey />
        <Experiences activeRoute={activeRoute} onActivate={activateRoute} />
        <Booking />
      </main>

      <footer className="site-footer">
        <span>NOVA RIDGE — 架空のスキーリゾート</span>
        <span>シーズン開幕 11.14</span>
      </footer>
    </>
  );
}
