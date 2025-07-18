import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// 分类映射 - 用于将数据库的category映射到页面的section
const CATEGORY_MAPPING = {
  'love': 'love',
  'apology': 'sorry', 
  'blessing': 'blessing',
  'thanks': 'thanks',
  'general': 'thanks', // 将general归类到thanks
  'anime': 'blessing', // 将anime归类到blessing
  'gaming': 'blessing', // 将gaming归类到blessing
  'friendship': 'blessing' // 将friendship归类到blessing
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    // 构建查询
    let query = supabase
      .from('feelink_quotes')
      .select('*')
      .eq('type', 'Template')
      .order('created_at', { ascending: false })
    
    // 如果指定了category，则过滤
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data: templates, error } = await query
    
    if (error) {
      console.error('❌ 查询模板失败:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }
    
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
    }

    // 处理模板数据，添加section信息
    const processedTemplates = templates.map(template => {
      const templateName = template.web_url.split('#')[1] || 'unknown'
      const inferredCategory = TEMPLATE_CATEGORIES[templateName as keyof typeof TEMPLATE_CATEGORIES] || 'general'
      const section = CATEGORY_MAPPING[inferredCategory as keyof typeof CATEGORY_MAPPING] || 'thanks'
      
      return {
        id: template.id,
        name: templateName,
        imageUrl: template.image_url,
        quotes: template.quotes,
        description: template.description,
        category: inferredCategory, // 使用推断的category
        section: section, // 页面显示用的section
        webUrl: template.web_url,
        createdAt: template.created_at
      }
    })
    
    // 按section分组
    const templatesBySection = {
      love: processedTemplates.filter(t => t.section === 'love'),
      sorry: processedTemplates.filter(t => t.section === 'sorry'),
      blessing: processedTemplates.filter(t => t.section === 'blessing'),
      thanks: processedTemplates.filter(t => t.section === 'thanks')
    }
    
    return NextResponse.json({
      success: true,
      templates: processedTemplates,
      templatesBySection: templatesBySection,
      totalCount: templates.length,
      sectionCounts: {
        love: templatesBySection.love.length,
        sorry: templatesBySection.sorry.length,
        blessing: templatesBySection.blessing.length,
        thanks: templatesBySection.thanks.length
      }
    })
    
  } catch (error) {
    console.error('❌ 获取模板时发生错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取模板失败'
    }, { status: 500 })
  }
}

// 获取特定模板详情
export async function POST(request: NextRequest) {
  try {
    const { templateName } = await request.json()
    
    if (!templateName) {
      return NextResponse.json({
        success: false,
        error: '模板名称是必需的'
      }, { status: 400 })
    }
    
    const { data: template, error } = await supabase
      .from('feelink_quotes')
      .select('*')
      .eq('type', 'Template')
      .eq('web_url', `https://stanleyhi.com/feelink#${templateName.toLowerCase()}`)
      .single()
    
    if (error) {
      console.error('❌ 查询单个模板失败:', error)
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 500 })
    }
    
    if (!template) {
      return NextResponse.json({
        success: false,
        error: '模板未找到'
      }, { status: 404 })
    }
    
    const processedTemplate = {
      id: template.id,
      name: templateName,
      imageUrl: template.image_url,
      quotes: template.quotes,
      description: template.description,
      category: template.category,
      webUrl: template.web_url,
      createdAt: template.created_at
    }
    
    return NextResponse.json({
      success: true,
      template: processedTemplate
    })
    
  } catch (error) {
    console.error('❌ 获取单个模板时发生错误:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '获取模板失败'
    }, { status: 500 })
  }
}