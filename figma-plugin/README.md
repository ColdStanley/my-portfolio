# Resume Builder Figma Plugin

## 安装步骤

1. 打开 Figma 桌面应用
2. 进入 Plugins → Development → Import plugin from manifest...
3. 选择 `manifest.json` 文件
4. 插件安装完成

## 使用流程

1. 在 Web 应用的 FigmaBuilder 中填写目标职位和各组期望能力信息
2. 点击"生成配置并复制到剪贴板"
3. 打开 Figma，确保有 Resume_Page 页面
4. 运行 Resume Builder 插件
5. 点击"读取剪贴板并更新模板"
6. 插件会自动更新模板内容
7. 在 Figma 中导出 PDF

## Figma 设置要求

- 页面名称：`Resume_Page`
- 文本图层名称：
  - `target_role` - Target Role
  - **A组 (1st Expected Capabilities):**
    - `A1` - 1st Expected Capabilities（自适应行高）
    - `A2` - Firm 1, `A3` - Description 1（自适应行高）
    - `A4` - Firm 2, `A5` - Description 2（自适应行高）
    - `A6` - Firm 3, `A7` - Description 3（自适应行高）
    - `A8` - Firm 4, `A9` - Description 4（自适应行高）
  - **B组 (2nd Expected Capabilities):**
    - `B1` - 2nd Expected Capabilities（自适应行高）
    - `B2` - Firm 1, `B3` - Description 1（自适应行高）
    - `B4` - Firm 2, `B5` - Description 2（自适应行高）
    - `B6` - Firm 3, `B7` - Description 3（自适应行高）
    - `B8` - Firm 4, `B9` - Description 4（自适应行高）
  - **C组 (3rd Expected Capabilities):**
    - `C1` - 3rd Expected Capabilities（自适应行高）
    - `C2` - Firm 1, `C3` - Description 1（自适应行高）
    - `C4` - Firm 2, `C5` - Description 2（自适应行高）
    - `C6` - Firm 3, `C7` - Description 3（自适应行高）
    - `C8` - Firm 4, `C9` - Description 4（自适应行高）
  - **D组 (4th Expected Capabilities):**
    - `D1` - 4th Expected Capabilities（自适应行高）
    - `D2` - Firm 1, `D3` - Description 1（自适应行高）
    - `D4` - Firm 2, `D5` - Description 2（自适应行高）
    - `D6` - Firm 3, `D7` - Description 3（自适应行高）
    - `D8` - Firm 4, `D9` - Description 4（自适应行高）

## 布局说明

插件的布局处理机制：

1. **固定位置布局**：
   - 所有图层使用固定位置，不会因其他图层隐藏而移动
   - 适合绝对定位或固定间距的设计

2. **智能布局调整**：
   - 空内容的图层会自动设置为不可见
   - 支持自适应行高的字段会根据内容调整高度
   - 插件会自动调整后续组的位置，避免因文本扩展造成的重叠
   - 组间距离会根据前面组的内容长度动态调整

3. **设计建议**：
   - 在设计时为每个字段预留足够空间
   - 长文本字段建议预留更多垂直空间
   - 可以使用分组来组织相关元素

## 文件结构

- `manifest.json` - 插件配置文件
- `ui.html` - 用户界面
- `code.js` - 插件核心逻辑