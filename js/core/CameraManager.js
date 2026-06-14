// ==========================================
// CAMERA MANAGER - إدارة الكاميرا
// ==========================================

import CONSTANTS from '../utils/Constants.js';

class CameraManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.camera = null;
    this.scene = sceneManager.getScene();

    this.init();
  }

  init() {
    this.createCamera();
    this.setupWindowResizeListener();
  }

  // ===== إنشاء الكاميرا =====
  createCamera() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    // استخدام كاميرا PerspectiveCamera (منظور)
    // تحاكي الرؤية البشرية الطبيعية
    this.camera = new THREE.PerspectiveCamera(
      CONSTANTS.CAMERA.FOV,    // زاوية الرؤية (Field of View)
      aspect,                   // نسبة العرض إلى الارتفاع
      CONSTANTS.CAMERA.NEAR,    // البؤرة القريبة
      CONSTANTS.CAMERA.FAR      // البؤرة البعيدة
    );

    // موقع الكاميرا الابتدائي
    this.camera.position.set(
      CONSTANTS.PLAYER.START_X,
      CONSTANTS.PLAYER.START_Y,
      CONSTANTS.PLAYER.START_Z
    );

    // اتجاه الكاميرا
    this.camera.lookAt(
      CONSTANTS.PLAYER.START_X,
      CONSTANTS.PLAYER.START_Y - 1,
      CONSTANTS.PLAYER.START_Z - 5
    );

    // إضافة الكاميرا إلى المشهد
    this.scene.add(this.camera);

    // تخزين مرجع الكاميرا في SceneManager
    this.sceneManager.camera = this.camera;

    if (CONSTANTS.DEBUG) {
      console.log('✓ Camera created at position:', this.camera.position);
    }
  }

  // ===== مستمع لتغيير حجم النافذة =====
  setupWindowResizeListener() {
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // تحديث نسبة العرض إلى الارتفاع
    this.camera.aspect = width / height;

    // تحديث مصفوفة الإسقاط (Projection Matrix)
    this.camera.updateProjectionMatrix();
  }

  // ===== تحديث موقع الكاميرا =====
  setPosition(x, y, z) {
    this.camera.position.set(x, y, z);
  }

  // ===== الحصول على موقع الكاميرا =====
  getPosition() {
    return this.camera.position;
  }

  // ===== إضافة موقع للكاميرا (نسبي) =====
  addPosition(dx, dy, dz) {
    this.camera.position.x += dx;
    this.camera.position.y += dy;
    this.camera.position.z += dz;
  }

  // ===== تدوير الكاميرا (نظام Euler Angles) =====
  // استخدام Euler للدوران بشكل أسهل وأكثر طبيعية
  getEuler() {
    return this.camera.rotation;
  }

  // ===== الحصول على اتجاه نظر الكاميرا =====
  // اتجاه مامام الكاميرا (يستخدم لمعرفة أي كتلة نختار)
  getDirection() {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return direction;
  }

  // ===== الحصول على الكاميرا =====
  getCamera() {
    return this.camera;
  }

  // ===== تعديل FOV (زاوية الرؤية) =====
  // مفيد للتقريب والإبعاد
  setFOV(fov) {
    this.camera.fov = fov;
    this.camera.updateProjectionMatrix();
  }

  getFOV() {
    return this.camera.fov;
  }

  // ===== Zoom (تقريب) =====
  zoom(factor) {
    // factor > 1: إبعاد
    // factor < 1: تقريب
    this.camera.fov += factor;
    this.camera.fov = Math.max(10, Math.min(100, this.camera.fov));
    this.camera.updateProjectionMatrix();
  }
}

export default CameraManager;
