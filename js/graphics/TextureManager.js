// ==========================================
// TEXTURE MANAGER - نظام إدارة الخامات والنسيج
// ==========================================

import CONSTANTS from '../utils/Constants.js';

class TextureManager {
  constructor() {
    this.textures = {};
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.canvas.width = 64;
    this.canvas.height = 64;

    this.init();
  }

  init() {
    // توليد جميع الخامات الإجرائية
    this.generateTextures();

    if (CONSTANTS.DEBUG) {
      console.log('✓ TextureManager initialized');
    }
  }

  // ===== توليد جميع الخامات =====
  generateTextures() {
    // كل نوع كتلة يحتاج خامة
    this.textures[CONSTANTS.BLOCK_TYPES.STONE] = this.generateStoneTexture();
    this.textures[CONSTANTS.BLOCK_TYPES.DIRT] = this.generateDirtTexture();
    this.textures[CONSTANTS.BLOCK_TYPES.GRASS] = this.generateGrassTexture();
    this.textures[CONSTANTS.BLOCK_TYPES.WOOD] = this.generateWoodTexture();
    this.textures[CONSTANTS.BLOCK_TYPES.LEAVES] = this.generateLeavesTexture();
  }

  // ===== توليد خامة الحجر =====
  generateStoneTexture() {
    const canvas = this.createCanvas();
    const ctx = canvas.getContext('2d');

    // لون أساسي رمادي
    ctx.fillStyle = '#888888';
    ctx.fillRect(0, 0, 64, 64);

    // إضافة تفاصيل حجرية
    ctx.fillStyle = '#777777';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      const size = Math.random() * 5 + 1;
      ctx.fillRect(x, y, size, size);
    }

    // إضافة خطوط داكنة (شقوق)
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 32);
    ctx.lineTo(64, 32);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(32, 0);
    ctx.lineTo(32, 64);
    ctx.stroke();

    // إضافة شدات إضاءة
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, 32, 32);

    return new THREE.CanvasTexture(canvas);
  }

  // ===== توليد خامة التراب =====
  generateDirtTexture() {
    const canvas = this.createCanvas();
    const ctx = canvas.getContext('2d');

    // لون أساسي بني
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 0, 64, 64);

    // إضافة نقاط عشوائية (طين ورمل)
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      const size = Math.random() * 3 + 0.5;

      // ألوان مختلفة من البني
      const colors = ['#7A3F0B', '#9D5A1A', '#6B3410', '#A6600D'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // إضافة خطوط الرطوبة
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 64, 0);
      ctx.lineTo(Math.random() * 64, 64);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  // ===== توليد خامة العشب =====
  generateGrassTexture() {
    const canvas = this.createCanvas();
    const ctx = canvas.getContext('2d');

    // نصف سفلي: تراب
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, 32, 64, 32);

    // نصف علوي: عشب أخضر
    ctx.fillStyle = '#00AA00';
    ctx.fillRect(0, 0, 64, 32);

    // إضافة تفاصيل العشب
    ctx.strokeStyle = '#007700';
    ctx.lineWidth = 1;
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 32;
      const height = Math.random() * 6 + 2;

      ctx.beginPath();
      ctx.moveTo(x, y + height);
      ctx.lineTo(x + Math.random() * 2 - 1, y);
      ctx.stroke();
    }

    // إضافة ألوان مختلفة من الأخضر
    ctx.fillStyle = 'rgba(0, 200, 0, 0.1)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 32;
      ctx.fillRect(x, y, 3, 3);
    }

    return new THREE.CanvasTexture(canvas);
  }

  // ===== توليد خامة الخشب =====
  generateWoodTexture() {
    const canvas = this.createCanvas();
    const ctx = canvas.getContext('2d');

    // لون أساسي بني غامق
    ctx.fillStyle = '#654321';
    ctx.fillRect(0, 0, 64, 64);

    // خطوط الحلقات السنوية
    ctx.strokeStyle = '#4a3118';
    ctx.lineWidth = 2;

    const centerX = 32;
    const centerY = 32;

    // رسم حلقات داخلية
    for (let i = 1; i < 10; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, i * 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    // إضافة نسيج الخشب
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 64, 0);
      ctx.quadraticCurveTo(
        Math.random() * 64,
        32,
        Math.random() * 64,
        64
      );
      ctx.stroke();
    }

    // إضافة تفاصيل فاتحة
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(0, 0, 64, 16);

    return new THREE.CanvasTexture(canvas);
  }

  // ===== توليد خامة الأوراق =====
  generateLeavesTexture() {
    const canvas = this.createCanvas();
    const ctx = canvas.getContext('2d');

    // لون أخضر داكن
    ctx.fillStyle = '#228B22';
    ctx.fillRect(0, 0, 64, 64);

    // إضافة نسيج الأوراق (نقاط عشوائية)
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      const size = Math.random() * 2 + 0.5;

      // ألوان مختلفة من الأخضر
      const colors = [
        '#1a6e1a',
        '#2d9d2d',
        '#3cb33c',
        '#0d470d'
      ];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // إضافة خطوط الأوراق الفردية
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * 64, 0);
      ctx.lineTo(Math.random() * 64, 64);
      ctx.stroke();
    }

    // شدات إضاءة
    ctx.fillStyle = 'rgba(100, 255, 100, 0.15)';
    for (let i = 0; i < 30; i++) {
      ctx.fillRect(
        Math.random() * 64,
        Math.random() * 64,
        Math.random() * 8 + 2,
        Math.random() * 8 + 2
      );
    }

    return new THREE.CanvasTexture(canvas);
  }

  // ===== إنشاء Canvas جديد =====
  createCanvas() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    return canvas;
  }

  // ===== الحصول على خامة =====
  getTexture(blockType) {
    return this.textures[blockType] || this.textures[CONSTANTS.BLOCK_TYPES.STONE];
  }

  // ===== الحصول على جميع الخامات =====
  getAllTextures() {
    return { ...this.textures };
  }

  // ===== تحديث الخامة =====
  updateTexture(blockType) {
    switch (blockType) {
      case CONSTANTS.BLOCK_TYPES.STONE:
        this.textures[blockType] = this.generateStoneTexture();
        break;
      case CONSTANTS.BLOCK_TYPES.DIRT:
        this.textures[blockType] = this.generateDirtTexture();
        break;
      case CONSTANTS.BLOCK_TYPES.GRASS:
        this.textures[blockType] = this.generateGrassTexture();
        break;
      case CONSTANTS.BLOCK_TYPES.WOOD:
        this.textures[blockType] = this.generateWoodTexture();
        break;
      case CONSTANTS.BLOCK_TYPES.LEAVES:
        this.textures[blockType] = this.generateLeavesTexture();
        break;
    }
  }

  // ===== تنظيف الموارد =====
  dispose() {
    Object.values(this.textures).forEach(texture => {
      if (texture) texture.dispose();
    });

    this.textures = {};

    if (CONSTANTS.DEBUG) {
      console.log('🧹 TextureManager disposed');
    }
  }
}

export default TextureManager;
