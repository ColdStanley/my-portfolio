import { create } from 'zustand';
import { supabase } from '../../../lib/supabaseClient';
import { Column } from '../types';
import { resolveReferences } from '../utils/cardUtils';
import type { User } from '@supabase/supabase-js'

interface WorkspaceState {
  columns: Column[];
  user: User | null;
  isLoading: boolean;
  isInitialLoad: boolean; // 避免竞态条件的标志
  saveError: string | null;
  columnExecutionStatus: { [columnId: string]: boolean }; // Track column execution status
  actions: {
    fetchAndHandleWorkspace: (userId: string) => Promise<void>;
    updateColumns: (updater: (prev: Column[]) => Column[]) => void;
    moveColumn: (columnId: string, direction: 'left' | 'right') => void;
    moveCard: (columnId: string, cardId: string, direction: 'up' | 'down') => void;
    runColumnWorkflow: (columnId: string) => Promise<void>;
    saveWorkspace: () => Promise<void>;
    setUser: (user: User | null) => void;
    clearSaveError: () => void;
  };
}

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
];

// Manual save only - no debounce

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  columns: [],
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
          const insertWithTimeout = Promise.race([
            supabase
              .from('ai_card_studios')
              .insert({ user_id: userId, data: defaultColumns })
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
              set({ columns: defaultColumns, saveError: 'Failed to create workspace' });
            } else {
              set({ columns: newWorkspace.data as Column[], saveError: null });
            }
          } catch (insertErr) {
            console.error('Insert operation timeout:', insertErr);
            set({ columns: defaultColumns, saveError: 'Database connection slow, using defaults' });
          }
        } else if (error && error.message !== 'Database timeout') {
          console.error('Error fetching workspace:', error.message);
          set({ columns: defaultColumns, saveError: 'Failed to load workspace' });
        } else if (data && data.data) {
          console.log('Loaded workspace data:', data.data);
          set({ columns: data.data as Column[], saveError: null });
        } else {
          console.log('No workspace data found, using defaults');
          set({ columns: defaultColumns, saveError: null });
        }
      } catch (err: any) {
        console.error('Workspace fetch error:', err);
        if (err.message === 'Database timeout') {
          set({ columns: defaultColumns, saveError: 'Connection timeout, using defaults' });
        } else {
          set({ columns: defaultColumns, saveError: 'Unexpected error occurred' });
        }
      }
      
      set({ isLoading: false, isInitialLoad: false });
    },

    updateColumns: (updater) => {
      set((state) => ({ columns: updater(state.columns) }));
      
      // Debug: Log when columns are updated (no auto-save anymore)
      console.log('Columns updated. Use Save button to save changes.');
    },

    moveColumn: (columnId, direction) => {
      const { columns } = get();
      const currentIndex = columns.findIndex(col => col.id === columnId);
      
      if (currentIndex === -1) return;
      
      const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
      
      // Boundary check
      if (newIndex < 0 || newIndex >= columns.length) return;
      
      const newColumns = [...columns];
      [newColumns[currentIndex], newColumns[newIndex]] = [newColumns[newIndex], newColumns[currentIndex]];
      
      set({ columns: newColumns });
      
      // Auto-save after move
      get().actions.saveWorkspace();
    },

    moveCard: (columnId, cardId, direction) => {
      const { columns } = get();
      
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
      
      set({ columns: newColumns });
      
      console.log('Card moved. Use Save button to save changes.');
    },

    runColumnWorkflow: async (columnId) => {
      const { columns, columnExecutionStatus } = get();
      
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
          
          // Resolve references using current state
          const currentColumns = get().columns;
          let resolvedPrompt = resolveReferences(promptText, currentColumns);
          
          // Handle options - automatically use first option if available
          const options = card.options || [];
          if (options.length > 0) {
            const defaultOption = options[0];
            resolvedPrompt = resolvedPrompt.replace(/\{\{option\}\}/g, defaultOption);
          }
          
          // Call AI API
          const response = await fetch('/api/ai-agent/generate', {
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

    saveWorkspace: async () => {
      const { columns, user, isInitialLoad } = get();
      if (isInitialLoad || !user) return;

      try {
        console.log('Saving workspace data:', columns);
        const { error } = await supabase
          .from('ai_card_studios')
          .update({ data: columns })
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
  },
}));