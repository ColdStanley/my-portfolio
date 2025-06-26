// Hook 用于管理 topic 和 difficulty 的本地筛选状态
export function useFrenotesFilter() {
  return {
    topic: null,
    difficulty: null,
    setTopic: () => {},
    setDifficulty: () => {},
  }
}
