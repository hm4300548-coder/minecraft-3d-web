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
    RENDER_DISTANCE: 1,  // عدد الـ Chunks حول اللاعب (optimized: 1 = 27 chunks instead of 729)
  },

  // ===== TERRAIN GENERATION CONFIG =====
  TERRAIN: {
    SEED: 12345,         // البذرة العشوائية لتوليد متطابق
    SCALE: 50,           // حجم التضاريس (أكبر = تضاريس أكثر سلاسة)
    OCTAVES: 3,          // عدد طبقات Perlin Noise (reduced from 5 for faster generation)
    PERSISTENCE: 0.5,    // تأثير الطبقات الكبيرة
    LACUNARITY: 2.0,     // تكرار التفاصيل
    AMPLITUDE: 15,       // ارتفاع التلال (reduced from 20)
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
    ANTIALIAS: false,           // Disabled for performance
    SHADOW_MAP: false,          // Disabled for performance (60+ FPS target)
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
    TREE_CHANCE: 0.04,        // احتمالية وجود شجرة (reduced from 0.08 for faster generation)
    CAVE_CHANCE: 0.1,         // احتمالية وجود كهف (reduced from 0.3)
    CAVE_SIZE: 2,             // حجم الكهوف (reduced from 4)
    TREE_DENSITY: 0.05,       // كثافة الأشجار (reduced from 0.1)
  },

  // ===== GRAPHICS CONFIG =====
  GRAPHICS: {
    FOG_ENABLED: true,            // تفعيل الضباب
    FOG_NEAR: 50,                 // بداية الضباب
    FOG_FAR: 500,                 // نهاية الضباب
    SHADOWS_ENABLED: false,       // تعطيل الظلال لأداء أفضل
    SHADOW_QUALITY: 1024,         // دقة منخفضة (إذا تم تفعيل الظلال)
    SHADOW_FAR: 200,              // بعد منخفض للظلال
    ANTIALIASING: false,          // تعطيل AA لأداء أفضل
    MAX_PIXEL_RATIO: 1.5,         // تقليل نسبة البكسل
    AMBIENT_INTENSITY: 0.8,       // زيادة طفيفة في الضوء المحيط
    DIRECTIONAL_INTENSITY: 0.8,   // الضوء الموجه ثابت
    TONE_MAPPING_EXPOSURE: 1.0,   // تعريض معالجة الألوان
    ANISOTROPY: 2,                // تقليل التصفية الخواصية
    FLAT_SHADING: true,           // استخدام Flat Shading (أسرع)
    QUALITY_LEVEL: 'medium',      // مستوى جودة متوسط
  },

  // ===== DEBUG =====
  DEBUG: true,                    // تفعيل وضع التصحيح
};

export default CONSTANTS;
