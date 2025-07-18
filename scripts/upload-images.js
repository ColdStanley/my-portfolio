#!/usr/bin/env node

/**
 * 上传图片到Vercel Blob并更新数据库中的URL
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { put } = require('@vercel/blob');

// 配置
const supabaseUrl = 'https://gkqiimehwoqvwmqkwphv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcWlpbWVod29xdndtcWt3cGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzQ3NzcsImV4cCI6MjA2NTk1MDc3N30.-P6fQfONDH6upQvrya6k9RB1vSXIL4OhtdsMQXN0v9Y';
const blobToken = 'vercel_blob_rw_B7QvKaCanaOLtYUa_nCavqXnXVfD8tsxwdsn0iN6EUwEHKK';

const supabase = createClient(supabaseUrl, supabaseKey);

// 图片映射
const IMAGE_MAPPING = {
  '/images/picgame02.png': 'picgame02.png',
  '/images/picgamelove01animateanon.png': 'picgamelove01animateanon.png',
  '/images/picgameapology01.png': 'picgameapology01.png'
};

async function uploadImageToBlob(localPath, fileName) {
  try {
    console.log(`📤 上传图片: ${fileName}`);
    
    const imagePath = path.join(__dirname, '../public/images', fileName);
    
    if (!fs.existsSync(imagePath)) {
      console.error(`❌ 图片文件不存在: ${imagePath}`);
      return null;
    }
    
    const fileBuffer = fs.readFileSync(imagePath);
    const blobName = `feelink_template_${fileName}_${Date.now()}`;
    
    const blob = await put(blobName, fileBuffer, {
      access: 'public',
      token: blobToken
    });
    
    console.log(`✅ 图片上传成功: ${blob.url}`);
    return blob.url;
  } catch (error) {
    console.error(`❌ 图片上传失败: ${fileName}`, error);
    return null;
  }
}

async function updateDatabaseImageUrl(oldImageUrl, newImageUrl) {
  try {
    console.log(`🔄 更新数据库URL: ${oldImageUrl} -> ${newImageUrl}`);
    
    const { data, error } = await supabase
      .from('feelink_quotes')
      .update({ image_url: newImageUrl })
      .eq('image_url', oldImageUrl)
      .eq('type', 'Template')
      .select();
    
    if (error) {
      console.error(`❌ 数据库更新失败:`, error);
      return false;
    }
    
    console.log(`✅ 数据库更新成功，影响 ${data.length} 条记录`);
    return true;
  } catch (error) {
    console.error(`❌ 数据库更新异常:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 开始上传图片到Vercel Blob...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const [localPath, fileName] of Object.entries(IMAGE_MAPPING)) {
    try {
      // 1. 上传图片到Vercel Blob
      const blobUrl = await uploadImageToBlob(localPath, fileName);
      
      if (!blobUrl) {
        console.error(`❌ 跳过更新: ${localPath} 上传失败`);
        failCount++;
        continue;
      }
      
      // 2. 更新数据库中的URL
      const updateSuccess = await updateDatabaseImageUrl(localPath, blobUrl);
      
      if (updateSuccess) {
        successCount++;
        console.log(`✅ 完成: ${fileName}`);
      } else {
        failCount++;
        console.error(`❌ 数据库更新失败: ${fileName}`);
      }
      
    } catch (error) {
      console.error(`❌ 处理异常: ${fileName}`, error);
      failCount++;
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 图片上传完成统计:');
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失败: ${failCount}`);
  
  // 验证最终结果
  console.log('\n🔍 验证最终结果...');
  const { data, error } = await supabase
    .from('feelink_quotes')
    .select('image_url, web_url')
    .eq('type', 'Template');
  
  if (error) {
    console.error('❌ 验证查询失败:', error);
    return;
  }
  
  console.log(`📊 模板记录 (${data.length} 个):`);
  data.forEach((template, index) => {
    const isBlob = template.image_url.includes('vercel-storage.com') || template.image_url.includes('blob.vercel-storage.com');
    console.log(`${index + 1}. ${template.web_url}`);
    console.log(`   图片: ${isBlob ? '✅ Blob URL' : '❌ 本地路径'} - ${template.image_url}`);
  });
  
  console.log('\n🎉 图片上传和数据库更新完成！');
}

main().catch(console.error);