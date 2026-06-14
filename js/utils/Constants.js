// ============================================
// MINECRAFT-LIKE 3D GAME - CONSTANTS & CONFIG
// ============================================

const CONSTANTS = {
  // ===== WORLD CONFIG =====
  WORLD: {
    WIDTH: 32,           // عرض العالم (عدد الكتل) - مهمل إذا استخدمنا Chunks
    HEIGHT: 32,          // ارتفاع العالم
    DEPTH: 32,           // عمق العالم - مهمل إذا استخدمنا Chunks
    BLOCK_SIZE: 1,       // حجم الكتلة الواحدة (وحدة)
    INFINITE: true,      // تفعيل عالم لا نهائي
  },

  // ===== CHUNK CONFIG =====
  CHUNK: {
    WIDTH: 16,           // عرض الـ Chunk (16x16x16 كتلة)
    HEIGHT: 16,          // ارتفاع الـ Chunk
    DEPTH: 16,           // عمق الـ Chunk
    RENDER_DISTANCE: 4,  // عدد الـ Chunks حول اللاعب (أكبر = أداء أقل)
  },

  // ===== TERRAIN GENERATION CONFIG =====
  TERRAIN: {
    SEED: 12345,         // البذرة العشوائية لتوليد متطابق
    SCALE: 50,           // حجم التضاريس (أكبر = تضاريس أكثر سلاسة)
    OCTAVES: 5,          // عدد طبقات Perlin Noise
    PERSISTENCE: 0.5,    // تأثير الطبقات الكبيرة
    LACUNARITY: 2.0,     // تكرار التفاصيل
    AMPLITUDE: 20,       // ارتفاع التلال
    WATER_LEVEL: 5,      // مستوى الماء
    GRASS_LEVEL: 8,      // ارتفاع الأرضية العشبية
  },

  // ===== CAMERA CONFIG =====
  CAMERA: {
    FOV: 75,             // زاوية الرؤية
    NEAR: 0.1,           // القريب من الكاميرا
    FAR: 1000,           // البعيد من الكاميرا
    SPEED: 0.1,          // سرعة الحركة
    SPRINT_SPEED: 0.2,   // سرعة الجري
  },

  // ===== LIGHTING CONFIG =====
  LIGHTING: {
    AMBIENT_COLOR: 0xffffff,      // لون الضوء المحيط
    AMBIENT_INTENSITY: 0.6,       // شدة الضوء المحيط
    DIRECTIONAL_COLOR: 0xffffff,  // لون الضوء الموجه
    DIRECTIONAL_INTENSITY: 0.8,   // شدة الضوء الموجه
    SHADOW_MAP_SIZE: 2048,        // دقة الظلال
  },

  // ===== PLAYER CONFIG =====
  PLAYER: {
    START_X: 16,         // موقع البداية X
    START_Y: 20,         // موقع البداية Y (الارتفاع)
    START_Z: 16,         // موقع البداية Z
    HEIGHT: 1.7,         // ارتفاع اللاعب (الكاميرا)
    SPEED: 0.1,          // السرعة الأساسية
    GRAVITY: 0.01,       // الجاذبية (في Creative لا نستخدمها كثيراً)
  },

  // ===== CONTROLS CONFIG =====
  CONTROLS: {
    MOVE_FORWARD: 'w',
    MOVE_BACKWARD: 's',
    MOVE_LEFT: 'a',
    MOVE_RIGHT: 'd',
    JUMP: ' ',           // مفتاح المسافة
    SPRINT: 'shift',
    FLY_UP: ' ',
    FLY_DOWN: 'c',
  },

  // ===== BLOCK TYPES =====
  BLOCK_TYPES: {
    EMPTY: 0,
    STONE: 1,
    DIRT: 2,
    GRASS: 3,
    WOOD: 4,
    LEAVES: 5,
  },

  // ===== BLOCK COLORS =====
  BLOCK_COLORS: {
    STONE: 0x888888,      // رمادي
    DIRT: 0x8B4513,       // بني
    GRASS: 0x00AA00,      // أخضر
    WOOD: 0x654321,       // بني داكن
    LEAVES: 0x228B22,     // أخضر غامق
  },

  // ===== RENDERER CONFIG =====
  RENDERER: {
    ANTIALIAS: true,
    SHADOW_MAP: true,
    PIXEL_RATIO: window.devicePixelRatio || 1,
  },

  // ===== PHYSICS CONFIG =====
  PHYSICS: {
    GRAVITY: 0.008,           // الجاذبية (قوة السقوط)
    FRICTION: 0.8,            // الاحتكاك على الأرض (0-1)
    JUMP_FORCE: 0.15,         // قوة القفز
    JUMP_HEIGHT: 1.5,         // ارتفاع القفز التقريبي
    MAX_FALL_SPEED: 0.3,      // أقصى سرعة سقوط
    PLAYER_HEIGHT: 1.7,       // ارتفاع اللاعب
    PLAYER_RADIUS: 0.3,       // نصف قطر اللاعب (للاصطدام)
  },

  // ===== ENVIRONMENT CONFIG =====
  ENVIRONMENT: {
    TREE_CHANCE: 0.08,        // احتمالية وجود شجرة
    CAVE_CHANCE: 0.3,         // احتمالية وجود كهف
    CAVE_SIZE: 4,             // حجم الكهوف
    TREE_DENSITY: 0.1,        // كثافة الأشجار
  },

  // ===== GRAPHICS CONFIG =====
  GRAPHICS: {
    FOG_ENABLED: true,            // تفعيل الضباب
    FOG_NEAR: 50,                 // بداية الضباب
    FOG_FAR: 500,                 // نهاية الضباب
    SHADOWS_ENABLED: true,        // تفعيل الظلال
    SHADOW_QUALITY: 2048,         // دقة خريطة الظلال
    SHADOW_FAR: 500,              // بعد الظلال
    ANTIALIASING: true,           // تفعيل Anti-aliasing
    MAX_PIXEL_RATIO: 2,           // أقصى نسبة بكسل
    AMBIENT_INTENSITY: 0.7,       // شدة الضوء المحيط
    DIRECTIONAL_INTENSITY: 0.9,   // شدة الضوء الموجه
    TONE_MAPPING_EXPOSURE: 1.0,   // تعريض معالجة الألوان
    ANISOTROPY: 4,                // درجة التصفية الخواصية
    FLAT_SHADING: false,          // استخدام Flat Shading
    QUALITY_LEVEL: 'high',        // مستوى الجودة (low/medium/high)
  },

  // ===== DEBUG =====
  DEBUG: true,                    // تفعيل وضع التصحيح
};

export default CONSTANTS;
