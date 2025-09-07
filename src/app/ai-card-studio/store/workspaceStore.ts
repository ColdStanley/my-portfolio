import { create } from 'zustand';
import { supabase } from '../../../lib/supabaseClient';
import { Column, Canvas } from '../types';
import { resolveReferences, generateUniqueCanvasName } from '../utils/cardUtils';
import type { User } from '@supabase/supabase-js'

interface WorkspaceState {
  canvases: Canvas[];
  activeCanvasId: string;
  user: User | null;
  isLoading: boolean;
  isInitialLoad: boolean; // 避免竞态条件的标志
  saveError: string | null;
  columnExecutionStatus: { [columnId: string]: boolean }; // Track column execution status
  currentAbortController: AbortController | null; // 管理请求取消
  actions: {
    fetchAndHandleWorkspace: (userId: string, abortSignal?: AbortSignal) => Promise<void>;
    cancelCurrentRequest: () => void;
    cleanAllAIReplies: () => Promise<void>;
    loadFromCache: () => boolean;
    updateCanvases: (updater: (prev: Canvas[]) => Canvas[]) => void;
    updateColumns: (updater: (prev: Column[]) => Column[]) => void; // Helper for backward compatibility
    moveColumn: (columnId: string, direction: 'left' | 'right') => void;
    moveCard: (columnId: string, cardId: string, direction: 'up' | 'down') => void;
    runColumnWorkflow: (columnId: string) => Promise<void>;
    addCanvas: () => void;
    deleteCanvas: (canvasId: string) => void;
    renameCanvas: (canvasId: string, newName: string) => void;
    setActiveCanvas: (canvasId: string) => void;
    saveWorkspace: () => Promise<void>;
    setUser: (user: User | null) => void;
    clearSaveError: () => void;
    resetWorkspace: () => void;
    
    // Fine-grained card update actions
    updateCardTitle: (cardId: string, title: string) => void;
    updateCardDescription: (cardId: string, description: string) => void;
    updateCardButtonName: (cardId: string, buttonName: string) => void;
    updateCardPromptText: (cardId: string, promptText: string) => void;
    updateCardOptions: (cardId: string, options: string[]) => void;
    updateCardAiModel: (cardId: string, aiModel: 'deepseek' | 'openai') => void;
    updateCardGeneratedContent: (cardId: string, content: string) => void;
    updateCardGeneratingState: (cardId: string, isGenerating: boolean) => void;
    deleteCard: (columnId: string, cardId: string) => void;
    updateCardLockStatus: (cardId: string, isLocked: boolean, passwordHash?: string) => void;
  };
}

const defaultCanvases: Canvas[] = [
  {
    id: 'canvas-1',
    name: 'Default Canvas',
    columns: [
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
            id: 'aitool-1',
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
            id: 'aitool-2',
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
  }
];

// Manual save only - no debounce

// 🔧 确保AI工具卡片有正确的初始字段
const ensureAIToolCardFields = (card: any) => {
  if (card.type === 'aitool') {
    return {
      ...card,
      generatedContent: '',  // 始终为空字符串
      isGenerating: false,   // 初始化为false
      // 其他字段保持原样
    }
  }
  return card
}

// 🔧 清理并初始化canvas数据
const normalizeCanvases = (canvases: Canvas[]) => {
  return canvases.map(canvas => ({
    ...canvas,
    columns: canvas.columns.map(col => ({
      ...col,
      cards: col.cards.map(ensureAIToolCardFields)
    }))
  }))
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  canvases: [],
  activeCanvasId: '',
  user: null,
  isLoading: false, // 🔧 初始不loading，缓存优先策略
  isInitialLoad: true,
  saveError: null,
  columnExecutionStatus: {},
  currentAbortController: null,

  actions: {
    setUser: (user) => set({ user }),

    clearSaveError: () => set({ saveError: null }),

    // 🚫 取消当前请求
    cancelCurrentRequest: () => {
      const { currentAbortController } = get()
      if (currentAbortController) {
        console.log('🚫 Canceling current workspace request')
        currentAbortController.abort()
        set({ 
          currentAbortController: null,
          isLoading: false 
        })
      }
    },

    // 🧹 清理所有用户数据中的AI回复（一次性运行）
    cleanAllAIReplies: async () => {
      console.log('🧹 Starting to clean all AI replies from database...')
      
      try {
        // 获取所有用户数据
        const { data: allWorkspaces, error: fetchError } = await supabase
          .from('ai_card_studios')
          .select('user_id, data');

        if (fetchError) {
          console.error('Error fetching workspaces:', fetchError)
          return
        }

        console.log(`Found ${allWorkspaces?.length || 0} workspaces to clean`)

        if (!allWorkspaces || allWorkspaces.length === 0) {
          console.log('No workspaces found')
          return
        }

        // 清理每个workspace
        for (const workspace of allWorkspaces) {
          const { user_id, data } = workspace
          
          if (!data || !data.canvases) {
            console.log(`Skipping user ${user_id} - no canvases data`)
            continue
          }

          // 清理AI回复
          const cleanCanvases = data.canvases.map((canvas: any) => ({
            ...canvas,
            columns: canvas.columns.map((col: any) => ({
              ...col,
              cards: col.cards.map((card: any) => {
                if (card.type === 'aitool') {
                  const { generatedContent, isGenerating, ...cleanCard } = card
                  console.log(`Cleaned AI reply from card ${card.id || 'unknown'}`)
                  return cleanCard
                }
                return card
              })
            }))
          }))

          const cleanData = {
            canvases: cleanCanvases,
            activeCanvasId: data.activeCanvasId
          }

          // 更新数据库
          const { error: updateError } = await supabase
            .from('ai_card_studios')
            .update({ data: cleanData })
            .eq('user_id', user_id)

          if (updateError) {
            console.error(`Error updating user ${user_id}:`, updateError)
          } else {
            console.log(`✅ Cleaned workspace for user ${user_id}`)
          }
        }

        console.log('🎉 All workspaces cleaned successfully!')
        
      } catch (error) {
        console.error('Error during cleaning process:', error)
      }
    },

    resetWorkspace: () => set({
      canvases: [],
      activeCanvasId: '',
      isLoading: false,  // ⚠️ 最关键
      saveError: null,
      currentAbortController: null
    }),

    // 💾 从缓存加载workspace数据
    loadFromCache: () => {
      try {
        const cachedData = localStorage.getItem('workspace-cache')
        if (cachedData) {
          const workspaceData = JSON.parse(cachedData)
          if (workspaceData.canvases && workspaceData.activeCanvasId) {
            console.log('💾 Loading workspace from cache', {
              canvasCount: workspaceData.canvases.length,
              activeCanvasId: workspaceData.activeCanvasId
            })
            
            // 🔧 确保AI字段正确初始化
            const normalizedCanvases = normalizeCanvases(workspaceData.canvases as Canvas[])
            
            set({
              canvases: normalizedCanvases,
              activeCanvasId: workspaceData.activeCanvasId,
              isLoading: false,
              saveError: null
            })
            return true // 成功加载
          }
        }
        console.log('💾 No valid cache found')
        return false // 没有缓存或无效
      } catch (e) {
        console.warn('⚠️ Failed to load from cache:', e)
        return false
      }
    },


    fetchAndHandleWorkspace: async (userId, externalAbortSignal) => {
      console.log('🔄 fetchAndHandleWorkspace called for userId:', userId)
      
      // 🔧 页面可见性检查 - 只在页面可见时发请求
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        console.log('📱 Page is hidden, skipping fetch to avoid timeout')
        return
      }
      
      // 🚫 取消之前的请求
      const { currentAbortController } = get()
      if (currentAbortController) {
        console.log('🚫 Canceling previous request')
        currentAbortController.abort()
      }
      
      // 🔧 创建新的AbortController
      const abortController = new AbortController()
      const abortSignal = externalAbortSignal || abortController.signal
      
      // 🔧 智能幂等保护 - 区分重复调用和首次加载卡死
      const currentState = get()
      const hasData = currentState.canvases && currentState.canvases.length > 0
      
      if (currentState.isLoading && hasData && !abortSignal.aborted) {
        console.log('⏭️ Workspace is loading but has data, skipping duplicate call')
        return
      }
      
      if (currentState.isLoading && !hasData) {
        console.log('🔧 Workspace is loading but no data, continuing fetch (possible stuck state)')
      }
      
      // 🔧 只在没有数据时才显示loading
      const shouldShowLoading = !hasData
      
      set({ 
        isLoading: shouldShowLoading,
        currentAbortController: abortController
      });
      
      // 🕐 记录loading开始时间，用于hang检测
      localStorage.setItem('workspace-loading-start', Date.now().toString());
      
      // 🔧 轻量级超时保护
      const fetchTimeout = setTimeout(() => {
        console.warn('⚠️ Workspace fetch timeout, keeping current data')
        localStorage.removeItem('workspace-loading-start')
        
        // 失败时保持现有数据
        const currentCanvases = get().canvases
        const hasExistingData = currentCanvases && currentCanvases.length > 0
        
        set({ 
          canvases: hasExistingData ? currentCanvases : defaultCanvases,
          activeCanvasId: hasExistingData ? get().activeCanvasId : defaultCanvases[0].id,
          saveError: 'Workspace loading timeout, showing cached data',
          isLoading: false,
          isInitialLoad: false
        });
      }, 30000); // 简化为30秒超时
      
      try {
        console.log('🚀 Workspace fetch started', { userId, hasAbortSignal: !!abortSignal })
        
        // 🚫 检查是否已被取消
        if (abortSignal.aborted) {
          console.log('🚫 Request already aborted, skipping')
          return
        }
        
        const { data, error } = await supabase
          .from('ai_card_studios')
          .select('data')
          .eq('user_id', userId)
          .abortSignal(abortSignal)
          .single();
        
        console.log('📡 Supabase query completed', {
          hasData: !!data,
          hasError: !!error,
          errorCode: error?.code
        })

          if (error && error.code === 'PGRST116') {
            // No existing workspace, create new one
            console.log('🆕 Creating new workspace...')
            const workspaceData = {
              canvases: defaultCanvases,
              activeCanvasId: defaultCanvases[0].id
            };
            
            const { data: newWorkspace, error: insertError } = await supabase
              .from('ai_card_studios')
              .insert({ user_id: userId, data: workspaceData })
              .select('data')
              .single()
              
            if (insertError) {
              console.error('Error creating new workspace:', insertError.message);
              throw new Error(`Failed to create workspace: ${insertError.message}`);
            } else {
              const workspaceData = newWorkspace.data;
              console.log('✅ New workspace created successfully', {
                canvasCount: workspaceData.canvases?.length,
                activeCanvasId: workspaceData.activeCanvasId
              })
              localStorage.removeItem('workspace-loading-start') // 清理loading时间戳
              
              // 🔧 确保AI字段正确初始化
              const normalizedCanvases = normalizeCanvases(workspaceData.canvases as Canvas[])
              
              // 💾 保存到缓存（规范化后的数据）
              try {
                localStorage.setItem('workspace-cache', JSON.stringify({
                  canvases: normalizedCanvases,
                  activeCanvasId: workspaceData.activeCanvasId
                }))
                console.log('💾 Workspace cached successfully')
              } catch (e) {
                console.warn('⚠️ Failed to cache workspace:', e)
              }
              
              set({ 
                canvases: normalizedCanvases,
                activeCanvasId: workspaceData.activeCanvasId,
                saveError: null,
                isLoading: false,
                isInitialLoad: false
              });
            }
          } else if (error) {
            // 🚫 特殊处理AbortError，避免抛出错误
            if (error.message?.includes('AbortError') || abortSignal.aborted) {
              console.log('🚫 Database request was cancelled')
              return
            }
            console.error('📊 Database error fetching workspace:', error.message);
            throw new Error(`Database error: ${error.message}`);
          } else if (data && data.data) {
            console.log('📦 Loaded workspace data successfully', {
              dataSize: JSON.stringify(data.data).length,
              hasCanvases: !!data.data.canvases,
              hasActiveCanvasId: !!data.data.activeCanvasId
            })
            const workspaceData = data.data;
            
            // Expect new format (canvases array)
            if (workspaceData.canvases && workspaceData.activeCanvasId) {
              console.log('✅ Valid workspace format loaded', {
                canvasCount: workspaceData.canvases.length,
                activeCanvasId: workspaceData.activeCanvasId
              })
              localStorage.removeItem('workspace-loading-start') // 清理loading时间戳
              
              // 🔧 确保AI字段正确初始化
              const normalizedCanvases = normalizeCanvases(workspaceData.canvases as Canvas[])
              
              // 💾 保存到缓存（规范化后的数据）
              try {
                localStorage.setItem('workspace-cache', JSON.stringify({
                  canvases: normalizedCanvases,
                  activeCanvasId: workspaceData.activeCanvasId
                }))
                console.log('💾 Workspace cached successfully')
              } catch (e) {
                console.warn('⚠️ Failed to cache workspace:', e)
              }
              
              set({ 
                canvases: normalizedCanvases,
                activeCanvasId: workspaceData.activeCanvasId,
                saveError: null,
                isLoading: false,
                isInitialLoad: false
              });
            } else {
              console.log('⚠️ Invalid workspace format, using defaults', {
                workspaceData: workspaceData
              })
              localStorage.removeItem('workspace-loading-start') // 清理loading时间戳
              set({ 
                canvases: defaultCanvases, 
                activeCanvasId: defaultCanvases[0].id,
                saveError: null,
                isLoading: false,
                isInitialLoad: false
              });
            }
          } else {
            console.log('🆕 No workspace data found, using defaults', {
              data: data,
              dataData: data?.data
            });
            localStorage.removeItem('workspace-loading-start') // 清理loading时间戳
            set({ 
              canvases: defaultCanvases, 
              activeCanvasId: defaultCanvases[0].id,
              saveError: null,
              isLoading: false,
              isInitialLoad: false
            });
          }
      } catch (err: any) {
        // 🚫 如果是取消错误，静默处理
        if (err.name === 'AbortError' || abortSignal.aborted) {
          console.log('🚫 Request was cancelled')
          return
        }
        
        console.warn('⚠️ Workspace fetch failed, keeping current data:', err.message)
        
        // 失败时保持现有数据
        const currentCanvases = get().canvases
        const hasExistingData = currentCanvases && currentCanvases.length > 0
        
        set({ 
          canvases: hasExistingData ? currentCanvases : defaultCanvases,
          activeCanvasId: hasExistingData ? get().activeCanvasId : defaultCanvases[0].id,
          saveError: 'Workspace fetch failed, showing cached data',
          isLoading: false,
          isInitialLoad: false
        });
      } finally {
        // 🔧 无论成功失败，都要清理资源并重置loading状态
        clearTimeout(fetchTimeout);
        localStorage.removeItem('workspace-loading-start')
        
        // 清理AbortController
        const finalState = get()
        if (finalState.currentAbortController === abortController) {
          set({ currentAbortController: null })
        }
        
        // 确保isLoading被重置（防止卡死）
        if (finalState.isLoading && !abortSignal.aborted) {
          console.warn('🚨 Force resetting isLoading to prevent hang')
          set({ isLoading: false })
        }
      }
    },

    updateCanvases: (updater) => {
      set((state) => ({ canvases: updater(state.canvases) }));
      
      // Debug: Log when canvases are updated (no auto-save anymore)
      console.log('Canvases updated. Use Save button to save changes.');
    },

    updateColumns: (updater) => {
      // Helper function for backward compatibility - updates active canvas columns
      const { canvases, activeCanvasId } = get();
      const activeCanvas = canvases.find(canvas => canvas.id === activeCanvasId);
      if (!activeCanvas) return;
      
      const updatedColumns = updater(activeCanvas.columns);
      
      set((state) => ({
        canvases: state.canvases.map(canvas => 
          canvas.id === activeCanvasId 
            ? { ...canvas, columns: updatedColumns }
            : canvas
        )
      }));
      
      console.log('Active canvas columns updated. Use Save button to save changes.');
    },

    moveColumn: (columnId, direction) => {
      const { canvases, activeCanvasId } = get();
      const activeCanvas = canvases.find(canvas => canvas.id === activeCanvasId);
      if (!activeCanvas) return;
      
      const columns = activeCanvas.columns;
      const currentIndex = columns.findIndex(col => col.id === columnId);
      
      if (currentIndex === -1) return;
      
      const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
      
      // Boundary check
      if (newIndex < 0 || newIndex >= columns.length) return;
      
      const newColumns = [...columns];
      [newColumns[currentIndex], newColumns[newIndex]] = [newColumns[newIndex], newColumns[currentIndex]];
      
      set((state) => ({
        canvases: state.canvases.map(canvas => 
          canvas.id === activeCanvasId 
            ? { ...canvas, columns: newColumns }
            : canvas
        )
      }));
    },

    moveCard: (columnId, cardId, direction) => {
      const { canvases, activeCanvasId } = get();
      const activeCanvas = canvases.find(canvas => canvas.id === activeCanvasId);
      if (!activeCanvas) return;
      
      const columns = activeCanvas.columns;
      
      // Find the target column
      const columnIndex = columns.findIndex(col => col.id === columnId);
      if (columnIndex === -1) return;
      
      const targetColumn = columns[columnIndex];
      
      // Find the target card within the column
      const currentIndex = targetColumn.cards.findIndex(card => card.id === cardId);
      if (currentIndex === -1) return;
      
      // Calculate new index
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      // Boundary check
      if (newIndex < 0 || newIndex >= targetColumn.cards.length) return;
      
      // Create new columns array with updated card order
      const newColumns = [...columns];
      const newCards = [...targetColumn.cards];
      
      // Move the card using splice
      const [movedCard] = newCards.splice(currentIndex, 1);
      newCards.splice(newIndex, 0, movedCard);
      
      // Update the column with new cards order
      newColumns[columnIndex] = {
        ...targetColumn,
        cards: newCards
      };
      
      set((state) => ({
        canvases: state.canvases.map(canvas => 
          canvas.id === activeCanvasId 
            ? { ...canvas, columns: newColumns }
            : canvas
        )
      }));
      
      console.log('Card moved. Use Save button to save changes.');
    },

    runColumnWorkflow: async (columnId) => {
      const { canvases, activeCanvasId, columnExecutionStatus } = get();
      const activeCanvas = canvases.find(canvas => canvas.id === activeCanvasId);
      if (!activeCanvas) return;
      
      const columns = activeCanvas.columns;
      
      // Check if column is already executing
      if (columnExecutionStatus[columnId]) return;
      
      // Find the target column
      const targetColumn = columns.find(col => col.id === columnId);
      if (!targetColumn) return;
      
      // Get all AI tool cards in the column
      const aiToolCards = targetColumn.cards.filter(card => card.type === 'aitool');
      if (aiToolCards.length === 0) return;
      
      // Set column execution status to true
      set(state => ({
        columnExecutionStatus: {
          ...state.columnExecutionStatus,
          [columnId]: true
        }
      }));
      
      try {
        // Process cards sequentially
        for (const card of aiToolCards) {
          const cardId = card.id;
          const promptText = card.promptText || '';
          const aiModel = card.aiModel || 'deepseek';
          
          // Skip if no prompt text
          if (!promptText.trim()) continue;
          
          // Set generating state
          get().actions.updateColumns(prev => prev.map(col => ({
            ...col,
            cards: col.cards.map(c =>
              c.id === cardId
                ? { ...c, isGenerating: true, generatedContent: '' }
                : c
            )
          })));
          
          // Resolve references within current column only
          const currentCanvases = get().canvases;
          let resolvedPrompt = resolveReferences(promptText, currentCanvases, columnId);
          
          // Handle options - automatically use first option if available
          const options = card.options || [];
          if (options.length > 0) {
            const defaultOption = options[0];
            resolvedPrompt = resolvedPrompt.replace(/\{\{option\}\}/g, defaultOption);
          }
          
          // Call AI API
          const response = await fetch('/api/ai-card-studio/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              prompt: resolvedPrompt,
              model: aiModel,
              stream: true
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response body reader');
          }

          const decoder = new TextDecoder();
          let fullResponse = '';
          let buffer = '';

          // Process streaming response
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) break;
            
            // Append new data to buffer
            buffer += decoder.decode(value, { stream: true });
            
            // Split by newlines, keep incomplete last line
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            // Process complete lines
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    fullResponse += content;
                    // Update content in real-time
                    get().actions.updateColumns(prev => prev.map(col => ({
                      ...col,
                      cards: col.cards.map(c =>
                        c.id === cardId
                          ? { ...c, generatedContent: fullResponse }
                          : c
                      )
                    })));
                  }
                } catch (parseError) {
                  console.warn('Skipping malformed JSON line:', data);
                }
              }
            }
          }
          
          // Process remaining buffer content
          if (buffer.trim() && buffer.startsWith('data: ')) {
            const data = buffer.slice(6).trim();
            if (data !== '[DONE]') {
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                  fullResponse += content;
                  get().actions.updateColumns(prev => prev.map(col => ({
                    ...col,
                    cards: col.cards.map(c =>
                      c.id === cardId
                        ? { ...c, generatedContent: fullResponse }
                        : c
                    )
                  })));
                }
              } catch (parseError) {
                console.warn('Skipping final malformed JSON:', data);
              }
            }
          }
          
          // Mark as completed
          get().actions.updateColumns(prev => prev.map(col => ({
            ...col,
            cards: col.cards.map(c =>
              c.id === cardId
                ? { ...c, isGenerating: false }
                : c
            )
          })));
          
          // Small delay between cards to ensure state updates are processed
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (error: any) {
        console.error('Workflow execution error:', error);
        set({ saveError: `Workflow failed: ${error.message}` });
        
        // Reset all generating states on error
        get().actions.updateColumns(prev => prev.map(col => ({
          ...col,
          cards: col.cards.map(card =>
            card.type === 'aitool'
              ? { ...card, isGenerating: false }
              : card
          )
        })));
      } finally {
        // Set column execution status to false when done
        set(state => ({
          columnExecutionStatus: {
            ...state.columnExecutionStatus,
            [columnId]: false
          }
        }));
      }
    },

    addCanvas: () => {
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substr(2, 9);
      const newCanvasId = `canvas-${timestamp}-${randomId}`;
      
      const newCanvas: Canvas = {
        id: newCanvasId,
        name: 'New Canvas',
        columns: []
      };
      
      set((state) => ({
        canvases: [...state.canvases, newCanvas],
        activeCanvasId: newCanvasId
      }));
      
      console.log('New canvas created and activated');
    },

    deleteCanvas: (canvasId: string) => {
      const { canvases, activeCanvasId } = get();
      
      // Don't allow deleting the last canvas
      if (canvases.length <= 1) {
        console.warn('Cannot delete the last canvas');
        return;
      }
      
      const filteredCanvases = canvases.filter(canvas => canvas.id !== canvasId);
      
      // If deleting active canvas, switch to first available
      const newActiveId = activeCanvasId === canvasId 
        ? filteredCanvases[0].id 
        : activeCanvasId;
      
      set({
        canvases: filteredCanvases,
        activeCanvasId: newActiveId
      });
      
      console.log('Canvas deleted, active canvas:', newActiveId);
    },

    renameCanvas: (canvasId: string, newName: string) => {
      const { canvases } = get();
      const trimmedName = newName.trim() || 'Untitled Canvas';
      
      // Generate unique name if there's a conflict
      const uniqueName = generateUniqueCanvasName(trimmedName, canvases, canvasId);
      
      set((state) => ({
        canvases: state.canvases.map(canvas => 
          canvas.id === canvasId 
            ? { ...canvas, name: uniqueName }
            : canvas
        )
      }));
      
      console.log('Canvas renamed to:', uniqueName);
    },

    setActiveCanvas: (canvasId: string) => {
      const { canvases } = get();
      const canvasExists = canvases.find(canvas => canvas.id === canvasId);
      
      if (canvasExists) {
        set({ activeCanvasId: canvasId });
        console.log('Active canvas changed to:', canvasId);
      }
    },

    saveWorkspace: async () => {
      const { canvases, activeCanvasId, user, isInitialLoad } = get();
      if (isInitialLoad || !user) return;

      try {
        // 🔧 过滤AI回复内容，不保存到数据库
        const cleanCanvases = canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(col => ({
            ...col,
            cards: col.cards.map(card => {
              if (card.type === 'aitool') {
                // 移除AI回复相关字段
                const { generatedContent, isGenerating, ...cleanCard } = card
                return cleanCard
              }
              return card
            })
          }))
        }))

        const workspaceData = {
          canvases: cleanCanvases,
          activeCanvasId
        };
        
        console.log('Saving workspace data (AI replies filtered):', workspaceData);
        const { error } = await supabase
          .from('ai_card_studios')
          .update({ data: workspaceData })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating workspace:', error.message);
          set({ saveError: 'Failed to save changes' });
        } else {
          console.log('Workspace saved successfully (without AI replies)');
          set({ saveError: null });
        }
      } catch (err) {
        console.error('Unexpected save error:', err);
        set({ saveError: 'Failed to save changes' });
      }
    },

    // Fine-grained card update actions
    updateCardTitle: (cardId: string, title: string) => {
      set((state) => {
        // First, find the old title for reference updating
        let oldTitle = '';
        let targetColumnId = '';
        
        for (const canvas of state.canvases) {
          for (const col of canvas.columns) {
            const targetCard = col.cards.find(card => card.id === cardId && card.type === 'info');
            if (targetCard) {
              oldTitle = targetCard.title || '';
              targetColumnId = col.id;
              break;
            }
          }
          if (oldTitle) break;
        }
        
        return {
          canvases: state.canvases.map(canvas => ({
            ...canvas,
            columns: canvas.columns.map(col => ({
              ...col,
              cards: col.cards.map(card => {
                // Update the target card's title
                if (card.id === cardId && card.type === 'info') {
                  return { ...card, title };
                }
                
                // Update INFO references in AI Tool cards within the same column
                if (col.id === targetColumnId && card.type === 'aitool' && card.promptText && oldTitle) {
                  const referencePattern = new RegExp(
                    `\\[INFO:\\s*${oldTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 
                    'g'
                  );
                  const updatedPromptText = card.promptText.replace(referencePattern, `[INFO: ${title}]`);
                  
                  if (updatedPromptText !== card.promptText) {
                    return { ...card, promptText: updatedPromptText };
                  }
                }
                
                return card;
              })
            }))
          }))
        };
      });
    },

    updateCardDescription: (cardId: string, description: string) => {
      set((state) => ({
        canvases: state.canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(col => ({
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId && card.type === 'info'
                ? { ...card, description }
                : card
            )
          }))
        }))
      }));
    },

    updateCardButtonName: (cardId: string, buttonName: string) => {
      set((state) => {
        // First, find the old button name for reference updating
        let oldButtonName = '';
        let targetColumnId = '';
        
        for (const canvas of state.canvases) {
          for (const col of canvas.columns) {
            const targetCard = col.cards.find(card => card.id === cardId && card.type === 'aitool');
            if (targetCard) {
              oldButtonName = targetCard.buttonName || '';
              targetColumnId = col.id;
              break;
            }
          }
          if (oldButtonName) break;
        }
        
        return {
          canvases: state.canvases.map(canvas => ({
            ...canvas,
            columns: canvas.columns.map(col => ({
              ...col,
              cards: col.cards.map(card => {
                // Update the target card's button name
                if (card.id === cardId && card.type === 'aitool') {
                  return { ...card, buttonName };
                }
                
                // Update references in other cards within the same column
                if (col.id === targetColumnId && card.type === 'aitool' && card.id !== cardId && card.promptText && oldButtonName) {
                  const referencePattern = new RegExp(
                    `\\[REF:\\s*${oldButtonName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\]`, 
                    'g'
                  );
                  const updatedPromptText = card.promptText.replace(referencePattern, `[REF: ${buttonName}]`);
                  
                  if (updatedPromptText !== card.promptText) {
                    return { ...card, promptText: updatedPromptText };
                  }
                }
                
                return card;
              })
            }))
          }))
        };
      });
    },

    updateCardPromptText: (cardId: string, promptText: string) => {
      set((state) => ({
        canvases: state.canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(col => ({
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId && card.type === 'aitool'
                ? { ...card, promptText }
                : card
            )
          }))
        }))
      }));
    },

    updateCardOptions: (cardId: string, options: string[]) => {
      set((state) => ({
        canvases: state.canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(col => ({
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId && card.type === 'aitool'
                ? { ...card, options }
                : card
            )
          }))
        }))
      }));
    },

    updateCardAiModel: (cardId: string, aiModel: 'deepseek' | 'openai') => {
      set((state) => ({
        canvases: state.canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(col => ({
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId && card.type === 'aitool'
                ? { ...card, aiModel }
                : card
            )
          }))
        }))
      }));
    },

    updateCardGeneratedContent: (cardId: string, generatedContent: string) => {
      set((state) => ({
        canvases: state.canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(col => ({
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId && card.type === 'aitool'
                ? { ...card, generatedContent }
                : card
            )
          }))
        }))
      }));
    },

    updateCardGeneratingState: (cardId: string, isGenerating: boolean) => {
      set((state) => ({
        canvases: state.canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(col => ({
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId && card.type === 'aitool'
                ? { ...card, isGenerating }
                : card
            )
          }))
        }))
      }));
    },

    deleteCard: (columnId: string, cardId: string) => {
      set((state) => ({
        canvases: state.canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.reduce((acc, col) => {
            if (col.id === columnId) {
              const updatedCards = col.cards.filter(card => card.id !== cardId);
              // If this was the last card in the column, delete the entire column
              if (updatedCards.length === 0) {
                return acc; // Don't include this column in the result
              }
              // Otherwise, keep the column with updated cards
              return [...acc, { ...col, cards: updatedCards }];
            }
            return [...acc, col];
          }, [] as Column[])
        }))
      }));
    },

    updateCardLockStatus: (cardId: string, isLocked: boolean, passwordHash?: string) => {
      set((state) => ({
        canvases: state.canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(col => ({
            ...col,
            cards: col.cards.map(card =>
              card.id === cardId
                ? { 
                    ...card, 
                    isLocked,
                    passwordHash: isLocked ? passwordHash : undefined
                  }
                : card
            )
          }))
        }))
      }));
      
      console.log(`Card ${cardId} ${isLocked ? 'locked' : 'unlocked'}`);
    },
  },
}));