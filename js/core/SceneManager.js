// ==========================================
// SCENE MANAGER - إدارة المشهد والإضاءة
// ==========================================

import CONSTANTS from '../utils/Constants.js';

class SceneManager {
  constructor() {
    this.scene = null;
    this.renderer = null;
    this.camera = null;
    this.lights = {};

    this.init();
  }

  init() {
    // إنشاء المشهد الثلاثي الأبعاد
    this.createScene();

    // إنشاء الـ Renderer
    this.createRenderer();

    // إعداد الإضاءة
    this.setupLighting();

    // إضافة مستمع لتغيير حجم النافذة
    this.setupWindowResizeListener();
  }

  // ===== إنشاء المشهد =====
  createScene() {
    this.scene = new THREE.Scene();

    // لون الخلفية (سماء زرقاء فاتحة)
    this.scene.background = new THREE.Color(0x87CEEB);

    // الضباب (لتحسين الأداء)
    this.scene.fog = new THREE.Fog(
      0x87CEEB,  // لون الضباب (نفس لون السماء)
      500,       // بداية الضباب
      1000       // نهاية الضباب
    );

    if (CONSTANTS.DEBUG) {
      console.log('✓ Scene created successfully');
    }
  }

  // ===== إنشاء Renderer =====
  createRenderer() {
    const container = document.getElementById('canvas-container');

    this.renderer = new THREE.WebGLRenderer({
      antialias: false,  // Disable for performance
      powerPreference: 'high-performance',
      alpha: false,
      precision: 'lowp'
    });

    // إعدادات الـ Renderer (optimized for performance)
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap pixel ratio
    this.renderer.shadowMap.enabled = false;  // Disable shadows by default
    this.renderer.toneMapping = THREE.NoToneMapping;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // إضافة الـ Canvas إلى الصفحة
    container.appendChild(this.renderer.domElement);

    if (CONSTANTS.DEBUG) {
      console.log('✓ Renderer created successfully (optimized for 60+ FPS)');
    }
  }

  // ===== إعداد الإضاءة =====
  setupLighting() {
    // 1. ضوء محيط (Ambient Light)
    // يضيء المشهد بشكل عام من كل الاتجاهات
    const ambientLight = new THREE.AmbientLight(
      CONSTANTS.LIGHTING.AMBIENT_COLOR,
      CONSTANTS.LIGHTING.AMBIENT_INTENSITY
    );
    this.scene.add(ambientLight);
    this.lights.ambient = ambientLight;

    // 2. ضوء موجه (Directional Light)
    // يشبه ضوء الشمس - يأتي من اتجاه واحد
    const directionalLight = new THREE.DirectionalLight(
      CONSTANTS.LIGHTING.DIRECTIONAL_COLOR,
      CONSTANTS.LIGHTING.DIRECTIONAL_INTENSITY
    );

    // موقع الضوء (يمثل الشمس)
    directionalLight.position.set(100, 100, 50);

    // تفعيل الظلال مُعطّل لتحسين الأداء
    directionalLight.castShadow = false;

    this.scene.add(directionalLight);
    this.lights.directional = directionalLight;

    if (CONSTANTS.DEBUG) {
      console.log('✓ Lighting setup completed');
      // إضافة مساعد لعرض اتجاه الضوء (للتصحيح)
      const helper = new THREE.DirectionalLightHelper(directionalLight, 10);
      this.scene.add(helper);
    }
  }

  // ===== مستمع لتغيير حجم النافذة =====
  setupWindowResizeListener() {
    window.addEventListener('resize', () => this.onWindowResize());
  }

  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // تحديث حجم الـ Renderer
    this.renderer.setSize(width, height);

    // تحديث نسبة العرض إلى الارتفاع للكاميرا
    // (سيتم تحديثها من CameraManager)
  }

  // ===== الحصول على المشهد =====
  getScene() {
    return this.scene;
  }

  // ===== الحصول على الـ Renderer =====
  getRenderer() {
    return this.renderer;
  }

  // ===== الحصول على الضوء المحيط =====
  getAmbientLight() {
    return this.lights.ambient;
  }

  // ===== الحصول على الضوء الموجه =====
  getDirectionalLight() {
    return this.lights.directional;
  }

  // ===== تحديث الضوء الموجه =====
  updateDirectionalLightPosition(x, y, z) {
    this.lights.directional.position.set(x, y, z);
  }

  // ===== Render Frame =====
  render() {
    this.renderer.render(this.scene, this.camera);
  }

  // ===== Dispose (تنظيف الموارد) =====
  dispose() {
    this.renderer.dispose();
  }
}

export default SceneManager;
