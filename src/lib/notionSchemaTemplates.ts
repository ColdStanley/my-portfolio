// Notion数据库黄金模板配置
// 基于开发者的数据库结构，作为所有用户的标准模板

export interface NotionPropertyConfig {
  type: string
  name?: string
  select?: {
    options: Array<{
      name: string
    }>
  }
  multi_select?: {
    options: Array<{
      name: string
    }>
  }
  relation?: {
    database_id: string // 这个会在运行时替换为用户的实际database_id
    dual_property?: {}
    single_property?: {}
  }
  date?: {}
  title?: {}
  rich_text?: {}
  number?: {
    format: string
  }
  checkbox?: {}
}

export interface DatabaseTemplate {
  name: string
  properties: {
    [key: string]: NotionPropertyConfig
  }
}

// Tasks数据库模板
export const TASKS_TEMPLATE: DatabaseTemplate = {
  name: "Tasks",
  properties: {
    "title": {
      type: "title",
      title: {}
    },
    "status": {
      type: "select",
      select: {
        options: [
          { name: "Not Started" },
          { name: "In Progress" },
          { name: "Completed" },
          { name: "On Hold" },
          { name: "Cancelled" }
        ]
      }
    },
    "start_date": {
      type: "date",
      date: {}
    },
    "end_date": {
      type: "date",
      date: {}
    },
    "all_day": {
      type: "checkbox",
      checkbox: {}
    },
    "remind_before": {
      type: "number",
      number: {
        format: "number"
      }
    },
    "plan": {
      type: "relation",
      relation: {
        database_id: "PLAN_DB_PLACEHOLDER", // 运行时替换
        dual_property: {}
      }
    },
    "note": {
      type: "rich_text",
      rich_text: {}
    },
    "budget_time": {
      type: "number",
      number: {
        format: "number"
      }
    },
    "actual_time": {
      type: "number",
      number: {
        format: "number"
      }
    }
  }
}

// Plan数据库模板
export const PLAN_TEMPLATE: DatabaseTemplate = {
  name: "Plan",
  properties: {
    "objective": {
      type: "title",
      title: {}
    },
    "status": {
      type: "select",
      select: {
        options: [
          { name: "Not Started" },
          { name: "In Progress" },
          { name: "Completed" },
          { name: "On Hold" },
          { name: "Cancelled" }
        ]
      }
    },
    "start_date": {
      type: "date",
      date: {}
    },
    "end_date": {
      type: "date",
      date: {}
    },
    "strategy": {
      type: "relation",
      relation: {
        database_id: "STRATEGY_DB_PLACEHOLDER", // 运行时替换
        dual_property: {}
      }
    },
    "budget_money": {
      type: "number",
      number: {
        format: "number"
      }
    },
    "budget_time": {
      type: "number",
      number: {
        format: "number"
      }
    },
    "note": {
      type: "rich_text",
      rich_text: {}
    }
  }
}

// Strategy数据库模板
export const STRATEGY_TEMPLATE: DatabaseTemplate = {
  name: "Strategy",
  properties: {
    "objective": {
      type: "title",
      title: {}
    },
    "status": {
      type: "select",
      select: {
        options: [
          { name: "Not Started" },
          { name: "In Progress" },
          { name: "Completed" },
          { name: "On Hold" },
          { name: "Cancelled" }
        ]
      }
    },
    "start_date": {
      type: "date",
      date: {}
    },
    "end_date": {
      type: "date",
      date: {}
    },
    "budget_money": {
      type: "number",
      number: {
        format: "number"
      }
    },
    "budget_time": {
      type: "number",
      number: {
        format: "number"
      }
    },
    "note": {
      type: "rich_text",
      rich_text: {}
    }
  }
}

// 获取指定数据库类型的模板
export function getDatabaseTemplate(dbType: 'tasks' | 'plan' | 'strategy'): DatabaseTemplate {
  switch (dbType) {
    case 'tasks':
      return TASKS_TEMPLATE
    case 'plan':
      return PLAN_TEMPLATE
    case 'strategy':
      return STRATEGY_TEMPLATE
    default:
      throw new Error(`Unknown database type: ${dbType}`)
  }
}

// 替换模板中的relation placeholder
export function replaceRelationPlaceholders(
  template: DatabaseTemplate, 
  userDbIds: { tasks: string; plan: string; strategy: string }
): DatabaseTemplate {
  const updatedTemplate = JSON.parse(JSON.stringify(template)) // 深拷贝
  
  Object.keys(updatedTemplate.properties).forEach(propKey => {
    const prop = updatedTemplate.properties[propKey]
    if (prop.type === 'relation' && prop.relation) {
      if (prop.relation.database_id === 'PLAN_DB_PLACEHOLDER') {
        prop.relation.database_id = userDbIds.plan
      } else if (prop.relation.database_id === 'STRATEGY_DB_PLACEHOLDER') {
        prop.relation.database_id = userDbIds.strategy
      }
    }
  })
  
  return updatedTemplate
}