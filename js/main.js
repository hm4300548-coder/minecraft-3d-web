// ==========================================
// MAIN.JS - نقطة البداية للعبة
// ==========================================

import CONSTANTS from './utils/Constants.js';
import SceneManager from './core/SceneManager.js';
import CameraManager from './core/CameraManager.js';
import Player from './player/Player.js';
import World2 from './world/World2.js';
import UI from './ui/UI.js';
import AudioManager from './audio/AudioManager.js';
import BlockStorage from './utils/BlockStorage.js';

class Game {
  constructor() {
    this.sceneManager = null;
    this.cameraManager = null;
    this.player = null;
    this.world = null;
    this.ui = null;
    this.audioManager = null;
    this.blockStorage = null;
    this.running = false;
    this.frameCount = 0;
    this.lastTime = Date.now();
    this.fps = 0;

    this.init();
  }

  // ===== تهيئة اللعبة =====
  async init() {
    console.log('🎮 Starting Minecraft-Like 3D Game...');

    // إنشاء Audio Manager (نظام الصوت والموسيقى)
    this.audioManager = new AudioManager();
    this.audioManager.playMusic('ambient');

    // إنشاء Block Storage (نظام حفظ الكتل في قاعدة البيانات)
    this.blockStorage = new BlockStorage('http://localhost:3000', 'default');

    // إنشاء Scene Manager (إدارة المشهد والإضاءة)
    this.sceneManager = new SceneManager();

    // إنشاء Camera Manager (إدارة الكاميرا)
    this.cameraManager = new CameraManager(this.sceneManager);

    // إنشاء World2 (عالم بلا نهاية مع Chunks)
    this.world = new World2(this.sceneManager, this.cameraManager.getCamera());

    // إنشاء Player (إدارة اللاعب والحركة)
    // تمرير World و AudioManager و BlockStorage ليتمكن Player من التفاعل مع الكتل والصوت والحفظ
    this.player = new Player(this.cameraManager, this.world, this.audioManager, this.blockStorage);

    // إنشاء UI (واجهة المستخدم)
    this.ui = new UI(this);

    // تحميل الكتل المحفوظة من قاعدة البيانات
    await this.loadSavedBlocks();

    // تفعيل وضع التصحيح إذا لزم الأمر
    if (CONSTANTS.DEBUG) {
      this.enableDebugMode();
    }

    // بدء حلقة اللعبة الرئيسية
    this.running = true;
    this.startGameLoop();

    console.log('✓ Game initialized successfully!');
    console.log('📐 World Size:',
      `${CONSTANTS.WORLD.WIDTH}x${CONSTANTS.WORLD.HEIGHT}x${CONSTANTS.WORLD.DEPTH}`);
    console.log('⌨️ Controls:');
    console.log('  WASD - Move | Space/C - Fly Up/Down | Shift - Sprint | ESC - Unlock Mouse');
  }

  // ===== تحميل الكتل المحفوظة من قاعدة البيانات =====
  async loadSavedBlocks() {
    try {
      console.log('📦 Loading saved blocks from database...');
      const blocks = await this.blockStorage.loadBlocks();

      if (blocks && blocks.length > 0) {
        console.log(`✓ Loaded ${blocks.length} blocks from database`);

        // إضافة الكتل المحملة إلى العالم
        blocks.forEach(block => {
          this.world.setBlock(block.x, block.y, block.z, block.block_type);
        });

        console.log(`✓ Added ${blocks.length} blocks to the world`);
      } else {
        console.log('ℹ️  No saved blocks found, starting with fresh world');
      }
    } catch (error) {
      console.error('❌ Error loading saved blocks:', error);
      console.log('ℹ️  Continuing with fresh world...');
    }
  }

  // ===== حلقة اللعبة الرئيسية =====
  startGameLoop() {
    const animate = () => {
      requestAnimationFrame(animate);

      if (!this.running) return;

      // تحديث اللعبة
      this.update();

      // رسم الإطار
      this.render();

      // تحديث إحصائيات الأداء
      this.updateFrameStats();
    };

    animate();
  }

  // ===== تحديث منطق اللعبة =====
  update() {
    // تحديث اللاعب (معالجة الإدخالات والحركة)
    if (this.player) {
      this.player.update();
    }

    // تحديث العالم (تحميل/تفريغ Chunks، Culling)
    if (this.world && this.player) {
      const playerPos = this.player.getPosition();
      this.world.update(playerPos);
    }

    // تحديث UI
    if (this.ui) {
      this.ui.update();
    }

    // تحديث معلومات الأداء
    this.updatePerformanceStats();
  }

  // ===== رسم الإطار =====
  render() {
    this.sceneManager.render();
  }

  // ===== تحديث إحصائيات الأداء (FPS) =====
  updateFrameStats() {
    this.frameCount++;
    const currentTime = Date.now();
    const deltaTime = currentTime - this.lastTime;

    // حساب FPS كل ثانية تقريباً
    if (deltaTime >= 1000) {
      this.fps = Math.round(this.frameCount * 1000 / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;

      // تحديث عنصر FPS في الواجهة
      const fpsElement = document.getElementById('fps');
      if (fpsElement) {
        fpsElement.textContent = this.fps;
      }

      // إظهار في Console
      if (CONSTANTS.DEBUG) {
        console.log(`📊 FPS: ${this.fps}`);
      }
    }
  }

  // ===== تحديث إحصائيات الأداء =====
  updatePerformanceStats() {
    if (!CONSTANTS.DEBUG) return;

    const stats = this.world.getStats();
    const chunksElement = document.getElementById('chunks');

    if (chunksElement) {
      chunksElement.textContent = `${stats.chunksLoaded} / ${stats.totalBlocks} blocks`;
    }
  }

  // ===== تفعيل وضع التصحيح =====
  enableDebugMode() {
    const debugInfo = document.getElementById('debug-info');
    if (debugInfo) {
      debugInfo.style.display = 'block';
    }

    // تحديث معلومات موقع اللاعب والكاميرا
    setInterval(() => {
      const playerPos = this.player.getPosition();
      const posElement = document.getElementById('pos');
      if (posElement) {
        posElement.textContent =
          `${playerPos.x.toFixed(1)}, ${playerPos.y.toFixed(1)}, ${playerPos.z.toFixed(1)}`;
      }
    }, 100);

    console.log('🔍 Debug mode enabled');
    console.log('   Infinite terrain with Chunks & Perlin Noise');
    console.log('   Frustum Culling active for performance');
  }

  // ===== إيقاف اللعبة =====
  stop() {
    this.running = false;
    console.log('⏹️  Game stopped');
  }

  // ===== إعادة تشغيل اللعبة =====
  resume() {
    this.running = true;
    console.log('▶️  Game resumed');
  }

  // ===== تنظيف الموارد =====
  dispose() {
    if (this.audioManager) {
      this.audioManager.dispose();
    }
    if (this.world) {
      this.world.dispose();
    }
    this.sceneManager.dispose();
    console.log('🧹 Game disposed');
  }

  // ===== الحصول على Audio Manager =====
  getAudioManager() {
    return this.audioManager;
  }

  // ===== الحصول على Block Storage =====
  getBlockStorage() {
    return this.blockStorage;
  }
}

// ===== تشغيل اللعبة =====
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});

// معالجة الخروج من الصفحة
window.addEventListener('beforeunload', () => {
  if (window.game) {
    window.game.dispose();
  }
});
