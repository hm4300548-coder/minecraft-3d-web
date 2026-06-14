# 🎮 Minecraft-Like 3D Web Game

لعبة بناء ثلاثية الأبعاد مستوحاة من Minecraft باستخدام HTML5 و Three.js و JavaScript.

## 🌍 اللعب الآن - مجاني!

**🎮 اضغط هنا للعب**: [**https://minecraft-3d-web.vercel.app**](https://minecraft-3d-web.vercel.app)

أو على GitHub Pages:
[https://YOUR_USERNAME.github.io/minecraft-3d-web](https://YOUR_USERNAME.github.io/minecraft-3d-web)

---

## 🚀 البدء السريع (التطوير المحلي)

### المتطلبات
- متصفح حديث يدعم WebGL (Chrome, Firefox, Edge, Safari)
- لا يتطلب تثبيت أي شيء للعب المباشر

### الفتح
1. افتح ملف `index.html` في المتصفح
2. يمكنك الآن اللعب!

## ⌨️ التحكم

| المفتاح | الوظيفة |
|--------|--------|
| **W** | حركة للأمام |
| **A** | حركة لليسار |
| **S** | حركة للخلف |
| **D** | حركة لليمين |
| **Space** | الطيران للأعلى |
| **C** | الطيران للأسفل |
| **Shift** | ركض (مضاعفة السرعة) |
| **ESC** | تحرير الماوس |
| **Mouse Move** | تدوير الكاميرا |
| **Click** | قفل الماوس |

## 🏗️ هيكل المشروع

```
minecraft-game/
├── index.html              # الصفحة الرئيسية
├── css/
│   └── style.css          # التنسيقات
├── js/
│   ├── main.js            # نقطة البداية
│   ├── core/              # الأنظمة الأساسية
│   │   ├── SceneManager.js
│   │   ├── CameraManager.js
│   │   └── InputManager.js
│   ├── world/             # نظام العالم والكتل
│   │   ├── Block.js
│   │   ├── World.js
│   │   └── Generator.js (قريباً)
│   ├── player/            # نظام اللاعب
│   │   └── Player.js
│   └── utils/             # أدوات مساعدة
│       ├── Constants.js
│       └── Helper.js
└── assets/                # الموارد (الصور والأصوات)
    └── textures/
```

## 🎯 الميزات الحالية

✅ **نظام الكاميرا**
- منظور شخص أول (First Person)
- دوران سلس مع الماوس
- تحرير/قفل الماوس التلقائي

✅ **نظام الحركة**
- حركة في أربع اتجاهات (WASD)
- ركض سريع (Shift)
- طيران حر في Creative Mode
- حركة سلسة مع Physics بسيطة

✅ **نظام الإضاءة**
- إضاءة محيطة (Ambient Light)
- ضوء موجه يشبه الشمس (Directional Light)
- نظام الظلال (Shadow Map)

✅ **نظام العالم المتقدم**
- 🌍 **عالم لا نهائي** مع نظام Chunks (16x16x16)
- 🗻 **تضاريس طبيعية** باستخدام Perlin Noise (تلال، وديان، كهوف)
- 🎲 **توليد إجرائي** قابل للتخصيص (Seed، Scale، Octaves)
- 📦 **نظام Chunks ذكي** - تحميل/تفريغ ديناميكي حول اللاعب
- 👁️ **Frustum Culling** - عدم رسم الـ Chunks غير المرئية
- 📊 **إحصائيات الأداء** - عرض عدد الـ Chunks والكتل المرسومة

✅ **نظام الإدخال**
- معالجة لوحة المفاتيح
- معالجة الماوس والدوران
- Pointer Lock API للتحكم الكامل

## 📊 إحصائيات الأداء

- **FPS Counter**: معروض في الزاوية العلوية اليسرى (في Debug Mode)
- **Debug Info**: موقع اللاعب والإحصائيات
- استهداف **60 FPS** على أجهزة متوسطة

## 🔧 تفعيل وضع Debug

في ملف `Constants.js`، غيّر:
```javascript
DEBUG: false,  // إلى
DEBUG: true,   // هكذا
```

سيظهر:
- عداد FPS
- موقع اللاعب الحالي
- رسائل تصحيح في Console
- مساعد إضاءة بصري

## 🎨 التخصيص

### تغيير الإعدادات
في `js/utils/Constants.js`:
- حجم العالم
- السرعة والتسارع
- ألوان الكتل
- إعدادات الإضاءة

### تغيير الألوان
في `BLOCK_COLORS`:
```javascript
BLOCK_COLORS: {
  STONE: 0x888888,    // رمادي
  DIRT: 0x8B4513,     // بني
  GRASS: 0x00AA00,    // أخضر
  // ...
}
```

## 🚧 الميزات القادمة

- [x] نظام البناء والهدم (Placement/Removal)
- [x] Chunks لدعم عوالم لا نهائية
- [x] Perlin Noise لتضاريس طبيعية
- [x] Frustum Culling لتحسين الأداء
- [ ] نسيج الكتل (Texture Mapping)
- [ ] نظام الفيزياء المتقدم
- [ ] Survival Mode مع صحة وجوع
- [ ] نظام أصوات
- [ ] تأثيرات جسيمات
- [ ] عوالم متعددة اللاعبين (Multiplayer)
- [ ] محررات التضاريس والعوالم

## 📝 الملاحظات التقنية

- استخدام **ES6 Modules** للهيكلة الأفضل
- نمط **Object-Oriented Programming**
- **Three.js r128** للرسوميات
- معالجة الأخطاء والحدود التلقائية

## 🐛 التقارير

إذا وجدت أي خلل، افحص:
1. فتح Console (F12)
2. ابحث عن رسائل الخطأ
3. تأكد من تفعيل JavaScript

## 🔧 تخصيص التضاريس

في `js/utils/Constants.js` تحت قسم `TERRAIN`:

```javascript
TERRAIN: {
  SEED: 12345,         // غيّر لعالم مختلف
  SCALE: 50,           // أكبر = تضاريس أكثر سلاسة
  OCTAVES: 5,          // أكثر = تفاصيل أكبر
  PERSISTENCE: 0.5,    // تأثير الطبقات الكبيرة
  LACUNARITY: 2.0,     // تكرار التفاصيل
  AMPLITUDE: 20,       // ارتفاع التلال
  WATER_LEVEL: 5,      // مستوى الماء
  GRASS_LEVEL: 8,      // ارتفاع الأرضية العشبية
}

CHUNK: {
  RENDER_DISTANCE: 4,  // عدد الـ Chunks حول اللاعب (3-8 موصى به)
}
```

### أمثلة:

| الإعدادات | التأثير |
|----------|--------|
| SEED: 111 | عالم مختلف تماماً |
| SCALE: 30 | تضاريس أكثر تعقيداً |
| AMPLITUDE: 30 | تلال أعلى بكثير |
| RENDER_DISTANCE: 2 | أداء أفضل لكن مسافة رؤية أقل |

---

## 🎓 كيف يعمل النظام؟

### 1️⃣ **Perlin Noise**
- خوارزمية توليد أرقام عشوائية طبيعية المظهر
- تستخدم لحساب ارتفاع التضاريس عند كل موقع

### 2️⃣ **Chunks**
- تقسيم العالم إلى مربعات 16x16x16
- يتم تحميلها حول اللاعب فقط
- توفر ذاكرة وأداء أفضل

### 3️⃣ **Frustum Culling**
- لا ترسم الأشياء خارج مجال الرؤية
- تقلل عدد الـ Meshes المرسومة بنسبة 60-80%

---

## 📚 الموارد

- [Three.js Documentation](https://threejs.org/docs/)
- [WebGL Guide](https://webglfundamentals.org/)
- [Minecraft Wiki](https://minecraft.wiki/)
- [Perlin Noise شرح](https://en.wikipedia.org/wiki/Perlin_noise)

## 📄 الترخيص

هذا المشروع مفتوح المصدر للأغراض التعليمية.

---

**نسخة**: 0.1 (Alpha)  
**آخر تحديث**: يونيو 2026  
**الحالة**: قيد الإطوار 🚀
