// ==========================================
// WORLD.JS - إدارة العالم والكتل
// ==========================================

import CONSTANTS from '../utils/Constants.js';
import Block from './Block.js';
import Helper from '../utils/Helper.js';

class World {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.getScene();

    // تخزين الكتل في Array ثلاثي الأبعاد
    this.blocks = {};

    // مجموعة جميع الـ Meshes
    this.meshGroup = new THREE.Group();
    this.scene.add(this.meshGroup);

    // إحصائيات
    this.blockCount = 0;
    this.meshCount = 0;

    this.init();
  }

  init() {
    // توليد العالم الأولي
    this.generateWorld();

    if (CONSTANTS.DEBUG) {
      console.log('✓ World initialized');
      console.log(`  Total blocks: ${this.blockCount}`);
      console.log(`  Rendered meshes: ${this.meshCount}`);
    }
  }

  // ===== توليد العالم =====
  generateWorld() {
    const width = CONSTANTS.WORLD.WIDTH;
    const height = CONSTANTS.WORLD.HEIGHT;
    const depth = CONSTANTS.WORLD.DEPTH;

    // إنشاء أرضية (ground)
    const groundLevel = 5;

    for (let x = 0; x < width; x++) {
      for (let z = 0; z < depth; z++) {
        // طبقة الحجر (تحت)
        for (let y = 0; y < groundLevel - 1; y++) {
          this.setBlock(x, y, z, CONSTANTS.BLOCK_TYPES.STONE);
        }

        // طبقة التراب
        this.setBlock(x, groundLevel - 1, z, CONSTANTS.BLOCK_TYPES.DIRT);

        // طبقة العشب (الأعلى)
        this.setBlock(x, groundLevel, z, CONSTANTS.BLOCK_TYPES.GRASS);

        // إضافة كتل عشوائية بسيطة (أشجار ومباني)
        if (Math.random() > 0.95) {
          const treeHeight = Helper.random(3, 5);
          for (let h = 0; h < treeHeight; h++) {
            this.setBlock(x, groundLevel + 1 + h, z, CONSTANTS.BLOCK_TYPES.WOOD);
          }

          // أوراق الشجرة
          if (Math.random() > 0.5) {
            for (let dx = -1; dx <= 1; dx++) {
              for (let dz = -1; dz <= 1; dz++) {
                const lx = x + dx;
                const lz = z + dz;
                if (lx >= 0 && lx < width && lz >= 0 && lz < depth) {
                  this.setBlock(lx, groundLevel + treeHeight + 2, lz, CONSTANTS.BLOCK_TYPES.LEAVES);
                }
              }
            }
          }
        }
      }
    }

    // إضافة جزيرة عائمة في المنتصف (اختياري)
    const centerX = Math.floor(width / 2);
    const centerZ = Math.floor(depth / 2);
    const floatingY = 15;

    for (let x = centerX - 3; x <= centerX + 3; x++) {
      for (let z = centerZ - 3; z <= centerZ + 3; z++) {
        if (x >= 0 && x < width && z >= 0 && z < depth) {
          this.setBlock(x, floatingY, z, CONSTANTS.BLOCK_TYPES.STONE);
          this.setBlock(x, floatingY + 1, z, CONSTANTS.BLOCK_TYPES.GRASS);
        }
      }
    }
  }

  // ===== تعيين كتلة =====
  setBlock(x, y, z, type) {
    // التحقق من الحدود
    if (!this.isWithinBounds(x, y, z)) {
      return false;
    }

    // إنشاء مفتاح فريد للكتلة
    const key = `${x},${y},${z}`;

    // إذا كانت الكتلة موجودة بالفعل، حذفها أولاً
    if (this.blocks[key]) {
      this.removeBlock(x, y, z);
    }

    // إنشاء كتلة جديدة
    const block = new Block(x, y, z, type);

    // إنشاء Mesh وإضافته للمشهد
    const mesh = block.createMesh();
    this.meshGroup.add(mesh);

    // تخزين الكتلة
    this.blocks[key] = block;
    this.blockCount++;
    this.meshCount++;

    return true;
  }

  // ===== الحصول على كتلة =====
  getBlock(x, y, z) {
    const key = `${x},${y},${z}`;
    return this.blocks[key] || null;
  }

  // ===== حذف كتلة =====
  removeBlock(x, y, z) {
    const key = `${x},${y},${z}`;
    const block = this.blocks[key];

    if (block) {
      // حذف الـ Mesh من المشهد
      if (block.mesh) {
        this.meshGroup.remove(block.mesh);
        block.dispose();
        this.meshCount--;
      }

      // حذف من التخزين
      delete this.blocks[key];
      this.blockCount--;

      return true;
    }

    return false;
  }

  // ===== التحقق من وجود كتلة =====
  hasBlock(x, y, z) {
    return this.getBlock(x, y, z) !== null;
  }

  // ===== التحقق من الحدود =====
  isWithinBounds(x, y, z) {
    return (
      x >= 0 && x < CONSTANTS.WORLD.WIDTH &&
      y >= 0 && y < CONSTANTS.WORLD.HEIGHT &&
      z >= 0 && z < CONSTANTS.WORLD.DEPTH
    );
  }

  // ===== تحديث نوع الكتلة =====
  updateBlock(x, y, z, newType) {
    const block = this.getBlock(x, y, z);
    if (block) {
      block.setType(newType);
      return true;
    }
    return false;
  }

  // ===== الحصول على كل الكتل المرئية =====
  getVisibleBlocks() {
    return Object.values(this.blocks).filter(block => block.isVisible());
  }

  // ===== الحصول على إحصائيات العالم =====
  getStats() {
    return {
      totalBlocks: this.blockCount,
      visibleMeshes: this.meshCount,
      blockTypes: this.countBlockTypes(),
    };
  }

  // ===== عد أنواع الكتل =====
  countBlockTypes() {
    const count = {};

    Object.values(this.blocks).forEach(block => {
      const typeName = Object.keys(CONSTANTS.BLOCK_TYPES).find(
        key => CONSTANTS.BLOCK_TYPES[key] === block.type
      );
      count[typeName] = (count[typeName] || 0) + 1;
    });

    return count;
  }

  // ===== البحث عن كتلة باستخدام Raycast (للنقر) =====
  raycast(origin, direction, maxDistance = 10) {
    const raycaster = new THREE.Raycaster(origin, direction.normalize());
    const intersects = raycaster.intersectObjects(this.meshGroup.children);

    if (intersects.length > 0) {
      const firstHit = intersects[0];
      if (firstHit.distance <= maxDistance) {
        return {
          block: firstHit.object.userData,
          distance: firstHit.distance,
          point: firstHit.point,
          normal: firstHit.face.normal,
          mesh: firstHit.object,
        };
      }
    }

    return null;
  }

  // ===== الحصول على الكتلة المجاورة للنقر =====
  getAdjacentBlock(raycastHit) {
    if (!raycastHit) return null;

    const blockData = raycastHit.block;
    const normal = raycastHit.normal;

    // حساب موقع الكتلة الجديدة بناءً على الاتجاه الطبيعي
    const newX = blockData.blockX + Math.round(normal.x);
    const newY = blockData.blockY + Math.round(normal.y);
    const newZ = blockData.blockZ + Math.round(normal.z);

    return { x: newX, y: newY, z: newZ };
  }

  // ===== تنظيف العالم =====
  dispose() {
    // حذف جميع الكتل
    Object.values(this.blocks).forEach(block => {
      block.dispose();
    });

    // حذف الـ Group
    this.meshGroup.children.forEach(mesh => {
      mesh.geometry.dispose();
      mesh.material.dispose();
    });

    this.blocks = {};
    this.blockCount = 0;
    this.meshCount = 0;

    if (CONSTANTS.DEBUG) {
      console.log('🧹 World disposed');
    }
  }
}

export default World;
