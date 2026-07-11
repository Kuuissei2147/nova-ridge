import { useEffect, useState } from 'react';
import { useScroll } from 'framer-motion';
import Scene from './components/Scene';
import Hero from './components/Hero';
import Journey from './components/Journey';
import Experiences from './components/Experiences';
import Booking from './components/Booking';
import FirstTracks from './components/FirstTracks';
import { audio } from './audio/engine';
import { CONTENT } from './i18n/content';
import type { Lang } from './i18n/content';
import { COURSES } from './data/courses';

export default function App() {
  // 0 at the top of the page, 1 at the bottom — drives the camera approach.
  const { scrollYProgress } = useScroll();
  // ホバー/フォーカス中のコース。3Dシーンのルート発光とカメラの寄りを駆動する
  const [activeRoute, setActiveRoute] = useState<number | null>(null);
  // 効果音・環境音。自動再生制限があるため、必ずオフで始めてクリックで開始する
  const [soundOn, setSoundOn] = useState(false);
  // 表示言語。既定は日本語、選択は記憶する
  const [lang, setLang] = useState<Lang>(() =>
    localStorage.getItem('nova-lang') === 'en' ? 'en' : 'ja',
  );
  const copy = CONTENT[lang];

  // 言語に合わせて <html lang> とページタイトルを更新し、選択を保存する
  useEffect(() => {
    localStorage.setItem('nova-lang', lang);
    document.documentElement.lang = lang;
    document.title = copy.meta.title;
  }, [lang, copy]);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (next) {
      void audio.enable();
    } else {
      audio.disable();
    }
  };

  const toggleLang = () => {
    audio.playClick();
    setLang((current) => (current === 'ja' ? 'en' : 'ja'));
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

  // FIRST TRACKS:選んだコースをカメラが滑空する
  const [flyover, setFlyover] = useState<number | null>(null);

  const startFlyover = (index: number) => {
    audio.playClick();
    audio.setWind(1); // 滑空中は風を強める
    setFlyover(index);
  };

  const endFlyover = () => {
    audio.playClick();
    audio.setWind(scrollYProgress.get()); // 風をスクロール位置相応に戻す
    setFlyover(null);
  };

  // 滑空中はページのUIをフェードアウトさせる(CSSの body.flyover-mode)
  useEffect(() => {
    document.body.classList.toggle('flyover-mode', flyover !== null);
    return () => document.body.classList.remove('flyover-mode');
  }, [flyover]);

  return (
    <>
      <Scene
        scrollProgress={scrollYProgress}
        activeRoute={flyover ?? activeRoute}
        flyover={flyover}
        onFlyoverEnd={endFlyover}
      />

      <header className="site-header">
        <span className="wordmark">NOVA RIDGE</span>
        <div className="header-right">
          <span className="header-meta">{copy.header.est}</span>
          <button
            type="button"
            className="lang-toggle"
            aria-label={copy.a11y.langToggle}
            onClick={toggleLang}
          >
            <span className={lang === 'ja' ? 'lang-active' : ''}>JP</span>
            <span aria-hidden="true">/</span>
            <span className={lang === 'en' ? 'lang-active' : ''}>EN</span>
          </button>
          <button
            type="button"
            className="sound-toggle"
            aria-pressed={soundOn}
            aria-label={copy.a11y.soundToggle}
            onClick={toggleSound}
          >
            SOUND {soundOn ? 'ON' : 'OFF'}
          </button>
        </div>
      </header>

      <main className="content">
        <Hero copy={copy.hero} />
        <Journey copy={copy.journey} sectionLabel={copy.a11y.journeySection} />
        <Experiences
          copy={copy.experiences}
          ftLabel={copy.firstTracks.start}
          activeRoute={activeRoute}
          onActivate={activateRoute}
          onFlyover={startFlyover}
        />
        <Booking copy={copy.booking} dialogLabel={copy.a11y.confirmDialog} />
      </main>

      <FirstTracks
        copy={copy.firstTracks}
        courseName={flyover !== null ? COURSES[flyover].name : null}
        onExit={endFlyover}
      />

      <footer className="site-footer">
        <span>{copy.footer.fictional}</span>
        <span>{copy.footer.season}</span>
      </footer>
    </>
  );
}
