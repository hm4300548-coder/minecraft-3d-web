// ==========================================
// PLAYER.JS - نظام اللاعب والحركة والطيران
// ==========================================

import CONSTANTS from '../utils/Constants.js';
import InputManager from '../core/InputManager.js';
import BlockInteraction from './BlockInteraction.js';
import Physics from '../physics/Physics.js';
import CollisionDetector from '../physics/CollisionDetector.js';

class Player {
  constructor(cameraManager, world = null, audioManager = null, blockStorage = null) {
    this.cameraManager = cameraManager;
    this.inputManager = new InputManager();
    this.blockInteraction = null;
    this.world = world;
    this.audioManager = audioManager;
    this.blockStorage = blockStorage;

    // أنظمة الفيزياء
    this.collisionDetector = null;
    this.physics = null;

    // موقع اللاعب
    this.position = {
      x: CONSTANTS.PLAYER.START_X,
      y: CONSTANTS.PLAYER.START_Y,
      z: CONSTANTS.PLAYER.START_Z,
    };

    // السرعة
    this.velocity = {
      x: 0,
      y: 0,
      z: 0,
    };

    // نظام الطيران (Creative Mode)
    this.flying = false;
    this.flySpeed = CONSTANTS.PLAYER.SPEED;

    // الدوران (في الراديان)
    this.rotation = {
      pitch: 0,  // دوران عمودي (أعلى/أسفل)
      yaw: 0,    // دوران أفقي (يمين/يسار)
    };

    // حدود العالم
    this.worldBounds = {
      minX: 0,
      maxX: CONSTANTS.WORLD.WIDTH,
      minY: 0,
      maxY: CONSTANTS.WORLD.HEIGHT,
      minZ: 0,
      maxZ: CONSTANTS.WORLD.DEPTH,
    };

    this.init();
  }

  init() {
    // تحديث الموقع الابتدائي
    this.updateCameraPosition();

    // إنشاء أنظمة الفيزياء إذا كان العالم متوفراً
    if (this.world) {
      this.collisionDetector = new CollisionDetector(this.world);
      this.physics = new Physics(this.world, this.collisionDetector);
      this.blockInteraction = new BlockInteraction(this, this.world, this.audioManager, this.blockStorage);
    }

    if (CONSTANTS.DEBUG) {
      console.log('✓ Player initialized');
      console.log('  Position:', this.position);
      console.log('  Flying:', this.flying);
      console.log('  Physics: Enabled');
      console.log('  Controls:');
      console.log('    WASD: Move');
      console.log('    Space: Jump');
      console.log('    Left Click: Break Block');
      console.log('    Right Click: Place Block');
      console.log('    Number Keys (1-5): Change Block Type');
    }
  }

  // ===== تحديث منطق اللاعب في كل Frame =====
  update() {
    // معالجة الإدخالات
    this.handleInput();

    // تطبيق الحركة
    this.applyMovement();

    // تطبيق الفيزياء والاصطدام
    if (this.physics && !this.flying) {
      const movementInput = this.inputManager.getMovementDirection();
      const movement = {
        x: this.velocity.x,
        z: this.velocity.z,
      };

      this.physics.applyMovement(movement);
      const newPos = this.physics.update(this.position, movementInput, false);
      this.position = newPos;

      // معالجة القفز
      if (this.inputManager.isKeyPressed(' ') && this.physics.canJump) {
        this.physics.jump();
      }
    } else {
      // الطيران الحر
      this.clampToWorldBounds();
    }

    // تحديث موقع الكاميرا
    this.updateCameraPosition();

    // تحديث التفاعل مع الكتل
    if (this.blockInteraction) {
      this.blockInteraction.update();
    }

    // معالجة اختيار نوع الكتلة (الأرقام 1-5)
    this.handleBlockTypeSelection();
  }

  // ===== معالجة الإدخالات =====
  handleInput() {
    // الحصول على اتجاه الحركة المطلوبة
    const movement = this.inputManager.getMovementDirection();
    const flight = this.inputManager.getFlightInput();

    // السرعة الحالية (عادي أو ركض)
    const speed = this.inputManager.getSpeed();

    // حساب اتجاه الكاميرا (Forward و Right vectors)
    const camera = this.cameraManager.getCamera();
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    // الحصول على اتجاه الكاميرا (للأمام)
    camera.getWorldDirection(forward);
    forward.y = 0; // تجاهل الارتفاع (نريد حركة أفقية فقط)
    forward.normalize();

    // الحصول على اتجاه اليمين (عمودي على Forward)
    right.crossVectors(camera.up, forward).normalize();

    // إعادة تعيين السرعة الأفقية
    this.velocity.x = 0;
    this.velocity.z = 0;

    // معالجة الحركة الأفقية
    if (movement.forward) {
      this.velocity.x += forward.x * speed;
      this.velocity.z += forward.z * speed;
    }
    if (movement.backward) {
      this.velocity.x -= forward.x * speed;
      this.velocity.z -= forward.z * speed;
    }
    if (movement.left) {
      this.velocity.x -= right.x * speed;
      this.velocity.z -= right.z * speed;
    }
    if (movement.right) {
      this.velocity.x += right.x * speed;
      this.velocity.z += right.z * speed;
    }

    // معالجة الطيران (Creative Mode)
    if (this.flying) {
      if (flight.up) {
        this.velocity.y = this.flySpeed;
      } else if (flight.down) {
        this.velocity.y = -this.flySpeed;
      } else {
        this.velocity.y = 0;
      }
    } else {
      // في Survival Mode، الحركة العمودية يتم التحكم بها بواسطة الفيزياء
      // لا نغير this.velocity.y هنا
    }

    // معالجة دوران الكاميرا (بناءً على حركة الماوس)
    this.handleMouseRotation();
  }

  // ===== معالجة دوران الكاميرا بالماوس =====
  handleMouseRotation() {
    const mouseDelta = this.inputManager.getMouseDelta();
    const camera = this.cameraManager.getCamera();

    // تحديث الدوران
    this.rotation.yaw -= mouseDelta.x;   // يمين/يسار
    this.rotation.pitch -= mouseDelta.y; // أعلى/أسفل

    // تحديد حد أقصى للدوران العمودي (منع القلب رأساً على عقب)
    const maxPitch = Math.PI / 2 - 0.01; // تقريباً 90 درجة
    this.rotation.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.rotation.pitch));

    // تطبيق الدوران على الكاميرا
    const euler = new THREE.Euler(this.rotation.pitch, this.rotation.yaw, 0, 'YXZ');
    camera.quaternion.setFromEuler(euler);
  }

  // ===== معالجة اختيار نوع الكتلة بالأرقام 1-5 =====
  handleBlockTypeSelection() {
    if (!this.blockInteraction) return;

    // الأرقام 1-5 لاختيار أنواع مختلفة من الكتل
    const numberKeys = ['1', '2', '3', '4', '5'];
    const blockTypeArray = [
      CONSTANTS.BLOCK_TYPES.STONE,
      CONSTANTS.BLOCK_TYPES.DIRT,
      CONSTANTS.BLOCK_TYPES.GRASS,
      CONSTANTS.BLOCK_TYPES.WOOD,
      CONSTANTS.BLOCK_TYPES.LEAVES,
    ];

    for (let i = 0; i < numberKeys.length; i++) {
      if (this.inputManager.isKeyPressed(numberKeys[i])) {
        this.blockInteraction.setSelectedBlockType(blockTypeArray[i]);
        break; // اختر واحد فقط في الإطار
      }
    }
  }

  // ===== تطبيق الحركة =====
  applyMovement() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.position.z += this.velocity.z;
  }

  // ===== تحديث موقع الكاميرا =====
  updateCameraPosition() {
    // موقع العين بالنسبة للقدمين
    const eyeHeight = CONSTANTS.PLAYER.HEIGHT;

    this.cameraManager.setPosition(
      this.position.x,
      this.position.y + eyeHeight,
      this.position.z
    );
  }

  // ===== حدود العالم (منع الخروج من الخريطة) =====
  clampToWorldBounds() {
    // حدود أفقية بسيطة
    const padding = 0.3; // مسافة من الحافة

    this.position.x = Math.max(
      this.worldBounds.minX + padding,
      Math.min(this.position.x, this.worldBounds.maxX - padding)
    );

    this.position.y = Math.max(
      this.worldBounds.minY + padding,
      Math.min(this.position.y, this.worldBounds.maxY - padding)
    );

    this.position.z = Math.max(
      this.worldBounds.minZ + padding,
      Math.min(this.position.z, this.worldBounds.maxZ - padding)
    );
  }

  // ===== تفعيل/إيقاف الطيران =====
  toggleFlight() {
    this.flying = !this.flying;

    if (CONSTANTS.DEBUG) {
      console.log('Flying mode:', this.flying ? 'ON ✈️' : 'OFF 🚶');
    }
  }

  // ===== الحصول على موقع اللاعب =====
  getPosition() {
    return { ...this.position };
  }

  // ===== الحصول على الدوران =====
  getRotation() {
    return { ...this.rotation };
  }

  // ===== الحصول على إدارة الإدخالات =====
  getInputManager() {
    return this.inputManager;
  }

  // ===== تعيين السرعة اليدوية (للاختبار) =====
  setPosition(x, y, z) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
    this.updateCameraPosition();
  }

  // ===== تعيين سرعة الطيران =====
  setFlySpeed(speed) {
    this.flySpeed = speed;
  }

  // ===== إعادة تعيين اللاعب =====
  reset() {
    this.position = {
      x: CONSTANTS.PLAYER.START_X,
      y: CONSTANTS.PLAYER.START_Y,
      z: CONSTANTS.PLAYER.START_Z,
    };

    this.velocity = { x: 0, y: 0, z: 0 };
    this.rotation = { pitch: 0, yaw: 0 };
    this.flying = false;

    this.updateCameraPosition();

    if (CONSTANTS.DEBUG) {
      console.log('🔄 Player reset');
    }
  }

  // ===== الحصول على نظام التفاعل مع الكتل =====
  getBlockInteraction() {
    return this.blockInteraction;
  }

  // ===== تعيين العالم (للحالات المتأخرة) =====
  setWorld(world) {
    this.world = world;
    if (!this.blockInteraction && world) {
      this.blockInteraction = new BlockInteraction(this, world, this.audioManager, this.blockStorage);
    }
    if (!this.collisionDetector && world) {
      this.collisionDetector = new CollisionDetector(world);
    }
    if (!this.physics && world) {
      this.physics = new Physics(world, this.collisionDetector);
    }
  }

  // ===== الحصول على الفيزياء =====
  getPhysics() {
    return this.physics;
  }

  // ===== الحصول على معالج الاصطدام =====
  getCollisionDetector() {
    return this.collisionDetector;
  }
}

export default Player;
