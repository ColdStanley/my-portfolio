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
  actions: {
    fetchAndHandleWorkspace: (userId: string) => Promise<void>;
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

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  canvases: [],
  activeCanvasId: '',
  user: null,
  isLoading: true,
  isInitialLoad: true,
  saveError: null,
  columnExecutionStatus: {},

  actions: {
    setUser: (user) => set({ user }),

    clearSaveError: () => set({ saveError: null }),

    fetchAndHandleWorkspace: async (userId) => {
      set({ isLoading: true });
      
      try {
        // Add timeout to database operations
        const fetchWithTimeout = Promise.race([
          supabase
            .from('ai_card_studios')
            .select('data')
            .eq('user_id', userId)
            .single(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Database timeout')), 15000)
          )
        ]) as Promise<any>;

        const { data, error } = await fetchWithTimeout;

        if (error && error.code === 'PGRST116') {
          // No existing workspace, create new one with timeout
          const workspaceData = {
            canvases: defaultCanvases,
            activeCanvasId: defaultCanvases[0].id
          };
          
          const insertWithTimeout = Promise.race([
            supabase
              .from('ai_card_studios')
              .insert({ user_id: userId, data: workspaceData })
              .select('data')
              .single(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Insert timeout')), 15000)
            )
          ]) as Promise<any>;

          try {
            const { data: newWorkspace, error: insertError } = await insertWithTimeout;
            
            if (insertError) {
              console.error('Error creating new workspace:', insertError.message);
              set({ 
                canvases: defaultCanvases, 
                activeCanvasId: defaultCanvases[0].id,
                saveError: 'Failed to create workspace' 
              });
            } else {
              const workspaceData = newWorkspace.data;
              set({ 
                canvases: workspaceData.canvases as Canvas[], 
                activeCanvasId: workspaceData.activeCanvasId,
                saveError: null 
              });
            }
          } catch (insertErr) {
            console.error('Insert operation timeout:', insertErr);
            set({ 
              canvases: defaultCanvases, 
              activeCanvasId: defaultCanvases[0].id,
              saveError: 'Database connection slow, using defaults' 
            });
          }
        } else if (error && error.message !== 'Database timeout') {
          console.error('Error fetching workspace:', error.message);
          set({ 
            canvases: defaultCanvases, 
            activeCanvasId: defaultCanvases[0].id,
            saveError: 'Failed to load workspace' 
          });
        } else if (data && data.data) {
          console.log('Loaded workspace data:', data.data);
          const workspaceData = data.data;
          
          // Expect new format (canvases array)
          if (workspaceData.canvases && workspaceData.activeCanvasId) {
            set({ 
              canvases: workspaceData.canvases as Canvas[], 
              activeCanvasId: workspaceData.activeCanvasId,
              saveError: null 
            });
          } else {
            // Fallback to default
            set({ 
              canvases: defaultCanvases, 
              activeCanvasId: defaultCanvases[0].id,
              saveError: null 
            });
          }
        } else {
          console.log('No workspace data found, using defaults');
          set({ 
            canvases: defaultCanvases, 
            activeCanvasId: defaultCanvases[0].id,
            saveError: null 
          });
        }
      } catch (err: any) {
        console.error('Workspace fetch error:', err);
        if (err.message === 'Database timeout') {
          set({ 
            canvases: defaultCanvases, 
            activeCanvasId: defaultCanvases[0].id,
            saveError: 'Connection timeout, using defaults' 
          });
        } else {
          set({ 
            canvases: defaultCanvases, 
            activeCanvasId: defaultCanvases[0].id,
            saveError: 'Unexpected error occurred' 
          });
        }
      }
      
      set({ isLoading: false, isInitialLoad: false });
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
        const workspaceData = {
          canvases,
          activeCanvasId
        };
        
        console.log('Saving workspace data:', workspaceData);
        const { error } = await supabase
          .from('ai_card_studios')
          .update({ data: workspaceData })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error updating workspace:', error.message);
          set({ saveError: 'Failed to save changes' });
        } else {
          console.log('Workspace saved successfully');
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