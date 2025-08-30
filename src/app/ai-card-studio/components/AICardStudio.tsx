'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Column, ColumnCard, CardInfo, CardContextType } from '../types'
import { generateUniqueButtonName, generateUniqueTitle, checkReferences, isButtonNameExists, isTitleExists } from '../utils/cardUtils'
import { CardContext } from './CardContext'
import ColumnComponent from './Column'
import AuthModal from './AuthModal'
import { useAuth } from '../hooks/useAuth'
import { useWorkflows } from '../hooks/useWorkflows'

export default function AICardStudio() {
  const authHookResult = useAuth()
  const { user, isAuthenticated, loading, logout } = authHookResult
  
  // 实时监控认证状态
  console.log('🏠 AICardStudio: Current auth state:', {
    user: user?.email,
    isAuthenticated,
    loading,
    authHookResult
  })
  const { 
    workflows,
    currentWorkflow, 
    loading: workflowLoading, 
    error: workflowError,
    updateCurrentWorkflow,
    createDefaultWorkflow,
    deleteWorkflow,
    createWorkflow,
    setCurrentWorkflow,
    renameWorkflow,
    checkTitleExists,
    generateUniqueTitle,
    initializeWorkflows 
  } = useWorkflows()
  
  // 调试状态变化
  useEffect(() => {
    console.log('🏠 AICardStudio: Auth state changed:', { 
      user: user?.email, 
      isAuthenticated, 
      loading,
      userObject: user,
      hasUser: !!user,
      condition: isAuthenticated && user
    })
  }, [user, isAuthenticated, loading])
  
  // 从当前工作流获取columns，或使用默认值
  const [columns, setColumns] = useState<Column[]>(() => [])
  const [allCards, setAllCards] = useState<CardInfo[]>([])
  const [showCardTypeModal, setShowCardTypeModal] = useState(false)
  const [cardTypeModalVisible, setCardTypeModalVisible] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string>('')
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [defaultWorkflowCreated, setDefaultWorkflowCreated] = useState(false)
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [showNewWorkflowModal, setShowNewWorkflowModal] = useState(false)
  const [newWorkflowTitle, setNewWorkflowTitle] = useState('')

  // 处理登录后的模态框关闭 - 将关闭逻辑与认证状态绑定
  useEffect(() => {
    console.log('🔄 Modal close useEffect triggered:', {
      isAuthenticated,
      showAuthModal,
      user: user?.email,
      condition: isAuthenticated && showAuthModal
    })
    
    // 如果用户已认证且模态框当前是打开的，则关闭它
    if (isAuthenticated && showAuthModal) {
      console.log('✅ Auth success, closing modal via useEffect')
      setShowAuthModal(false)
    }
  }, [isAuthenticated, showAuthModal, user])

  // 当工作流加载完成时更新columns
  useEffect(() => {
    if (currentWorkflow?.columns) {
      console.log('🔄 Updating columns from current workflow:', currentWorkflow.title)
      setColumns(currentWorkflow.columns)
    } else if (currentWorkflow) {
      console.log('🆕 Current workflow has no columns, setting empty array')
      setColumns([])
    }
  }, [currentWorkflow])

  // 根据认证状态初始化工作流 - 使用ref避免依赖循环
  const initializeWorkflowsRef = useRef(initializeWorkflows)
  initializeWorkflowsRef.current = initializeWorkflows
  
  useEffect(() => {
    console.log('🔄 Auth state change, initializing workflows:', { isAuthenticated, loading })
    if (!loading) {
      // 重置defaultWorkflowCreated标志，确保每次认证状态变化时都能正确判断
      setDefaultWorkflowCreated(false)
      initializeWorkflowsRef.current(isAuthenticated)
    }
  }, [isAuthenticated, loading])

  // 为首次用户创建默认工作流 - 只在真正没有工作流时创建
  const createDefaultWorkflowRef = useRef(createDefaultWorkflow)
  createDefaultWorkflowRef.current = createDefaultWorkflow
  
  useEffect(() => {
    if (isAuthenticated && !workflowLoading && workflows.length === 0 && !workflowError && !defaultWorkflowCreated) {
      console.log('🆕 Creating default workflow for new user (no existing workflows)')
      setDefaultWorkflowCreated(true)
      createDefaultWorkflowRef.current()
    }
  }, [isAuthenticated, workflowLoading, workflows.length, workflowError, defaultWorkflowCreated])

  // 保存到数据库（替代localStorage）- 使用ref避免依赖循环
  const updateCurrentWorkflowRef = useRef(updateCurrentWorkflow)
  updateCurrentWorkflowRef.current = updateCurrentWorkflow
  
  useEffect(() => {
    if (isAuthenticated && currentWorkflow && columns.length > 0) {
      // 检查columns是否与当前工作流不同
      const currentColumns = JSON.stringify(currentWorkflow.columns)
      const newColumns = JSON.stringify(columns)
      
      if (currentColumns !== newColumns) {
        // 防抖保存，避免频繁API调用
        const timeoutId = setTimeout(async () => {
          console.log('💾 Saving workflow to database:', {
            workflowId: currentWorkflow.id,
            columnsCount: columns.length
          })
          const result = await updateCurrentWorkflowRef.current(columns)
          console.log('💾 Save result:', result)
        }, 1000)
        
        return () => clearTimeout(timeoutId)
      }
    }
  }, [columns, isAuthenticated, currentWorkflow])

  // 检查状态一致性 - 避免无限循环
  const setCurrentWorkflowRef = useRef(setCurrentWorkflow)
  setCurrentWorkflowRef.current = setCurrentWorkflow
  
  useEffect(() => {
    if (currentWorkflow && workflows.length > 0) {
      const exists = workflows.find(w => w.id === currentWorkflow.id)
      if (!exists) {
        console.warn('⚠️ Current workflow not in workflows array:', {
          currentWorkflowId: currentWorkflow.id,
          currentWorkflowTitle: currentWorkflow.title,
          availableWorkflows: workflows.map(w => ({ id: w.id, title: w.title }))
        })
        // 自动选择第一个可用的工作流，但只执行一次避免循环
        const firstWorkflow = workflows[0]
        if (firstWorkflow) {
          console.log('🔧 Auto-selecting first available workflow:', firstWorkflow.title)
          // 使用setTimeout避免状态更新冲突
          setTimeout(() => {
            setCurrentWorkflowRef.current(firstWorkflow)
          }, 0)
        }
      }
    }
  }, [currentWorkflow?.id, workflows.length]) // 只依赖关键值，避免对象引用变化导致的循环

  // Card context functions
  const updateCard = (id: string, updates: Partial<CardInfo>) => {
    setAllCards(prev => prev.map(card => 
      card.id === id ? { ...card, ...updates } : card
    ))
  }

  const addCard = (card: CardInfo) => {
    setAllCards(prev => {
      const exists = prev.find(c => c.id === card.id)
      if (exists) {
        return prev.map(c => c.id === card.id ? card : c)
      } else {
        return [...prev, card]
      }
    })
  }

  const getCard = (id: string) => {
    return allCards.find(card => card.id === id)
  }

  const cardContextValue: CardContextType = {
    cards: allCards,
    addCard,
    updateCard,
    getCard
  }

  // Handle button name change with auto-suffix for duplicates
  const handleButtonNameChange = (cardId: string, newName: string, currentName: string): string => {
    if (!newName.trim()) return currentName
    
    // If name hasn't changed, return as-is
    if (newName === currentName) return newName
    
    // If name is unique, use it
    if (!isButtonNameExists(newName, columns, cardId)) {
      return newName
    }
    
    // If duplicate, generate unique version
    return generateUniqueButtonName(newName, columns)
  }

  // Handle info card title change with uniqueness
  const handleTitleChange = (cardId: string, newTitle: string, currentTitle: string): string => {
    if (!newTitle.trim()) return currentTitle
    
    // If title hasn't changed, return as-is
    if (newTitle === currentTitle) return newTitle
    
    // If title is unique, use it
    if (!isTitleExists(newTitle, columns, cardId)) {
      return newTitle
    }
    
    // If duplicate, generate unique version
    return generateUniqueTitle(newTitle, columns)
  }

  const addNewColumn = () => {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)
    
    const newColumn: Column = {
      id: `col-${timestamp}-${randomId}`,
      cards: [{
        id: `info-${timestamp}-${randomId}`,
        type: 'info',
        title: generateUniqueTitle('New Card', columns),
        description: 'Enter description...',
        justCreated: true
      }]
    }

    setColumns(prev => [...prev, newColumn])

    // Remove justCreated flag after animation
    setTimeout(() => {
      setColumns(prev => prev.map(col =>
        col.id === newColumn.id
          ? { ...col, cards: col.cards.map(card => ({ ...card, justCreated: undefined })) }
          : col
      ))
    }, 400)
  }

  const addCardToColumn = (columnId: string, cardType: 'info' | 'aitool') => {
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substr(2, 9)

    const newCard: ColumnCard = cardType === 'info' 
      ? {
          id: `info-${timestamp}-${randomId}`,
          type: 'info',
          title: generateUniqueTitle('New Card', columns),
          description: 'Enter description...'
        }
      : {
          id: `aitool-${timestamp}-${randomId}`,
          type: 'aitool',
          buttonName: generateUniqueButtonName('Start', columns),
          promptText: '',
          generatedContent: '',
          aiModel: 'deepseek'  // Default to DeepSeek
        }

    setColumns(prev => prev.map(col =>
      col.id === columnId
        ? { ...col, cards: [...col.cards, { ...newCard, justCreated: true }] }
        : col
    ))

    // Remove justCreated flag after animation
    setTimeout(() => {
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? { 
              ...col, 
              cards: col.cards.map(card => 
                card.id === newCard.id 
                  ? { ...card, justCreated: undefined } 
                  : card
              ) 
            }
          : col
      ))
    }, 400)

    // Close modal
    handleCloseCardTypeModal()
  }

  const deleteCard = (columnId: string, cardId: string, isTopCard: boolean) => {
    if (isTopCard) {
      // Delete entire column with animation
      setColumns(prev => prev.map(col => 
        col.id === columnId
          ? { ...col, cards: col.cards.map(card => ({ ...card, deleting: true })) }
          : col
      ))
      
      // Remove column after animation
      setTimeout(() => {
        setColumns(prev => prev.filter(col => col.id !== columnId))
      }, 800)
    } else {
      // Delete individual card with animation
      setColumns(prev => prev.map(col =>
        col.id === columnId
          ? {
              ...col,
              cards: col.cards.map(card =>
                card.id === cardId ? { ...card, deleting: true } : card
              )
            }
          : col
      ))

      // Remove card after animation
      setTimeout(() => {
        setColumns(prev => prev.map(col =>
          col.id === columnId
            ? { ...col, cards: col.cards.filter(card => card.id !== cardId) }
            : col
        ))
      }, 800)
    }
  }

  const handleAddCard = (columnId: string) => {
    setSelectedColumnId(columnId)
    setShowCardTypeModal(true)
    setTimeout(() => setCardTypeModalVisible(true), 10)
  }

  const handleCloseCardTypeModal = () => {
    setCardTypeModalVisible(false)
    setTimeout(() => setShowCardTypeModal(false), 250)
  }

  return (
    <CardContext.Provider value={cardContextValue}>
      {/* Full screen layout - no L-shaped offset */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 pb-0">
        <div className="max-w-full mx-auto">
          {/* Header with Auth */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  AI Card Studio
                </h1>
                {currentWorkflow && (
                  <p className="text-sm text-gray-500 mt-1">
                    {workflowLoading ? 'Saving...' : currentWorkflow.title}
                  </p>
                )}
              </div>
              
              {/* Workflow Management */}
              {isAuthenticated && workflows.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg px-3 py-2">
                    {editingWorkflowId === currentWorkflow?.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={async () => {
                          if (currentWorkflow && editingTitle.trim() !== currentWorkflow.title) {
                            const result = await renameWorkflow(currentWorkflow.id, editingTitle)
                            if (!result.success) {
                              alert(result.error)
                              setEditingTitle(currentWorkflow.title)
                            }
                          }
                          setEditingWorkflowId(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur()
                          }
                          if (e.key === 'Escape') {
                            setEditingTitle(currentWorkflow?.title || '')
                            setEditingWorkflowId(null)
                          }
                        }}
                        className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 p-0 min-w-32"
                        autoFocus
                      />
                    ) : (
                      <>
                        <select 
                          value={currentWorkflow?.id || ''}
                          onChange={(e) => {
                            const selectedId = e.target.value
                            const selectedWorkflow = workflows.find(w => w.id === selectedId)
                            
                            console.log('👆 Workflow select onChange:', {
                              selectedId,
                              foundWorkflow: selectedWorkflow?.title,
                              currentWorkflow: currentWorkflow?.title,
                              allWorkflows: workflows.map(w => ({ id: w.id, title: w.title }))
                            })
                            
                            if (selectedId === '') {
                              console.log('📝 Empty selection, ignoring')
                              return
                            }
                            
                            if (selectedWorkflow) {
                              console.log('🔄 User selected workflow:', selectedWorkflow.title, 'ID:', selectedWorkflow.id)
                              setCurrentWorkflow(selectedWorkflow)
                            } else {
                              console.warn('⚠️ Selected workflow not found:', selectedId)
                            }
                          }}
                          className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 pr-6"
                        >
                          <option value="">Select workflow...</option>
                          {workflows.map(workflow => (
                            <option key={workflow.id} value={workflow.id}>
                              {workflow.title}
                            </option>
                          ))}
                        </select>
                        {currentWorkflow && (
                          <button
                            onClick={() => {
                              setEditingWorkflowId(currentWorkflow.id)
                              setEditingTitle(currentWorkflow.title)
                            }}
                            className="ml-1 p-1 text-gray-400 hover:text-purple-600 transition-colors"
                            title="Rename workflow"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={() => setShowNewWorkflowModal(true)}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-all duration-200"
                  >
                    + New
                  </button>
                  
                  
                  {workflows.length > 1 && (
                    <button
                      onClick={async () => {
                        if (currentWorkflow && confirm(`Delete workflow "${currentWorkflow.title}"?`)) {
                          console.log('🗑️ Delete button clicked for workflow:', currentWorkflow.id, currentWorkflow.title)
                          console.log('🔐 Current auth state:', { isAuthenticated, user: user?.email })
                          const result = await deleteWorkflow(currentWorkflow.id)
                          console.log('🗑️ Delete result:', result)
                          if (result.success) {
                            console.log('✅ Workflow deleted successfully')
                          } else {
                            console.error('❌ Delete failed:', result.error)
                          }
                        } else {
                          console.log('🗑️ Delete cancelled or no current workflow')
                        }
                      }}
                      className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* User Menu */}
            <div className="flex items-center gap-4">
              {loading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {user.user_metadata?.name || user.email}
                  </span>
                  <button
                    onClick={logout}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
          
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={() => {
                const container = document.querySelector('.horizontal-scroll-container')
                if (container) {
                  container.scrollBy({ left: -480, behavior: 'smooth' })
                }
              }}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => {
                const container = document.querySelector('.horizontal-scroll-container')
                if (container) {
                  container.scrollBy({ left: 480, behavior: 'smooth' })
                }
              }}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full shadow-lg flex items-center justify-center text-purple-600 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scrollable Content */}
            <div className="horizontal-scroll-container flex gap-6 items-start overflow-x-auto scrollbar-hide pb-0 h-[calc(100vh-200px)] px-12">
              {/* Render all columns */}
              {columns.map((column) => (
                <ColumnComponent
                  key={column.id}
                  column={column}
                  onAddCard={handleAddCard}
                  onDeleteCard={deleteCard}
                  onButtonNameChange={handleButtonNameChange}
                  onTitleChange={handleTitleChange}
                  updateColumns={setColumns}
                  allColumns={columns}
                />
              ))}
              
              {/* Add new column button */}
              <button
                onClick={addNewColumn}
                className="flex-shrink-0 w-[480px] h-32 border-2 border-dashed border-purple-300 rounded-xl flex items-center justify-center text-purple-600 hover:border-purple-400 hover:text-purple-700 hover:bg-purple-50/50 transition-all duration-200 font-medium"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Column
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Type Selection Modal */}
      {showCardTypeModal && typeof document !== 'undefined' && createPortal(
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={handleCloseCardTypeModal}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className={`bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-md w-full mx-4 pointer-events-auto transform transition-all duration-300 ease-out ${
              cardTypeModalVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Choose Card Type</h3>
                <button
                  onClick={handleCloseCardTypeModal}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => addCardToColumn(selectedColumnId, 'info')}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200"
                >
                  <h4 className="font-medium text-gray-800">Info Card</h4>
                  <p className="text-sm text-gray-600 mt-1">Static information, instructions, or reference content</p>
                </button>
                
                <button
                  onClick={() => addCardToColumn(selectedColumnId, 'aitool')}
                  className="w-full p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200"
                >
                  <h4 className="font-medium text-gray-800">AI Tool Card</h4>
                  <p className="text-sm text-gray-600 mt-1">Interactive AI-powered content generation</p>
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* New Workflow Modal */}
      {showNewWorkflowModal && typeof document !== 'undefined' && createPortal(
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => {
              setShowNewWorkflowModal(false)
              setNewWorkflowTitle('')
            }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 max-w-md w-full mx-4 pointer-events-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-800">Create New Workflow</h3>
                <button
                  onClick={() => {
                    setShowNewWorkflowModal(false)
                    setNewWorkflowTitle('')
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    value={newWorkflowTitle}
                    onChange={(e) => setNewWorkflowTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        document.getElementById('create-workflow-btn')?.click()
                      }
                    }}
                    placeholder="Enter workflow name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    autoFocus
                  />
                  {newWorkflowTitle.trim() && checkTitleExists(newWorkflowTitle.trim()) && (
                    <p className="text-red-600 text-xs mt-1">This name already exists</p>
                  )}
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowNewWorkflowModal(false)
                      setNewWorkflowTitle('')
                    }}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="create-workflow-btn"
                    onClick={async () => {
                      if (!newWorkflowTitle.trim()) {
                        alert('Please enter a workflow name')
                        return
                      }
                      
                      if (checkTitleExists(newWorkflowTitle.trim())) {
                        alert('Workflow name already exists')
                        return
                      }
                      
                      console.log('➕ Creating new workflow:', newWorkflowTitle)
                      const result = await createWorkflow(newWorkflowTitle.trim(), [])
                      
                      if (result.success && result.workflow) {
                        console.log('✅ New workflow created, switching to it')
                        setShowNewWorkflowModal(false)
                        setNewWorkflowTitle('')
                      } else {
                        console.error('❌ Failed to create workflow:', result.error)
                        alert(result.error || 'Failed to create workflow')
                      }
                    }}
                    disabled={!newWorkflowTitle.trim() || checkTitleExists(newWorkflowTitle.trim())}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg transition-colors"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </CardContext.Provider>
  )
}