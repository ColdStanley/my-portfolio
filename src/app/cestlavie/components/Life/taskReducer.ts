import { useReducer, useCallback } from 'react'

interface TaskRecord {
  id: string
  title: string
  status: string
  start_date: string
  end_date: string
  all_day: boolean
  plan: string[]
  priority_quadrant: string
  note: string
  actual_start?: string
  actual_end?: string
  budget_time: number
  actual_time: number
  quality_rating?: number
  next?: string
  is_plan_critical?: boolean
}

interface PlanOption {
  id: string
  title: string
  budget_money?: number
  budget_time?: number
}

// State interface
export interface TaskState {
  // Data
  tasks: TaskRecord[]
  statusOptions: string[]
  priorityOptions: string[]
  planOptions: PlanOption[]
  
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
  
  // Timer State
  runningTasks: Set<string>
  updatingTimer: string | null
  
  // Calendar Integration
  addingToCalendar: string | null
  
  // Completion Modal
  completionModal: {
    isOpen: boolean
    task: TaskRecord | null
  }
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
  | { type: 'OPEN_FORM_PANEL'; payload?: TaskRecord }
  | { type: 'CLOSE_FORM_PANEL' }
  | { type: 'SET_SELECTED_STATUS'; payload: string }
  | { type: 'SET_SELECTED_QUADRANT'; payload: string }
  | { type: 'SET_SELECTED_PLAN_FILTER'; payload: string }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'SET_CURRENT_MONTH'; payload: Date }
  | { type: 'SET_RUNNING_TASKS'; payload: Set<string> }
  | { type: 'SET_UPDATING_TIMER'; payload: string | null }
  | { type: 'SET_ADDING_TO_CALENDAR'; payload: string | null }
  | { type: 'OPEN_COMPLETION_MODAL'; payload: TaskRecord }
  | { type: 'CLOSE_COMPLETION_MODAL' }
  | { type: 'RESET_STATE' }

// Initial state
const createInitialState = (): TaskState => ({
  tasks: [],
  statusOptions: [],
  priorityOptions: [],
  planOptions: [],
  loading: true,
  error: null,
  refreshing: false,
  formPanelOpen: false,
  editingTask: null,
  selectedStatus: 'all',
  selectedQuadrant: 'all',
  selectedPlanFilter: 'all',
  selectedDate: new Date().toISOString().split('T')[0],
  currentMonth: new Date(),
  runningTasks: new Set(),
  updatingTimer: null,
  addingToCalendar: null,
  completionModal: {
    isOpen: false,
    task: null
  }
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
    
    case 'SET_RUNNING_TASKS':
      return { ...state, runningTasks: action.payload }
    
    case 'SET_UPDATING_TIMER':
      return { ...state, updatingTimer: action.payload }
    
    case 'SET_ADDING_TO_CALENDAR':
      return { ...state, addingToCalendar: action.payload }
    
    case 'OPEN_COMPLETION_MODAL':
      return {
        ...state,
        completionModal: {
          isOpen: true,
          task: action.payload
        }
      }
    
    case 'CLOSE_COMPLETION_MODAL':
      return {
        ...state,
        completionModal: {
          isOpen: false,
          task: null
        }
      }
    
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
    
    setRunningTasks: useCallback((tasks: Set<string>) => 
      dispatch({ type: 'SET_RUNNING_TASKS', payload: tasks }), []),
    
    setUpdatingTimer: useCallback((taskId: string | null) => 
      dispatch({ type: 'SET_UPDATING_TIMER', payload: taskId }), []),
    
    setAddingToCalendar: useCallback((taskId: string | null) => 
      dispatch({ type: 'SET_ADDING_TO_CALENDAR', payload: taskId }), []),
    
    openCompletionModal: useCallback((task: TaskRecord) => 
      dispatch({ type: 'OPEN_COMPLETION_MODAL', payload: task }), []),
    
    closeCompletionModal: useCallback(() => 
      dispatch({ type: 'CLOSE_COMPLETION_MODAL' }), []),
    
    resetState: useCallback(() => 
      dispatch({ type: 'RESET_STATE' }), [])
  }
  
  return [state, actions] as const
}