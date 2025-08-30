import { useState, useEffect, useCallback, useMemo } from 'react'
import { Column } from '../types'

interface Workflow {
  id: string
  user_id: string
  title: string
  columns: Column[]
  created_at: string
  updated_at: string
}

interface WorkflowsState {
  workflows: Workflow[]
  currentWorkflowId: string | null
  loading: boolean
  error: string | null
}

export const useWorkflows = () => {
  const [state, setState] = useState<WorkflowsState>({
    workflows: [],
    currentWorkflowId: null,
    loading: false,
    error: null
  })

  // 派生的 currentWorkflow - 始终与 workflows 同步
  const currentWorkflow = useMemo(() => {
    if (!state.currentWorkflowId || state.workflows.length === 0) return null
    return state.workflows.find(w => w.id === state.currentWorkflowId) || null
  }, [state.currentWorkflowId, state.workflows])

  // 获取用户的所有工作流
  const fetchWorkflows = useCallback(async () => {
    console.log('📥 Fetching workflows...')
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const response = await fetch('/ai-card-studio/api/workflows', {
        credentials: 'include'
      })

      console.log('📥 Fetch response status:', response.status)

      if (response.ok) {
        const { workflows } = await response.json()
        console.log('📥 Fetched workflows:', workflows?.length || 0, 'items')
        setState(prev => { 
          // 选择当前工作流ID的逻辑：
          // 1. 如果已有ID且仍存在于列表中，保持选择
          // 2. 否则选择列表中的第一个
          let newCurrentWorkflowId = prev.currentWorkflowId
          
          if (prev.currentWorkflowId) {
            // 查找当前工作流是否仍存在
            const exists = workflows.find(w => w.id === prev.currentWorkflowId)
            if (exists) {
              console.log('🔄 Current workflow still exists:', exists.title)
            } else {
              // 当前工作流不存在了，选择第一个
              newCurrentWorkflowId = workflows[0]?.id || null
              console.log('📌 Current workflow deleted, switching to:', workflows[0]?.title)
            }
          } else {
            // 没有当前工作流，选择第一个
            newCurrentWorkflowId = workflows[0]?.id || null
            console.log('📌 Setting initial workflow to:', workflows[0]?.title)
          }
          
          return {
            ...prev, 
            workflows, 
            loading: false,
            currentWorkflowId: newCurrentWorkflowId
          }
        })
      } else {
        const { error } = await response.json()
        console.log('❌ Fetch workflows failed:', error)
        setState(prev => ({ ...prev, loading: false, error }))
      }
    } catch (error) {
      console.error('❌ Fetch workflows error:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to fetch workflows' 
      }))
    }
  }, [])

  // 检查工作流标题是否已存在
  const checkTitleExists = useCallback((title: string, excludeId?: string) => {
    return state.workflows.some(w => w.title.trim() === title.trim() && w.id !== excludeId)
  }, [state.workflows])

  // 生成唯一的工作流标题
  const generateUniqueTitle = useCallback((baseTitle: string) => {
    let title = baseTitle.trim()
    let counter = 1
    
    while (checkTitleExists(title)) {
      title = `${baseTitle.trim()} ${counter}`
      counter++
    }
    
    return title
  }, [checkTitleExists])

  // 创建新工作流
  const createWorkflow = useCallback(async (title: string, columns: Column[]) => {
    // 检查标题是否重复
    if (checkTitleExists(title)) {
      return { success: false, error: 'Workflow title already exists' }
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/ai-card-studio/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, columns }),
        credentials: 'include'
      })

      if (response.ok) {
        const { workflow } = await response.json()
        console.log('✅ Workflow created:', workflow.title)
        setState(prev => ({
          ...prev,
          workflows: [workflow, ...prev.workflows],
          currentWorkflowId: workflow.id,
          loading: false
        }))
        return { success: true, workflow }
      } else {
        const { error } = await response.json()
        setState(prev => ({ ...prev, loading: false, error }))
        return { success: false, error }
      }
    } catch (error) {
      console.error('Create workflow error:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to create workflow' 
      }))
      return { success: false, error: 'Failed to create workflow' }
    }
  }, [])

  // 更新当前工作流
  const updateCurrentWorkflow = useCallback(async (columns: Column[]) => {
    if (!currentWorkflow) return { success: false, error: 'No current workflow' }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(`/ai-card-studio/api/workflows/${currentWorkflow.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: currentWorkflow.title, 
          columns 
        }),
        credentials: 'include'
      })

      if (response.ok) {
        const { workflow } = await response.json()
        setState(prev => ({
          ...prev,
          workflows: prev.workflows.map(w => w.id === workflow.id ? workflow : w),
          loading: false
        }))
        return { success: true, workflow }
      } else {
        const { error } = await response.json()
        setState(prev => ({ ...prev, loading: false, error }))
        return { success: false, error }
      }
    } catch (error) {
      console.error('Update workflow error:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to update workflow' 
      }))
      return { success: false, error: 'Failed to update workflow' }
    }
  }, [currentWorkflow])

  // 创建默认工作流（首次用户）
  const createDefaultWorkflow = useCallback(async () => {
    const defaultTitle = generateUniqueTitle('My First Workflow')
    
    const defaultColumns: Column[] = [
      {
        id: 'col-1',
        cards: [
          {
            id: 'info-1',
            type: 'info',
            title: 'Info Card',
            description: 'Display static information, instructions, or reference content without AI processing.'
          },
          {
            id: 'aitool-1-default', 
            type: 'aitool',
            buttonName: 'Start',
            promptText: '',
            generatedContent: '',
            aiModel: 'deepseek'
          }
        ]
      },
      {
        id: 'col-2',
        cards: [
          {
            id: 'info-2',
            type: 'info',
            title: 'Usage Tips',
            description: 'Use [REF: Start] to reference other AI tool outputs in your prompts. Use {{option}} for user-selectable options.'
          },
          {
            id: 'aitool-2-default',
            type: 'aitool',
            buttonName: 'Analyze Data',
            promptText: 'Analyze the following data: {{option}}',
            generatedContent: '',
            options: ['Sales Report', 'User Feedback', 'Performance Metrics'],
            aiModel: 'deepseek'
          }
        ]
      }
    ]

    return await createWorkflow(defaultTitle, defaultColumns)
  }, [createWorkflow, generateUniqueTitle])

  // 删除工作流
  const deleteWorkflow = useCallback(async (workflowId: string) => {
    console.log('🗑️ Deleting workflow:', workflowId)
    console.log('🍪 Document cookies:', document.cookie)
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(`/ai-card-studio/api/workflows/${workflowId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log('🗑️ Delete response status:', response.status)
      console.log('🗑️ Delete response headers:', Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        console.log('✅ Workflow deleted successfully, refreshing list')
        
        // 删除成功后重新获取列表，fetchWorkflows会自动处理currentWorkflow的选择
        await fetchWorkflows()
        
        return { success: true }
      } else {
        const { error } = await response.json()
        console.log('❌ Delete workflow failed:', error)
        setState(prev => ({ ...prev, loading: false, error }))
        return { success: false, error }
      }
    } catch (error) {
      console.error('❌ Delete workflow error:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to delete workflow' 
      }))
      return { success: false, error: 'Failed to delete workflow' }
    }
  }, [fetchWorkflows])

  // 只有在用户登录时才获取工作流
  const initializeWorkflows = useCallback(async (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      await fetchWorkflows()
    } else {
      // 未登录时清空状态
      setState({
        workflows: [],
        currentWorkflowId: null,
        loading: false,
        error: null
      })
    }
  }, [fetchWorkflows])

  // 清理重复工作流
  const cleanupDuplicateWorkflows = useCallback(async () => {
    console.log('🧹 Cleaning up duplicate workflows...')
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/ai-card-studio/api/workflows', {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        const { deletedCount } = await response.json()
        console.log(`✅ Cleaned up ${deletedCount} duplicate workflows`)
        
        // 重新获取工作流列表
        await fetchWorkflows()
        
        return { success: true, deletedCount }
      } else {
        const { error } = await response.json()
        console.log('❌ Cleanup failed:', error)
        setState(prev => ({ ...prev, loading: false, error }))
        return { success: false, error }
      }
    } catch (error) {
      console.error('❌ Cleanup error:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to cleanup workflows' 
      }))
      return { success: false, error: 'Failed to cleanup workflows' }
    }
  }, [fetchWorkflows])

  // 设置当前工作流
  const setCurrentWorkflow = useCallback((workflow: Workflow | null) => {
    console.log('📌 Setting current workflow:', workflow?.title)
    setState(prev => ({ ...prev, currentWorkflowId: workflow?.id || null }))
  }, [])

  // 重命名工作流
  const renameWorkflow = useCallback(async (workflowId: string, newTitle: string) => {
    const trimmedTitle = newTitle.trim()
    
    if (!trimmedTitle) {
      return { success: false, error: 'Title cannot be empty' }
    }
    
    if (checkTitleExists(trimmedTitle, workflowId)) {
      return { success: false, error: 'Workflow title already exists' }
    }

    const workflow = state.workflows.find(w => w.id === workflowId)
    if (!workflow) {
      return { success: false, error: 'Workflow not found' }
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch(`/ai-card-studio/api/workflows/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: trimmedTitle, 
          columns: workflow.columns 
        }),
        credentials: 'include'
      })

      if (response.ok) {
        const { workflow: updatedWorkflow } = await response.json()
        setState(prev => ({
          ...prev,
          workflows: prev.workflows.map(w => w.id === workflowId ? updatedWorkflow : w),
          loading: false
        }))
        return { success: true, workflow: updatedWorkflow }
      } else {
        const { error } = await response.json()
        setState(prev => ({ ...prev, loading: false, error }))
        return { success: false, error }
      }
    } catch (error) {
      console.error('Rename workflow error:', error)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to rename workflow' 
      }))
      return { success: false, error: 'Failed to rename workflow' }
    }
  }, [checkTitleExists, state.workflows])

  return {
    workflows: state.workflows,
    currentWorkflow, // 派生状态
    loading: state.loading,
    error: state.error,
    fetchWorkflows,
    createWorkflow,
    updateCurrentWorkflow,
    createDefaultWorkflow,
    deleteWorkflow,
    setCurrentWorkflow,
    renameWorkflow,
    checkTitleExists,
    generateUniqueTitle,
    initializeWorkflows
  }
}