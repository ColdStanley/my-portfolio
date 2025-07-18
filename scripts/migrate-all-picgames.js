#!/usr/bin/env node

/**
 * 完整的PicGame数据迁移脚本 - 所有16个组件
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

// 完整的16个PicGame组件数据映射
const ALL_PICGAME_DATA = {
  'PicGame02': {
    imageFile: 'picgame02.png',
    quotes: "Life's short—hug a marshmallow. I may look soft and squishy, but I've got a fire in me. Your go-to emotional support snack for tough days and cozy nights.",
    description: "Meet the fluffiest friend you never knew you needed. He doesn't talk much—but his squish says it all. Always smiling, always soft—your go-to emotional support snack for tough days and cozy nights. Perfectly toasted? Maybe. Emotionally available? Always.",
    category: 'general'
  },
  'PicGame06': {
    imageFile: 'picgame06.png',
    quotes: "These long twin-tails? Total icon status! I've got sixteen million fans worldwide and counting. Ready to sing along?",
    description: "Miku isn't just a character—she's a cultural phenomenon. From bedroom producers to sold-out concerts, we created something that transcends pixels and code. Together, we built her. Together, we believe. The holographic dream lives on.",
    category: 'anime'
  },
  'PicGame07': {
    imageFile: 'picgame07.png',
    quotes: "Eat my banana peels. I was born for first place. Speed? Check. Style? Obviously. Survival? Optional.",
    description: "The race is on—and chaos is at full throttle. Mario Kart isn't just a game; it's a battlefield where friendships die and legends are born. Speed? Check. Style? Obviously. Survival? Optional. The track's about to get a whole lot more interesting.",
    category: 'gaming'
  },
  'PicGame08': {
    imageFile: 'picgame08.png',
    quotes: "Did you just step into a sacred barrier? Oopsie. My spiritual energy might be slightly more intense than your morning coffee.",
    description: "Dressed in red and white, armed with grace and quiet power. She's a spiritual firewall—detecting demons, deflecting negativity, and occasionally dealing with tourists who think shrine grounds are photo ops. Respectfully, please mind the sacred space.",
    category: 'anime'
  },
  'PicGame09': {
    imageFile: 'picgame09.png',
    quotes: "Believe it!—or I'll say it again. Louder. With more ramen-fueled determination and probably a shadow clone jutsu.",
    description: "Loud, loyal, and lowkey legendary. Behind the messy hair and wild optimism is a heart that never gives up—even when the odds are stacked, the village doubts, and the ramen's gone cold. He'll find a way. He always does.",
    category: 'anime'
  },
  'PicGame10': {
    imageFile: 'picgame10.png',
    quotes: "I may be small, but my love is full-size. Do you love me back? Please don't make this awkward.",
    description: "The big question—asked with tiny paws and a heart that's somehow both brave and terrified. It's clumsy, honest, and impossibly adorable—just like real love. Sometimes the smallest gestures carry the biggest feelings.",
    category: 'love'
  },
  'PicGame11': {
    imageFile: 'picgame11.png',
    quotes: "Wands out. Homework later. We've got dark wizards to defeat and friendship speeches to deliver.",
    description: "The golden trio returns—spell-ready and slightly sleep-deprived. Between saving the wizarding world and passing Potions class, they've mastered the art of magical multitasking. Friendship, chaos, and a whole lot of wand-flinging magic.",
    category: 'friendship'
  },
  'PicGameApology01': {
    imageFile: 'picgameapology01.png',
    quotes: "Still here. Still sorry. Still hoping. I didn't forget them—I just forgot how important this was to you. Let me show you I'm not always this dumb.",
    description: "I told you I'd pick up your parents from the airport. You even texted me the flight info—twice. But I lost track of time, got stuck in traffic, and by the time I got there, they'd already Ubered home. You didn't say much. Just sat across from me like this, quiet. I get it. I didn't just forget an errand—I forgot something that mattered to you.",
    category: 'apology'
  },
  'PicGameApology02': {
    imageFile: 'picgameapology02.png',
    quotes: "Remember that dinner? Yeah, I still cringe too. Turns out 'your mom's lasagna tastes store-bought' wasn't the icebreaker I thought it was.",
    description: "I know you hate when I make jokes at the wrong time. That dinner with your family? Definitely the wrong time. Your mom spent hours on that lasagna, and I... well, I opened my mouth and immediately wished I hadn't. I'm still learning when to shut up. Progress is slow.",
    category: 'apology'
  },
  'PicGameBlessing01Graduation': {
    imageFile: 'picgameblessing01graduation.png',
    quotes: "Sophie, you're sitting like you didn't just annihilate four years of chaos. Look at you—diploma in hand, world at your feet.",
    description: "You made it through finals, bad coffee, and three existential crises—and still came out with that smile. The cap, the gown, the whole ceremony thing? It's all just decoration. What matters is you did it. You actually did it. Time to take over the world, one spreadsheet at a time.",
    category: 'blessing'
  },
  'PicGameLove01AnimateAnon': {
    imageFile: 'picgamelove01animateanon.png',
    quotes: "You don't have to love me back. Just don't leave. I hate how easily you make my heart race, but being near you hurts less than not being near you at all.",
    description: "I know you're good at pretending things don't matter. And I'm terrible at hiding when they do. So maybe this is messy, maybe it's too much. But I can't keep pretending I don't care how you look at me. If this ruins everything, fine. But if there's even a small part of you that doesn't want me to walk away—say something. Please.",
    category: 'love'
  },
  'PicGameLove02RealCouple': {
    imageFile: 'picgamelove02realcouple.png',
    quotes: "You remembered my coffee order before I did. Extra shot, oat milk, no sugar. You just... knew.",
    description: "I didn't take this picture to show the food. I took it because I realized—this is what it feels like to be safe. To sit across from someone who notices the small things, who remembers how you like your coffee, who doesn't need you to explain why you're quiet today. Just... this.",
    category: 'love'
  },
  'PicGameLove03RealCoupleWine': {
    imageFile: 'picgamelove03realcouplewine.png',
    quotes: "We had sushi on paper plates and it still felt like a five-star night. Sometimes the best moments are the unplanned ones.",
    description: "We didn't book a restaurant, or dress up, or make it complicated. It was just wine, sushi, your laugh echoing off these walls. I looked at you mid-bite and thought—this is enough. This random Tuesday, this messy apartment, this ordinary magic we keep creating together.",
    category: 'love'
  },
  'PicGameLove04AnimateMitsumi': {
    imageFile: 'picgamelove04animatemitsumi.png',
    quotes: "You always look so calm. I wonder if it's ever tiring. You don't have to smile all the time, you know.",
    description: "You don't have to smile all the time, you know. I like the version of you who doesn't have it all together. The one who gets overwhelmed by crowds, who needs five minutes to breathe, who doesn't always know what to say. That version is real. That version is enough.",
    category: 'love'
  },
  'PicGameLove05AnimateFrieren': {
    imageFile: 'picgamelove05animatefrieren.png',
    quotes: "You don't have to understand right now. I'll wait. Time moves differently when you've seen centuries pass—but this feeling? This is worth the wait.",
    description: "I know you've lived longer than I can ever imagine. That time feels different to you, that decades are like days in your endless story. But this—whatever this is between us—it doesn't need to be rushed or explained. Just a quiet kind of love that waits without asking.",
    category: 'love'
  },
  'PicGameThanks01HappyBirthday': {
    imageFile: 'picgamethanks01birthdayparty.png',
    quotes: "Emma, I walked in and you had that 'surprise but I planned everything' face. Classic. Thank you for making today about more than just getting older.",
    description: "I thought we were just getting tacos. Next thing I know, there's a crown on my head, a cake with my name in wobbly icing, and you standing there with that proud smile. You turned my birthday into something that mattered. Thank you for caring enough to make it special.",
    category: 'thanks'
  }
};

async function uploadImageToBlob(imagePath, fileName) {
  try {
    console.log(`📤 上传图片: ${fileName}`);
    
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

async function insertToSupabase(templateName, imageUrl, quotes, description, category) {
  try {
    console.log(`💾 插入数据: ${templateName}`);
    
    const { data, error } = await supabase
      .from('feelink_quotes')
      .insert([
        {
          user_id: null,
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
    
    console.log(`✅ 数据插入成功: ${templateName}`);
    return true;
  } catch (error) {
    console.error(`❌ 数据插入异常: ${templateName}`, error);
    return false;
  }
}

async function cleanExistingTemplates() {
  try {
    console.log('🧹 清理现有模板数据...');
    
    const { data, error } = await supabase
      .from('feelink_quotes')
      .delete()
      .eq('type', 'Template');
    
    if (error) {
      console.error('❌ 清理失败:', error);
      return false;
    }
    
    console.log('✅ 现有模板数据已清理');
    return true;
  } catch (error) {
    console.error('❌ 清理异常:', error);
    return false;
  }
}

async function migrateAllData() {
  console.log('🚀 开始完整的PicGame数据迁移...\n');
  
  // 1. 清理现有数据
  const cleaned = await cleanExistingTemplates();
  if (!cleaned) {
    console.error('❌ 清理失败，终止迁移');
    return;
  }
  
  let successCount = 0;
  let failCount = 0;
  const results = [];
  
  // 2. 逐个处理所有模板
  for (const [templateName, templateData] of Object.entries(ALL_PICGAME_DATA)) {
    console.log(`\n📋 处理模板: ${templateName} (${templateData.category})`);
    
    try {
      // 上传图片
      const imagePath = path.join(__dirname, '../public/images', templateData.imageFile);
      const imageUrl = await uploadImageToBlob(imagePath, templateData.imageFile);
      
      if (!imageUrl) {
        console.error(`❌ 跳过模板 ${templateName}: 图片上传失败`);
        failCount++;
        results.push({
          template: templateName,
          success: false,
          error: '图片上传失败'
        });
        continue;
      }
      
      // 插入数据
      const success = await insertToSupabase(
        templateName,
        imageUrl,
        templateData.quotes,
        templateData.description,
        templateData.category
      );
      
      if (success) {
        successCount++;
        results.push({
          template: templateName,
          success: true,
          category: templateData.category,
          imageUrl: imageUrl
        });
        console.log(`✅ 模板 ${templateName} 迁移成功`);
      } else {
        failCount++;
        results.push({
          template: templateName,
          success: false,
          error: '数据插入失败'
        });
        console.error(`❌ 模板 ${templateName} 迁移失败`);
      }
      
    } catch (error) {
      console.error(`❌ 模板 ${templateName} 处理异常:`, error);
      failCount++;
      results.push({
        template: templateName,
        success: false,
        error: error.message
      });
    }
    
    // 避免请求过快
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 3. 统计结果
  console.log('\n📊 完整迁移统计:');
  console.log(`✅ 成功: ${successCount}`);
  console.log(`❌ 失败: ${failCount}`);
  console.log(`📦 总数: ${successCount + failCount}`);
  
  // 按分类统计
  const categoryStats = {};
  results.filter(r => r.success).forEach(r => {
    categoryStats[r.category] = (categoryStats[r.category] || 0) + 1;
  });
  
  console.log('\n📊 分类统计:');
  Object.entries(categoryStats).forEach(([category, count]) => {
    console.log(`  ${category}: ${count} 个模板`);
  });
  
  // 4. 验证最终结果
  console.log('\n🔍 验证最终结果...');
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
    const templateName = template.web_url.split('#')[1];
    console.log(`${index + 1}. ${templateName} - ${template.quotes.slice(0, 40)}...`);
  });
  
  console.log('\n🎉 完整数据迁移完成！');
}

// 主函数
async function main() {
  try {
    await migrateAllData();
  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { migrateAllData };