import { create } from 'zustand';
import { supabase } from '../../../lib/supabaseClient';
import { Column } from '../types';
import type { User } from '@supabase/supabase-js'

interface WorkspaceState {
  columns: Column[];
  user: User | null;
  isLoading: boolean;
  isInitialLoad: boolean; // 避免竞态条件的标志
  saveError: string | null;
  actions: {
    fetchAndHandleWorkspace: (userId: string) => Promise<void>;
    updateColumns: (updater: (prev: Column[]) => Column[]) => void;
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

// Debounced save function
let saveTimeout: NodeJS.Timeout | null = null;

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  columns: [],
  user: null,
  isLoading: true,
  isInitialLoad: true,
  saveError: null,

  actions: {
    setUser: (user) => set({ user }),

    clearSaveError: () => set({ saveError: null }),

    fetchAndHandleWorkspace: async (userId) => {
      set({ isLoading: true });
      try {
        const { data, error } = await supabase
          .from('ai_card_studios')
          .select('data')
          .eq('user_id', userId)
          .single();

        if (error && error.code === 'PGRST116') {
          // No existing workspace, create new one
          const { data: newWorkspace, error: insertError } = await supabase
            .from('ai_card_studios')
            .insert({ user_id: userId, data: defaultColumns })
            .select('data')
            .single();
            
          if (insertError) {
            console.error('Error creating new workspace:', insertError.message);
            set({ columns: defaultColumns, saveError: 'Failed to create workspace' });
          } else {
            set({ columns: newWorkspace.data as Column[], saveError: null });
          }
        } else if (error) {
          console.error('Error fetching workspace:', error.message);
          set({ columns: defaultColumns, saveError: 'Failed to load workspace' });
        } else if (data && data.data) {
          // Debug logging
          console.log('Loaded workspace data:', data.data);
          set({ columns: data.data as Column[], saveError: null });
        } else {
          console.log('No workspace data found, using defaults');
          set({ columns: defaultColumns, saveError: null });
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        set({ columns: defaultColumns, saveError: 'Unexpected error occurred' });
      }
      
      set({ isLoading: false, isInitialLoad: false });
    },

    updateColumns: (updater) => {
      const prevColumns = get().columns;
      set((state) => ({ columns: updater(state.columns) }));
      
      // Debug: Log when columns are updated
      const newColumns = get().columns;
      console.log('Columns updated. Scheduling save...');
      
      // Debounced auto-save (800ms delay)
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      
      saveTimeout = setTimeout(() => {
        const { saveWorkspace } = get().actions;
        console.log('Debounce timeout reached, saving...');
        saveWorkspace();
      }, 200); // Reduced to 200ms for faster debugging
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