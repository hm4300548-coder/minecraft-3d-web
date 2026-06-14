// ==========================================
// GRAPHICS MANAGER - نظام إدارة الرسوميات
// ==========================================

import CONSTANTS from '../utils/Constants.js';
import TextureManager from './TextureManager.js';
import MaterialManager from './MaterialManager.js';

class GraphicsManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.getScene();
    this.renderer = sceneManager.getRenderer();

    // أنظمة الرسوميات
    this.textureManager = new TextureManager();
    this.materialManager = new MaterialManager(this.textureManager);

    // إعدادات التأثيرات
    this.fogEnabled = CONSTANTS.GRAPHICS.FOG_ENABLED !== false;
    this.shadowsEnabled = CONSTANTS.GRAPHICS.SHADOWS_ENABLED !== false;
    this.antiAliasingEnabled = CONSTANTS.GRAPHICS.ANTIALIASING !== false;

    this.init();
  }

  init() {
    // تطبيق التأثيرات البصرية
    this.applyVisualEffects();

    // تحسين الإضاءة
    this.enhanceLighting();

    // تطبيق إعدادات الـ Renderer
    this.configureRenderer();

    if (CONSTANTS.DEBUG) {
      console.log('✓ GraphicsManager initialized');
      console.log('  Fog:', this.fogEnabled);
      console.log('  Shadows:', this.shadowsEnabled);
      console.log('  Anti-aliasing:', this.antiAliasingEnabled);
    }
  }

  // ===== تطبيق التأثيرات البصرية =====
  applyVisualEffects() {
    // تفعيل الضباب (Fog)
    if (this.fogEnabled) {
      const fogColor = 0x87CEEB; // لون السماء الأزرق
      const fogNear = CONSTANTS.GRAPHICS.FOG_NEAR || 100;
      const fogFar = CONSTANTS.GRAPHICS.FOG_FAR || 1000;

      this.scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

      if (CONSTANTS.DEBUG) {
        console.log(`🌫️ Fog enabled: ${fogNear} - ${fogFar}`);
      }
    }

    // تفعيل الظلال
    if (this.shadowsEnabled) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;

      if (CONSTANTS.DEBUG) {
        console.log('🌑 Shadows enabled');
      }
    }
  }

  // ===== تحسين الإضاءة =====
  enhanceLighting() {
    const ambientLight = this.sceneManager.getAmbientLight();
    const directionalLight = this.sceneManager.getDirectionalLight();

    // تحسين شدة الضوء المحيط
    ambientLight.intensity = CONSTANTS.GRAPHICS.AMBIENT_INTENSITY || 0.6;

    // تحسين الضوء الموجه
    directionalLight.intensity = CONSTANTS.GRAPHICS.DIRECTIONAL_INTENSITY || 0.8;

    // تحسين جودة الظلال
    if (this.shadowsEnabled && directionalLight) {
      directionalLight.shadow.mapSize.width = CONSTANTS.GRAPHICS.SHADOW_QUALITY || 2048;
      directionalLight.shadow.mapSize.height = CONSTANTS.GRAPHICS.SHADOW_QUALITY || 2048;
      directionalLight.shadow.camera.far = CONSTANTS.GRAPHICS.SHADOW_FAR || 500;
    }

    if (CONSTANTS.DEBUG) {
      console.log('💡 Lighting enhanced');
    }
  }

  // ===== تكوين الـ Renderer =====
  configureRenderer() {
    // تفعيل Anti-aliasing
    if (this.antiAliasingEnabled) {
      this.renderer.antialias = true;

      if (CONSTANTS.DEBUG) {
        console.log('🎯 Anti-aliasing enabled');
      }
    }

    // تحسين دقة الرسم
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, CONSTANTS.GRAPHICS.MAX_PIXEL_RATIO || 2)
    );

    // تفعيل الألوان الخطية
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // تحسين معالجة الألوان
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = CONSTANTS.GRAPHICS.TONE_MAPPING_EXPOSURE || 1.0;
  }

  // ===== الحصول على MaterialManager =====
  getMaterialManager() {
    return this.materialManager;
  }

  // ===== الحصول على TextureManager =====
  getTextureManager() {
    return this.textureManager;
  }

  // ===== تغيير جودة الرسوميات =====
  setQuality(level) {
    // low: أداء عالي، رسوميات منخفضة
    // medium: توازن
    // high: رسوميات عالية، أداء منخفضة

    switch (level.toLowerCase()) {
      case 'low':
        this.renderer.shadowMap.enabled = false;
        if (this.scene.fog) {
          this.scene.fog.far = 300;
        }
        break;

      case 'medium':
        this.renderer.shadowMap.enabled = true;
        if (this.scene.fog) {
          this.scene.fog.far = 500;
        }
        break;

      case 'high':
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        if (this.scene.fog) {
          this.scene.fog.far = 1000;
        }
        break;
    }

    if (CONSTANTS.DEBUG) {
      console.log(`📊 Graphics quality set to: ${level}`);
    }
  }

  // ===== تفعيل/تعطيل الضباب =====
  setFogEnabled(enabled) {
    this.fogEnabled = enabled;
    if (this.scene.fog) {
      this.scene.fog.far = enabled ? 500 : 10000;
    }
  }

  // ===== تفعيل/تعطيل الظلال =====
  setShadowsEnabled(enabled) {
    this.shadowsEnabled = enabled;
    this.renderer.shadowMap.enabled = enabled;
  }

  // ===== التقاط لقطة شاشة =====
  takeScreenshot() {
    const canvas = this.renderer.domElement;
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `screenshot-${Date.now()}.png`;
    link.click();

    if (CONSTANTS.DEBUG) {
      console.log('📸 Screenshot taken');
    }
  }

  // ===== إعادة تعيين الرسوميات =====
  resetGraphics() {
    this.applyVisualEffects();
    this.enhanceLighting();
    this.configureRenderer();

    if (CONSTANTS.DEBUG) {
      console.log('🔄 Graphics reset');
    }
  }

  // ===== تنظيف الموارد =====
  dispose() {
    this.textureManager.dispose();
    this.materialManager.dispose();

    if (CONSTANTS.DEBUG) {
      console.log('🧹 GraphicsManager disposed');
    }
  }
}

export default GraphicsManager;
