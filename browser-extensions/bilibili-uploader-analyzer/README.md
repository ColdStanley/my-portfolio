# Bilibili Video Data Extractor Chrome Extension

## 功能说明
从Bilibili UP主页面提取视频数据，配合网站的插件版本使用。

## 安装步骤

1. **打开Chrome扩展程序页面**
   - 在Chrome地址栏输入：`chrome://extensions/`
   - 或者：菜单 → 更多工具 → 扩展程序

2. **启用开发者模式**
   - 打开右上角的"开发者模式"开关

3. **加载扩展程序**
   - 点击"加载已解压的扩展程序"
   - 选择 `bilibili-extractor-plugin` 文件夹

4. **确认安装**
   - 扩展程序列表中出现 "Bilibili Video Data Extractor"
   - 浏览器工具栏出现插件图标

## 使用方法

1. **访问B站UP主页面**
   ```
   例如：https://space.bilibili.com/197456791
   ```

2. **等待页面完全加载**
   - 确保视频列表已显示

3. **点击插件图标**
   - 在弹出窗口中点击"提取当前页面数据"

4. **复制数据**
   - 提取成功后，点击"复制到剪贴板"

5. **粘贴到网站**
   - 访问 `localhost:3000/bilibili/test`
   - 点击"插件版本"标签页
   - 将数据粘贴到文本框并点击"解析数据"

## 数据格式

```json
{
  "uploader": "UP主名称",
  "videos": [
    {
      "title": "视频标题",
      "author": "UP主名称", 
      "views": "播放量",
      "publishTime": "发布时间",
      "duration": "视频时长",
      "url": "视频链接"
    }
  ],
  "totalVideos": 25,
  "extractTime": "2024-01-01T00:00:00.000Z",
  "pageUrl": "当前页面URL"
}
```

## 故障排除

**插件无法提取数据**：
- 确保在B站UP主页面使用
- 等待页面完全加载后再操作
- 刷新页面重试

**数据不完整**：
- B站页面结构可能发生变化
- 查看浏览器控制台错误信息

**权限问题**：
- 确保插件已正确安装
- 检查是否启用了插件