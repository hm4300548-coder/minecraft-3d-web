// ==========================================
// BLOCK.JS - نظام الكتل الفردية
// ==========================================

import CONSTANTS from '../utils/Constants.js';

class Block {
  constructor(x, y, z, type = CONSTANTS.BLOCK_TYPES.STONE, materialManager = null) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.type = type;
    this.visible = true;       // هل الكتلة مرئية أم لا
    this.mesh = null;          // Mesh الـ Three.js للكتلة
    this.materialManager = materialManager;
  }

  // ===== إنشاء Mesh للكتلة =====
  createMesh() {
    // استخدام BoxGeometry لإنشاء مكعب
    const geometry = new THREE.BoxGeometry(
      CONSTANTS.BLOCK_SIZE,
      CONSTANTS.BLOCK_SIZE,
      CONSTANTS.BLOCK_SIZE
    );

    // الحصول على المادة من MaterialManager إذا كان متوفراً
    let material;
    if (this.materialManager) {
      material = this.materialManager.getMaterial(this.type);
    } else {
      // fallback إلى مادة بسيطة بناءً على اللون
      const color = this.getColor();
      material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.8,
        metalness: 0.2,
      });
    }

    // إنشاء Mesh
    const mesh = new THREE.Mesh(geometry, material);

    // تفعيل الظلال
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // تحديد موقع الكتلة
    mesh.position.set(
      this.x + CONSTANTS.BLOCK_SIZE / 2,
      this.y + CONSTANTS.BLOCK_SIZE / 2,
      this.z + CONSTANTS.BLOCK_SIZE / 2
    );

    // تخزين بيانات الكتلة في الـ Mesh (للمراجعة لاحقاً)
    mesh.userData = {
      blockX: this.x,
      blockY: this.y,
      blockZ: this.z,
      blockType: this.type,
    };

    this.mesh = mesh;
    return mesh;
  }

  // ===== الحصول على لون الكتلة =====
  getColor() {
    switch (this.type) {
      case CONSTANTS.BLOCK_TYPES.STONE:
        return CONSTANTS.BLOCK_COLORS.STONE;
      case CONSTANTS.BLOCK_TYPES.DIRT:
        return CONSTANTS.BLOCK_COLORS.DIRT;
      case CONSTANTS.BLOCK_TYPES.GRASS:
        return CONSTANTS.BLOCK_COLORS.GRASS;
      case CONSTANTS.BLOCK_TYPES.WOOD:
        return CONSTANTS.BLOCK_COLORS.WOOD;
      case CONSTANTS.BLOCK_TYPES.LEAVES:
        return CONSTANTS.BLOCK_COLORS.LEAVES;
      default:
        return 0xffffff; // أبيض كلون افتراضي
    }
  }

  // ===== الحصول على نوع الكتلة =====
  getType() {
    return this.type;
  }

  // ===== تعيين نوع الكتلة =====
  setType(type) {
    this.type = type;
    // تحديث لون الـ Mesh إذا كان موجوداً
    if (this.mesh) {
      this.mesh.material.color.setHex(this.getColor());
    }
  }

  // ===== الحصول على الموقع =====
  getPosition() {
    return {
      x: this.x,
      y: this.y,
      z: this.z,
    };
  }

  // ===== تحديث مرئية الكتلة =====
  setVisible(visible) {
    this.visible = visible;
    if (this.mesh) {
      this.mesh.visible = visible;
    }
  }

  // ===== الحصول على مرئية الكتلة =====
  isVisible() {
    return this.visible;
  }

  // ===== الحصول على الـ Mesh =====
  getMesh() {
    return this.mesh;
  }

  // ===== حذف الكتلة (تنظيف الموارد) =====
  dispose() {
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.material.dispose();
      this.mesh = null;
    }
  }

  // ===== نسخ البيانات =====
  clone() {
    const block = new Block(this.x, this.y, this.z, this.type);
    block.visible = this.visible;
    return block;
  }

  // ===== تحويل إلى String (للتصحيح) =====
  toString() {
    const typeNames = Object.keys(CONSTANTS.BLOCK_TYPES).find(
      key => CONSTANTS.BLOCK_TYPES[key] === this.type
    );
    return `Block(${this.x}, ${this.y}, ${this.z}) Type: ${typeNames || 'UNKNOWN'}`;
  }
}

export default Block;
