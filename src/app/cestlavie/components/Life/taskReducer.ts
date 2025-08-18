import { useReducer, useCallback } from 'react'

export interface TaskRecord {
  id: string
  title: string
  status: string
  start_date: string
  end_date: string
  all_day: boolean
  remind_before?: number
  plan: string[]
  priority_quadrant: string
  note: string
  outlook_event_id?: string
}

interface PlanOption {
  id: string
  objective: string
  parent_goal?: string[]
}

interface StrategyOption {
  id: string
  objective: string
}

// State interface
export interface TaskState {
  // Data
  tasks: TaskRecord[]
  statusOptions: string[]
  priorityOptions: string[]
  planOptions: PlanOption[]
  strategyOptions: StrategyOption[]
  
  // UI State
  loading: boolean
  error: string | null
  refreshing: boolean
  
  // Form State
  formPanelOpen: boolean
  editingTask: TaskRecord | null
  
  // Filters
  selectedStatus: string
  selectedQuadrant: string
  selectedPlanFilter: string
  
  // Calendar
  selectedDate: string
  currentMonth: Date
  
}

// Action types
export type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_REFRESHING'; payload: boolean }
  | { type: 'SET_TASKS'; payload: TaskRecord[] }
  | { type: 'ADD_TASK'; payload: TaskRecord }
  | { type: 'UPDATE_TASK'; payload: TaskRecord }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_STATUS_OPTIONS'; payload: string[] }
  | { type: 'SET_PRIORITY_OPTIONS'; payload: string[] }
  | { type: 'SET_PLAN_OPTIONS'; payload: PlanOption[] }
  | { type: 'SET_STRATEGY_OPTIONS'; payload: StrategyOption[] }
  | { type: 'OPEN_FORM_PANEL'; payload?: TaskRecord }
  | { type: 'CLOSE_FORM_PANEL' }
  | { type: 'SET_SELECTED_STATUS'; payload: string }
  | { type: 'SET_SELECTED_QUADRANT'; payload: string }
  | { type: 'SET_SELECTED_PLAN_FILTER'; payload: string }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'SET_CURRENT_MONTH'; payload: Date }
  | { type: 'RESET_STATE' }

// Initial state
const createInitialState = (): TaskState => ({
  tasks: [],
  statusOptions: [],
  priorityOptions: [],
  planOptions: [],
  strategyOptions: [],
  loading: true,
  error: null,
  refreshing: false,
  formPanelOpen: false,
  editingTask: null,
  selectedStatus: 'all',
  selectedQuadrant: 'all',
  selectedPlanFilter: 'all',
  selectedDate: new Date().toLocaleDateString('en-CA'),
  currentMonth: new Date(),
})

// Reducer function
export const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_REFRESHING':
      return { ...state, refreshing: action.payload }
    
    case 'SET_TASKS':
      return { ...state, tasks: action.payload }
    
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] }
    
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        )
      }
    
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload)
      }
    
    case 'SET_STATUS_OPTIONS':
      return { ...state, statusOptions: action.payload }
    
    case 'SET_PRIORITY_OPTIONS':
      return { ...state, priorityOptions: action.payload }
    
    case 'SET_PLAN_OPTIONS':
      return { ...state, planOptions: action.payload }
    
    case 'SET_STRATEGY_OPTIONS':
      return { ...state, strategyOptions: action.payload }
    
    case 'OPEN_FORM_PANEL':
      return {
        ...state,
        formPanelOpen: true,
        editingTask: action.payload || null
      }
    
    case 'CLOSE_FORM_PANEL':
      return {
        ...state,
        formPanelOpen: false,
        editingTask: null
      }
    
    case 'SET_SELECTED_STATUS':
      return { ...state, selectedStatus: action.payload }
    
    case 'SET_SELECTED_QUADRANT':
      return { ...state, selectedQuadrant: action.payload }
    
    case 'SET_SELECTED_PLAN_FILTER':
      return { ...state, selectedPlanFilter: action.payload }
    
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload }
    
    case 'SET_CURRENT_MONTH':
      return { ...state, currentMonth: action.payload }
    
    
    case 'RESET_STATE':
      return createInitialState()
    
    default:
      return state
  }
}

// Custom hook to use the task reducer with convenience methods
export const useTaskReducer = () => {
  const [state, dispatch] = useReducer(taskReducer, createInitialState())
  
  // Convenience action creators
  const actions = {
    setLoading: useCallback((loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }), []),
    
    setError: useCallback((error: string | null) => 
      dispatch({ type: 'SET_ERROR', payload: error }), []),
    
    setRefreshing: useCallback((refreshing: boolean) => 
      dispatch({ type: 'SET_REFRESHING', payload: refreshing }), []),
    
    setTasks: useCallback((tasks: TaskRecord[]) => 
      dispatch({ type: 'SET_TASKS', payload: tasks }), []),
    
    addTask: useCallback((task: TaskRecord) => 
      dispatch({ type: 'ADD_TASK', payload: task }), []),
    
    updateTask: useCallback((task: TaskRecord) => 
      dispatch({ type: 'UPDATE_TASK', payload: task }), []),
    
    deleteTask: useCallback((taskId: string) => 
      dispatch({ type: 'DELETE_TASK', payload: taskId }), []),
    
    setStatusOptions: useCallback((options: string[]) => 
      dispatch({ type: 'SET_STATUS_OPTIONS', payload: options }), []),
    
    setPriorityOptions: useCallback((options: string[]) => 
      dispatch({ type: 'SET_PRIORITY_OPTIONS', payload: options }), []),
    
    setPlanOptions: useCallback((options: PlanOption[]) => 
      dispatch({ type: 'SET_PLAN_OPTIONS', payload: options }), []),
    
    setStrategyOptions: useCallback((options: StrategyOption[]) => 
      dispatch({ type: 'SET_STRATEGY_OPTIONS', payload: options }), []),
    
    openFormPanel: useCallback((task?: TaskRecord) => 
      dispatch({ type: 'OPEN_FORM_PANEL', payload: task }), []),
    
    closeFormPanel: useCallback(() => 
      dispatch({ type: 'CLOSE_FORM_PANEL' }), []),
    
    setSelectedStatus: useCallback((status: string) => 
      dispatch({ type: 'SET_SELECTED_STATUS', payload: status }), []),
    
    setSelectedQuadrant: useCallback((quadrant: string) => 
      dispatch({ type: 'SET_SELECTED_QUADRANT', payload: quadrant }), []),
    
    setSelectedPlanFilter: useCallback((planFilter: string) => 
      dispatch({ type: 'SET_SELECTED_PLAN_FILTER', payload: planFilter }), []),
    
    setSelectedDate: useCallback((date: string) => 
      dispatch({ type: 'SET_SELECTED_DATE', payload: date }), []),
    
    setCurrentMonth: useCallback((month: Date) => 
      dispatch({ type: 'SET_CURRENT_MONTH', payload: month }), []),
    
    
    resetState: useCallback(() => 
      dispatch({ type: 'RESET_STATE' }), [])
  }
  
  return [state, actions] as const
}