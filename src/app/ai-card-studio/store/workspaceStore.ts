import { create } from 'zustand';
import { supabase } from '../../../lib/supabaseClient';
import { Column, Canvas } from '../types';
import { generateUniqueCanvasName } from '../utils/cardUtils';
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
  hasUnsavedChanges: boolean; // 全局保存状态
  autoRunState: {
    columnId: string;
    queue: string[];
    currentIndex: number;
    token: number;
  } | null;
  actions: {
    cancelCurrentRequest: () => void;
    cleanAllAIReplies: () => Promise<void>;
    syncToCache: () => void;
    loadWorkspace: (userId: string) => Promise<void>;
    mergeDbWithCache: (dbData: any, cacheData: any) => Canvas[];
    checkForUpdates: (userId: string) => Promise<{ hasUpdates: boolean, lastUpdated?: string }>;
    updateCanvases: (updater: (prev: Canvas[]) => Canvas[]) => void;
    updateColumns: (updater: (prev: Column[]) => Column[]) => void; // Helper for backward compatibility
    moveColumn: (columnId: string, direction: 'left' | 'right') => void;
    moveCard: (columnId: string, cardId: string, direction: 'up' | 'down') => void;
    runColumnWorkflow: (columnId: string) => void;
    completeColumnWorkflowStep: (columnId: string, cardId: string) => void;
    addCanvas: () => void;
    deleteCanvas: (canvasId: string) => void;
    renameCanvas: (canvasId: string, newName: string) => void;
    setActiveCanvas: (canvasId: string) => void;
    saveWorkspace: () => Promise<void>;
    setUser: (user: User | null) => void;
    clearSaveError: () => void;
    resetWorkspace: () => void;
    setHasUnsavedChanges: (hasChanges: boolean) => void;
    
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

// Manual save only

// 🔧 确保AI工具卡片有正确的初始字段，保留内容但重置状态
const ensureAIToolCardFields = (card: any) => {
  if (card.type === 'aitool') {
    return {
      ...card,
      // 🔧 保留现有AI回复内容
      generatedContent: card.generatedContent ?? '',
      // 🔧 页面刷新后总是重置生成状态（异步操作已中断）
      isGenerating: false,
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
  hasUnsavedChanges: false,
  autoRunState: null,

  actions: {
    setUser: (user) => set({ user }),

    clearSaveError: () => set({ saveError: null }),
    
    setHasUnsavedChanges: (hasChanges: boolean) => {
      set({ hasUnsavedChanges: hasChanges })
    },

    // 🚫 取消当前请求
    cancelCurrentRequest: () => {
      const { currentAbortController } = get()
      if (currentAbortController) {
        currentAbortController.abort()
        set({ 
          currentAbortController: null,
          isLoading: false 
        })
      }
    },

    // 🧹 清理所有用户数据中的AI回复（一次性运行）
    cleanAllAIReplies: async () => {
      
      try {
        // 获取所有用户数据
        const { data: allWorkspaces, error: fetchError } = await supabase
          .from('ai_card_studios')
          .select('user_id, data');

        if (fetchError) {
          console.error('Error fetching workspaces:', fetchError)
          return
        }


        if (!allWorkspaces || allWorkspaces.length === 0) {
          return
        }

        // 清理每个workspace
        for (const workspace of allWorkspaces) {
          const { user_id, data } = workspace
          
          if (!data || !data.canvases) {
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
          }
        }

        
      } catch (error) {
        console.error('Error during cleaning process:', error)
      }
    },

    // 🔧 智能合并：数据库结构 + 缓存AI回复
    mergeDbWithCache: (dbData, cacheData) => {
      
      return dbData.canvases.map((dbCanvas: Canvas) => {
        const cacheCanvas = cacheData.canvases.find((c: Canvas) => c.id === dbCanvas.id)
        
        return {
          ...dbCanvas, // 结构以DB为准
          columns: dbCanvas.columns.map(dbCol => {
            const cacheCol = cacheCanvas?.columns.find(c => c.id === dbCol.id)
            
            return {
              ...dbCol, // 列结构以DB为准
              cards: dbCol.cards.map(dbCard => {
                const cacheCard = cacheCol?.cards.find(c => c.id === dbCard.id)
                
                // AI回复以缓存为准
                if (dbCard.type === 'aitool' && cacheCard?.generatedContent) {
                  return { 
                    ...dbCard, 
                    generatedContent: cacheCard.generatedContent 
                  }
                }
                return dbCard
              })
            }
          })
        }
      })
    },

    // 🔧 核心读取逻辑：智能加载工作区
    loadWorkspace: async (userId: string) => {
      
      try {
        // Step 1: 获取数据库最新结构
        const { data, error } = await supabase
          .from('ai_card_studios')
          .select('data')
          .eq('user_id', userId)
          .single()
        
        let dbData = null
        if (!error && data?.data) {
          const payload = data.data as any
          dbData = {
            canvases: normalizeCanvases((payload.canvases || []) as Canvas[]),
            activeCanvasId: payload.active_canvas_id || payload.activeCanvasId || payload.canvases?.[0]?.id || ''
          }
        } else {
        }
        
        // Step 2: 获取缓存数据（含AI回复）
        let cacheData = null
        try {
          const cachedDataStr = localStorage.getItem('workspace-cache')
          if (cachedDataStr) {
            const parsed = JSON.parse(cachedDataStr)
            if (parsed.canvases && parsed.activeCanvasId) {
              cacheData = {
                canvases: normalizeCanvases(parsed.canvases as Canvas[]),
                activeCanvasId: parsed.activeCanvasId,
                timestamp: parsed.timestamp || 0
              }
            }
          }
        } catch (e) {
          console.warn('⚠️ Failed to load cache:', e)
        }
        
        // Step 3: 智能合并策略
        let finalData
        if (dbData && cacheData) {
          
          // 🔧 检查缓存是否过期（24小时）
          const CACHE_TTL = 24 * 60 * 60 * 1000 // 24小时
          const cacheAge = Date.now() - (cacheData.timestamp || 0)
          
          if (cacheAge > CACHE_TTL) {
            console.warn('⚠️ Cache is older than 24h, consider refreshing')
            // 注意：这里不自动丢弃，保护AI回复
            // 用户可以通过UI手动选择是否刷新
          }
          
          const mergedCanvases = get().actions.mergeDbWithCache(dbData, cacheData)
          finalData = {
            canvases: mergedCanvases,
            activeCanvasId: dbData.activeCanvasId || mergedCanvases[0]?.id || '' // 活跃画布以DB为准，若缺失则退回第一个
          }
        } else if (dbData) {
          finalData = {
            canvases: dbData.canvases,
            activeCanvasId: dbData.activeCanvasId || (dbData.canvases[0]?.id ?? '')
          }
        } else if (cacheData) {
          finalData = {
            canvases: cacheData.canvases,
            activeCanvasId: cacheData.activeCanvasId
          }
        } else {
          finalData = {
            canvases: defaultCanvases,
            activeCanvasId: defaultCanvases[0].id
          }
        }
        
        // Step 4: 应用到store
        set({
          canvases: finalData.canvases,
          activeCanvasId: finalData.activeCanvasId,
          isLoading: false,
          isInitialLoad: false,
          saveError: null
        })
        
        
      } catch (error) {
        console.error('❌ Workspace loading failed:', error)
        set({
          canvases: defaultCanvases,
          activeCanvasId: defaultCanvases[0].id,
          isLoading: false,
          isInitialLoad: false,
          saveError: 'Failed to load workspace'
        })
      }
    },

    // 🔧 轻量级更新检查：只查询时间戳，不获取数据
    checkForUpdates: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('ai_card_studios')
          .select('updated_at')
          .eq('user_id', userId)
          .single()
        
        if (error || !data) {
          return { hasUpdates: false }
        }
        
        // 比较本地缓存时间戳
        const cachedDataStr = localStorage.getItem('workspace-cache')
        if (cachedDataStr) {
          try {
            const cached = JSON.parse(cachedDataStr)
            const cacheTimestamp = cached.timestamp || 0
            const dbTimestamp = new Date(data.updated_at).getTime()
            
            const hasUpdates = dbTimestamp > cacheTimestamp
            
            return { 
              hasUpdates,
              lastUpdated: data.updated_at 
            }
          } catch (e) {
            console.warn('Failed to parse cache for comparison')
            return { hasUpdates: true, lastUpdated: data.updated_at }
          }
        }
        
        return { hasUpdates: true, lastUpdated: data.updated_at }
      } catch (error) {
        console.error('Update check failed:', error)
        return { hasUpdates: false }
      }
    },

    resetWorkspace: () => set({
      canvases: [],
      activeCanvasId: '',
      isLoading: false,  // ⚠️ 最关键
      saveError: null,
      currentAbortController: null
    }),


    // 💾 同步当前状态到缓存
    syncToCache: () => {
      try {
        const { canvases, activeCanvasId } = get()
        if (canvases.length > 0) {
          // 🔧 缓存存储：完整结构 + AI回复，但不UI状态
          const cacheCanvases = canvases.map(canvas => ({
            ...canvas,
            columns: canvas.columns.map(col => ({
              ...col,
              cards: col.cards.map(card => {
                if (card.type === 'aitool') {
                  // 保留AI回复，移除UI状态
                  const { isGenerating, ...cacheCard } = card
                  return cacheCard
                }
                return card
              })
            }))
          }))
          
          localStorage.setItem('workspace-cache', JSON.stringify({
            canvases: cacheCanvases,
            activeCanvasId,
            timestamp: Date.now()
          }))
        }
      } catch (e) {
        console.warn('⚠️ Failed to sync to cache:', e)
      }
    },

    // 🔧 已删除fetchAndHandleWorkspace，使用loadWorkspace替代

    updateCanvases: (updater) => {
      set((state) => ({ 
        canvases: updater(state.canvases),
        hasUnsavedChanges: true
      }));
      // 🔧 状态变化后自动缓存
      get().actions.syncToCache();
    },

    updateColumns: (updater) => {
      // Helper function for backward compatibility - updates active canvas columns
      const state = get();

      if (state.canvases.length === 0) {
        console.warn('updateColumns called without any canvases in state');
        return;
      }

      let targetCanvasId = state.activeCanvasId;
      let targetCanvas = state.canvases.find(canvas => canvas.id === targetCanvasId);

      if (!targetCanvas) {
        // Fallback to the first available canvas and make it active to avoid silent failures
        targetCanvas = state.canvases[0];
        targetCanvasId = targetCanvas.id;
      }

      const updatedColumns = updater(targetCanvas.columns);

      set((prevState) => ({
        canvases: prevState.canvases.map(canvas =>
          canvas.id === targetCanvasId
            ? { ...canvas, columns: updatedColumns }
            : canvas
        ),
        activeCanvasId: targetCanvasId,
        hasUnsavedChanges: true
      }));

      // 🔧 状态变化后自动缓存
      get().actions.syncToCache();
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
        ),
        hasUnsavedChanges: true
      }));
      
      // 🔧 结构变化后自动缓存
      get().actions.syncToCache();
    },

    // 🚨 临时占位符函数 - 避免引用错误
    moveCard: (columnId: string, cardId: string, direction: 'up' | 'down') => {
      get().actions.updateCanvases(canvases => 
        canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(column => {
            if (column.id !== columnId) return column;
            
            const cards = [...column.cards];
            const cardIndex = cards.findIndex(card => card.id === cardId);
            
            if (cardIndex === -1) return column;
            
            const newIndex = direction === 'up' 
              ? Math.max(0, cardIndex - 1)
              : Math.min(cards.length - 1, cardIndex + 1);
            
            if (newIndex !== cardIndex) {
              [cards[cardIndex], cards[newIndex]] = [cards[newIndex], cards[cardIndex]];
            }
            
            return { ...column, cards };
          })
        }))
      );
    },
    runColumnWorkflow: (columnId: string) => {
      const state = get();
      if (state.columnExecutionStatus[columnId]) {
        console.warn(`Column ${columnId} is already running.`);
        return;
      }

      if (state.autoRunState) {
        console.warn('Another column workflow is currently running.');
        return;
      }

      const activeCanvas = state.canvases.find(canvas =>
        canvas.columns.some(col => col.id === columnId)
      );

      const targetColumn = activeCanvas?.columns.find(col => col.id === columnId);
      if (!targetColumn) {
        console.warn(`Column ${columnId} not found.`);
        return;
      }

      const aitoolCardIds = targetColumn.cards
        .filter(card => card.type === 'aitool')
        .map(card => card.id);

      if (aitoolCardIds.length === 0) {
        console.warn(`Column ${columnId} has no AI Tool cards to run.`);
        return;
      }

      set(prev => ({
        columnExecutionStatus: {
          ...prev.columnExecutionStatus,
          [columnId]: true
        },
        autoRunState: {
          columnId,
          queue: aitoolCardIds,
          currentIndex: 0,
          token: Date.now()
        }
      }));
    },
    completeColumnWorkflowStep: (columnId: string, cardId: string) => {
      const state = get();
      const current = state.autoRunState;
      if (!current || current.columnId !== columnId) {
        return;
      }

      const queue = current.queue;
      if (queue.length === 0) {
        set(prev => {
          const nextStatus = { ...prev.columnExecutionStatus };
          delete nextStatus[columnId];
          return {
            autoRunState: null,
            columnExecutionStatus: nextStatus
          };
        });
        return;
      }

      const currentIndex = queue[current.currentIndex] === cardId
        ? current.currentIndex
        : queue.indexOf(cardId) !== -1
          ? queue.indexOf(cardId)
          : current.currentIndex;

      const nextIndex = currentIndex + 1;

      if (nextIndex >= queue.length) {
        set(prev => {
          const nextStatus = { ...prev.columnExecutionStatus };
          delete nextStatus[columnId];
          return {
            columnExecutionStatus: nextStatus,
            autoRunState: null
          };
        });
      } else {
        set(prev => ({
          autoRunState: {
            columnId,
            queue,
            currentIndex: nextIndex,
            token: Date.now()
          }
        }));
      }
    },
    addCanvas: () => {
      set((state) => {
        const newCanvas: Canvas = {
          id: `canvas-${Date.now()}`,
          name: generateUniqueCanvasName('New Canvas', state.canvases),
          columns: [{
            id: `col-${Date.now()}`,
            cards: []
          }]
        };
        const newState = {
          ...state,
          canvases: [...state.canvases, newCanvas],
          activeCanvasId: newCanvas.id,
          hasUnsavedChanges: true
        };
        get().actions.syncToCache();
        return newState;
      });
    },
    deleteCanvas: (canvasId: string) => {
      set((state) => {
        if (state.canvases.length <= 1) {
          console.warn('Cannot delete the last canvas');
          return state;
        }
        
        const filteredCanvases = state.canvases.filter(c => c.id !== canvasId);
        const newActiveId = state.activeCanvasId === canvasId 
          ? filteredCanvases[0]?.id || ''
          : state.activeCanvasId;
        
        const newState = {
          ...state,
          canvases: filteredCanvases,
          activeCanvasId: newActiveId,
          hasUnsavedChanges: true
        };
        get().actions.syncToCache();
        return newState;
      });
    },
    renameCanvas: (canvasId: string, newName: string) => {
      set((state) => {
        const newState = {
          ...state,
          canvases: state.canvases.map(canvas => 
            canvas.id === canvasId 
              ? { ...canvas, name: newName.trim() || canvas.name }
              : canvas
          ),
          hasUnsavedChanges: true
        };
        get().actions.syncToCache();
        return newState;
      });
    },
    setActiveCanvas: (canvasId: string) => {
      set((state) => {
        const newState = { ...state, activeCanvasId: canvasId };
        get().actions.syncToCache();
        return newState;
      });
    },
    saveWorkspace: async () => {
      const state = get();
      if (!state.user?.id) {
        console.warn('Cannot save: no authenticated user');
        return;
      }

      try {
        set({ saveError: null });
        
        // 数据库只保存结构，不包含AI回复
        const canvasesToSave = state.canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(column => ({
            ...column,
            cards: column.cards.map(card => {
              if (card.type === 'aitool') {
                const { generatedContent, isGenerating, ...cardWithoutAI } = card;
                return cardWithoutAI;
              }
              return card;
            })
          }))
        }));

        const workspaceData = {
          canvases: canvasesToSave,
          active_canvas_id: state.activeCanvasId,
          user_id: state.user.id,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('ai_card_studios')
          .upsert({ user_id: state.user.id, data: workspaceData }, { onConflict: 'user_id' });

        if (error) {
          throw error;
        }

        // 更新缓存
        get().actions.syncToCache();
        
        set({ 
          hasUnsavedChanges: false
        });
        
      } catch (error: any) {
        console.error('Save failed:', error);
        set({ 
          saveError: error.message || 'Save failed'
        });
      }
    },
    updateCardTitle: (cardId: string, title: string) => {
      get().actions.updateCanvases(canvases => 
        canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(column => ({
            ...column,
            cards: column.cards.map(card => 
              card.id === cardId ? { ...card, title } : card
            )
          }))
        }))
      );
    },
    updateCardDescription: (cardId: string, description: string) => {
      get().actions.updateCanvases(canvases => 
        canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(column => ({
            ...column,
            cards: column.cards.map(card => 
              card.id === cardId ? { ...card, description } : card
            )
          }))
        }))
      );
    },
    updateCardButtonName: (cardId: string, buttonName: string) => {
      get().actions.updateCanvases(canvases => 
        canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(column => ({
            ...column,
            cards: column.cards.map(card => 
              card.id === cardId && card.type === 'aitool' 
                ? { ...card, buttonName } 
                : card
            )
          }))
        }))
      );
    },
    updateCardPromptText: (cardId: string, promptText: string) => {
      get().actions.updateCanvases(canvases => 
        canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(column => ({
            ...column,
            cards: column.cards.map(card => 
              card.id === cardId && card.type === 'aitool' 
                ? { ...card, promptText } 
                : card
            )
          }))
        }))
      );
    },
    updateCardOptions: (cardId: string, options: string[]) => {
      get().actions.updateCanvases(canvases => 
        canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(column => ({
            ...column,
            cards: column.cards.map(card => 
              card.id === cardId && card.type === 'aitool' 
                ? { ...card, options } 
                : card
            )
          }))
        }))
      );
    },
    updateCardAiModel: (cardId: string, aiModel: 'deepseek' | 'openai') => {
      get().actions.updateCanvases(canvases => 
        canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(column => ({
            ...column,
            cards: column.cards.map(card => 
              card.id === cardId && card.type === 'aitool' 
                ? { ...card, aiModel } 
                : card
            )
          }))
        }))
      );
    },
    updateCardGeneratedContent: (cardId: string, content: string) => {
      // AI回复不触发Save按钮，只更新状态和缓存
      set((state) => ({
        canvases: state.canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(column => ({
            ...column,
            cards: column.cards.map(card => 
              card.id === cardId && card.type === 'aitool' 
                ? { ...card, generatedContent: content } 
                : card
            )
          }))
        }))
        // 不设置 hasUnsavedChanges: true
      }));
      
      // 仍然需要缓存AI回复到localStorage
      get().actions.syncToCache();
    },
    updateCardGeneratingState: (cardId: string, isGenerating: boolean) => {
      get().actions.updateCanvases(canvases => 
        canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(column => ({
            ...column,
            cards: column.cards.map(card => 
              card.id === cardId && card.type === 'aitool' 
                ? { ...card, isGenerating } 
                : card
            )
          }))
        }))
      );
    },
    deleteCard: (columnId: string, cardId: string) => {
      get().actions.updateCanvases(canvases => 
        canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.reduce((acc, column) => {
            if (column.id === columnId) {
              const updatedCards = column.cards.filter(card => card.id !== cardId);
              // If this was the last card in the column, delete the entire column
              if (updatedCards.length === 0) {
                return acc; // Don't include this column in the result
              }
              // Otherwise, keep the column with updated cards
              return [...acc, { ...column, cards: updatedCards }];
            }
            return [...acc, column];
          }, [] as Column[])
        }))
      );
    },
    updateCardLockStatus: (cardId: string, isLocked: boolean, passwordHash?: string) => {
      get().actions.updateCanvases(canvases => 
        canvases.map(canvas => ({
          ...canvas,
          columns: canvas.columns.map(column => ({
            ...column,
            cards: column.cards.map(card => 
              card.id === cardId 
                ? { ...card, isLocked, passwordHash } 
                : card
            )
          }))
        }))
      );
    },
  },
}));
