// ==========================================
// INDEX.JS - Express Server for Minecraft 3D
// ==========================================

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import {
  initializeDatabase,
  saveBlock,
  saveBlocks,
  loadPlayerBlocks,
  deleteBlock,
  deletePlayerAllBlocks,
  getBlockStats,
  getBlocksInRange,
} from './database.js';

dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3000;

// ===== Middleware =====
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// ===== تهيئة قاعدة البيانات عند بدء السيرفر =====
await initializeDatabase();

// ===== الطلبات الأساسية =====

// GET - اختبار الاتصال
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// ===== APIs للكتل =====

// GET - تحميل جميع الكتل للاعب
app.get('/api/blocks/load', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const result = await loadPlayerBlocks(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - حفظ كتلة واحدة
app.post('/api/blocks/save', async (req, res) => {
  try {
    const { x, y, z, blockType, userId } = req.body;

    if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
      return res.status(400).json({ success: false, error: 'Invalid coordinates' });
    }

    const result = await saveBlock(x, y, z, blockType, userId || 'default');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST - حفظ عدة كتل (دفعة واحدة)
app.post('/api/blocks/save-batch', async (req, res) => {
  try {
    const { blocks, userId } = req.body;

    if (!Array.isArray(blocks)) {
      return res.status(400).json({ success: false, error: 'Blocks must be an array' });
    }

    const result = await saveBlocks(blocks, userId || 'default');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - حذف كتلة واحدة
app.delete('/api/blocks/delete', async (req, res) => {
  try {
    const { x, y, z, userId } = req.body;

    if (typeof x !== 'number' || typeof y !== 'number' || typeof z !== 'number') {
      return res.status(400).json({ success: false, error: 'Invalid coordinates' });
    }

    const result = await deleteBlock(x, y, z, userId || 'default');
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE - حذف جميع الكتل
app.delete('/api/blocks/clear', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const result = await deletePlayerAllBlocks(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - الحصول على إحصائيات
app.get('/api/blocks/stats', async (req, res) => {
  try {
    const userId = req.query.userId || 'default';
    const result = await getBlockStats(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET - الحصول على كتل في منطقة معينة
app.get('/api/blocks/range', async (req, res) => {
  try {
    const { minX, maxX, minY, maxY, minZ, maxZ, userId } = req.query;

    const result = await getBlocksInRange(
      parseInt(minX),
      parseInt(maxX),
      parseInt(minY),
      parseInt(maxY),
      parseInt(minZ),
      parseInt(maxZ),
      userId || 'default'
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ===== معالجة الأخطاء =====
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ===== بدء السيرفر =====
app.listen(PORT, () => {
  console.log('════════════════════════════════════════════════════════════');
  console.log(`🚀 Minecraft 3D Server is running on http://localhost:${PORT}`);
  console.log('════════════════════════════════════════════════════════════');
  console.log('');
  console.log('📊 API Endpoints:');
  console.log('');
  console.log('  GET  /api/health');
  console.log('       → Check server status');
  console.log('');
  console.log('  GET  /api/blocks/load?userId=default');
  console.log('       → Load all saved blocks');
  console.log('');
  console.log('  POST /api/blocks/save');
  console.log('       → Save a single block { x, y, z, blockType, userId }');
  console.log('');
  console.log('  POST /api/blocks/save-batch');
  console.log('       → Save multiple blocks { blocks: [], userId }');
  console.log('');
  console.log('  DELETE /api/blocks/delete');
  console.log('         → Delete a block { x, y, z, userId }');
  console.log('');
  console.log('  DELETE /api/blocks/clear?userId=default');
  console.log('         → Delete all blocks');
  console.log('');
  console.log('  GET  /api/blocks/stats?userId=default');
  console.log('       → Get block statistics');
  console.log('');
  console.log('  GET  /api/blocks/range?minX=-10&maxX=10&minY=0&maxY=256&minZ=-10&maxZ=10&userId=default');
  console.log('       → Get blocks in a specific range');
  console.log('');
  console.log('════════════════════════════════════════════════════════════');
  console.log(`⏰ Started at ${new Date().toLocaleString()}`);
  console.log('════════════════════════════════════════════════════════════');
});

// معالجة إيقاف السيرفر بشكل آمن
process.on('SIGINT', () => {
  console.log('\n📊 Server shutting down gracefully...');
  process.exit(0);
});

export default app;
