// ==========================================
// COLLISION DETECTOR - كشف الاصطدام
// ==========================================

import CONSTANTS from '../utils/Constants.js';
import Helper from '../utils/Helper.js';

class CollisionDetector {
  constructor(world) {
    this.world = world;

    // دقة فحص الاصطدام (عدد النقاط للفحص)
    this.checkPoints = 8;
  }

  // ===== فحص اصطدام اللاعب مع الكتل =====
  checkPlayerCollision(playerPos, playerHeight, playerRadius) {
    // مربع الاصطدام حول اللاعب
    const boundingBox = this.getPlayerBoundingBox(playerPos, playerHeight, playerRadius);

    // فحص تقاطع مع الكتل
    const collidingBlocks = this.findCollidingBlocks(boundingBox);

    if (collidingBlocks.length === 0) {
      return {
        collided: false,
        blocks: [],
        direction: { x: 0, y: 0, z: 0 },
      };
    }

    // حساب اتجاه الاصطدام
    const direction = this.calculateCollisionDirection(playerPos, collidingBlocks);

    return {
      collided: true,
      blocks: collidingBlocks,
      direction: direction,
    };
  }

  // ===== الحصول على صندوق الاصطدام حول اللاعب =====
  getPlayerBoundingBox(playerPos, playerHeight, playerRadius) {
    return {
      minX: playerPos.x - playerRadius,
      maxX: playerPos.x + playerRadius,
      minY: playerPos.y - playerHeight / 2,
      maxY: playerPos.y + playerHeight / 2,
      minZ: playerPos.z - playerRadius,
      maxZ: playerPos.z + playerRadius,
    };
  }

  // ===== البحث عن الكتل المتقاطعة =====
  findCollidingBlocks(boundingBox) {
    const collidingBlocks = [];

    // الكتل التي قد تتقاطع
    const minBlockX = Math.floor(boundingBox.minX);
    const maxBlockX = Math.ceil(boundingBox.maxX);
    const minBlockY = Math.floor(boundingBox.minY);
    const maxBlockY = Math.ceil(boundingBox.maxY);
    const minBlockZ = Math.floor(boundingBox.minZ);
    const maxBlockZ = Math.ceil(boundingBox.maxZ);

    // فحص كل كتلة
    for (let x = minBlockX; x <= maxBlockX; x++) {
      for (let y = minBlockY; y <= maxBlockY; y++) {
        for (let z = minBlockZ; z <= maxBlockZ; z++) {
          const block = this.world.getBlock(x, y, z);

          // إذا كانت الكتلة موجودة
          if (block !== null && block !== CONSTANTS.BLOCK_TYPES.EMPTY) {
            // صندوق الكتلة
            const blockBox = {
              minX: x,
              maxX: x + 1,
              minY: y,
              maxY: y + 1,
              minZ: z,
              maxZ: z + 1,
            };

            // فحص التقاطع
            if (this.boxesIntersect(boundingBox, blockBox)) {
              collidingBlocks.push({
                x: x,
                y: y,
                z: z,
                box: blockBox,
              });
            }
          }
        }
      }
    }

    return collidingBlocks;
  }

  // ===== فحص تقاطع صندوقين =====
  boxesIntersect(box1, box2) {
    return (
      box1.minX < box2.maxX &&
      box1.maxX > box2.minX &&
      box1.minY < box2.maxY &&
      box1.maxY > box2.minY &&
      box1.minZ < box2.maxZ &&
      box1.maxZ > box2.minZ
    );
  }

  // ===== حساب اتجاه الاصطدام =====
  calculateCollisionDirection(playerPos, collidingBlocks) {
    let direction = { x: 0, y: 0, z: 0 };

    collidingBlocks.forEach(block => {
      const blockCenter = {
        x: block.x + 0.5,
        y: block.y + 0.5,
        z: block.z + 0.5,
      };

      // الاتجاه من الكتلة للاعب
      const dx = playerPos.x - blockCenter.x;
      const dy = playerPos.y - blockCenter.y;
      const dz = playerPos.z - blockCenter.z;

      // اتجاه الاصطدام الأساسي
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > Math.abs(dz)) {
        // اصطدام أفقي (يمين/يسار)
        direction.x += Math.sign(dx);
      } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > Math.abs(dz)) {
        // اصطدام عمودي (أعلى/أسفل)
        direction.y += Math.sign(dy);
      } else {
        // اصطدام عميق (أمام/خلف)
        direction.z += Math.sign(dz);
      }
    });

    // تطبيع الاتجاه
    const length = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
    if (length > 0) {
      direction.x /= length;
      direction.y /= length;
      direction.z /= length;
    }

    return direction;
  }

  // ===== فحص تقاطع الأشعة مع الكتلة =====
  raycastBlock(rayOrigin, rayDirection, maxDistance = 10) {
    const raycaster = new THREE.Raycaster(rayOrigin, rayDirection.normalize());
    let closestBlock = null;
    let closestDistance = maxDistance;

    // فحص الكتل حول شعاع
    const checkRange = Math.ceil(maxDistance);
    const minX = Math.floor(rayOrigin.x - checkRange);
    const maxX = Math.ceil(rayOrigin.x + checkRange);
    const minY = Math.floor(rayOrigin.y - checkRange);
    const maxY = Math.ceil(rayOrigin.y + checkRange);
    const minZ = Math.floor(rayOrigin.z - checkRange);
    const maxZ = Math.ceil(rayOrigin.z + checkRange);

    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        for (let z = minZ; z <= maxZ; z++) {
          const block = this.world.getBlock(x, y, z);

          if (block !== null && block !== CONSTANTS.BLOCK_TYPES.EMPTY) {
            // صندوق الكتلة
            const blockBox = new THREE.Box3(
              new THREE.Vector3(x, y, z),
              new THREE.Vector3(x + 1, y + 1, z + 1)
            );

            // فحص تقاطع الشعاع مع الصندوق
            const intersectPoint = raycaster.ray.intersectBox(blockBox);

            if (intersectPoint) {
              const distance = rayOrigin.distanceTo(intersectPoint);

              if (distance < closestDistance) {
                closestDistance = distance;
                closestBlock = {
                  x: x,
                  y: y,
                  z: z,
                  distance: distance,
                  intersectPoint: intersectPoint,
                };
              }
            }
          }
        }
      }
    }

    return closestBlock;
  }

  // ===== فحص إذا كان الموقع آمن =====
  isSafePosition(playerPos, playerHeight, playerRadius) {
    const boundingBox = this.getPlayerBoundingBox(playerPos, playerHeight, playerRadius);
    const collidingBlocks = this.findCollidingBlocks(boundingBox);

    return collidingBlocks.length === 0;
  }

  // ===== البحث عن أقرب موقع آمن =====
  findSafePosition(playerPos, playerHeight, playerRadius, maxDistance = 5) {
    if (this.isSafePosition(playerPos, playerHeight, playerRadius)) {
      return playerPos;
    }

    // محاولة التحرك لأعلى
    for (let offset = 0.1; offset <= maxDistance; offset += 0.1) {
      const testPos = { ...playerPos, y: playerPos.y + offset };

      if (this.isSafePosition(testPos, playerHeight, playerRadius)) {
        return testPos;
      }
    }

    return playerPos;
  }
}

export default CollisionDetector;
