#!/usr/bin/env node

/**
 * PicGame数据迁移脚本
 * 将现有的PicGame组件数据迁移到Supabase数据库
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { put } = require('@vercel/blob');

// 配置
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BLOB_READ_WRITE_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!SUPABASE_URL || !SUPABASE_KEY || !BLOB_READ_WRITE_TOKEN) {
  console.error('❌ 请设置环境变量: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BLOB_READ_WRITE_TOKEN');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// PicGame组件目录
const PICGAME_DIR = path.join(__dirname, '../src/app/feelink');
const IMAGES_DIR = path.join(__dirname, '../public/images');

// 手动定义的PicGame数据映射（基于已修改的组件）
const PICGAME_DATA = {
  'PicGame02': {
    imageFile: 'picgame02.png',
    quotes: "Life's short—hug a marshmallow. I may look soft and squishy, but I've got a fire in me. Your go-to emotional support snack for tough days and cozy nights.",
    description: "Meet the fluffiest friend you never knew you needed. He doesn't talk much—but his squish says it all. Always smiling, always soft—your go-to emotional support snack for tough days and cozy nights. Perfectly toasted? Maybe. Emotionally available? Always.",
    category: 'thanks'
  },
  'PicGameLove01AnimateAnon': {
    imageFile: 'picgamelove01animateanon.png',
    quotes: "You don't have to love me back. Just don't leave. I hate how easily you make my heart race, but being near you hurts less than not being near you at all.",
    description: "I know you're good at pretending things don't matter. And I'm terrible at hiding when they do. So maybe this is messy, maybe it's too much. But I can't keep pretending I don't care how you look at me. If this ruins everything, fine. But if there's even a small part of you that doesn't want me to walk away—say something. Please.",
    category: 'love'
  },
  'PicGameApology01': {
    imageFile: 'picgameapology01.png',
    quotes: "Still here. Still sorry. Still hoping. I didn't forget them—I just forgot how important this was to you. Let me show you I'm not always this dumb.",
    description: "I told you I'd pick up your parents from the airport. You even texted me the flight info—twice. But I lost track of time, got stuck in traffic, and by the time I got there, they'd already Ubered home. You didn't say much. Just sat across from me like this, quiet. I get it. I didn't just forget an errand—I forgot something that mattered to you.",
    category: 'sorry'
  }
};

/**
 * 上传图片到Vercel Blob
 */
async function uploadImageToBlob(imagePath, fileName) {
  try {
    console.log(`📤 上传图片: ${fileName}`);
    
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ 图片文件不存在: ${imagePath}`);
      return null;
    }
    
    const fileBuffer = fs.readFileSync(imagePath);
    const blobName = `template_${fileName}_${Date.now()}`;
    
    const blob = await put(blobName, fileBuffer, {
      access: 'public',
      token: BLOB_READ_WRITE_TOKEN
    });
    
    console.log(`✅ 图片上传成功: ${blob.url}`);
    return blob.url;
  } catch (error) {
    console.error(`❌ 图片上传失败: ${fileName}`, error);
    return null;
  }
}

/**
 * 插入数据到Supabase
 */
async function insertToSupabase(templateName, imageUrl, quotes, description, category) {
  try {
    console.log(`💾 插入数据: ${templateName}`);
    
    const { data, error } = await supabase
      .from('feelink_quotes')
      .insert([
        {
          user_id: null, // 模板数据无用户
          image_url: imageUrl,
          description: description,
          quotes: quotes,
          type: 'Template',
          web_url: `https://stanleyhi.com/feelink#${templateName.toLowerCase()}`,
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error(`❌ 数据插入失败: ${templateName}`, error);
      return false;
    }
    
    console.log(`✅ 数据插入成功: ${templateName}`, data);
    return true;
  } catch (error) {
    console.error(`❌ 数据插入异常: ${templateName}`, error);
    return false;
  }
}

/**
 * 主迁移函数
 */
async function migrateData() {
  console.log('🚀 开始PicGame数据迁移...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [templateName, templateData] of Object.entries(PICGAME_DATA)) {
    console.log(`\n📋 处理模板: ${templateName}`);
    
    try {
      // 1. 上传图片
      const imagePath = path.join(IMAGES_DIR, templateData.imageFile);
      const imageUrl = await uploadImageToBlob(imagePath, templateData.imageFile);
      
      if (!imageUrl) {
        console.error(`❌ 跳过模板 ${templateName}: 图片上传失败`);
        failCount++;
        continue;
      }
      
      // 2. 插入数据
      const success = await insertToSupabase(
        templateName,
        imageUrl,
        templateData.quotes,
        templateData.description,
        templateData.category
      );
      
      if (success) {
        successCount++;
        console.log(`✅ 模板 ${templateName} 迁移成功`);
      } else {
        failCount++;
        console.error(`❌ 模板 ${templateName} 迁移失败`);
      }
      
    } catch (error) {
      console.error(`❌ 模板 ${templateName} 处理异常:`, error);
      failCount++;
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 迁移完成统计:');
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失败: ${failCount}`);
  console.log(`📦 总数: ${successCount + failCount}`);
}

/**
 * 验证迁移结果
 */
async function validateMigration() {
  console.log('\n🔍 验证迁移结果...');
  
  const { data, error } = await supabase
    .from('feelink_quotes')
    .select('*')
    .eq('type', 'Template');
  
  if (error) {
    console.error('❌ 验证查询失败:', error);
    return;
  }
  
  console.log(`✅ 数据库中共有 ${data.length} 个模板`);
  data.forEach((template, index) => {
    console.log(`${index + 1}. ${template.web_url} - ${template.quotes.slice(0, 50)}...`);
  });
}

// 主函数
async function main() {
  try {
    await migrateData();
    await validateMigration();
    console.log('\n🎉 数据迁移完成！');
  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { migrateData, validateMigration };