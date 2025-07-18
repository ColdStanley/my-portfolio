#!/usr/bin/env node

/**
 * 检查数据库中的模板记录
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkqiimehwoqvwmqkwphv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcWlpbWVod29xdndtcWt3cGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzQ3NzcsImV4cCI6MjA2NTk1MDc3N30.-P6fQfONDH6upQvrya6k9RB1vSXIL4OhtdsMQXN0v9Y';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    console.log('🔍 检查数据库中的模板记录...\n');
    
    const { data, error } = await supabase
      .from('feelink_quotes')
      .select('*')
      .eq('type', 'Template');
    
    if (error) {
      console.error('❌ 查询失败:', error);
      return;
    }
    
    console.log(`📊 找到 ${data.length} 个模板记录:`);
    data.forEach((template, index) => {
      console.log(`\n${index + 1}. ID: ${template.id}`);
      console.log(`   URL: ${template.web_url}`);
      console.log(`   图片: ${template.image_url}`);
      console.log(`   引用: ${template.quotes.slice(0, 50)}...`);
      console.log(`   类型: ${template.type}`);
      console.log(`   用户ID: ${template.user_id}`);
    });
    
    // 尝试手动更新一个记录来测试权限
    if (data.length > 0) {
      console.log('\n🧪 测试更新权限...');
      const testId = data[0].id;
      const testUrl = 'https://test-blob-url.com/test.png';
      
      const { data: updateData, error: updateError } = await supabase
        .from('feelink_quotes')
        .update({ image_url: testUrl })
        .eq('id', testId)
        .select();
      
      if (updateError) {
        console.error('❌ 更新权限测试失败:', updateError);
        console.log('💡 可能需要service role key或RLS策略调整');
      } else {
        console.log(`✅ 更新权限测试成功，影响 ${updateData.length} 条记录`);
        
        // 回滚测试更新
        await supabase
          .from('feelink_quotes')
          .update({ image_url: data[0].image_url })
          .eq('id', testId);
        console.log('🔄 已回滚测试更新');
      }
    }
    
  } catch (error) {
    console.error('❌ 检查异常:', error);
  }
}

checkDatabase();