// 统一动画配置
// 所有 Tooltip/Modal/Tab 必须使用这些动画规范

export const ANIMATIONS = {
  // 淡入淡出 + 轻微缩放（用于 Modal/Tooltip）
  fadeIn: {
    initial: { opacity: 0, scale: 0.96, y: -4 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: -4 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] } // cubic-bezier 细腻曲线
  },

  // 背景遮罩淡入
  modalBackdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  },

  // 组件切换（用于 ArticleInput → ArticleReader、Tab 切换）
  contentSwitch: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
  }
} as const
