// ==========================================
// BLOCKSTORAGE.JS - نظام حفظ الكتل من العميل
// ==========================================

import Config from './Config.js';

class BlockStorage {
  constructor(serverUrl = null, userId = 'default') {
    this.serverUrl = serverUrl || Config.getBackendUrl();
    this.userId = userId;
    this.savingQueue = [];
    this.isSaving = false;
    this.autoSaveInterval = 30000; // كل 30 ثانية
    this.unsavedBlocks = new Set();

    // Retry configuration
    const retryConfig = Config.getRetryConfig();
    this.maxRetries = retryConfig.maxRetries;
    this.retryDelay = retryConfig.retryDelay;
    this.backoffMultiplier = retryConfig.backoffMultiplier;
    this.maxDelay = retryConfig.maxDelay;
    this.apiTimeout = Config.getApiTimeout();

    console.log(`📦 BlockStorage initialized with backend: ${this.serverUrl}`);
    this.startAutoSave();
  }

  // ===== Retry helper with exponential backoff =====
  async retryFetch(url, options, retryCount = 0) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.apiTimeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      // Check if we should retry
      if (retryCount < this.maxRetries) {
        const delay = Math.min(
          this.retryDelay * Math.pow(this.backoffMultiplier, retryCount),
          this.maxDelay
        );

        console.warn(`⚠️ Request failed, retrying in ${delay}ms... (${retryCount + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryFetch(url, options, retryCount + 1);
      }

      throw error;
    }
  }

  // ===== حفظ كتلة واحدة =====
  async saveBlock(x, y, z, blockType) {
    try {
      const response = await this.retryFetch(
        `${this.serverUrl}/api/blocks/save`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            x: Math.round(x),
            y: Math.round(y),
            z: Math.round(z),
            blockType,
            userId: this.userId,
          }),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        console.log(`✓ Block saved: (${x}, ${y}, ${z}) -> ${blockType}`);
        this.unsavedBlocks.delete(`${x},${y},${z}`);
        return result;
      } else {
        console.error('❌ Save failed:', result.error || response.statusText);
        this.unsavedBlocks.add(`${x},${y},${z}`);
        return result;
      }
    } catch (error) {
      console.error('❌ Save error after retries:', error);
      this.unsavedBlocks.add(`${x},${y},${z}`);
      return { success: false, error: error.message };
    }
  }

  // ===== حفظ عدة كتل دفعة واحدة =====
  async saveBlocksBatch(blocks) {
    if (blocks.length === 0) return { success: true };

    try {
      const blocksData = blocks.map(b => ({
        x: Math.round(b.x),
        y: Math.round(b.y),
        z: Math.round(b.z),
        blockType: b.blockType,
      }));

      const response = await fetch(`${this.serverUrl}/api/blocks/save-batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blocks: blocksData,
          userId: this.userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✓ ${blocks.length} blocks saved`);
        blocks.forEach(b => {
          this.unsavedBlocks.delete(`${b.x},${b.y},${b.z}`);
        });
      } else {
        console.error('❌ Batch save failed:', result.error);
        blocks.forEach(b => {
          this.unsavedBlocks.add(`${b.x},${b.y},${b.z}`);
        });
      }

      return result;
    } catch (error) {
      console.error('❌ Batch save error:', error);
      blocks.forEach(b => {
        this.unsavedBlocks.add(`${b.x},${b.y},${b.z}`);
      });
      return { success: false, error: error.message };
    }
  }

  // ===== حذف كتلة واحدة =====
  async deleteBlock(x, y, z) {
    try {
      const response = await fetch(`${this.serverUrl}/api/blocks/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          x: Math.round(x),
          y: Math.round(y),
          z: Math.round(z),
          userId: this.userId,
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✓ Block deleted: (${x}, ${y}, ${z})`);
        this.unsavedBlocks.delete(`${x},${y},${z}`);
      } else {
        console.error('❌ Delete failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('❌ Delete error:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== تحميل جميع الكتل المحفوظة =====
  async loadBlocks() {
    try {
      const response = await this.retryFetch(
        `${this.serverUrl}/api/blocks/load?userId=${this.userId}`
      );
      const result = await response.json();

      if (response.ok && result.success) {
        console.log(`✓ Loaded ${result.blocks?.length || 0} blocks from server`);
        return result.blocks || [];
      } else {
        console.warn('⚠️ Load request returned non-success:', result.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Load error after retries:', error);
      console.log('ℹ️ Continuing with fresh world (no saved blocks)');
      return [];
    }
  }

  // ===== الحصول على إحصائيات =====
  async getStats() {
    try {
      const response = await fetch(
        `${this.serverUrl}/api/blocks/stats?userId=${this.userId}`
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('❌ Stats error:', error);
      return { success: false, count: 0 };
    }
  }

  // ===== الحصول على كتل في منطقة =====
  async getBlocksInRange(minX, maxX, minY, maxY, minZ, maxZ) {
    try {
      const params = new URLSearchParams({
        minX,
        maxX,
        minY,
        maxY,
        minZ,
        maxZ,
        userId: this.userId,
      });

      const response = await fetch(
        `${this.serverUrl}/api/blocks/range?${params}`
      );
      const result = await response.json();

      if (result.success) {
        return result.blocks;
      } else {
        console.error('❌ Range query failed:', result.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Range query error:', error);
      return [];
    }
  }

  // ===== حذف جميع الكتل =====
  async clearAllBlocks() {
    try {
      const response = await fetch(
        `${this.serverUrl}/api/blocks/clear?userId=${this.userId}`,
        { method: 'DELETE' }
      );
      const result = await response.json();

      if (result.success) {
        console.log('✓ All blocks cleared');
        this.unsavedBlocks.clear();
      } else {
        console.error('❌ Clear failed:', result.error);
      }

      return result;
    } catch (error) {
      console.error('❌ Clear error:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== حفظ تلقائي دوري =====
  startAutoSave() {
    setInterval(() => {
      if (this.unsavedBlocks.size > 0) {
        console.log(`⏰ Auto-saving ${this.unsavedBlocks.size} blocks...`);
        // يمكن تنفيذ حفظ تلقائي هنا إذا لزم الأمر
      }
    }, this.autoSaveInterval);
  }

  // ===== الحصول على عدد الكتل غير المحفوظة =====
  getUnsavedCount() {
    return this.unsavedBlocks.size;
  }

  // ===== تعيين عنوان السيرفر =====
  setServerUrl(url) {
    this.serverUrl = url;
  }

  // ===== تعيين معرّف اللاعب =====
  setUserId(id) {
    this.userId = id;
  }
}

export default BlockStorage;
