# 🗄️ دليل إعداد قاعدة البيانات - Supabase Integration

---

## 📋 نظرة عامة:

```
✅ نظام حفظ تلقائي للكتل (Blocks)
✅ تحميل تلقائي للكتل المحفوظة عند بدء اللعبة
✅ API Server باستخدام Node.js + Express
✅ اتصال آمن مع Supabase
✅ دعم عدة لاعبين (Multi-user support)
```

---

## 🚀 خطوات الإعداد السريعة:

### 1️⃣ تثبيت المتطلبات:

```powershell
cd "c:\Users\hm430\Downloads\mop\server"
npm install
```

### 2️⃣ تشغيل السيرفر:

```powershell
cd "c:\Users\hm430\Downloads\mop\server"
npm start
```

### 3️⃣ التحقق من الاتصال:

```
اذهب إلى: http://localhost:3000/api/health
يجب أن ترى: { "status": "online", "timestamp": "..." }
```

---

## 📊 ملفات النظام:

### Server-Side (Node.js):

```
server/
├── index.js              ← Express server الرئيسي
├── database.js           ← دوال التفاعل مع Supabase
├── package.json          ← المتطلبات
├── .gitignore            ← ملفات تجاهلها Git
└── .env                  ← متغيرات البيئة (لا تشاركها!)
```

### Client-Side (JavaScript):

```
js/utils/
└── BlockStorage.js       ← نظام التواصل مع السيرفر
```

### Modified Files:

```
js/main.js               ← إضافة BlockStorage initialization
js/player/Player.js      ← تمرير BlockStorage
js/player/BlockInteraction.js ← حفظ عند البناء/الهدم
```

---

## 🔌 API Endpoints:

### 1. فحص حالة السيرفر:

```
GET /api/health
```

**الاستجابة:**
```json
{
  "status": "online",
  "timestamp": "2026-06-14T10:30:00Z"
}
```

---

### 2. تحميل جميع الكتل:

```
GET /api/blocks/load?userId=default
```

**الاستجابة:**
```json
{
  "success": true,
  "blocks": [
    {
      "x": 0,
      "y": 64,
      "z": 0,
      "block_type": "STONE",
      "user_id": "default",
      "updated_at": "2026-06-14T10:30:00Z"
    },
    ...
  ]
}
```

---

### 3. حفظ كتلة واحدة:

```
POST /api/blocks/save
```

**البيانات:**
```json
{
  "x": 0,
  "y": 64,
  "z": 0,
  "blockType": "STONE",
  "userId": "default"
}
```

**الاستجابة:**
```json
{
  "success": true,
  "data": [...]
}
```

---

### 4. حفظ عدة كتل:

```
POST /api/blocks/save-batch
```

**البيانات:**
```json
{
  "blocks": [
    { "x": 0, "y": 64, "z": 0, "blockType": "STONE" },
    { "x": 1, "y": 64, "z": 0, "blockType": "DIRT" },
    { "x": 2, "y": 64, "z": 0, "blockType": "GRASS" }
  ],
  "userId": "default"
}
```

---

### 5. حذف كتلة واحدة:

```
DELETE /api/blocks/delete
```

**البيانات:**
```json
{
  "x": 0,
  "y": 64,
  "z": 0,
  "userId": "default"
}
```

---

### 6. حذف جميع الكتل:

```
DELETE /api/blocks/clear?userId=default
```

---

### 7. الحصول على إحصائيات:

```
GET /api/blocks/stats?userId=default
```

**الاستجابة:**
```json
{
  "success": true,
  "count": 150
}
```

---

### 8. الحصول على كتل في منطقة:

```
GET /api/blocks/range?minX=-10&maxX=10&minY=0&maxY=256&minZ=-10&maxZ=10&userId=default
```

---

## 💻 استخدام BlockStorage في اللعبة:

### الاستخدام الأساسي:

```javascript
// تم إنشاء blockStorage تلقائياً في main.js
const blockStorage = window.game.getBlockStorage();

// حفظ كتلة واحدة
await blockStorage.saveBlock(0, 64, 0, 'STONE');

// حفظ عدة كتل
await blockStorage.saveBlocksBatch([
  { x: 0, y: 64, z: 0, blockType: 'STONE' },
  { x: 1, y: 64, z: 0, blockType: 'DIRT' }
]);

// حذف كتلة
await blockStorage.deleteBlock(0, 64, 0);

// تحميل جميع الكتل
const blocks = await blockStorage.loadBlocks();

// الحصول على الإحصائيات
const stats = await blockStorage.getStats();
console.log(`عدد الكتل المحفوظة: ${stats.count}`);
```

---

## 🔄 تدفق البيانات:

### عند البناء (Place Block):

```
1. اللاعب ينقر بالزر الأيمن
   ↓
2. placeBlock() في BlockInteraction.js
   ↓
3. world.setBlock() ← تُضاف الكتلة للعالم
   ↓
4. blockStorage.saveBlock() ← تُرسل للسيرفر
   ↓
5. Server → Supabase Database
   ↓
✅ تُحفظ نهائياً
```

### عند الهدم (Break Block):

```
1. اللاعب ينقر بالزر الأيسر
   ↓
2. breakBlock() في BlockInteraction.js
   ↓
3. world.removeBlock() ← تُزال من العالم
   ↓
4. blockStorage.deleteBlock() ← تُرسل للسيرفر
   ↓
5. Server → Supabase Database
   ↓
✅ تُحذف نهائياً
```

### عند تحميل اللعبة:

```
1. Game initialization
   ↓
2. loadSavedBlocks() في main.js
   ↓
3. blockStorage.loadBlocks() ← تطلب البيانات
   ↓
4. Server ← Supabase Database
   ↓
5. world.setBlock() لكل كتلة محفوظة
   ↓
✅ العالم جاهز مع جميع الكتل المحفوظة
```

---

## 🗄️ هيكل جدول Supabase:

### Table: `blocks`

```sql
CREATE TABLE blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  x INTEGER NOT NULL,
  y INTEGER NOT NULL,
  z INTEGER NOT NULL,
  block_type VARCHAR(50) NOT NULL,
  user_id VARCHAR(255) NOT NULL DEFAULT 'default',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(x, y, z, user_id)
);

CREATE INDEX idx_blocks_user ON blocks(user_id);
CREATE INDEX idx_blocks_coords ON blocks(x, y, z);
```

---

## ⚙️ المتغيرات البيئية (.env):

```env
# Supabase Configuration
SUPABASE_URL=https://supabase.co
SUPABASE_ANON_KEY=sb_publishable_-wq_H0QMbGrLf9C0pExkK_wE0wL

# Server Configuration
PORT=3000
NODE_ENV=development
```

---

## 🐛 استكشاف الأخطاء:

### المشكلة: "Cannot connect to server"

**الحل:**
```
1. تأكد من تشغيل السيرفر: npm start
2. تحقق من http://localhost:3000/api/health
3. تحقق من أن PORT=3000 في .env
```

### المشكلة: "Database connection failed"

**الحل:**
```
1. تحقق من SUPABASE_URL و SUPABASE_ANON_KEY في .env
2. تأكد من صحة المفاتيح في Supabase Dashboard
3. تحقق من اتصالك بالإنترنت
```

### المشكلة: "Blocks are not saving"

**الحل:**
```
1. افتح Console (F12) واتبع الرسائل
2. تحقق من API responses
3. تأكد من أن BlockStorage تم إنشاؤها
4. راجع السجلات في Server Terminal
```

---

## 📈 مراقبة النظام:

### الملفات اللوغية:

```
في Server Terminal:
✓ تحديثات الحفظ
✓ تحميل الكتل
✓ الأخطاء والتحذيرات
✓ إحصائيات الأداء
```

### في Browser Console:

```javascript
// تحقق من حالة BlockStorage
console.log(window.game.getBlockStorage());

// الحصول على الإحصائيات
const stats = await window.game.getBlockStorage().getStats();
console.log(stats);

// عدد الكتل غير المحفوظة
console.log(window.game.getBlockStorage().getUnsavedCount());
```

---

## 🔐 الأمان:

```
⚠️  لا تشارك .env file
⚠️  لا تسجل المفاتيح في الكود
⚠️  استخدم SUPABASE_ANON_KEY فقط (محدود الصلاحيات)
⚠️  الكتل محفوظة لكل لاعب على حدة (userId)
```

---

## 📱 دعم عدة لاعبين:

```javascript
// كل لاعب له userId مختلف
const blockStorage = new BlockStorage('http://localhost:3000', 'player1');

// الكتل منفصلة تماماً:
// - player1 يحفظ في user_id='player1'
// - player2 يحفظ في user_id='player2'
// - لا توجد تضاربات
```

---

## 🎯 الخطوات التالية:

```
✅ 1. تثبيت npm packages
✅ 2. تشغيل السيرفر
✅ 3. بدء اللعبة
✅ 4. البناء والهدم → حفظ تلقائي
✅ 5. إعادة التحميل → تحميل تلقائي
✅ 6. نشر على Vercel + Heroku/Railway للسيرفر

بعدها ستكون اللعبة:
- ✅ محفوظة في قاعدة البيانات
- ✅ تعمل عبر الإنترنت
- ✅ تدعم عدة لاعبين
```

---

**التاريخ:** 14 يونيو 2026
**الحالة:** ✅ نظام قاعدة البيانات جاهز
**الخطوة التالية:** تشغيل السيرفر وبدء اللعبة

