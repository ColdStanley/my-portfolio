figma.showUI(__html__, { width: 400, height: 350 });

figma.ui.onmessage = (msg) => {
  if (msg.type === 'clipboard-data') {
    processClipboardData(msg.data);
  } else if (msg.type === 'close-plugin') {
    figma.closePlugin();
  }
};


async function processClipboardData(clipboardText) {
  try {
    let config;
    try {
      config = JSON.parse(clipboardText);
    } catch (e) {
      figma.ui.postMessage({
        type: 'process-error',
        message: '剪贴板内容不是有效的 JSON 格式'
      });
      return;
    }
    
    if (!config.target_role) {
      figma.ui.postMessage({
        type: 'process-error',
        message: 'JSON 配置缺少必要字段 target_role'
      });
      return;
    }
    
    // 首先检查当前页面是否就是 Resume_Page
    let resumePage = null;
    if (figma.currentPage.name === 'Resume_Page') {
      resumePage = figma.currentPage;
    } else {
      // 如果不是，则在所有页面中查找
      resumePage = figma.root.findOne(node => node.type === 'PAGE' && node.name === 'Resume_Page');
    }
    
    if (!resumePage) {
      figma.ui.postMessage({
        type: 'process-error',
        message: '未找到 Resume_Page 页面，请确保页面名称正确'
      });
      return;
    }
    
    const textNodes = [];
    function findTextNodes(node) {
      if (node.type === 'TEXT') {
        textNodes.push(node);
      }
      if ('children' in node) {
        for (const child of node.children) {
          findTextNodes(child);
        }
      }
    }
    
    findTextNodes(resumePage);
    
    // 处理所有文本节点
    for (const textNode of textNodes) {
      const fieldName = textNode.name;
      if (config.hasOwnProperty(fieldName)) {
        const content = config[fieldName].trim();
        
        if (content) {
          // 有内容：显示并填充
          textNode.visible = true;
          await figma.loadFontAsync(textNode.fontName);
          textNode.characters = content;
          
          // 自适应行高
          if (fieldName === 'A1' || fieldName === 'A3' || fieldName === 'A5' || fieldName === 'A7' || fieldName === 'A9' ||
              fieldName === 'B1' || fieldName === 'B3' || fieldName === 'B5' || fieldName === 'B7' || fieldName === 'B9' ||
              fieldName === 'C1' || fieldName === 'C3' || fieldName === 'C5' || fieldName === 'C7' || fieldName === 'C9' ||
              fieldName === 'D1' || fieldName === 'D3' || fieldName === 'D5' || fieldName === 'D7' || fieldName === 'D9') {
            textNode.textAutoResize = 'HEIGHT';
          }
        } else {
          // 无内容：隐藏图层
          textNode.visible = false;
        }
      }
    }
    
    // 处理组级别隐藏和位置调整
    const groups = ['A', 'B', 'C', 'D'];
    const groupContainers = [];
    const originalPositions = [];
    let cumulativeOffset = 0;
    
    // 首先收集所有组容器和原始位置
    for (const group of groups) {
      const groupContainer = resumePage.findOne(node => 
        (node.type === 'FRAME' || node.type === 'GROUP') && 
        node.name.toLowerCase().includes(group.toLowerCase() + '_group')
      );
      
      if (groupContainer) {
        groupContainers.push(groupContainer);
        originalPositions.push(groupContainer.y);
      } else {
        groupContainers.push(null);
        originalPositions.push(0);
      }
    }
    
    // 处理每个组的可见性和位置调整
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      const groupContainer = groupContainers[i];
      
      const groupFields = [
        config[`${group}1`], config[`${group}2`], config[`${group}3`],
        config[`${group}4`], config[`${group}5`], config[`${group}6`],
        config[`${group}7`], config[`${group}8`], config[`${group}9`]
      ];
      
      const hasContent = groupFields.some(field => field && field.trim());
      
      if (groupContainer) {
        groupContainer.visible = hasContent;
        
        if (hasContent && i > 0) {
          // 调整当前组的位置，加上累积偏移
          groupContainer.y = originalPositions[i] + cumulativeOffset;
          
          // 计算当前组由于自动行高产生的额外高度
          const groupHeight = groupContainer.height;
          const originalGroupHeight = groupHeight; // 假设原始高度
          
          // 检查组内自动调整高度的文本节点
          let maxExpansion = 0;
          const autoResizeFields = [`${group}1`, `${group}3`, `${group}5`, `${group}7`, `${group}9`];
          
          for (const fieldName of autoResizeFields) {
            const textNode = resumePage.findOne(node => 
              node.type === 'TEXT' && node.name === fieldName
            );
            
            if (textNode && textNode.visible && config[fieldName] && config[fieldName].trim()) {
              // 计算文本扩展，使用更大的估算值以确保不重叠
              const contentLength = config[fieldName].length;
              const estimatedExtraHeight = Math.max(0, Math.floor((contentLength - 30) / 40) * 30);
              maxExpansion = Math.max(maxExpansion, estimatedExtraHeight);
            }
          }
          
          // 累积偏移量，为下一个组预留空间，并添加安全边距
          cumulativeOffset += maxExpansion + 40; // 额外40像素安全边距
        } else if (hasContent && i === 0) {
          // A组：计算扩展高度但不调整位置
          let maxExpansion = 0;
          const autoResizeFields = [`${group}1`, `${group}3`, `${group}5`, `${group}7`, `${group}9`];
          
          for (const fieldName of autoResizeFields) {
            const textNode = resumePage.findOne(node => 
              node.type === 'TEXT' && node.name === fieldName
            );
            
            if (textNode && textNode.visible && config[fieldName] && config[fieldName].trim()) {
              const contentLength = config[fieldName].length;
              const estimatedExtraHeight = Math.max(0, Math.floor((contentLength - 30) / 40) * 30);
              maxExpansion = Math.max(maxExpansion, estimatedExtraHeight);
            }
          }
          
          cumulativeOffset += maxExpansion + 40; // 额外40像素安全边距
        }
      }
    }
    
    figma.ui.postMessage({
      type: 'process-complete'
    });
    
  } catch (error) {
    figma.ui.postMessage({
      type: 'process-error',
      message: '处理失败: ' + error.message
    });
  }
}