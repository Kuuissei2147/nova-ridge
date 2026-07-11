import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { audio } from '../audio/engine';
import type { Copy } from '../i18n/content';
import { COURSES } from '../data/courses';

// 今日の日付を YYYY-MM-DD で(ローカルタイムゾーン基準)
function todayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

interface Confirmation {
  code: string;
  date: string;
  guests: string;
  course: string;
}

// エラーは文字列ではなくキーで持つ。
// 表示中に言語を切り替えても、正しい言語のメッセージに追従できる
interface FieldErrors {
  date?: 'dateRequired' | 'datePast';
  course?: 'courseRequired';
}

// 確認演出の見出しを単語ごとに立ち上げる(ブランド要素なので両言語共通)
const words = 'YOUR JOURNEY BEGINS HERE.'.split(' ');

interface BookingProps {
  copy: Copy['booking'];
  dialogLabel: string;
}

export default function Booking({ copy, dialogLabel }: BookingProps) {
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('2');
  const [course, setCourse] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const submitRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const minDate = todayISO();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: FieldErrors = {};
    if (!date) {
      next.date = 'dateRequired';
    } else if (date < minDate) {
      next.date = 'datePast';
    }
    if (!course) {
      next.course = 'courseRequired';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    audio.playConfirm();
    setConfirmation({
      code: `NR-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date,
      guests,
      course,
    });
  };

  const close = () => {
    audio.playClick();
    setConfirmation(null);
    submitRef.current?.focus();
  };

  // オーバーレイ表示中:フォーカスを閉じるボタンへ、Escape で閉じる、背景スクロールを止める
  useEffect(() => {
    if (!confirmation) return;
    closeRef.current?.focus();
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmation]);

  return (
    <section className="booking" id="booking">
      <div className="booking-head">
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
          RESERVE
        </motion.h2>
      </div>

      <form className="booking-form" noValidate onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="booking-date">{copy.dateLabel}</label>
          <input
            id="booking-date"
            type="date"
            min={minDate}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? 'booking-date-error' : undefined}
          />
          <p className="field-error" id="booking-date-error" aria-live="polite">
            {errors.date ? copy.errors[errors.date] : ''}
          </p>
        </div>

        <div className="field">
          <label htmlFor="booking-guests">{copy.guestsLabel}</label>
          <select
            id="booking-guests"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={String(n)}>
                {copy.guestsOption(n)}
              </option>
            ))}
          </select>
          <p className="field-error" aria-live="polite" />
        </div>

        <div className="field">
          <label htmlFor="booking-course">{copy.courseLabel}</label>
          <select
            id="booking-course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            aria-invalid={Boolean(errors.course)}
            aria-describedby={errors.course ? 'booking-course-error' : undefined}
          >
            <option value="">{copy.coursePlaceholder}</option>
            {COURSES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="field-error" id="booking-course-error" aria-live="polite">
            {errors.course ? copy.errors[errors.course] : ''}
          </p>
        </div>

        <button ref={submitRef} type="submit" className="cta booking-submit">
          BOOK YOUR RIDE
          <span className="cta-line" aria-hidden="true" />
        </button>
      </form>

      <p className="booking-note">{copy.note}</p>

      {/* シネマティックな予約確認 */}
      <AnimatePresence>
        {confirmation && (
          <motion.div
            className="confirm-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={dialogLabel}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onKeyDown={(e) => {
              // フォーカスをダイアログ内(唯一のボタン)に留める
              if (e.key === 'Tab') {
                e.preventDefault();
                closeRef.current?.focus();
              }
            }}
          >
            <div className="confirm-inner">
              <motion.p
                className="confirm-kicker"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                RESERVATION {confirmation.code}
              </motion.p>

              <h3 className="confirm-title">
                {words.map((word, i) => (
                  <motion.span
                    className="confirm-word"
                    key={word}
                    initial={{ opacity: 0, y: 34 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 + i * 0.14, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {word}
                  </motion.span>
                ))}
              </h3>

              <motion.p
                className="confirm-sub"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.25, duration: 0.9 }}
              >
                {copy.confirm.sub}
              </motion.p>

              <motion.span
                className="confirm-rule"
                aria-hidden="true"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 1.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />

              <motion.dl
                className="confirm-summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <div>
                  <dt>{copy.confirm.dateLabel}</dt>
                  <dd>{copy.confirm.formatDate(confirmation.date)}</dd>
                </div>
                <div>
                  <dt>{copy.confirm.guestsLabel}</dt>
                  <dd>{copy.confirm.formatGuests(confirmation.guests)}</dd>
                </div>
                <div>
                  <dt>{copy.confirm.courseLabel}</dt>
                  <dd>{confirmation.course}</dd>
                </div>
              </motion.dl>

              <motion.p
                className="confirm-note"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.8 }}
              >
                {copy.confirm.note}
              </motion.p>

              <motion.button
                ref={closeRef}
                type="button"
                className="cta confirm-close"
                onClick={close}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 0.8 }}
              >
                {copy.confirm.close}
                <span className="cta-line" aria-hidden="true" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
