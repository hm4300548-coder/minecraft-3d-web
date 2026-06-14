// ==========================================
// WORLD2.JS - نظام العالم الجديد مع Chunks و Infinite Terrain
// ==========================================

import CONSTANTS from '../utils/Constants.js';
import ChunkManager from './ChunkManager.js';
import TerrainGenerator from './TerrainGenerator.js';
import CullingManager from './CullingManager.js';
import GraphicsManager from '../graphics/GraphicsManager.js';
import StructureGenerator from './StructureGenerator.js';

class World2 {
  constructor(sceneManager, camera) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.getScene();
    this.camera = camera;

    // إنشاء مدير الرسوميات (يتضمن الخامات والمواد)
    this.graphicsManager = new GraphicsManager(sceneManager);

    // إنشاء مولد التضاريس
    this.generator = new TerrainGenerator(CONSTANTS.TERRAIN.SEED);
    this.generator.setSettings({
      scale: CONSTANTS.TERRAIN.SCALE,
      octaves: CONSTANTS.TERRAIN.OCTAVES,
      persistence: CONSTANTS.TERRAIN.PERSISTENCE,
      lacunarity: CONSTANTS.TERRAIN.LACUNARITY,
      amplitude: CONSTANTS.TERRAIN.AMPLITUDE,
      waterLevel: CONSTANTS.TERRAIN.WATER_LEVEL,
      grassLevel: CONSTANTS.TERRAIN.GRASS_LEVEL,
    });

    // إنشاء مدير الـ Chunks (مع MaterialManager)
    this.chunkManager = new ChunkManager(
      sceneManager,
      this.generator,
      this.graphicsManager.getMaterialManager()
    );

    // إنشاء مدير الـ Culling
    this.cullingManager = new CullingManager(camera);

    // إحصائيات
    this.stats = {
      chunksLoaded: 0,
      blocksRendered: 0,
      fps: 0,
    };

    this.init();
  }

  init() {
    if (CONSTANTS.DEBUG) {
      console.log('✓ World2 (Infinite Terrain) initialized');
      console.log('  Terrain Settings:', this.generator.getInfo());
    }

    // إنشاء البنى المسبقة بالقرب من نقطة الإنطلاق
    this.generateStarterStructures();
  }

  // ===== إنشاء البنى الأساسية عند بدء اللعبة =====
  generateStarterStructures() {
    const spawnX = 0;
    const spawnZ = 0;

    // الانتظار قليلاً قبل إنشاء البنى للتأكد من تحميل الـ Chunks
    setTimeout(() => {
      // إنشاء المنزل الأساسي
      StructureGenerator.createStarterHouse(this, spawnX - 4, 0, spawnZ - 4);

      // إنشاء حديقة صغيرة بجانب المنزل
      StructureGenerator.createGarden(this, spawnX + 5, spawnZ - 5, 6);

      // إنشاء برج مراقبة
      StructureGenerator.createWatchTower(this, spawnX + 10, 0, spawnZ, 8);

      console.log('✓ Starter structures created');
    }, 500);
  }

  // ===== الحصول على ارتفاع التضاريس عند موقع معين =====
  getTerrainHeightAtChunk(x, z) {
    return this.generator.getTerrainHeight(x, z);
  }

  // ===== تحديث العالم في كل Frame =====
  update(playerPos) {
    // تحديث الـ Chunks حول اللاعب
    this.chunkManager.updateChunksAroundPlayer(playerPos);

    // تحديث الـ Culling
    this.updateCulling();

    // تحديث الإحصائيات
    this.updateStats();
  }

  // ===== تحديث Frustum Culling =====
  updateCulling() {
    this.cullingManager.updateFrustum();

    // تطبيق الـ Culling على جميع الـ Chunks
    for (const key in this.chunkManager.chunks) {
      const chunk = this.chunkManager.chunks[key];

      if (chunk.meshGroup) {
        const isVisible = this.cullingManager.isChunkVisible(chunk.getBounds());
        chunk.meshGroup.visible = isVisible;
      }
    }
  }

  // ===== تحديث الإحصائيات =====
  updateStats() {
    const chunkStats = this.chunkManager.getStats();
    const cullingStats = this.cullingManager.getStats();

    this.stats = {
      chunksLoaded: chunkStats.chunksLoaded,
      blocksRendered: chunkStats.totalMeshes,
      culledCount: cullingStats.culledCount,
      cullingRatio: cullingStats.cullRatio,
    };
  }

  // ===== الحصول على كتلة =====
  getBlock(x, y, z) {
    return this.chunkManager.getBlock(x, y, z);
  }

  // ===== تعيين كتلة =====
  setBlock(x, y, z, type) {
    return this.chunkManager.setBlock(x, y, z, type);
  }

  // ===== حذف كتلة =====
  removeBlock(x, y, z) {
    return this.chunkManager.removeBlock(x, y, z);
  }

  // ===== البحث عن كتلة باستخدام Raycast =====
  raycast(origin, direction, maxDistance = 10) {
    const raycaster = new THREE.Raycaster(origin, direction.normalize());
    let closestHit = null;
    let closestDistance = maxDistance;

    // البحث عن التقاطع مع جميع الـ Chunks
    for (const key in this.chunkManager.chunks) {
      const chunk = this.chunkManager.chunks[key];

      if (!chunk.meshGroup || !chunk.meshGroup.visible) continue;

      const intersects = raycaster.intersectObject(chunk.meshGroup, true);

      if (intersects.length > 0) {
        const hit = intersects[0];

        if (hit.distance < closestDistance) {
          closestDistance = hit.distance;
          closestHit = {
            block: hit.object.userData,
            distance: hit.distance,
            point: hit.point,
            normal: hit.face ? hit.face.normal : new THREE.Vector3(),
            mesh: hit.object,
          };
        }
      }
    }

    return closestHit;
  }

  // ===== الحصول على الكتلة المجاورة للنقر =====
  getAdjacentBlock(raycastHit) {
    if (!raycastHit) return null;

    const blockData = raycastHit.block;
    const normal = raycastHit.normal;

    const newX = blockData.blockX + Math.round(normal.x);
    const newY = blockData.blockY + Math.round(normal.y);
    const newZ = blockData.blockZ + Math.round(normal.z);

    return { x: newX, y: newY, z: newZ };
  }

  // ===== التحقق من وجود كتلة =====
  hasBlock(x, y, z) {
    return this.getBlock(x, y, z) !== null;
  }

  // ===== الحصول على إحصائيات العالم =====
  getStats() {
    return {
      ...this.stats,
      ...this.chunkManager.getStats(),
    };
  }

  // ===== الحصول على مدير الرسوميات =====
  getGraphicsManager() {
    return this.graphicsManager;
  }

  // ===== تنظيف الموارد =====
  dispose() {
    this.chunkManager.dispose();
    this.graphicsManager.dispose();

    if (CONSTANTS.DEBUG) {
      console.log('🧹 World2 disposed');
    }
  }
}

export default World2;
