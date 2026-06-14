// ==========================================
// ENVIRONMENT GENERATOR - توليد الأشجار والكهوف والميزات الأخرى
// ==========================================

import CONSTANTS from '../utils/Constants.js';
import Helper from '../utils/Helper.js';

class EnvironmentGenerator {
  constructor(perlin) {
    this.perlin = perlin;

    // إعدادات التوليد
    this.settings = {
      treeChance: 0.08,        // احتمالية وجود شجرة في كل موقع
      caveChance: 0.3,         // احتمالية وجود كهف
      caveSize: 4,             // حجم الكهوف
      treeDensity: 0.1,        // كثافة الأشجار
    };
  }

  // ===== توليد الأشجار في منطقة معينة =====
  generateTrees(chunk, terrainGenerator, blocks) {
    const chunkWidth = CONSTANTS.CHUNK.WIDTH || 16;
    const chunkDepth = CONSTANTS.CHUNK.DEPTH || 16;

    // الموقع العالمي لـ Chunk
    const baseX = chunk.x * chunkWidth;
    const baseZ = chunk.z * chunkDepth;

    // محاولة توليد أشجار
    for (let lx = 0; lx < chunkWidth; lx++) {
      for (let lz = 0; lz < chunkDepth; lz++) {
        const wx = baseX + lx;
        const wz = baseZ + lz;

        // الحصول على ارتفاع التضاريس
        const terrainHeight = terrainGenerator.getTerrainHeight(wx, wz);

        // فحص إذا يجب أن نضع شجرة هنا
        const noise = this.perlin.noise2D(wx / 30, wz / 30);
        const shouldPlaceTree = (noise + 1) / 2 > (1 - this.settings.treeChance);

        if (shouldPlaceTree && terrainHeight > terrainGenerator.settings.waterLevel) {
          // وضع شجرة
          this.placeTree(blocks, wx, Math.floor(terrainHeight) + 1, wz, lx, lz, chunk);
        }
      }
    }
  }

  // ===== وضع شجرة واحدة محسّنة =====
  placeTree(blocks, worldX, worldY, worldZ, localX, localZ, chunk) {
    const chunkHeight = CONSTANTS.CHUNK.HEIGHT || 16;
    const chunkDepth = CONSTANTS.CHUNK.DEPTH || 16;
    const chunkWidth = CONSTANTS.CHUNK.WIDTH || 16;

    // ارتفاع الشجرة
    const treeHeight = Helper.random(6, 11);
    const trunkTop = worldY + treeHeight;

    // وضع جذع الشجرة (خشب)
    for (let h = 0; h < treeHeight; h++) {
      const y = worldY + h;
      const localY = (chunk.y * chunkHeight) + h;

      // تحويل للإحداثيات المحلية
      if (localY >= 0 && localY < chunkHeight) {
        const key = `${localX},${localY},${localZ}`;
        blocks[key] = CONSTANTS.BLOCK_TYPES.WOOD;
      }
    }

    // وضع أوراق الشجرة برتفاعات مختلفة (شكل مخروطي)
    // طبقة سفلية: كبيرة
    this.placeLeavesLayer(blocks, worldX, trunkTop, worldZ, localX, localZ, chunk, 4, 0);

    // طبقة وسطية: متوسطة
    this.placeLeavesLayer(blocks, worldX, trunkTop + 2, worldZ, localX, localZ, chunk, 3, 2);

    // طبقة عليا: صغيرة
    this.placeLeavesLayer(blocks, worldX, trunkTop + 4, worldZ, localX, localZ, chunk, 2, 4);

    // طبقة القمة: نقطة واحدة
    this.placeLeavesLayer(blocks, worldX, trunkTop + 6, worldZ, localX, localZ, chunk, 1, 6);

    if (CONSTANTS.DEBUG) {
      console.log(`🌳 Enhanced tree placed at (${worldX}, ${worldY}, ${worldZ})`);
    }
  }

  // ===== وضع طبقة أوراق =====
  placeLeavesLayer(blocks, worldX, worldY, worldZ, localX, localZ, chunk, radius, heightOffset) {
    const chunkHeight = CONSTANTS.CHUNK.HEIGHT || 16;
    const chunkWidth = CONSTANTS.CHUNK.WIDTH || 16;
    const chunkDepth = CONSTANTS.CHUNK.DEPTH || 16;

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        const distance = Math.sqrt(dx * dx + dz * dz);

        // شكل دائري للأوراق
        if (distance <= radius) {
          const lx = localX + dx;
          const lz = localZ + dz;
          const ly = (chunk.y * chunkHeight) + (worldY - chunk.y * chunkHeight) + heightOffset;

          // التحقق من الحدود
          if (lx >= 0 && lx < chunkWidth && lz >= 0 && lz < chunkDepth && ly >= 0 && ly < chunkHeight) {
            const key = `${lx},${ly},${lz}`;
            // عدم الكتابة فوق الخشب
            if (blocks[key] !== CONSTANTS.BLOCK_TYPES.WOOD) {
              blocks[key] = CONSTANTS.BLOCK_TYPES.LEAVES;
            }
          }
        }
      }
    }
  }

  // ===== توليد الكهوف =====
  generateCaves(chunk, blocks) {
    const chunkWidth = CONSTANTS.CHUNK.WIDTH || 16;
    const chunkHeight = CONSTANTS.CHUNK.HEIGHT || 16;
    const chunkDepth = CONSTANTS.CHUNK.DEPTH || 16;

    // الموقع العالمي لـ Chunk
    const baseX = chunk.x * chunkWidth;
    const baseY = chunk.y * chunkHeight;
    const baseZ = chunk.z * chunkDepth;

    // توليد كهوف عشوائية
    for (let x = 0; x < chunkWidth; x++) {
      for (let y = 0; y < chunkHeight; y++) {
        for (let z = 0; z < chunkDepth; z++) {
          const key = `${x},${y},${z}`;

          // فقط للحجر والتراب
          if (blocks[key] !== CONSTANTS.BLOCK_TYPES.STONE &&
              blocks[key] !== CONSTANTS.BLOCK_TYPES.DIRT) {
            continue;
          }

          // ضوضاء الكهوف
          const caveNoise = this.perlin.noise(
            (baseX + x) / this.settings.caveSize,
            (baseY + y) / this.settings.caveSize,
            (baseZ + z) / this.settings.caveSize
          );

          // إذا كانت الضوضاء منخفضة جداً، احفر كهف
          if (caveNoise < -this.settings.caveChance) {
            blocks[key] = CONSTANTS.BLOCK_TYPES.EMPTY;
          }
        }
      }
    }
  }

  // ===== توليد موارد معادن (اختياري للمستقبل) =====
  generateOres(chunk, blocks) {
    // سيتم تطويره لاحقاً
    // أنواع خام: الحديد، الذهب، الماس، إلخ
  }

  // ===== تعديل الإعدادات =====
  setSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
  }

  // ===== الحصول على الإعدادات =====
  getSettings() {
    return { ...this.settings };
  }
}

export default EnvironmentGenerator;
