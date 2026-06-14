# 🚀 تكاوين النشر على الخدمات السحابية

---

## 📋 الملفات الجديدة:

```
✅ render.json      ← تكوين Render
✅ Procfile         ← تكوين Heroku
✅ railway.json     ← تكوين Railway
✅ build.sh         ← Script البناء
```

---

## 🎯 اختر منصة النشر:

### 1️⃣ **Render** (الأسهل والأفضل):

#### الملف: `render.json`

```json
{
  "buildCommand": "cd server && npm install",
  "startCommand": "cd server && npm start",
  "envVars": [...]
}
```

**خطوات النشر:**

```
1. اذهب إلى: https://render.com
2. اضغط: New+ → Web Service
3. اختر: Connect Repository → minecraft-3d-web
4. في Build Command:    cd server && npm install
5. في Start Command:    cd server && npm start
6. أضف Environment Variables:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - PORT=3000
   - NODE_ENV=production
7. اضغط: Create Web Service
```

**الوقت:** ~2-3 دقائق

---

### 2️⃣ **Heroku**:

#### الملف: `Procfile`

```
web: cd server && npm start
```

**خطوات النشر:**

```
1. ثبت Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. اتصل:
   heroku login
3. أنشئ تطبيق:
   heroku create minecraft-3d-server
4. أضف المتغيرات:
   heroku config:set SUPABASE_URL=https://supabase.co
   heroku config:set SUPABASE_ANON_KEY=sb_publishable_...
   heroku config:set PORT=3000
   heroku config:set NODE_ENV=production
5. ادفع:
   git push heroku main
```

**الوقت:** ~3-5 دقائق

**ملاحظة:** Heroku توقفت الخدمات المجانية (بحاجة لدفع)

---

### 3️⃣ **Railway**:

#### الملف: `railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd server && npm install"
  },
  "deploy": {
    "startCommand": "cd server && npm start"
  }
}
```

**خطوات النشر:**

```
1. اذهب إلى: https://railway.app
2. اضغط: New Project → Deploy from GitHub
3. اختر: minecraft-3d-web
4. اذهب إلى: Settings → Build
5. في Build Command:    cd server && npm install
6. في Start Command:    cd server && npm start
7. أضف Environment Variables:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - PORT=3000
   - NODE_ENV=production
8. اضغط: Deploy
```

**الوقت:** ~2-3 دقائق

---

## 🔧 المتغيرات البيئية المطلوبة:

جميع المنصات تحتاج:

```
SUPABASE_URL=https://supabase.co
SUPABASE_ANON_KEY=sb_publishable_-wq_H0QMbGrLf9C0pExkK_wE0wL
PORT=3000
NODE_ENV=production
```

---

## 📊 مقارنة المنصات:

| الميزة | Render | Heroku | Railway |
|--------|--------|--------|---------|
| التكلفة | مجاني | مدفوع ($7/شهر) | مجاني ($5) |
| السهولة | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| الأداء | ممتاز | جيد | ممتاز |
| التشغيل الدائم | 24/7 | 24/7 | 24/7 |
| الدعم | جيد | ممتاز | جيد |

**التوصية:** 🏆 **Render** (الأفضل والأسهل)

---

## ✅ قائمة التحقق:

- [ ] اختر منصة النشر (أنصح بـ Render)
- [ ] انسخ التكوين المناسب
- [ ] أضف البيئة والمتغيرات
- [ ] شغّل النشر
- [ ] اختبر الـ API:
  ```
  https://your-app-name.onrender.com/api/health
  ```
- [ ] احصل على رابط السيرفر الحي
- [ ] حدّث BlockStorage.js في اللعبة:
  ```javascript
  this.blockStorage = new BlockStorage(
    'https://your-app-name.onrender.com',  // ← الرابط الجديد
    'default'
  );
  ```

---

## 🌐 روابط مفيدة:

```
📌 Render:
   https://render.com
   Documentation: https://render.com/docs

📌 Heroku:
   https://www.heroku.com
   Documentation: https://devcenter.heroku.com

📌 Railway:
   https://railway.app
   Documentation: https://docs.railway.app
```

---

## 🚨 مشاكل شائعة:

### ❌ "Build Failed - Cannot find module 'express'"

**الحل:**
```
تأكد من أن buildCommand:
✅ cd server && npm install
```

### ❌ "Port already in use"

**الحل:**
```
المنصات تضع PORT تلقائياً:
✅ PORT محدد من المنصة
✅ لا تغيره يدوياً
```

### ❌ "Cannot connect to Supabase"

**الحل:**
```
تحقق من:
✅ SUPABASE_URL صحيح
✅ SUPABASE_ANON_KEY صحيح
✅ متغيرات البيئة مضافة بشكل صحيح
```

---

## 📈 بعد النشر:

### 1. احصل على رابط السيرفر:

```
Render:   https://your-app-name.onrender.com
Heroku:   https://your-app-name.herokuapp.com
Railway:  https://your-app-name.railway.app
```

### 2. اختبر API:

```
https://your-server-url/api/health
```

يجب أن ترى:
```json
{
  "status": "online",
  "timestamp": "2026-06-14T..."
}
```

### 3. حدّث اللعبة:

في `js/main.js`:

```javascript
this.blockStorage = new BlockStorage(
  'https://your-server-url',  // ← السيرفر الحي
  'default'
);
```

### 4. أعد نشر على Vercel:

اللعبة ستتصل تلقائياً بالسيرفر الحي!

---

## 🎊 النتيجة النهائية:

```
✅ Server:  https://your-server.onrender.com
✅ Game:    https://your-game.vercel.app
✅ Database: Supabase (في السحابة)

🌐 لعبة حية على الإنترنت 24/7!
```

---

**التاريخ:** 14 يونيو 2026
**الحالة:** ✅ جاهزة للنشر على السحابة
**التوصية:** استخدم Render (الأسهل والأفضل)

