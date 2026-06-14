// ==========================================
// STRUCTURE GENERATOR - إنشاء البنى المسبقة
// ==========================================

import CONSTANTS from '../utils/Constants.js';

class StructureGenerator {
  // ===== إنشاء منزل بدء اللعبة =====
  static createStarterHouse(world, centerX = 0, centerY = 0, centerZ = 0) {
    console.log('🏠 Generating starter house at spawn point...');

    // إيجاد ارتفاع الأرض عند نقطة البداية
    const groundY = world.getTerrainHeightAtChunk(centerX, centerZ) + 1;

    // أبعاد المنزل
    const width = 7;
    const height = 4;
    const depth = 7;
    const doorX = centerX + Math.floor(width / 2);
    const doorZ = centerZ;

    // 1. بناء الجدران والأرضية (حجر)
    for (let x = centerX; x < centerX + width; x++) {
      for (let z = centerZ; z < centerZ + depth; z++) {
        // الأرضية
        world.setBlock(x, groundY, z, CONSTANTS.BLOCK_TYPES.STONE);

        // الجدران الخارجية
        if (x === centerX || x === centerX + width - 1 || z === centerZ || z === centerZ + depth - 1) {
          for (let y = groundY + 1; y < groundY + height; y++) {
            world.setBlock(x, y, z, CONSTANTS.BLOCK_TYPES.STONE);
          }
        }
      }
    }

    // 2. إزالة الكتل الداخلية (تفريغ المنزل من الداخل)
    for (let x = centerX + 1; x < centerX + width - 1; x++) {
      for (let z = centerZ + 1; z < centerZ + depth - 1; z++) {
        for (let y = groundY + 1; y < groundY + height - 1; y++) {
          world.setBlock(x, y, z, CONSTANTS.BLOCK_TYPES.EMPTY);
        }
      }
    }

    // 3. إضافة السقف (خشب)
    for (let x = centerX; x < centerX + width; x++) {
      for (let z = centerZ; z < centerZ + depth; z++) {
        world.setBlock(x, groundY + height - 1, z, CONSTANTS.BLOCK_TYPES.WOOD);
      }
    }

    // 4. إضافة الباب
    world.setBlock(doorX, groundY + 1, doorZ, CONSTANTS.BLOCK_TYPES.EMPTY);

    // 5. إضافة نافذة على الجانب
    const windowX = centerX + width - 1;
    const windowZ = centerZ + Math.floor(depth / 2);
    world.setBlock(windowX, groundY + 2, windowZ, CONSTANTS.BLOCK_TYPES.EMPTY);

    console.log(`✓ Starter house created from (${centerX}, ${groundY}, ${centerZ}) to (${centerX + width}, ${groundY + height}, ${centerZ + depth})`);
  }

  // ===== إنشاء برج مراقبة =====
  static createWatchTower(world, centerX = 0, centerY = 0, centerZ = 0, height = 10) {
    console.log('🏰 Generating watch tower...');

    const groundY = world.getTerrainHeightAtChunk(centerX, centerZ) + 1;
    const size = 3;

    // بناء البرج (حجر)
    for (let x = centerX; x < centerX + size; x++) {
      for (let z = centerZ; z < centerZ + size; z++) {
        for (let y = groundY; y < groundY + height; y++) {
          // ترك الداخل فارغاً
          if (x === centerX || x === centerX + size - 1 || z === centerZ || z === centerZ + size - 1) {
            world.setBlock(x, y, z, CONSTANTS.BLOCK_TYPES.STONE);
          }
        }
      }
    }

    // إضافة سقف
    for (let x = centerX; x < centerX + size; x++) {
      for (let z = centerZ; z < centerZ + size; z++) {
        world.setBlock(x, groundY + height, z, CONSTANTS.BLOCK_TYPES.WOOD);
      }
    }

    console.log(`✓ Watch tower created at (${centerX}, ${groundY}, ${centerZ}) with height ${height}`);
  }

  // ===== إنشاء حديقة بسيطة =====
  static createGarden(world, centerX = 0, centerZ = 0, size = 5) {
    console.log('🌳 Generating garden...');

    const groundY = world.getTerrainHeightAtChunk(centerX, centerZ) + 1;

    // غرس الأشجار البسيطة (جذع خشب + أوراق)
    for (let x = centerX; x < centerX + size; x += 2) {
      for (let z = centerZ; z < centerZ + size; z += 2) {
        // الجذع
        world.setBlock(x, groundY + 1, z, CONSTANTS.BLOCK_TYPES.WOOD);

        // الأوراق العلوية
        if (groundY + 2 < 255) {
          world.setBlock(x, groundY + 2, z, CONSTANTS.BLOCK_TYPES.LEAVES);
          world.setBlock(x + 1, groundY + 2, z, CONSTANTS.BLOCK_TYPES.LEAVES);
          world.setBlock(x, groundY + 2, z + 1, CONSTANTS.BLOCK_TYPES.LEAVES);
          world.setBlock(x + 1, groundY + 2, z + 1, CONSTANTS.BLOCK_TYPES.LEAVES);
        }
      }
    }

    console.log(`✓ Garden created at (${centerX}, ${centerZ}) with size ${size}`);
  }
}

export default StructureGenerator;
