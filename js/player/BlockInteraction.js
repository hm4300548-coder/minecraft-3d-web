// ==========================================
// BLOCK INTERACTION - نظام التفاعل مع الكتل
// ==========================================

import CONSTANTS from '../utils/Constants.js';

class BlockInteraction {
  constructor(player, world, audioManager = null) {
    this.player = player;
    this.world = world;
    this.audioManager = audioManager;

    // معلومات الكتلة المختارة حالياً
    this.selectedBlock = null;
    this.targetDistance = 5;  // المسافة القصوى لاختيار كتلة

    // الكتلة المراد بناؤها (نوع الكتلة الحالي)
    this.selectedBlockType = CONSTANTS.BLOCK_TYPES.STONE;

    // التأخير بين الضغطات (لتجنب البناء السريع جداً)
    this.clickCooldown = 0;
    this.clickCooldownMax = 10; // إطارات

    this.init();
  }

  init() {
    this.setupMouseClickListeners();

    if (CONSTANTS.DEBUG) {
      console.log('✓ BlockInteraction initialized');
    }
  }

  // ===== معالجات النقر بالماوس =====
  setupMouseClickListeners() {
    document.addEventListener('mousedown', (e) => this.onMouseDown(e));
    document.addEventListener('mouseup', (e) => this.onMouseUp(e));
  }

  onMouseDown(event) {
    // الزر الأيسر = هدم (remove)
    if (event.button === 0) {
      this.breakBlock();
    }

    // الزر الأيمن = بناء (place)
    if (event.button === 2) {
      this.placeBlock();
    }
  }

  onMouseUp(event) {
    // يمكن استخدامه لاحقاً للإفراج عن الزر
  }

  // ===== تحديث التفاعل في كل Frame =====
  update() {
    // تحديث التأخير
    if (this.clickCooldown > 0) {
      this.clickCooldown--;
    }

    // البحث عن الكتلة التي ننظر إليها
    this.updateSelectedBlock();
  }

  // ===== البحث عن الكتلة المختارة =====
  updateSelectedBlock() {
    const camera = this.player.cameraManager.getCamera();
    const direction = new THREE.Vector3();

    camera.getWorldDirection(direction);

    // استخدام Raycast من العالم للبحث عن الكتلة
    const raycastHit = this.world.raycast(
      camera.position,
      direction,
      this.targetDistance
    );

    this.selectedBlock = raycastHit;
  }

  // ===== هدم الكتلة (الزر الأيسر) =====
  breakBlock() {
    if (this.clickCooldown > 0) return;
    if (!this.selectedBlock) return;

    const blockData = this.selectedBlock.block;

    // حذف الكتلة
    const removed = this.world.removeBlock(
      blockData.blockX,
      blockData.blockY,
      blockData.blockZ
    );

    if (removed) {
      this.clickCooldown = this.clickCooldownMax;

      // تشغيل صوت الهدم
      if (this.audioManager) {
        this.audioManager.playSound('break');
      }

      if (CONSTANTS.DEBUG) {
        console.log(`🔨 Block broken at (${blockData.blockX}, ${blockData.blockY}, ${blockData.blockZ})`);
      }
    }
  }

  // ===== بناء كتلة (الزر الأيمن) =====
  placeBlock() {
    if (this.clickCooldown > 0) return;
    if (!this.selectedBlock) return;

    // الحصول على موقع الكتلة المجاورة
    const adjacentBlock = this.world.getAdjacentBlock(this.selectedBlock);

    if (!adjacentBlock) return;

    // التحقق من عدم البناء فوق اللاعب
    const playerPos = this.player.getPosition();
    const playerBlockX = Math.round(playerPos.x);
    const playerBlockY = Math.round(playerPos.y);
    const playerBlockZ = Math.round(playerPos.z);

    if (
      adjacentBlock.x === playerBlockX &&
      adjacentBlock.z === playerBlockZ &&
      (adjacentBlock.y === playerBlockY || adjacentBlock.y === playerBlockY + 1)
    ) {
      if (CONSTANTS.DEBUG) {
        console.log('❌ Cannot place block on player!');
      }
      return;
    }

    // بناء الكتلة
    const placed = this.world.setBlock(
      adjacentBlock.x,
      adjacentBlock.y,
      adjacentBlock.z,
      this.selectedBlockType
    );

    if (placed) {
      this.clickCooldown = this.clickCooldownMax;

      // تشغيل صوت البناء
      if (this.audioManager) {
        this.audioManager.playSound('place');
      }

      if (CONSTANTS.DEBUG) {
        console.log(`🧱 Block placed at (${adjacentBlock.x}, ${adjacentBlock.y}, ${adjacentBlock.z})`);
      }
    }
  }

  // ===== تغيير نوع الكتلة المراد بناؤها =====
  setSelectedBlockType(blockType) {
    if (CONSTANTS.BLOCK_TYPES[Object.keys(CONSTANTS.BLOCK_TYPES).find(
      key => CONSTANTS.BLOCK_TYPES[key] === blockType
    )]) {
      this.selectedBlockType = blockType;

      if (CONSTANTS.DEBUG) {
        const typeName = Object.keys(CONSTANTS.BLOCK_TYPES).find(
          key => CONSTANTS.BLOCK_TYPES[key] === blockType
        );
        console.log(`📦 Selected block type: ${typeName}`);
      }
    }
  }

  // ===== الحصول على الكتلة المختارة =====
  getSelectedBlock() {
    return this.selectedBlock;
  }

  // ===== الحصول على نوع الكتلة المختارة =====
  getSelectedBlockType() {
    return this.selectedBlockType;
  }

  // ===== تعديل مسافة الاختيار =====
  setTargetDistance(distance) {
    this.targetDistance = distance;
  }

  // ===== تفعيل القائمة الجانبية (اختيار نوع الكتلة) =====
  cycleBlockType() {
    const blockTypes = Object.values(CONSTANTS.BLOCK_TYPES).filter(
      type => type !== CONSTANTS.BLOCK_TYPES.EMPTY
    );

    const currentIndex = blockTypes.indexOf(this.selectedBlockType);
    const nextIndex = (currentIndex + 1) % blockTypes.length;

    this.setSelectedBlockType(blockTypes[nextIndex]);
  }
}

export default BlockInteraction;
