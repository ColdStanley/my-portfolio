#!/usr/bin/env node

/**
 * 测试数据迁移脚本 - 验证数据提取逻辑
 */

const fs = require('fs');
const path = require('path');

// PicGame数据映射
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

// 检查图片文件是否存在
function checkImages() {
  console.log('🔍 检查图片文件...\n');
  
  for (const [templateName, templateData] of Object.entries(PICGAME_DATA)) {
    const imagePath = path.join(__dirname, '../public/images', templateData.imageFile);
    const exists = fs.existsSync(imagePath);
    
    console.log(`${exists ? '✅' : '❌'} ${templateName}: ${templateData.imageFile}`);
    
    if (exists) {
      const stats = fs.statSync(imagePath);
      console.log(`   大小: ${(stats.size / 1024).toFixed(2)} KB`);
    }
  }
}

// 显示待迁移的数据
function showMigrationData() {
  console.log('\n📋 待迁移数据预览:\n');
  
  for (const [templateName, templateData] of Object.entries(PICGAME_DATA)) {
    console.log(`🎯 ${templateName}:`);
    console.log(`   分类: ${templateData.category}`);
    console.log(`   图片: ${templateData.imageFile}`);
    console.log(`   引用: ${templateData.quotes.slice(0, 80)}...`);
    console.log(`   描述: ${templateData.description.slice(0, 80)}...`);
    console.log('');
  }
}

// 生成迁移SQL预览
function generateMigrationSQL() {
  console.log('💾 生成迁移SQL预览:\n');
  
  for (const [templateName, templateData] of Object.entries(PICGAME_DATA)) {
    const webUrl = `https://stanleyhi.com/feelink#${templateName.toLowerCase()}`;
    
    console.log(`INSERT INTO feelink_quotes (user_id, image_url, description, quotes, type, web_url, created_at) VALUES`);
    console.log(`(NULL, 'BLOB_URL_${templateData.imageFile}', '${templateData.description.replace(/'/g, "''")}', '${templateData.quotes.replace(/'/g, "''")}', 'Template', '${webUrl}', NOW());`);
    console.log('');
  }
}

// 主函数
function main() {
  console.log('🚀 数据迁移预检查\n');
  
  checkImages();
  showMigrationData();
  generateMigrationSQL();
  
  console.log('📊 统计信息:');
  console.log(`总模板数: ${Object.keys(PICGAME_DATA).length}`);
  console.log(`分类分布: ${Object.values(PICGAME_DATA).reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {})}`);
  
  console.log('\n✅ 预检查完成！');
  console.log('💡 设置环境变量后运行: node scripts/migrate-picgames.js');
}

main();