// ==========================================
// INPUT MANAGER - معالجة الإدخالات (لوحة المفاتيح والماوس)
// ==========================================

import CONSTANTS from '../utils/Constants.js';

class InputManager {
  constructor() {
    // حالة المفاتيح المضغوطة
    this.keys = {};

    // حالة الماوس
    this.mouse = {
      x: 0,
      y: 0,
      deltaX: 0,
      deltaY: 0,
      locked: false,
    };

    // حساسية الماوس (كم يتحرك عند تحريك الماوس)
    this.mouseSensitivity = 0.003; // 0.3% حركة لكل بكسل

    // حالة الركض
    this.sprinting = false;

    this.init();
  }

  init() {
    this.setupKeyboardListeners();
    this.setupMouseListeners();
    this.setupPointerLock();

    if (CONSTANTS.DEBUG) {
      console.log('✓ InputManager initialized');
    }
  }

  // ===== معالجات لوحة المفاتيح =====
  setupKeyboardListeners() {
    document.addEventListener('keydown', (e) => this.onKeyDown(e));
    document.addEventListener('keyup', (e) => this.onKeyUp(e));
  }

  onKeyDown(event) {
    const key = event.key.toLowerCase();
    this.keys[key] = true;

    // معالجة Shift للركض
    if (key === 'shift') {
      this.sprinting = true;
    }

    // معالجة Escape لتحرير الماوس
    if (key === 'escape') {
      this.unlockPointer();
    }

    if (CONSTANTS.DEBUG && key === 'p') {
      console.log('Keys pressed:', Object.keys(this.keys).filter(k => this.keys[k]));
    }
  }

  onKeyUp(event) {
    const key = event.key.toLowerCase();
    this.keys[key] = false;

    // إيقاف الركض عند إطلاق Shift
    if (key === 'shift') {
      this.sprinting = false;
    }
  }

  // ===== معالجات الماوس =====
  setupMouseListeners() {
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mousedown', () => this.lockPointer());
    document.addEventListener('mouseup', () => {
      // تحديث موضع الماوس عند الإفراج
      this.mouse.deltaX = 0;
      this.mouse.deltaY = 0;
    });
  }

  onMouseMove(event) {
    this.mouse.deltaX = event.movementX || event.mozMovementX || 0;
    this.mouse.deltaY = event.movementY || event.mozMovementY || 0;

    // إذا لم يكن الماوس مقفول، لا نستخدم الحركة
    if (!this.mouse.locked) {
      this.mouse.deltaX = 0;
      this.mouse.deltaY = 0;
    }

    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
  }

  // ===== قفل الماوس (Pointer Lock) =====
  // يمنع خروج الماوس من النافذة ويخفيه
  setupPointerLock() {
    this.canvas = document.querySelector('canvas');

    if (this.canvas) {
      this.canvas.addEventListener('click', () => this.lockPointer());
    }
  }

  lockPointer() {
    if (document.pointerLockElement === null && this.canvas) {
      this.canvas.requestPointerLock = this.canvas.requestPointerLock ||
        this.canvas.mozRequestPointerLock;

      if (this.canvas.requestPointerLock) {
        this.canvas.requestPointerLock();
        this.mouse.locked = true;

        if (CONSTANTS.DEBUG) {
          console.log('🔒 Pointer locked');
        }
      }
    }
  }

  unlockPointer() {
    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock = document.exitPointerLock ||
        document.mozExitPointerLock;

      if (document.exitPointerLock) {
        document.exitPointerLock();
        this.mouse.locked = false;

        if (CONSTANTS.DEBUG) {
          console.log('🔓 Pointer unlocked');
        }
      }
    }
  }

  // ===== دوال للحصول على حالة المدخلات =====

  // تحقق من ضغط مفتاح معين
  isKeyPressed(key) {
    return this.keys[key.toLowerCase()] || false;
  }

  // الحصول على حالة الحركة
  getMovementDirection() {
    const direction = {
      forward: this.isKeyPressed('w'),
      backward: this.isKeyPressed('s'),
      left: this.isKeyPressed('a'),
      right: this.isKeyPressed('d'),
    };
    return direction;
  }

  // الحصول على حالة الطيران
  getFlightInput() {
    const flight = {
      up: this.isKeyPressed(' '),      // Space للأعلى
      down: this.isKeyPressed('c'),    // C للأسفل
    };
    return flight;
  }

  // الحصول على حركة الماوس (للدوران)
  getMouseDelta() {
    return {
      x: this.mouse.deltaX * this.mouseSensitivity,
      y: this.mouse.deltaY * this.mouseSensitivity,
    };
  }

  // تحديث حساسية الماوس
  setMouseSensitivity(sensitivity) {
    this.mouseSensitivity = sensitivity;
  }

  // الحصول على السرعة الحالية (عادي أو ركض)
  getSpeed() {
    let speed = CONSTANTS.PLAYER.SPEED;

    if (this.sprinting) {
      speed = CONSTANTS.PLAYER.SPEED * 2; // مضاعفة السرعة عند الركض
    }

    return speed;
  }

  // تحقق من الركض
  isSprinting() {
    return this.sprinting;
  }

  // إعادة تعيين حالة المفاتيح (مفيد عند تغيير المشاهد)
  reset() {
    this.keys = {};
    this.sprinting = false;
    this.mouse.deltaX = 0;
    this.mouse.deltaY = 0;
  }
}

export default InputManager;
