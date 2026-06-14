// ==========================================
// PHYSICS.JS - نظام الفيزياء واللاعب
// ==========================================

import CONSTANTS from '../utils/Constants.js';
import Helper from '../utils/Helper.js';

class Physics {
  constructor(world, collisionDetector) {
    this.world = world;
    this.collisionDetector = collisionDetector;

    // حالة الفيزياء
    this.velocity = { x: 0, y: 0, z: 0 };
    this.isOnGround = false;
    this.isFalling = false;
    this.canJump = true;

    // إعدادات الفيزياء
    this.gravity = CONSTANTS.PHYSICS.GRAVITY;
    this.friction = CONSTANTS.PHYSICS.FRICTION;
    this.jumpForce = CONSTANTS.PHYSICS.JUMP_FORCE;
    this.jumpHeight = CONSTANTS.PHYSICS.JUMP_HEIGHT;
    this.maxFallSpeed = CONSTANTS.PHYSICS.MAX_FALL_SPEED;
    this.playerHeight = CONSTANTS.PHYSICS.PLAYER_HEIGHT;
    this.playerRadius = CONSTANTS.PHYSICS.PLAYER_RADIUS;

    if (CONSTANTS.DEBUG) {
      console.log('✓ Physics system initialized');
    }
  }

  // ===== تحديث الفيزياء =====
  update(playerPos, inputMovement, isFlying) {
    if (isFlying) {
      // في وضع الطيران، لا نطبق الفيزياء
      return playerPos;
    }

    // تطبيق الجاذبية
    this.applyGravity();

    // تطبيق الاحتكاك
    this.applyFriction();

    // حساب الموقع الجديد
    let newPos = {
      x: playerPos.x + this.velocity.x,
      y: playerPos.y + this.velocity.y,
      z: playerPos.z + this.velocity.z,
    };

    // فحص الاصطدام
    const collision = this.collisionDetector.checkPlayerCollision(newPos, this.playerHeight, this.playerRadius);

    // معالجة الاصطدام
    if (collision.collided) {
      newPos = this.handleCollision(playerPos, newPos, collision);
    }

    // التحقق من الأرض
    this.checkIfOnGround(newPos);

    return newPos;
  }

  // ===== تطبيق الجاذبية =====
  applyGravity() {
    if (!this.isOnGround) {
      // زيادة السرعة العمودية (الانخفاض)
      this.velocity.y -= this.gravity;

      // تحديد السرعة الأقصى للسقوط
      if (this.velocity.y < -this.maxFallSpeed) {
        this.velocity.y = -this.maxFallSpeed;
      }

      this.isFalling = true;
    } else {
      // إعادة تعيين السرعة العمودية عندما يكون على الأرض
      this.velocity.y = 0;
      this.isFalling = false;
      this.canJump = true;
    }
  }

  // ===== تطبيق الاحتكاك =====
  applyFriction() {
    if (this.isOnGround) {
      // احتكاك أفقي
      this.velocity.x *= this.friction;
      this.velocity.z *= this.friction;
    }
  }

  // ===== معالجة الاصطدام =====
  handleCollision(oldPos, newPos, collision) {
    // إذا كان الاصطدام من الأعلى (الرأس)
    if (collision.direction.y > 0.5) {
      this.velocity.y = 0;
      newPos.y = oldPos.y;
    }

    // إذا كان الاصطدام من الأسفل (الأرض)
    if (collision.direction.y < -0.5) {
      this.velocity.y = 0;
      newPos.y = oldPos.y;
      this.isOnGround = true;
    }

    // إذا كان الاصطدام من الجانب (جدار)
    if (Math.abs(collision.direction.x) > 0.5) {
      this.velocity.x = 0;
      newPos.x = oldPos.x;
    }

    if (Math.abs(collision.direction.z) > 0.5) {
      this.velocity.z = 0;
      newPos.z = oldPos.z;
    }

    return newPos;
  }

  // ===== التحقق من الأرض =====
  checkIfOnGround(playerPos) {
    // فحص ما إذا كان هناك كتلة تحت اللاعب
    const blockBelow = Helper.getBlockBelow(playerPos);

    const hasBlockBelow = this.world.getBlock(
      blockBelow.x,
      blockBelow.y,
      blockBelow.z
    ) !== null && this.world.getBlock(
      blockBelow.x,
      blockBelow.y,
      blockBelow.z
    ) !== CONSTANTS.BLOCK_TYPES.EMPTY;

    // إذا كان هناك كتلة تحته وليس يسقط، فهو على الأرض
    if (hasBlockBelow && this.velocity.y <= 0) {
      this.isOnGround = true;
    } else if (!hasBlockBelow) {
      this.isOnGround = false;
    }
  }

  // ===== تطبيق حركة أفقية =====
  applyMovement(velocity) {
    this.velocity.x = velocity.x;
    this.velocity.z = velocity.z;
  }

  // ===== القفز =====
  jump() {
    if (!this.canJump) return false;

    this.velocity.y = this.jumpForce;
    this.isOnGround = false;
    this.canJump = false;

    if (CONSTANTS.DEBUG) {
      console.log('⬆️ Jump!');
    }

    return true;
  }

  // ===== الحصول على السرعة الحالية =====
  getVelocity() {
    return { ...this.velocity };
  }

  // ===== تعيين السرعة =====
  setVelocity(x, y, z) {
    this.velocity.x = x;
    this.velocity.y = y;
    this.velocity.z = z;
  }

  // ===== الحصول على حالة الأرض =====
  isPlayerOnGround() {
    return this.isOnGround;
  }

  // ===== الحصول على حالة السقوط =====
  isPlayerFalling() {
    return this.isFalling;
  }

  // ===== تعديل الجاذبية =====
  setGravity(gravity) {
    this.gravity = gravity;
  }

  // ===== إعادة تعيين الفيزياء =====
  reset() {
    this.velocity = { x: 0, y: 0, z: 0 };
    this.isOnGround = false;
    this.isFalling = false;
    this.canJump = true;
  }
}

export default Physics;
