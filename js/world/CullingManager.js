// ==========================================
// CULLING MANAGER - تحسين الأداء بحذف العناصر غير المرئية
// ==========================================

import CONSTANTS from '../utils/Constants.js';

class CullingManager {
  constructor(camera) {
    this.camera = camera;
    this.frustum = new THREE.Frustum();
    this.projScreenMatrix = new THREE.Matrix4();

    // عدد العناصر المخفية/المرئية
    this.visibleCount = 0;
    this.culledCount = 0;

    // التخزين المؤقت للحدود
    this.boundsCache = new Map();
  }

  // ===== تحديث Frustum (نطاق الرؤية) =====
  updateFrustum() {
    // تحديث المصفوفة الإسقاطية
    this.projScreenMatrix.multiplyMatrices(
      this.camera.projectionMatrix,
      this.camera.matrixWorldInverse
    );

    // تحديث الـ Frustum
    this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
  }

  // ===== التحقق إذا كان كائن مرئياً =====
  isVisible(mesh) {
    if (!mesh.geometry.boundingSphere) {
      mesh.geometry.computeBoundingSphere();
    }

    return this.frustum.containsPoint(mesh.position);
  }

  // ===== التحقق إذا كانت الكتلة مرئية =====
  isBlockVisible(blockPosition) {
    // نقطة ثلاثية الأبعاد
    const point = new THREE.Vector3(
      blockPosition.x + 0.5,
      blockPosition.y + 0.5,
      blockPosition.z + 0.5
    );

    return this.frustum.containsPoint(point);
  }

  // ===== التحقق إذا كان الـ Chunk مرئياً =====
  isChunkVisible(chunkBounds) {
    const box = new THREE.Box3(
      new THREE.Vector3(chunkBounds.minX, chunkBounds.minY, chunkBounds.minZ),
      new THREE.Vector3(chunkBounds.maxX, chunkBounds.maxY, chunkBounds.maxZ)
    );

    return this.frustum.intersectsBox(box);
  }

  // ===== تطبيق Frustum Culling على مجموعة =====
  cullGroup(group) {
    if (!group) return;

    // تحديث الـ Frustum أولاً
    this.updateFrustum();

    this.visibleCount = 0;
    this.culledCount = 0;

    group.children.forEach(child => {
      const isVisible = this.isVisible(child);

      child.visible = isVisible;

      if (isVisible) {
        this.visibleCount++;
      } else {
        this.culledCount++;
      }
    });
  }

  // ===== تطبيق Occlusion Culling (تقريبي) =====
  // يخفي الكتل التي لا يمكن رؤيتها من الكاميرا
  cullOccludedBlocks(meshes, cameraPos) {
    meshes.forEach(mesh => {
      const blockPos = mesh.position;

      // حساب المسافة من الكاميرا
      const distance = cameraPos.distanceTo(blockPos);

      // إذا كانت بعيدة جداً، أخفها (اختياري)
      const maxDistance = CONSTANTS.CAMERA.FAR;

      if (distance > maxDistance) {
        mesh.visible = false;
        this.culledCount++;
      } else {
        mesh.visible = true;
        this.visibleCount++;
      }
    });
  }

  // ===== تطبيق Distance-based LOD (Level of Detail) =====
  updateLOD(meshes, cameraPos) {
    meshes.forEach(mesh => {
      const distance = cameraPos.distanceTo(mesh.position);

      // بناءً على المسافة، غيّر دقة النموذج
      // (يمكن أن يتطور إلى نماذج منخفضة الدقة)

      if (distance > 200) {
        mesh.visible = false;
      } else if (distance > 100) {
        mesh.material.wireframe = false; // أو استخدم نموذج منخفض
      }
    });
  }

  // ===== إحصائيات الـ Culling =====
  getStats() {
    return {
      visibleCount: this.visibleCount,
      culledCount: this.culledCount,
      totalCount: this.visibleCount + this.culledCount,
      cullRatio: (this.culledCount / (this.visibleCount + this.culledCount) * 100).toFixed(2),
    };
  }

  // ===== مسح التخزين المؤقت =====
  clearCache() {
    this.boundsCache.clear();
  }
}

export default CullingManager;
