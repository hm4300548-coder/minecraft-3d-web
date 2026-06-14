// ============================================
// MINECRAFT-LIKE 3D GAME - CONSTANTS & CONFIG
// ULTRA-LIGHT VERSION FOR ALL DEVICES
// ============================================

const CONSTANTS = {
  // ===== WORLD CONFIG =====
  WORLD: {
    WIDTH: 32,
    HEIGHT: 32,
    DEPTH: 32,
    BLOCK_SIZE: 1,
    INFINITE: true,
  },

  // ===== CHUNK CONFIG =====
  CHUNK: {
    WIDTH: 8,            // تقليل من 16 إلى 8 - أخف جداً
    HEIGHT: 8,           // تقليل من 16 إلى 8
    DEPTH: 8,            // تقليل من 16 إلى 8
    RENDER_DISTANCE: 0,  // فقط الـ chunk الحالي (9 chunks فقط!)
  },

  // ===== TERRAIN GENERATION CONFIG =====
  TERRAIN: {
    SEED: 12345,
    SCALE: 60,           // أكبر = أسهل (أقل تفاصيل)
    OCTAVES: 2,          // تقليل من 3 إلى 2 - سريع جداً
    PERSISTENCE: 0.4,
    LACUNARITY: 2.0,
    AMPLITUDE: 12,
    WATER_LEVEL: 4,
    GRASS_LEVEL: 6,
  },

  // ===== CAMERA CONFIG =====
  CAMERA: {
    FOV: 75,
    NEAR: 0.1,
    FAR: 200,            // تقليل من 1000 إلى 200
    SPEED: 0.15,         // أسرع قليلاً
    SPRINT_SPEED: 0.3,
  },

  // ===== LIGHTING CONFIG =====
  LIGHTING: {
    AMBIENT_COLOR: 0xffffff,
    AMBIENT_INTENSITY: 0.9,      // إضاءة قوية
    DIRECTIONAL_COLOR: 0xffffff,
    DIRECTIONAL_INTENSITY: 0.8,
    SHADOW_MAP_SIZE: 2048,
  },

  // ===== PLAYER CONFIG =====
  PLAYER: {
    START_X: 8,
    START_Y: 15,
    START_Z: 8,
    HEIGHT: 1.7,
    SPEED: 0.1,
    GRAVITY: 0.01,
  },

  // ===== CONTROLS CONFIG =====
  CONTROLS: {
    MOVE_FORWARD: 'w',
    MOVE_BACKWARD: 's',
    MOVE_LEFT: 'a',
    MOVE_RIGHT: 'd',
    JUMP: ' ',
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
    STONE: 0x808080,      // رمادي
    DIRT: 0x8B7355,       // بني
    GRASS: 0x2ECC71,      // أخضر
    WOOD: 0x654321,       // بني خشب
    LEAVES: 0x228B22,     // أخضر غامق
  },

  // ===== RENDERER CONFIG =====
  RENDERER: {
    ANTIALIAS: false,
    SHADOW_MAP: false,
    PIXEL_RATIO: 1,
  },

  // ===== PHYSICS CONFIG =====
  PHYSICS: {
    GRAVITY: 0.008,
    FRICTION: 0.8,
    JUMP_FORCE: 0.15,
    JUMP_HEIGHT: 1.5,
    MAX_FALL_SPEED: 0.3,
    PLAYER_HEIGHT: 1.7,
    PLAYER_RADIUS: 0.3,
  },

  // ===== ENVIRONMENT CONFIG =====
  ENVIRONMENT: {
    TREE_CHANCE: 0.01,        // 1% فقط
    CAVE_CHANCE: 0.02,        // 2% فقط
    CAVE_SIZE: 1.5,
    TREE_DENSITY: 0.01,
  },

  // ===== GRAPHICS CONFIG =====
  GRAPHICS: {
    FOG_ENABLED: true,
    FOG_NEAR: 30,
    FOG_FAR: 150,
    SHADOWS_ENABLED: false,
    SHADOW_QUALITY: 512,
    SHADOW_FAR: 100,
    ANTIALIASING: false,
    MAX_PIXEL_RATIO: 1.0,
    AMBIENT_INTENSITY: 1.0,
    DIRECTIONAL_INTENSITY: 1.0,
    TONE_MAPPING_EXPOSURE: 1.0,
    ANISOTROPY: 1,
    FLAT_SHADING: true,
    QUALITY_LEVEL: 'ultra-low',
  },

  // ===== DEBUG =====
  DEBUG: false,
};

export default CONSTANTS;
