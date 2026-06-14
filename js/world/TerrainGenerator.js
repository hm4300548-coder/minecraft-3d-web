// ==========================================
// TERRAIN GENERATOR - توليد التضاريس باستخدام Perlin Noise
// ==========================================

import CONSTANTS from '../utils/Constants.js';
import PerlinNoise from './PerlinNoise.js';
import EnvironmentGenerator from './EnvironmentGenerator.js';

class TerrainGenerator {
  constructor(seed = 12345) {
    this.seed = seed;
    this.perlin = new PerlinNoise(seed);

    // منشئ البيئة للأشجار والكهوف
    this.environmentGenerator = new EnvironmentGenerator(this.perlin);
    this.environmentGenerator.setSettings({
      treeChance: CONSTANTS.ENVIRONMENT.TREE_CHANCE,
      caveChance: CONSTANTS.ENVIRONMENT.CAVE_CHANCE,
      caveSize: CONSTANTS.ENVIRONMENT.CAVE_SIZE,
      treeDensity: CONSTANTS.ENVIRONMENT.TREE_DENSITY,
    });

    // إعدادات التوليد
    this.settings = {
      scale: 50,              // حجم التضاريس (أكبر = أكثر سلاسة)
      octaves: 5,             // عدد الطبقات
      persistence: 0.5,       // تأثير الطبقات الأكبر
      lacunarity: 2.0,        // تكرار التفاصيل
      amplitude: 20,          // ارتفاع التلال
      waterLevel: 5,          // مستوى المياه (اختياري)
      grassLevel: 8,          // ارتفاع الأرضية العشبية
    };
  }

  // ===== الحصول على نوع الكتلة في موقع معين =====
  getBlockType(x, y, z) {
    // حساب ارتفاع التضاريس عند هذا الموقع
    const height = this.getTerrainHeight(x, z);

    // تحديد نوع الكتلة بناءً على الارتفاع
    if (y > height) {
      return CONSTANTS.BLOCK_TYPES.EMPTY;  // فراغ
    }

    if (y === height) {
      // الطبقة العلوية
      if (height > this.settings.waterLevel) {
        return CONSTANTS.BLOCK_TYPES.GRASS;  // عشب فوق الماء
      } else {
        return CONSTANTS.BLOCK_TYPES.DIRT;   // تراب تحت الماء
      }
    }

    if (y > height - 3) {
      // طبقة التراب
      return CONSTANTS.BLOCK_TYPES.DIRT;
    }

    if (y > height - 8) {
      // طبقة الحجر الرمادي
      return CONSTANTS.BLOCK_TYPES.STONE;
    }

    // الطبقات السفيرة (صخور عميقة)
    if (Math.random() > 0.7) {
      return CONSTANTS.BLOCK_TYPES.STONE;
    }

    return CONSTANTS.BLOCK_TYPES.EMPTY;
  }

  // ===== حساب ارتفاع التضاريس عند موقع معين =====
  getTerrainHeight(x, z) {
    // استخدام Octave Noise للحصول على قيمة بين -1 و 1
    const noise = this.perlin.octaveNoise2D(
      x / this.settings.scale,
      z / this.settings.scale,
      this.settings.octaves,
      this.settings.persistence,
      this.settings.lacunarity
    );

    // تحويل القيمة إلى ارتفاع بالكتل
    const height = Math.round(
      (noise + 1) / 2 * this.settings.amplitude + this.settings.grassLevel
    );

    return Math.max(0, Math.min(height, CONSTANTS.WORLD.HEIGHT - 1));
  }

  // ===== إضافة ميزات طبيعية (أشجار، كهوف، إلخ) =====
  addFeatures(x, y, z) {
    // يمكن إضافة أشجار أو كهوف هنا لاحقاً
    return false;
  }

  // ===== تعديل إعدادات التوليد =====
  setSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  // ===== الحصول على الإعدادات =====
  getSettings() {
    return { ...this.settings };
  }

  // ===== إعادة تعيين الـ Seed =====
  setSeed(seed) {
    this.seed = seed;
    this.perlin = new PerlinNoise(seed);
  }

  // ===== عرض معلومات المولد =====
  getInfo() {
    return {
      seed: this.seed,
      settings: this.settings,
    };
  }
}

export default TerrainGenerator;
