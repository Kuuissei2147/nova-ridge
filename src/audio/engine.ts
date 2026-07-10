// Web Audio API だけで組み立てる効果音・環境音エンジン。
// 外部の音源ファイルは一切使わない(すべてその場で合成する)。
//
// 環境音:ブラウンノイズ+バンドパス+低速LFO = 山の風。55Hzのドローンが底を支える。
// 効果音:ホバー(氷の粒)、クリック(雪煙のひと吹き)、予約確定(澄んだ和音)。

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private windGain: GainNode | null = null;
  private enabled = false;

  private ensureContext(): AudioContext {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    this.buildAmbience(ctx, master);
    return ctx;
  }

  // 常時鳴り続ける「山の空気」。master のゲインでまとめてオン/オフする
  private buildAmbience(ctx: AudioContext, master: GainNode): void {
    // 風:ブラウンノイズ(白色ノイズを積分した柔らかいノイズ)をループ再生
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 380;
    filter.Q.value = 0.6;

    const windGain = ctx.createGain();
    windGain.gain.value = 0.05;

    noise.connect(filter);
    filter.connect(windGain);
    windGain.connect(master);
    noise.start();

    // 超低速のLFOでフィルタ周波数を揺らす=風の「うねり」
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 140;
    lfo.connect(lfoDepth);
    lfoDepth.connect(filter.frequency);
    lfo.start();

    // もう一本のLFOで音量も揺らす=時折の突風
    const gust = ctx.createOscillator();
    gust.frequency.value = 0.11;
    const gustDepth = ctx.createGain();
    gustDepth.gain.value = 0.018;
    gust.connect(gustDepth);
    gustDepth.connect(windGain.gain);
    gust.start();

    // 低いドローン(わずかにデチューンした2本のサイン波)
    const drone = ctx.createOscillator();
    drone.frequency.value = 55;
    const drone2 = ctx.createOscillator();
    drone2.frequency.value = 110.7;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.016;
    drone.connect(droneGain);
    drone2.connect(droneGain);
    droneGain.connect(master);
    drone.start();
    drone2.start();

    this.windGain = windGain;
  }

  // ユーザー操作(クリック)から呼ぶこと。ブラウザの自動再生制限のため
  async enable(): Promise<void> {
    const ctx = this.ensureContext();
    await ctx.resume();
    this.enabled = true;
    this.master?.gain.setTargetAtTime(0.9, ctx.currentTime, 0.4);
  }

  disable(): void {
    this.enabled = false;
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
    // フェードアウト後に停止してバッテリーを節約
    window.setTimeout(() => {
      if (!this.enabled) void this.ctx?.suspend();
    }, 600);
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  // スクロール進捗(0〜1)に応じて風を強める。山に近づくほど風が強い
  setWind(intensity: number): void {
    if (!this.ctx || !this.windGain) return;
    const clamped = Math.min(1, Math.max(0, intensity));
    this.windGain.gain.setTargetAtTime(0.04 + clamped * 0.05, this.ctx.currentTime, 0.6);
  }

  // コース名ホバー:氷の粒のような短い高音
  playHover(): void {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.frequency.setValueAtTime(1400, t);
    osc.frequency.exponentialRampToValueAtTime(1900, t + 0.12);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  // ボタン:雪煙のようなひと吹き(ノイズをローパスで掃く)
  playClick(): void {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const dur = 0.35;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3500, t);
    filter.frequency.exponentialRampToValueAtTime(250, t + dur);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.09, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    noise.start(t);
  }

  // 予約確定:澄んだ和音がゆっくり立ち上がる
  playConfirm(): void {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 784, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const start = t + i * 0.14;
      const osc = this.ctx!.createOscillator();
      osc.frequency.value = freq;
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.05, start + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 2);
      osc.connect(gain);
      gain.connect(this.master!);
      osc.start(start);
      osc.stop(start + 2.1);
    });

    // 背後で雪風がふわっと膨らむ
    const swellDur = 2.4;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * swellDur, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 600;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.035, t + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + swellDur);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    noise.start(t);
  }
}

export const audio = new AudioEngine();

// 開発時のみ、動作検証用にグローバルへ出す
if (import.meta.env.DEV) {
  (window as unknown as { __audio?: AudioEngine }).__audio = audio;
}
