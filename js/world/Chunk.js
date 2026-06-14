// ==========================================
// CHUNK.JS - تمثيل جزء من العالم
// ==========================================

import CONSTANTS from '../utils/Constants.js';
import Block from './Block.js';

class Chunk {
  constructor(x, y, z, generator = null, materialManager = null) {
    this.x = x;           // موقع Chunk على المحور X
    this.y = y;           // موقع Chunk على المحور Y
    this.z = z;           // موقع Chunk على المحور Z

    // حجم الـ Chunk
    this.width = CONSTANTS.CHUNK.WIDTH || 16;
    this.height = CONSTANTS.CHUNK.HEIGHT || 16;
    this.depth = CONSTANTS.CHUNK.DEPTH || 16;

    // تخزين الكتل ثلاثي الأبعاد
    this.blocks = {};

    // مجموعة Mesh الـ Three.js
    this.meshGroup = null;
    this.meshes = [];

    // حالة الـ Chunk
    this.isLoaded = false;
    this.isMeshed = false;
    this.isDirty = false; // هل يحتاج لإعادة رسم؟

    this.generator = generator;
    this.materialManager = materialManager;

    this.init();
  }

  init() {
    if (this.generator) {
      this.generateTerrain();
    }
  }

  // ===== توليد التضاريس =====
  generateTerrain() {
    if (!this.generator) return;

    for (let lx = 0; lx < this.width; lx++) {
      for (let lz = 0; lz < this.depth; lz++) {
        for (let ly = 0; ly < this.height; ly++) {
          // تحويل الموقع المحلي إلى موقع عالمي
          const wx = this.x * this.width + lx;
          const wy = this.y * this.height + ly;
          const wz = this.z * this.depth + lz;

          // الحصول على نوع الكتلة من المولد
          const blockType = this.generator.getBlockType(wx, wy, wz);

          if (blockType !== CONSTANTS.BLOCK_TYPES.EMPTY) {
            this.setLocalBlock(lx, ly, lz, blockType);
          }
        }
      }
    }

    // توليد الأشجار والكهوف
    this.generateEnvironment();

    this.isLoaded = true;
    this.isDirty = true;

    if (CONSTANTS.DEBUG) {
      console.log(`📦 Chunk (${this.x}, ${this.y}, ${this.z}) generated with ${Object.keys(this.blocks).length} blocks`);
    }
  }

  // ===== توليد البيئة (أشجار، كهوف) =====
  generateEnvironment() {
    if (!this.generator || !this.generator.environmentGenerator) return;

    // توليد الأشجار
    this.generator.environmentGenerator.generateTrees(this, this.generator, this.blocks);

    // توليد الكهوف
    this.generator.environmentGenerator.generateCaves(this, this.blocks);
  }

  // ===== تعيين كتلة محلياً =====
  setLocalBlock(lx, ly, lz, type) {
    if (!this.isWithinLocalBounds(lx, ly, lz)) return false;

    const key = `${lx},${ly},${lz}`;
    this.blocks[key] = type;
    this.isDirty = true;

    return true;
  }

  // ===== الحصول على كتلة محلياً =====
  getLocalBlock(lx, ly, lz) {
    if (!this.isWithinLocalBounds(lx, ly, lz)) return null;

    const key = `${lx},${ly},${lz}`;
    return this.blocks[key] || CONSTANTS.BLOCK_TYPES.EMPTY;
  }

  // ===== حذف كتلة محلياً =====
  removeLocalBlock(lx, ly, lz) {
    if (!this.isWithinLocalBounds(lx, ly, lz)) return false;

    const key = `${lx},${ly},${lz}`;
    if (this.blocks[key]) {
      delete this.blocks[key];
      this.isDirty = true;
      return true;
    }

    return false;
  }

  // ===== التحقق من الحدود المحلية =====
  isWithinLocalBounds(lx, ly, lz) {
    return (
      lx >= 0 && lx < this.width &&
      ly >= 0 && ly < this.height &&
      lz >= 0 && lz < this.depth
    );
  }

  // ===== بناء Mesh من الكتل =====
  buildMesh(scene) {
    if (!this.isLoaded) return;

    // حذف الـ Meshes القديمة
    this.clearMeshes();

    // إنشاء مجموعة جديدة
    this.meshGroup = new THREE.Group();

    // موقع الـ Chunk العالمي
    const baseX = this.x * this.width;
    const baseY = this.y * this.height;
    const baseZ = this.z * this.depth;

    // إنشاء Meshes للكتل
    for (const key in this.blocks) {
      const blockType = this.blocks[key];
      const [lx, ly, lz] = key.split(',').map(Number);

      // الموقع العالمي
      const wx = baseX + lx;
      const wy = baseY + ly;
      const wz = baseZ + lz;

      // إنشاء Block وMesh (مع MaterialManager إذا كان متوفراً)
      const block = new Block(wx, wy, wz, blockType, this.materialManager);
      const mesh = block.createMesh();

      this.meshGroup.add(mesh);
      this.meshes.push(mesh);
    }

    // إضافة المجموعة للمشهد
    scene.add(this.meshGroup);

    this.isMeshed = true;
    this.isDirty = false;

    if (CONSTANTS.DEBUG) {
      console.log(`🎨 Chunk (${this.x}, ${this.y}, ${this.z}) meshed with ${this.meshes.length} blocks`);
    }
  }

  // ===== حذف الـ Meshes =====
  clearMeshes() {
    this.meshes.forEach(mesh => {
      if (mesh.geometry) mesh.geometry.dispose();
      if (mesh.material) mesh.material.dispose();
    });

    if (this.meshGroup) {
      this.meshGroup.children.forEach(child => {
        this.meshGroup.remove(child);
      });
    }

    this.meshes = [];
    this.isMeshed = false;
  }

  // ===== إزالة الـ Chunk من المشهد =====
  removeFromScene(scene) {
    if (this.meshGroup && this.meshGroup.parent) {
      scene.remove(this.meshGroup);
    }
    this.clearMeshes();
  }

  // ===== الحصول على حدود الـ Chunk =====
  getBounds() {
    return {
      minX: this.x * this.width,
      maxX: (this.x + 1) * this.width,
      minY: this.y * this.height,
      maxY: (this.y + 1) * this.height,
      minZ: this.z * this.depth,
      maxZ: (this.z + 1) * this.depth,
    };
  }

  // ===== الحصول على مركز الـ Chunk =====
  getCenter() {
    const bounds = this.getBounds();
    return {
      x: (bounds.minX + bounds.maxX) / 2,
      y: (bounds.minY + bounds.maxY) / 2,
      z: (bounds.minZ + bounds.maxZ) / 2,
    };
  }

  // ===== تنظيف الموارد =====
  dispose() {
    this.clearMeshes();
    this.blocks = {};
  }

  // ===== الحصول على عدد الكتل =====
  getBlockCount() {
    return Object.keys(this.blocks).length;
  }

  // ===== الحصول على معلومات الـ Chunk =====
  getInfo() {
    return {
      position: { x: this.x, y: this.y, z: this.z },
      isLoaded: this.isLoaded,
      isMeshed: this.isMeshed,
      isDirty: this.isDirty,
      blockCount: this.getBlockCount(),
      meshCount: this.meshes.length,
    };
  }
}

export default Chunk;
