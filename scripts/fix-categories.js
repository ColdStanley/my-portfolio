#!/usr/bin/env node

/**
 * 修复数据库中的category字段
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gkqiimehwoqvwmqkwphv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcWlpbWVod29xdndtcWt3cGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzQ3NzcsImV4cCI6MjA2NTk1MDc3N30.-P6fQfONDH6upQvrya6k9RB1vSXIL4OhtdsMQXN0v9Y';

const supabase = createClient(supabaseUrl, supabaseKey);

// 根据模板名称推断category
const TEMPLATE_CATEGORIES = {
  'picgame02': 'general',
  'picgame06': 'anime',
  'picgame07': 'gaming',
  'picgame08': 'anime',
  'picgame09': 'anime',
  'picgame10': 'love',
  'picgame11': 'friendship',
  'picgameapology01': 'apology',
  'picgameapology02': 'apology',
  'picgameblessing01graduation': 'blessing',
  'picgamelove01animateanon': 'love',
  'picgamelove02realcouple': 'love',
  'picgamelove03realcouplewine': 'love',
  'picgamelove04animatemitsumi': 'love',
  'picgamelove05animatefrieren': 'love',
  'picgamethanks01happybirthday': 'thanks'
};

async function fixCategories() {
  try {
    console.log('🚀 开始修复category字段...\n');
    
    // 1. 获取所有模板
    const { data: templates, error } = await supabase
      .from('feelink_quotes')
      .select('*')
      .eq('type', 'Template');
    
    if (error) {
      console.error('❌ 查询模板失败:', error);
      return;
    }
    
    console.log(`📊 找到 ${templates.length} 个模板`);
    
    let successCount = 0;
    let failCount = 0;
    
    // 2. 更新每个模板的category
    for (const template of templates) {
      try {
        const templateName = template.web_url.split('#')[1];
        const newCategory = TEMPLATE_CATEGORIES[templateName];
        
        if (!newCategory) {
          console.warn(`⚠️ 未找到模板 ${templateName} 的category映射`);
          continue;
        }
        
        console.log(`🔄 更新 ${templateName}: ${template.category || 'null'} -> ${newCategory}`);
        
        const { data: updateData, error: updateError } = await supabase
          .from('feelink_quotes')
          .update({ category: newCategory })
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
    
    console.log('\n📊 修复完成统计:');
    console.log(`✅ 成功: ${successCount}`);
    console.log(`❌ 失败: ${failCount}`);
    
    // 3. 验证结果
    console.log('\n🔍 验证修复结果...');
    const { data: finalData, error: finalError } = await supabase
      .from('feelink_quotes')
      .select('web_url, category')
      .eq('type', 'Template')
      .order('created_at', { ascending: false });
    
    if (finalError) {
      console.error('❌ 验证查询失败:', finalError);
      return;
    }
    
    // 按category分组统计
    const categoryStats = {};
    finalData.forEach(template => {
      const category = template.category || 'null';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });
    
    console.log('\n📊 最终分类统计:');
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 个模板`);
    });
    
    console.log('\n🎉 Category字段修复完成！');
    
  } catch (error) {
    console.error('❌ 修复过程中发生错误:', error);
  }
}

fixCategories();