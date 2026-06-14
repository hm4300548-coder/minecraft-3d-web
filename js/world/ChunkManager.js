// ==========================================
// CHUNK MANAGER - إدارة الـ Chunks المحملة والغير محملة
// ==========================================

import CONSTANTS from '../utils/Constants.js';
import Chunk from './Chunk.js';

class ChunkManager {
  constructor(sceneManager, generator, materialManager = null) {
    this.sceneManager = sceneManager;
    this.scene = sceneManager.getScene();
    this.generator = generator;
    this.materialManager = materialManager;

    // تخزين الـ Chunks المحملة
    this.chunks = {};

    // نطاق الـ Chunks المحملة حول اللاعب
    this.renderDistance = CONSTANTS.CHUNK.RENDER_DISTANCE || 3;

    // الـ Chunk السابق (لتتبع حركة اللاعب)
    this.lastChunk = null;

    // قائمة انتظار للـ Chunks المراد رسمها (لتجنب التجميد)
    this.meshQueue = [];
    this.meshesPerFrame = 2; // عدد الـ Meshes المراد رسمها في الإطار الواحد

    // إحصائيات
    this.totalChunksLoaded = 0;
    this.totalChunksMeshed = 0;

    if (CONSTANTS.DEBUG) {
      console.log('✓ ChunkManager initialized');
    }
  }

  // ===== الحصول على مفتاح فريد للـ Chunk =====
  getChunkKey(cx, cy, cz) {
    return `${cx},${cy},${cz}`;
  }

  // ===== الحصول على إحداثيات الـ Chunk من موقع عالمي =====
  getChunkCoordinates(x, y, z) {
    const cx = Math.floor(x / (CONSTANTS.CHUNK.WIDTH || 16));
    const cy = Math.floor(y / (CONSTANTS.CHUNK.HEIGHT || 16));
    const cz = Math.floor(z / (CONSTANTS.CHUNK.DEPTH || 16));

    return { cx, cy, cz };
  }

  // ===== تحميل أو الحصول على Chunk =====
  getOrLoadChunk(cx, cy, cz) {
    const key = this.getChunkKey(cx, cy, cz);

    if (this.chunks[key]) {
      return this.chunks[key];
    }

    // إنشاء Chunk جديد (مع MaterialManager إذا كان متوفراً)
    const chunk = new Chunk(cx, cy, cz, this.generator, this.materialManager);
    this.chunks[key] = chunk;
    this.totalChunksLoaded++;

    if (CONSTANTS.DEBUG) {
      console.log(`📦 Chunk ${key} loaded`);
    }

    return chunk;
  }

  // ===== رسم Chunk (بناء Mesh وإضافته للمشهد) =====
  meshChunk(cx, cy, cz) {
    const key = this.getChunkKey(cx, cy, cz);
    const chunk = this.chunks[key];

    if (!chunk) return;
    if (chunk.isMeshed) return;

    chunk.buildMesh(this.scene);
    this.totalChunksMeshed++;
  }

  // ===== تحديث الـ Chunks المرئية حول اللاعب =====
  updateChunksAroundPlayer(playerPos) {
    const { cx, cy, cz } = this.getChunkCoordinates(
      playerPos.x,
      playerPos.y,
      playerPos.z
    );

    // إذا لم يتغير الـ Chunk، فقط معالجة قائمة الانتظار
    if (
      this.lastChunk &&
      this.lastChunk.cx === cx &&
      this.lastChunk.cy === cy &&
      this.lastChunk.cz === cz
    ) {
      this.processMeshQueue();
      return;
    }

    this.lastChunk = { cx, cy, cz };

    // تحميل الـ Chunks حول اللاعب وإضافتها لقائمة الانتظار
    for (let dx = -this.renderDistance; dx <= this.renderDistance; dx++) {
      for (let dy = -1; dy <= 1; dy++) {  // ارتفاع محدود
        for (let dz = -this.renderDistance; dz <= this.renderDistance; dz++) {
          const ncx = cx + dx;
          const ncy = cy + dy;
          const ncz = cz + dz;

          // تحميل الـ Chunk
          const chunk = this.getOrLoadChunk(ncx, ncy, ncz);

          // إضافة للقائمة بدلاً من الرسم الفوري
          if (!chunk.isMeshed) {
            this.meshQueue.push({ cx: ncx, cy: ncy, cz: ncz });
          }
        }
      }
    }

    // معالجة جزء من قائمة الانتظار في هذا الإطار
    this.processMeshQueue();

    // تفريغ الـ Chunks البعيدة
    this.unloadFarChunks(cx, cy, cz);
  }

  // ===== معالجة قائمة الانتظار تدريجياً =====
  processMeshQueue() {
    const meshCount = Math.min(this.meshesPerFrame, this.meshQueue.length);

    for (let i = 0; i < meshCount; i++) {
      const { cx, cy, cz } = this.meshQueue.shift();
      this.meshChunk(cx, cy, cz);
    }
  }

  // ===== تفريغ الـ Chunks البعيدة =====
  unloadFarChunks(cx, cy, cz) {
    const unloadDistance = this.renderDistance + 2;

    for (const key in this.chunks) {
      const [ccx, ccy, ccz] = key.split(',').map(Number);

      const distance = Math.max(
        Math.abs(ccx - cx),
        Math.abs(ccy - cy),
        Math.abs(ccz - cz)
      );

      if (distance > unloadDistance) {
        const chunk = this.chunks[key];

        // إزالة من المشهد
        chunk.removeFromScene(this.scene);

        // تنظيف الموارد
        chunk.dispose();

        // حذف من الذاكرة
        delete this.chunks[key];

        if (CONSTANTS.DEBUG) {
          console.log(`🗑️ Chunk ${key} unloaded`);
        }
      }
    }
  }

  // ===== الحصول على Chunk في موقع معين =====
  getChunkAt(x, y, z) {
    const { cx, cy, cz } = this.getChunkCoordinates(x, y, z);
    const key = this.getChunkKey(cx, cy, cz);
    return this.chunks[key] || null;
  }

  // ===== الحصول على كتلة من Chunk =====
  getBlock(x, y, z) {
    const chunk = this.getChunkAt(x, y, z);
    if (!chunk) return null;

    // تحويل الموقع العالمي إلى موقع محلي
    const chunkWidth = CONSTANTS.CHUNK.WIDTH || 16;
    const chunkHeight = CONSTANTS.CHUNK.HEIGHT || 16;
    const chunkDepth = CONSTANTS.CHUNK.DEPTH || 16;

    const lx = x % chunkWidth;
    const ly = y % chunkHeight;
    const lz = z % chunkDepth;

    return chunk.getLocalBlock(lx, ly, lz);
  }

  // ===== تعيين كتلة =====
  setBlock(x, y, z, type) {
    const chunk = this.getChunkAt(x, y, z);
    if (!chunk) return false;

    const chunkWidth = CONSTANTS.CHUNK.WIDTH || 16;
    const chunkHeight = CONSTANTS.CHUNK.HEIGHT || 16;
    const chunkDepth = CONSTANTS.CHUNK.DEPTH || 16;

    const lx = x % chunkWidth;
    const ly = y % chunkHeight;
    const lz = z % chunkDepth;

    chunk.setLocalBlock(lx, ly, lz, type);

    // إعادة رسم الـ Chunk
    if (chunk.isMeshed) {
      chunk.clearMeshes();
      chunk.buildMesh(this.scene);
    }

    return true;
  }

  // ===== حذف كتلة =====
  removeBlock(x, y, z) {
    const chunk = this.getChunkAt(x, y, z);
    if (!chunk) return false;

    const chunkWidth = CONSTANTS.CHUNK.WIDTH || 16;
    const chunkHeight = CONSTANTS.CHUNK.HEIGHT || 16;
    const chunkDepth = CONSTANTS.CHUNK.DEPTH || 16;

    const lx = x % chunkWidth;
    const ly = y % chunkHeight;
    const lz = z % chunkDepth;

    const removed = chunk.removeLocalBlock(lx, ly, lz);

    // إعادة رسم الـ Chunk
    if (removed && chunk.isMeshed) {
      chunk.clearMeshes();
      chunk.buildMesh(this.scene);
    }

    return removed;
  }

  // ===== الحصول على إحصائيات الـ Chunk Manager =====
  getStats() {
    let totalBlocks = 0;
    let totalMeshes = 0;

    for (const key in this.chunks) {
      const chunk = this.chunks[key];
      totalBlocks += chunk.getBlockCount();
      totalMeshes += chunk.meshes.length;
    }

    return {
      chunksLoaded: Object.keys(this.chunks).length,
      chunksTotal: this.totalChunksLoaded,
      totalBlocks,
      totalMeshes,
      renderDistance: this.renderDistance,
    };
  }

  // ===== تنظيف كل شيء =====
  dispose() {
    for (const key in this.chunks) {
      const chunk = this.chunks[key];
      chunk.removeFromScene(this.scene);
      chunk.dispose();
    }

    this.chunks = {};

    if (CONSTANTS.DEBUG) {
      console.log('🧹 ChunkManager disposed');
    }
  }
}

export default ChunkManager;
