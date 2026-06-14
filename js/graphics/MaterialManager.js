// ==========================================
// MATERIAL MANAGER - نظام إدارة المواد (Materials)
// ==========================================

import CONSTANTS from '../utils/Constants.js';

class MaterialManager {
  constructor(textureManager) {
    this.textureManager = textureManager;
    this.materials = {};

    this.init();
  }

  init() {
    // إنشاء مادة لكل نوع كتلة
    this.createMaterials();

    if (CONSTANTS.DEBUG) {
      console.log('✓ MaterialManager initialized');
    }
  }

  // ===== إنشاء المواد =====
  createMaterials() {
    const blockTypes = [
      CONSTANTS.BLOCK_TYPES.STONE,
      CONSTANTS.BLOCK_TYPES.DIRT,
      CONSTANTS.BLOCK_TYPES.GRASS,
      CONSTANTS.BLOCK_TYPES.WOOD,
      CONSTANTS.BLOCK_TYPES.LEAVES,
    ];

    blockTypes.forEach(blockType => {
      this.createMaterial(blockType);
    });
  }

  // ===== إنشاء مادة واحدة =====
  createMaterial(blockType) {
    const texture = this.textureManager.getTexture(blockType);

    // تحسين الخامة
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.anisotropy = CONSTANTS.GRAPHICS.ANISOTROPY || 1;

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.FrontSide,
      metalness: this.getMetalness(blockType),
      roughness: this.getRoughness(blockType),
      wireframe: false,
      flatShading: CONSTANTS.GRAPHICS.FLAT_SHADING || false,
    });

    this.materials[blockType] = material;

    return material;
  }

  // ===== الحصول على معامل المعادن =====
  getMetalness(blockType) {
    switch (blockType) {
      case CONSTANTS.BLOCK_TYPES.STONE:
        return 0.1;  // قليل من اللمعان للحجر
      case CONSTANTS.BLOCK_TYPES.WOOD:
        return 0.05; // خشب غير معدني
      case CONSTANTS.BLOCK_TYPES.LEAVES:
        return 0.0;  // أوراق غير معدنية
      default:
        return 0.0;
    }
  }

  // ===== الحصول على معامل الخشونة =====
  getRoughness(blockType) {
    switch (blockType) {
      case CONSTANTS.BLOCK_TYPES.STONE:
        return 0.8;  // حجر خشن
      case CONSTANTS.BLOCK_TYPES.DIRT:
        return 0.9;  // تراب خشن جداً
      case CONSTANTS.BLOCK_TYPES.GRASS:
        return 0.85; // عشب خشن
      case CONSTANTS.BLOCK_TYPES.WOOD:
        return 0.7;  // خشب ناعم نسبياً
      case CONSTANTS.BLOCK_TYPES.LEAVES:
        return 0.6;  // أوراق ناعمة
      default:
        return 0.8;
    }
  }

  // ===== الحصول على مادة =====
  getMaterial(blockType) {
    return this.materials[blockType] || this.materials[CONSTANTS.BLOCK_TYPES.STONE];
  }

  // ===== الحصول على جميع المواد =====
  getAllMaterials() {
    return { ...this.materials };
  }

  // ===== تحديث مادة =====
  updateMaterial(blockType) {
    this.createMaterial(blockType);
  }

  // ===== تغيير إعدادات العرض =====
  setWireframeMode(enabled) {
    Object.values(this.materials).forEach(material => {
      material.wireframe = enabled;
    });
  }

  // ===== تحسين الجودة =====
  setHighQuality(enabled) {
    Object.values(this.materials).forEach(material => {
      if (enabled) {
        material.roughness *= 0.9;
        material.metalness *= 0.9;
      }
    });
  }

  // ===== تنظيف الموارد =====
  dispose() {
    Object.values(this.materials).forEach(material => {
      material.dispose();
    });

    this.materials = {};

    if (CONSTANTS.DEBUG) {
      console.log('🧹 MaterialManager disposed');
    }
  }
}

export default MaterialManager;
