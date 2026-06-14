// ==========================================
// UI.JS - واجهة المستخدم والمعلومات
// ==========================================

import CONSTANTS from '../utils/Constants.js';

class UI {
  constructor(game) {
    this.game = game;
    this.player = game.player;
    this.world = game.world;

    // عناصر DOM
    this.debugInfo = document.getElementById('debug-info');
    this.crosshair = document.getElementById('crosshair');

    this.init();
  }

  init() {
    // إنشاء عناصر UI إضافية
    this.createUIElements();

    if (CONSTANTS.DEBUG) {
      console.log('✓ UI initialized');
    }
  }

  // ===== إنشاء عناصر UI =====
  createUIElements() {
    // Hotbar (شريط الأدوات)
    this.createHotbar();

    // معلومات الكتلة المختارة
    this.createTargetInfo();

    // رسالة الترحيب
    this.createWelcomeMessage();
  }

  // ===== إنشاء Hotbar =====
  createHotbar() {
    const hotbar = document.createElement('div');
    hotbar.id = 'hotbar';
    hotbar.style.cssText = `
      position: absolute;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      background-color: rgba(0, 0, 0, 0.7);
      padding: 10px;
      border-radius: 8px;
      z-index: 10;
      pointer-events: auto;
    `;

    // أنواع الكتل المتاحة
    const blockTypes = [
      { key: '1', name: 'Stone', type: CONSTANTS.BLOCK_TYPES.STONE, color: '#888888' },
      { key: '2', name: 'Dirt', type: CONSTANTS.BLOCK_TYPES.DIRT, color: '#8B4513' },
      { key: '3', name: 'Grass', type: CONSTANTS.BLOCK_TYPES.GRASS, color: '#00AA00' },
      { key: '4', name: 'Wood', type: CONSTANTS.BLOCK_TYPES.WOOD, color: '#654321' },
      { key: '5', name: 'Leaves', type: CONSTANTS.BLOCK_TYPES.LEAVES, color: '#228B22' },
    ];

    blockTypes.forEach((block, index) => {
      const slot = document.createElement('div');
      slot.className = 'hotbar-slot';
      slot.style.cssText = `
        width: 50px;
        height: 50px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        background-color: rgba(0, 0, 0, 0.5);
        transition: all 0.2s;
        font-size: 10px;
        text-align: center;
      `;

      // المربع الملون
      const colorBox = document.createElement('div');
      colorBox.style.cssText = `
        width: 30px;
        height: 30px;
        background-color: ${block.color};
        border-radius: 3px;
        margin-bottom: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
      `;

      // المفتاح
      const keyLabel = document.createElement('span');
      keyLabel.textContent = block.key;
      keyLabel.style.cssText = `
        color: rgba(255, 255, 255, 0.8);
        font-weight: bold;
        font-size: 10px;
      `;

      slot.appendChild(colorBox);
      slot.appendChild(keyLabel);

      // إضافة حدث الضغط
      slot.addEventListener('click', () => {
        this.player.getBlockInteraction().setSelectedBlockType(block.type);
      });

      slot.addEventListener('mouseenter', () => {
        slot.style.borderColor = 'rgba(255, 255, 255, 0.8)';
        slot.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
      });

      slot.addEventListener('mouseleave', () => {
        slot.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        slot.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      });

      hotbar.appendChild(slot);
      this.hotbarSlots = this.hotbarSlots || [];
      this.hotbarSlots.push({ element: slot, type: block.type, index });
    });

    document.getElementById('ui-container').appendChild(hotbar);
    this.hotbarElement = hotbar;
  }

  // ===== إنشاء معلومات الكتلة المختارة =====
  createTargetInfo() {
    const targetInfo = document.createElement('div');
    targetInfo.id = 'target-info';
    targetInfo.style.cssText = `
      position: absolute;
      bottom: 100px;
      left: 10px;
      background-color: rgba(0, 0, 0, 0.7);
      padding: 12px;
      border-radius: 5px;
      font-size: 12px;
      line-height: 1.6;
      pointer-events: auto;
      min-width: 150px;
    `;

    document.getElementById('ui-container').appendChild(targetInfo);
    this.targetInfoElement = targetInfo;
  }

  // ===== إنشاء رسالة الترحيب =====
  createWelcomeMessage() {
    const welcome = document.createElement('div');
    welcome.id = 'welcome-message';
    welcome.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
      pointer-events: none;
      z-index: 5;
      opacity: 0;
      animation: fadeInOut 4s ease-in-out;
    `;

    welcome.innerHTML = `
      <p>مرحباً في Minecraft 3D! 🎮</p>
      <p style="font-size: 14px; margin-top: 10px;">استخدم WASD للحركة • Space/C للطيران</p>
      <p style="font-size: 14px;">انقر بزر الماوس: بناء • انقر بزر يمين: هدم</p>
    `;

    document.getElementById('ui-container').appendChild(welcome);

    // إضافة الحركة
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; }
        20% { opacity: 1; }
        80% { opacity: 1; }
        100% { opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      welcome.remove();
    }, 4000);
  }

  // ===== تحديث معلومات الكتلة المختارة والفيزياء =====
  updateTargetInfo() {
    if (!this.targetInfoElement) return;

    const blockInteraction = this.player.getBlockInteraction();
    if (!blockInteraction) return;

    const selectedBlock = blockInteraction.getSelectedBlock();
    const selectedType = blockInteraction.getSelectedBlockType();
    const physics = this.player.getPhysics();

    // اسم النوع الحالي
    const typeName = Object.keys(CONSTANTS.BLOCK_TYPES).find(
      key => CONSTANTS.BLOCK_TYPES[key] === selectedType
    ) || 'UNKNOWN';

    let html = `<strong>🎯 معلومات البناء</strong><br>`;
    html += `النوع الحالي: <span style="color: #FFD700;">${typeName}</span><br>`;

    if (selectedBlock) {
      const bd = selectedBlock.block;
      html += `<br><strong>كتلة مختارة:</strong><br>`;
      html += `الموقع: (${bd.blockX}, ${bd.blockY}, ${bd.blockZ})<br>`;
      html += `النوع: ${Object.keys(CONSTANTS.BLOCK_TYPES).find(
        key => CONSTANTS.BLOCK_TYPES[key] === bd.blockType
      )}<br>`;
      html += `المسافة: ${selectedBlock.distance.toFixed(2)}`;
    } else {
      html += `<br><span style="color: #888;">لا توجد كتلة في النطاق</span>`;
    }

    // معلومات الفيزياء
    if (physics) {
      html += `<br><br><strong>⚙️ الفيزياء</strong><br>`;
      const vel = physics.getVelocity();
      html += `السرعة: ${Math.sqrt(vel.x ** 2 + vel.z ** 2).toFixed(2)}<br>`;
      html += `على الأرض: ${physics.isPlayerOnGround() ? '✓' : '✗'}<br>`;
      html += `يسقط: ${physics.isPlayerFalling() ? '✓' : '✗'}`;
    }

    this.targetInfoElement.innerHTML = html;
  }

  // ===== تحديث حالة Hotbar =====
  updateHotbarSelection() {
    if (!this.hotbarSlots) return;

    const selectedType = this.player.getBlockInteraction().getSelectedBlockType();

    this.hotbarSlots.forEach(slot => {
      if (slot.type === selectedType) {
        slot.element.style.borderColor = '#FFD700';
        slot.element.style.backgroundColor = 'rgba(255, 215, 0, 0.2)';
        slot.element.style.boxShadow = '0 0 12px rgba(255, 215, 0, 0.5)';
      } else {
        slot.element.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        slot.element.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        slot.element.style.boxShadow = 'none';
      }
    });
  }

  // ===== تحديث UI في كل Frame =====
  update() {
    if (CONSTANTS.DEBUG) {
      this.updateTargetInfo();
    }
    this.updateHotbarSelection();
  }
}

export default UI;
