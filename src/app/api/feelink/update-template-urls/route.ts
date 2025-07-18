import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 使用service role key来获得完整权限
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// Blob URL映射
const URL_MAPPING = {
  'picgame02': 'https://b7qvkacanaoltyua.public.blob.vercel-storage.com/feelink_template_picgame02.png_1752782827502',
  'picgamelove01animateanon': 'https://b7qvkacanaoltyua.public.blob.vercel-storage.com/feelink_template_picgamelove01animateanon.png_1752782828982',
  'picgameapology01': 'https://b7qvkacanaoltyua.public.blob.vercel-storage.com/feelink_template_picgameapology01.png_1752782830371'
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 开始更新模板图片URL...')
    
    // 1. 查询所有模板记录
    const { data: templates, error: queryError } = await supabase
      .from('feelink_quotes')
      .select('*')
      .eq('type', 'Template')
    
    if (queryError) {
      console.error('❌ 查询模板失败:', queryError)
      return NextResponse.json({
        success: false,
        error: queryError.message
      }, { status: 500 })
    }
    
    console.log(`📊 找到 ${templates.length} 个模板记录`)
    
    const results = []
    
    // 2. 更新每个模板的图片URL
    for (const template of templates) {
      try {
        const templateName = template.web_url.split('#')[1]
        const newImageUrl = URL_MAPPING[templateName as keyof typeof URL_MAPPING]
        
        if (!newImageUrl) {
          console.error(`❌ 未找到模板 ${templateName} 的URL映射`)
          results.push({
            template: templateName,
            success: false,
            error: '未找到URL映射'
          })
          continue
        }
        
        console.log(`🔄 更新模板 ${templateName}`)
        console.log(`   旧URL: ${template.image_url}`)
        console.log(`   新URL: ${newImageUrl}`)
        
        // 使用upsert来确保更新
        const { data: updateData, error: updateError } = await supabase
          .from('feelink_quotes')
          .update({ 
            image_url: newImageUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id)
          .select()
        
        if (updateError) {
          console.error(`❌ 更新失败: ${templateName}`, updateError)
          results.push({
            template: templateName,
            success: false,
            error: updateError.message
          })
        } else {
          console.log(`✅ 更新成功: ${templateName}`)
          results.push({
            template: templateName,
            success: true,
            oldUrl: template.image_url,
            newUrl: newImageUrl,
            updated: updateData?.[0] || null
          })
        }
        
      } catch (error) {
        console.error(`❌ 处理异常: ${template.web_url}`, error)
        results.push({
          template: template.web_url,
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        })
      }
    }
    
    // 3. 验证最终结果
    const { data: finalData, error: finalError } = await supabase
      .from('feelink_quotes')
      .select('id, image_url, web_url')
      .eq('type', 'Template')
    
    const summary = {
      total: results.length,
      success: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
    
    console.log(`📊 更新完成: 成功 ${summary.success}, 失败 ${summary.failed}`)
    
    return NextResponse.json({
      success: true,
      message: '模板图片URL更新完成',
      results: results,
      summary: summary,
      finalData: finalData || []
    })
    
  } catch (error) {
    console.error('❌ 更新过程中发生错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '更新失败'
    }, { status: 500 })
  }
}

// 获取当前状态
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
    
    const templatesWithStatus = data.map(template => {
      const templateName = template.web_url.split('#')[1]
      const isBlob = template.image_url.includes('vercel-storage.com') || template.image_url.includes('blob.vercel-storage.com')
      
      return {
        id: template.id,
        name: templateName,
        imageUrl: template.image_url,
        isBlob: isBlob,
        webUrl: template.web_url,
        quotes: template.quotes.slice(0, 50) + '...'
      }
    })
    
    return NextResponse.json({
      success: true,
      templates: templatesWithStatus,
      count: data.length
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '查询失败'
    }, { status: 500 })
  }
}