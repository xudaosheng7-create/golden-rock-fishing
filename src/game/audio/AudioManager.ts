// ═══════════════════════════════════════
// 音效管理器 — Web Audio API 程序化生成
// 零外部文件，零加载延迟
// ═══════════════════════════════════════

type SfxName = 'cast' | 'splash' | 'bite' | 'reel' | 'snap' | 'caught' | 'click'

class AudioManagerImpl {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private bgmGain: GainNode | null = null
  private sfxGain: GainNode | null = null
  private musicOn = true
  private sfxOn = true
  private masterVol = 0.7
  private bgmVol = 0.3
  private sfxVol = 0.8

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.masterVol
      this.masterGain.connect(this.ctx.destination)

      this.bgmGain = this.ctx.createGain()
      this.bgmGain.gain.value = this.bgmVol
      this.bgmGain.connect(this.masterGain)

      this.sfxGain = this.ctx.createGain()
      this.sfxGain.gain.value = this.sfxVol
      this.sfxGain.connect(this.masterGain)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume()
    return this.ctx
  }

  // ═══ 播放音效 ═══
  play(name: SfxName): void {
    if (!this.sfxOn) return
    const ctx = this.getCtx()
    const now = ctx.currentTime

    switch (name) {
      case 'cast': this._cast(ctx, now); break
      case 'splash': this._splash(ctx, now); break
      case 'bite': this._bite(ctx, now); break
      case 'reel': this._reel(ctx, now); break
      case 'snap': this._snap(ctx, now); break
      case 'caught': this._caught(ctx, now); break
      case 'click': this._click(ctx, now); break
    }
  }

  // ── 抛竿：风声呼啸 ──
  private _cast(ctx: AudioContext, t: number) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(300, t)
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.15)
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.5)
    gain.gain.setValueAtTime(0.15, t)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5)
    osc.connect(gain)
    gain.connect(this.sfxGain!)
    osc.start(t); osc.stop(t + 0.5)
  }

  // ── 入水：低频噗通 ──
  private _splash(ctx: AudioContext, t: number) {
    const bufferSize = ctx.sampleRate * 0.3
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      const decay = 1 - i / bufferSize
      data[i] = (Math.random() * 2 - 1) * decay * decay * 0.3
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 400
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.4, t)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3)
    src.connect(filter)
    filter.connect(gain)
    gain.connect(this.sfxGain!)
    src.start(t)
  }

  // ── 咬钩：叮铃铃 ──
  private _bite(ctx: AudioContext, t: number) {
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.value = 1200 + i * 200
      gain.gain.setValueAtTime(0.12, t + i * 0.12)
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.12 + 0.2)
      osc.connect(gain)
      gain.connect(this.sfxGain!)
      osc.start(t + i * 0.12)
      osc.stop(t + i * 0.12 + 0.2)
    }
  }

  // ── 收线：齿轮咔嗒 ──
  private _reel(ctx: AudioContext, t: number) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = 80
    gain.gain.setValueAtTime(0.04, t)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06)
    osc.connect(gain)
    gain.connect(this.sfxGain!)
    osc.start(t); osc.stop(t + 0.06)
  }

  // ── 断线：啪！──
  private _snap(ctx: AudioContext, t: number) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(800, t)
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15)
    gain.gain.setValueAtTime(0.25, t)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2)
    osc.connect(gain)
    gain.connect(this.sfxGain!)
    osc.start(t); osc.stop(t + 0.2)

    // 噪声层
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * (1-i/d.length)
    const src = ctx.createBufferSource()
    src.buffer = buf
    const gn = ctx.createGain()
    gn.gain.setValueAtTime(0.2, t)
    gn.gain.exponentialRampToValueAtTime(0.01, t + 0.1)
    src.connect(gn)
    gn.connect(this.sfxGain!)
    src.start(t)
  }

  // ── 鱼获：叮叮叮～ ──
  private _caught(ctx: AudioContext, t: number) {
    const notes = [523, 659, 784, 1047] // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0, t + i * 0.1)
      gain.gain.linearRampToValueAtTime(0.1, t + i * 0.1 + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.1 + 0.4)
      osc.connect(gain)
      gain.connect(this.sfxGain!)
      osc.start(t + i * 0.1)
      osc.stop(t + i * 0.1 + 0.4)
    })
  }

  // ── 按钮点击 ──
  private _click(ctx: AudioContext, t: number) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 600
    gain.gain.setValueAtTime(0.06, t)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05)
    osc.connect(gain)
    gain.connect(this.sfxGain!)
    osc.start(t); osc.stop(t + 0.05)
  }

  // ═══ 环境音：海浪 + 鸟叫 ═══
  private ambientNodes: AudioNode[] = []
  private ambientOn = false

  startAmbient(): void {
    if (this.ambientOn) return
    this.ambientOn = true
    const ctx = this.getCtx()

    // ── 海浪：持续低频噪声 + 滤波器摆动 ──
    const waveBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate)
    const waveData = waveBuffer.getChannelData(0)
    for (let i = 0; i < waveData.length; i++) {
      const t = i / ctx.sampleRate
      // 模拟海浪节奏：慢周期 + 快噪声
      const swell = Math.sin(t * 0.3) * 0.5 + 0.5  // 涌浪 0.3Hz
      const chop = Math.sin(t * 1.7) * 0.3           // 碎浪 1.7Hz
      waveData[i] = (Math.random() * 2 - 1) * (swell * 0.6 + chop * 0.3)
    }
    const waveSrc = ctx.createBufferSource()
    waveSrc.buffer = waveBuffer
    waveSrc.loop = true
    const waveFilter = ctx.createBiquadFilter()
    waveFilter.type = 'lowpass'
    waveFilter.frequency.value = 300
    // 滤波器缓慢摆动模拟远近海浪
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.value = 0.08
    lfoGain.gain.value = 150
    lfo.connect(lfoGain)
    lfoGain.connect(waveFilter.frequency)
    lfo.start()
    const waveGain = ctx.createGain()
    waveGain.gain.value = 0.12
    waveSrc.connect(waveFilter)
    waveFilter.connect(waveGain)
    waveGain.connect(this.bgmGain!)
    waveSrc.start()
    this.ambientNodes.push(waveSrc, waveFilter, lfo, lfoGain, waveGain)

    // ── 海鸟：随机间隔的高频短鸣 ──
    const birdSchedule = () => {
      if (!this.ambientOn) return
      const delay = 2 + Math.random() * 8  // 2-10 秒随机
      setTimeout(() => {
        if (!this.ambientOn) return
        this._birdCall(ctx)
        birdSchedule()
      }, delay * 1000)
    }
    birdSchedule()
  }

  stopAmbient(): void {
    this.ambientOn = false
    for (const n of this.ambientNodes) {
      try { (n as AudioScheduledSourceNode).stop() } catch {}
    }
    this.ambientNodes = []
  }

  // 单次鸟叫
  private _birdCall(ctx: AudioContext) {
    const now = ctx.currentTime
    const chirps = 1 + Math.floor(Math.random() * 3)  // 1-3 声
    for (let i = 0; i < chirps; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      const baseFreq = 1800 + Math.random() * 1200
      osc.frequency.setValueAtTime(baseFreq, now + i * 0.15)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.3, now + i * 0.15 + 0.08)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + i * 0.15 + 0.2)
      gain.gain.setValueAtTime(0, now + i * 0.15)
      gain.gain.linearRampToValueAtTime(0.04, now + i * 0.15 + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.3)
      osc.connect(gain)
      gain.connect(this.bgmGain!)
      osc.start(now + i * 0.15)
      osc.stop(now + i * 0.15 + 0.35)
    }
  }

  // ═══ BGM 播放 ═══
  private bgmAudio: HTMLAudioElement | null = null

  playBGM(url: string): void {
    this.stopBGM()
    this.bgmAudio = new Audio(url)
    this.bgmAudio.loop = true
    this.bgmAudio.preload = 'none'  // 不阻塞页面加载
    this.bgmAudio.volume = this.bgmVol * this.masterVol
    if (this.musicOn) {
      // 异步加载，不阻塞
      this.bgmAudio.load()
      this.bgmAudio.play().catch(() => {})
    }
  }

  stopBGM(): void {
    if (this.bgmAudio) {
      this.bgmAudio.pause()
      this.bgmAudio = null
    }
  }

  // ═══ 音乐开关 ═══
  toggleMusic(): boolean {
    this.musicOn = !this.musicOn
    if (this.bgmAudio) {
      if (this.musicOn) {
        this.bgmAudio.play().catch(() => {})
        if (this.bgmAudio) this.bgmAudio.volume = this.bgmVol * this.masterVol
        this.startAmbient()
      } else {
        this.bgmAudio.pause()
        this.stopAmbient()
      }
    }
    return this.musicOn
  }
  toggleSfx(): boolean { this.sfxOn = !this.sfxOn; return this.sfxOn }
  isMusicOn(): boolean { return this.musicOn }
  isSfxOn(): boolean { return this.sfxOn }

  setBgmVolume(v: number) {
    this.bgmVol = v
    if (this.bgmGain) this.bgmGain.gain.value = v
    if (this.bgmAudio) this.bgmAudio.volume = v * (this.masterVol)
  }
  setSfxVolume(v: number) {
    this.sfxVol = v
    if (this.sfxGain) this.sfxGain.gain.value = v
  }
  setMasterVolume(v: number) {
    this.masterVol = v
    if (this.masterGain) this.masterGain.gain.value = v
    if (this.bgmAudio) this.bgmAudio.volume = this.bgmVol * v
  }

  dispose() {
    this.ctx?.close()
    this.ctx = null
  }
}

export const AudioManager = new AudioManagerImpl()
