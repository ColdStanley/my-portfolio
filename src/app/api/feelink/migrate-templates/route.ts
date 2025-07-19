import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { put } from '@vercel/blob'
import fs from 'fs'
import path from 'path'

// 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

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
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 开始模板迁移...')
    
    const results = []
    
    for (const [templateName, templateData] of Object.entries(TEMPLATE_DATA)) {
      try {
        console.log(`📋 处理模板: ${templateName}`)
        
        // 1. 读取图片文件
        const imagePath = path.join(process.cwd(), 'public/images', templateData.imageFile)
        
        if (!fs.existsSync(imagePath)) {
          console.error(`❌ 图片文件不存在: ${imagePath}`)
          results.push({
            template: templateName,
            success: false,
            error: '图片文件不存在'
          })
          continue
        }
        
        const imageBuffer = fs.readFileSync(imagePath)
        const blobName = `template_${templateData.imageFile}_${Date.now()}`
        
        // 2. 上传到Vercel Blob
        console.log(`📤 上传图片: ${blobName}`)
        const blob = await put(blobName, imageBuffer, {
          access: 'public'
        })
        
        console.log(`✅ 图片上传成功: ${blob.url}`)
        
        // 3. 插入数据到Supabase
        console.log(`💾 插入数据: ${templateName}`)
        const { data, error } = await supabase
          .from('feelink_quotes')
          .insert([
            {
              user_id: null,
              image_url: blob.url,
              description: templateData.description,
              quotes: templateData.quotes,
              type: 'Template',
              web_url: `https://stanleyhi.com/feelink#${templateName.toLowerCase()}`,
              created_at: new Date().toISOString()
            }
          ])
          .select()
        
        if (error) {
          console.error(`❌ 数据插入失败: ${templateName}`, error)
          results.push({
            template: templateName,
            success: false,
            error: error.message
          })
          continue
        }
        
        console.log(`✅ 数据插入成功: ${templateName}`)
        results.push({
          template: templateName,
          success: true,
          data: data[0],
          imageUrl: blob.url
        })
        
      } catch (error) {
        console.error(`❌ 处理模板异常: ${templateName}`, error)
        results.push({
          template: templateName,
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        })
      }
    }
    
    // 统计结果
    const successCount = results.filter(r => r.success).length
    const failCount = results.filter(r => !r.success).length
    
    console.log(`📊 迁移完成: 成功 ${successCount}, 失败 ${failCount}`)
    
    return NextResponse.json({
      success: true,
      message: '模板迁移完成',
      results: results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failCount
      }
    })
    
  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '迁移失败'
    }, { status: 500 })
  }
}

// 验证迁移结果
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('feelink_quotes')
      .select('*')
      .eq('type', 'Template')
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      templates: data,
      count: data.length
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '查询失败'
    }, { status: 500 })
  }
}