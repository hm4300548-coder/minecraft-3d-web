// ==========================================
// DATABASE.JS - نظام قاعدة البيانات Supabase
// ==========================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// ===== إنشاء الجداول إن لم تكن موجودة =====
export async function initializeDatabase() {
  try {
    console.log('📊 Initializing database...');

    // التحقق من اتصال Supabase
    const { data, error } = await supabase.from('blocks').select('count').limit(1);

    if (error && error.code !== 'PGRST116') {
      console.warn('⚠️  Database warning:', error.message);
    } else {
      console.log('✓ Database initialized successfully');
    }
  } catch (err) {
    console.log('ℹ️  Database setup note:', err.message);
  }
}

// ===== حفظ كتلة واحدة =====
export async function saveBlock(x, y, z, blockType, userId = 'default') {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .upsert({
        x,
        y,
        z,
        block_type: blockType,
        user_id: userId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'x,y,z,user_id'
      });

    if (error) {
      console.error('❌ Save block error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('❌ Save block exception:', err.message);
    return { success: false, error: err.message };
  }
}

// ===== حفظ عدة كتل (دفعة واحدة) =====
export async function saveBlocks(blocks, userId = 'default') {
  try {
    const blocksToInsert = blocks.map(block => ({
      x: block.x,
      y: block.y,
      z: block.z,
      block_type: block.blockType,
      user_id: userId,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('blocks')
      .upsert(blocksToInsert, {
        onConflict: 'x,y,z,user_id'
      });

    if (error) {
      console.error('❌ Save blocks error:', error.message);
      return { success: false, error: error.message };
    }

    console.log(`✓ Saved ${blocksToInsert.length} blocks`);
    return { success: true, count: blocksToInsert.length, data };
  } catch (err) {
    console.error('❌ Save blocks exception:', err.message);
    return { success: false, error: err.message };
  }
}

// ===== تحميل جميع الكتل للاعب =====
export async function loadPlayerBlocks(userId = 'default') {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Load blocks error:', error.message);
      return { success: false, error: error.message, blocks: [] };
    }

    console.log(`✓ Loaded ${data.length} blocks for user ${userId}`);
    return { success: true, blocks: data };
  } catch (err) {
    console.error('❌ Load blocks exception:', err.message);
    return { success: false, error: err.message, blocks: [] };
  }
}

// ===== حذف كتلة واحدة =====
export async function deleteBlock(x, y, z, userId = 'default') {
  try {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('x', x)
      .eq('y', y)
      .eq('z', z)
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Delete block error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('❌ Delete block exception:', err.message);
    return { success: false, error: err.message };
  }
}

// ===== حذف جميع الكتل للاعب =====
export async function deletePlayerAllBlocks(userId = 'default') {
  try {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Delete all blocks error:', error.message);
      return { success: false, error: error.message };
    }

    console.log(`✓ Deleted all blocks for user ${userId}`);
    return { success: true };
  } catch (err) {
    console.error('❌ Delete all blocks exception:', err.message);
    return { success: false, error: err.message };
  }
}

// ===== الحصول على إحصائيات =====
export async function getBlockStats(userId = 'default') {
  try {
    const { count, error } = await supabase
      .from('blocks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('❌ Get stats error:', error.message);
      return { success: false, error: error.message, count: 0 };
    }

    return { success: true, count };
  } catch (err) {
    console.error('❌ Get stats exception:', err.message);
    return { success: false, error: err.message, count: 0 };
  }
}

// ===== البحث عن كتل في منطقة معينة =====
export async function getBlocksInRange(minX, maxX, minY, maxY, minZ, maxZ, userId = 'default') {
  try {
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .eq('user_id', userId)
      .gte('x', minX)
      .lte('x', maxX)
      .gte('y', minY)
      .lte('y', maxY)
      .gte('z', minZ)
      .lte('z', maxZ);

    if (error) {
      console.error('❌ Get blocks in range error:', error.message);
      return { success: false, error: error.message, blocks: [] };
    }

    return { success: true, blocks: data };
  } catch (err) {
    console.error('❌ Get blocks in range exception:', err.message);
    return { success: false, error: err.message, blocks: [] };
  }
}

export default supabase;
