// ==========================================
// AUDIO MANAGER - نظام الصوت والموسيقى
// ==========================================

import CONSTANTS from '../utils/Constants.js';

class AudioManager {
  constructor() {
    // إنشاء Audio Context
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // المتغيرات الصوتية
    this.sounds = {};
    this.musicTracks = {};
    this.currentMusic = null;

    // حالة الصوت
    this.masterVolume = 0.5;
    this.soundsEnabled = true;
    this.musicEnabled = true;

    // مستويات الصوت
    this.volumeLevels = {
      master: 0.5,
      effects: 0.7,
      music: 0.4,
    };

    this.init();
  }

  init() {
    // تشغيل الصوت عند أول تفاعل
    this.setupAudioInitialization();

    // تحميل الأصوات الافتراضية (إجرائية)
    this.createDefaultSounds();

    if (CONSTANTS.DEBUG) {
      console.log('✓ AudioManager initialized');
    }
  }

  // ===== إعداد تشغيل الصوت =====
  setupAudioInitialization() {
    // الكثير من المتصفحات تتطلب تفاعل المستخدم لتشغيل الصوت
    const resumeAudio = () => {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();

        if (CONSTANTS.DEBUG) {
          console.log('🔊 Audio context resumed');
        }
      }

      // إزالة المستمع بعد التشغيل الأول
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('keydown', resumeAudio);
    };

    document.addEventListener('click', resumeAudio);
    document.addEventListener('keydown', resumeAudio);
  }

  // ===== إنشاء أصوات افتراضية (توليد إجرائي) =====
  createDefaultSounds() {
    // صوت الخطوة
    this.createSound('step', {
      frequency: 200,
      duration: 0.1,
      type: 'sine',
    });

    // صوت القفز
    this.createSound('jump', {
      frequency: 400,
      duration: 0.2,
      type: 'square',
      envelope: { attack: 0.05, decay: 0.15 },
    });

    // صوت البناء
    this.createSound('place', {
      frequency: 600,
      duration: 0.15,
      type: 'triangle',
    });

    // صوت الهدم
    this.createSound('break', {
      frequency: 300,
      duration: 0.2,
      type: 'sawtooth',
    });

    // موسيقى الخلفية
    this.createAmbientMusic();

    if (CONSTANTS.DEBUG) {
      console.log('🎵 Default sounds created');
    }
  }

  // ===== إنشاء صوت مخصص =====
  createSound(name, options) {
    this.sounds[name] = {
      frequency: options.frequency || 440,
      duration: options.duration || 0.5,
      type: options.type || 'sine',
      envelope: options.envelope || { attack: 0, decay: this.audioContext.currentTime },
      volume: options.volume || this.volumeLevels.effects,
    };
  }

  // ===== تشغيل صوت =====
  playSound(soundName) {
    if (!this.soundsEnabled) return;

    const sound = this.sounds[soundName];
    if (!sound) {
      if (CONSTANTS.DEBUG) {
        console.warn(`⚠️ Sound not found: ${soundName}`);
      }
      return;
    }

    try {
      // إنشاء Oscillator
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = sound.type;
      oscillator.frequency.value = sound.frequency;

      // إعداد الـ Envelope
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        sound.volume,
        this.audioContext.currentTime + (sound.envelope?.attack || 0.01)
      );
      gainNode.gain.linearRampToValueAtTime(
        0,
        this.audioContext.currentTime + sound.duration
      );

      // توصيل الأصوات
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // تشغيل الصوت
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + sound.duration);

      if (CONSTANTS.DEBUG) {
        console.log(`🔊 Playing: ${soundName}`);
      }
    } catch (e) {
      if (CONSTANTS.DEBUG) {
        console.error(`❌ Error playing sound: ${e.message}`);
      }
    }
  }

  // ===== إنشاء موسيقى محيطة =====
  createAmbientMusic() {
    // موسيقى محيطة بسيطة وهادئة
    this.musicTracks.ambient = {
      notes: [
        { freq: 261.63, duration: 1 },   // C
        { freq: 329.63, duration: 1 },   // E
        { freq: 392.00, duration: 1 },   // G
        { freq: 329.63, duration: 1 },   // E
      ],
      bpm: 60,
      volume: this.volumeLevels.music,
      loop: true,
    };
  }

  // ===== تشغيل الموسيقى =====
  playMusic(trackName) {
    if (!this.musicEnabled) return;

    const track = this.musicTracks[trackName];
    if (!track) {
      if (CONSTANTS.DEBUG) {
        console.warn(`⚠️ Music track not found: ${trackName}`);
      }
      return;
    }

    // إيقاف الموسيقى السابقة
    if (this.currentMusic) {
      this.stopMusic();
    }

    this.currentMusic = {
      track: track,
      startTime: this.audioContext.currentTime,
      playing: true,
      noteIndex: 0,
    };

    this.playMusicNotes(track);

    if (CONSTANTS.DEBUG) {
      console.log(`🎵 Playing music: ${trackName}`);
    }
  }

  // ===== تشغيل نغمات الموسيقى =====
  playMusicNotes(track) {
    if (!this.currentMusic || !this.currentMusic.playing) return;

    const note = track.notes[this.currentMusic.noteIndex % track.notes.length];

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = note.freq;

      gainNode.gain.setValueAtTime(track.volume, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + note.duration * 0.9);

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + note.duration);

      // جدولة النغمة التالية
      this.currentMusic.noteIndex++;
      setTimeout(
        () => this.playMusicNotes(track),
        note.duration * 1000
      );
    } catch (e) {
      if (CONSTANTS.DEBUG) {
        console.error(`❌ Error playing music: ${e.message}`);
      }
    }
  }

  // ===== إيقاف الموسيقى =====
  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.playing = false;
      this.currentMusic = null;

      if (CONSTANTS.DEBUG) {
        console.log('🔇 Music stopped');
      }
    }
  }

  // ===== تفعيل/تعطيل الصوت =====
  setSoundsEnabled(enabled) {
    this.soundsEnabled = enabled;

    if (CONSTANTS.DEBUG) {
      console.log(`🔊 Sounds: ${enabled ? 'ON' : 'OFF'}`);
    }
  }

  // ===== تفعيل/تعطيل الموسيقى =====
  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;

    if (enabled) {
      this.playMusic('ambient');
    } else {
      this.stopMusic();
    }

    if (CONSTANTS.DEBUG) {
      console.log(`🎵 Music: ${enabled ? 'ON' : 'OFF'}`);
    }
  }

  // ===== تعديل مستوى الصوت =====
  setVolume(level, type = 'master') {
    if (type === 'master') {
      this.masterVolume = Math.max(0, Math.min(1, level));
    } else if (this.volumeLevels.hasOwnProperty(type)) {
      this.volumeLevels[type] = Math.max(0, Math.min(1, level));
    }

    if (CONSTANTS.DEBUG) {
      console.log(`🔊 Volume (${type}): ${(level * 100).toFixed(0)}%`);
    }
  }

  // ===== الحصول على مستوى الصوت =====
  getVolume(type = 'master') {
    if (type === 'master') {
      return this.masterVolume;
    }
    return this.volumeLevels[type] || 0.5;
  }

  // ===== تنظيف الموارد =====
  dispose() {
    if (this.currentMusic) {
      this.stopMusic();
    }

    this.sounds = {};
    this.musicTracks = {};

    if (CONSTANTS.DEBUG) {
      console.log('🧹 AudioManager disposed');
    }
  }
}

export default AudioManager;
