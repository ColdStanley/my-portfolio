#!/usr/bin/env node

/**
 * 通过ID更新图片URL
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkqiimehwoqvwmqkwphv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcWlpbWVod29xdndtcWt3cGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzQ3NzcsImV4cCI6MjA2NTk1MDc3N30.-P6fQfONDH6upQvrya6k9RB1vSXIL4OhtdsMQXN0v9Y';

const supabase = createClient(supabaseUrl, supabaseKey);

// 从之前的上传结果手动映射
const URL_MAPPING = {
  'picgame02': 'https://b7qvkacanaoltyua.public.blob.vercel-storage.com/feelink_template_picgame02.png_1752782827502',
  'picgamelove01animateanon': 'https://b7qvkacanaoltyua.public.blob.vercel-storage.com/feelink_template_picgamelove01animateanon.png_1752782828982',
  'picgameapology01': 'https://b7qvkacanaoltyua.public.blob.vercel-storage.com/feelink_template_picgameapology01.png_1752782830371'
};

async function updateImageUrls() {
  try {
    console.log('🚀 开始更新图片URL...\n');
    
    // 1. 获取所有模板记录
    const { data: templates, error } = await supabase
      .from('feelink_quotes')
      .select('*')
      .eq('type', 'Template');
    
    if (error) {
      console.error('❌ 查询模板失败:', error);
      return;
    }
    
    console.log(`📊 找到 ${templates.length} 个模板记录`);
    
    let successCount = 0;
    let failCount = 0;
    
    // 2. 遍历更新每个记录
    for (const template of templates) {
      try {
        // 从web_url中提取模板名称
        const templateName = template.web_url.split('#')[1];
        const newImageUrl = URL_MAPPING[templateName];
        
        if (!newImageUrl) {
          console.error(`❌ 未找到模板 ${templateName} 的新URL映射`);
          failCount++;
          continue;
        }
        
        console.log(`🔄 更新模板 ${templateName} (ID: ${template.id})`);
        console.log(`   旧URL: ${template.image_url}`);
        console.log(`   新URL: ${newImageUrl}`);
        
        const { data: updateData, error: updateError } = await supabase
          .from('feelink_quotes')
          .update({ image_url: newImageUrl })
          .eq('id', template.id)
          .select();
        
        if (updateError) {
          console.error(`❌ 更新失败: ${templateName}`, updateError);
          failCount++;
        } else {
          console.log(`✅ 更新成功: ${templateName}`);
          successCount++;
        }
        
      } catch (error) {
        console.error(`❌ 处理异常: ${template.web_url}`, error);
        failCount++;
      }
    }
    
    console.log('\n📊 更新完成统计:');
    console.log(`✅ 成功: ${successCount}`);
    console.log(`❌ 失败: ${failCount}`);
    
    // 3. 验证最终结果
    console.log('\n🔍 验证最终结果...');
    const { data: finalData, error: finalError } = await supabase
      .from('feelink_quotes')
      .select('id, image_url, web_url')
      .eq('type', 'Template');
    
    if (finalError) {
      console.error('❌ 验证查询失败:', finalError);
      return;
    }
    
    console.log(`📊 最终模板记录 (${finalData.length} 个):`);
    finalData.forEach((template, index) => {
      const isBlob = template.image_url.includes('vercel-storage.com') || template.image_url.includes('blob.vercel-storage.com');
      const templateName = template.web_url.split('#')[1];
      console.log(`${index + 1}. ${templateName}`);
      console.log(`   状态: ${isBlob ? '✅ Blob URL' : '❌ 本地路径'}`);
      console.log(`   URL: ${template.image_url}`);
    });
    
    console.log('\n🎉 图片URL更新完成！');
    
  } catch (error) {
    console.error('❌ 更新过程异常:', error);
  }
}

updateImageUrls();