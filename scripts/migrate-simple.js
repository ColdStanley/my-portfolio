#!/usr/bin/env node

/**
 * 简化的数据迁移脚本
 * 直接使用公开的anon key进行测试
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 使用公开的 anon key 进行测试
const supabaseUrl = 'https://gkqiimehwoqvwmqkwphv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcWlpbWVod29xdndtcWt3cGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzQ3NzcsImV4cCI6MjA2NTk1MDc3N30.-P6fQfONDH6upQvrya6k9RB1vSXIL4OhtdsMQXN0v9Y';

const supabase = createClient(supabaseUrl, supabaseKey);

// 模板数据
const TEMPLATE_DATA = {
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

async function testSupabaseConnection() {
  try {
    console.log('🔍 测试Supabase连接...');
    
    const { data, error } = await supabase
      .from('feelink_quotes')
      .select('*', { count: 'exact' })
      .eq('type', 'Template');
    
    if (error) {
      console.error('❌ Supabase连接失败:', error);
      return false;
    }
    
    console.log('✅ Supabase连接成功');
    console.log('📊 当前模板数量:', data);
    return true;
  } catch (error) {
    console.error('❌ 连接异常:', error);
    return false;
  }
}

async function insertTemplate(templateName, templateData) {
  try {
    console.log(`💾 插入模板: ${templateName}`);
    
    // 使用占位符图片URL，后续可以手动更新
    const imageUrl = `/images/${templateData.imageFile}`;
    
    const { data, error } = await supabase
      .from('feelink_quotes')
      .insert([
        {
          user_id: null,
          image_url: imageUrl,
          description: templateData.description,
          quotes: templateData.quotes,
          type: 'Template',
          web_url: `https://stanleyhi.com/feelink#${templateName.toLowerCase()}`,
          created_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (error) {
      console.error(`❌ 插入失败: ${templateName}`, error);
      return false;
    }
    
    console.log(`✅ 插入成功: ${templateName}`);
    return true;
  } catch (error) {
    console.error(`❌ 插入异常: ${templateName}`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 开始简化数据迁移...\n');
  
  // 1. 测试连接
  const connected = await testSupabaseConnection();
  if (!connected) {
    console.error('❌ 无法连接到Supabase，终止迁移');
    return;
  }
  
  // 2. 插入模板数据
  let successCount = 0;
  let failCount = 0;
  
  for (const [templateName, templateData] of Object.entries(TEMPLATE_DATA)) {
    const success = await insertTemplate(templateName, templateData);
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n📊 迁移完成统计:');
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失败: ${failCount}`);
  
  // 3. 验证结果
  console.log('\n🔍 验证迁移结果...');
  const { data, error } = await supabase
    .from('feelink_quotes')
    .select('*')
    .eq('type', 'Template');
  
  if (error) {
    console.error('❌ 验证失败:', error);
    return;
  }
  
  console.log(`✅ 数据库中共有 ${data.length} 个模板`);
  data.forEach((template, index) => {
    console.log(`${index + 1}. ${template.web_url}`);
    console.log(`   引用: ${template.quotes.slice(0, 50)}...`);
  });
  
  console.log('\n🎉 数据迁移完成！');
  console.log('💡 注意：图片URL使用了本地路径，需要后续上传到Vercel Blob并更新URL');
}

main().catch(console.error);