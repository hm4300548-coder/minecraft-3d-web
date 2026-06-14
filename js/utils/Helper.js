// ==========================================
// HELPER.JS - دوال مساعدة عامة
// ==========================================

class Helper {
  // ===== تحويل إحداثيات العالم إلى فهرس Array =====
  // مفيد لتخزين الكتل في Array بدلاً من Object ثلاثي الأبعاد
  static worldToIndex(x, y, z, width, height) {
    return x + (z * width) + (y * width * height);
  }

  // ===== تحويل الفهرس إلى إحداثيات العالم =====
  static indexToWorld(index, width, height) {
    const x = index % width;
    const y = Math.floor(index / (width * height));
    const z = Math.floor((index % (width * height)) / width);
    return { x, y, z };
  }

  // ===== تقريب الموقع إلى أقرب كتلة =====
  static roundToBlock(value) {
    return Math.round(value);
  }

  // ===== الحصول على الكتلة تحت الموقع =====
  static getBlockBelow(position) {
    return {
      x: Math.round(position.x),
      y: Math.round(position.y) - 1,
      z: Math.round(position.z),
    };
  }

  // ===== الحصول على الكتلة التي تنظر إليها الكاميرا =====
  static getRaycastBlock(camera, distance = 5) {
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3();

    camera.getWorldDirection(direction);
    raycaster.set(camera.position, direction);

    // سيتم استخدامه مع World لفحص تقاطع مع الكتل
    return {
      origin: camera.position.clone(),
      direction: direction.clone(),
      distance: distance,
    };
  }

  // ===== التحقق من وجود موقع ضمن حدود معينة =====
  static isWithinBounds(position, bounds) {
    return (
      position.x >= bounds.minX && position.x < bounds.maxX &&
      position.y >= bounds.minY && position.y < bounds.maxY &&
      position.z >= bounds.minZ && position.z < bounds.maxZ
    );
  }

  // ===== الحصول على الجيران (6 كتل حول موقع معين) =====
  static getNeighbors(x, y, z) {
    return [
      { x: x + 1, y, z, side: 'right' },   // يمين
      { x: x - 1, y, z, side: 'left' },    // يسار
      { x, y: y + 1, z, side: 'top' },     // أعلى
      { x, y: y - 1, z, side: 'bottom' },  // أسفل
      { x, y, z: z + 1, side: 'front' },   // أمام
      { x, y, z: z - 1, side: 'back' },    // خلف
    ];
  }

  // ===== حساب المسافة بين نقطتين =====
  static distance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  // ===== حساب المسافة الأفقية فقط =====
  static distanceHorizontal(p1, p2) {
    const dx = p1.x - p2.x;
    const dz = p1.z - p2.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  // ===== رقم عشوائي بين min و max =====
  static random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // ===== تحويل الزاوية من الراديان إلى الدرجات =====
  static radToDeg(rad) {
    return rad * (180 / Math.PI);
  }

  // ===== تحويل الزاوية من الدرجات إلى الراديان =====
  static degToRad(deg) {
    return deg * (Math.PI / 180);
  }

  // ===== ضوضاء Perlin (للتوليد الإجرائي) =====
  // سيتم استخدامه لاحقاً في Generator
  static perlinNoise(x, y) {
    // تنفيذ مبسط (يمكن استخدام مكتبة خارجية أفضل)
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }

  // ===== تسميع القيمة بين min و max =====
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // ===== Lerp (Linear Interpolation) =====
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }
}

export default Helper;
