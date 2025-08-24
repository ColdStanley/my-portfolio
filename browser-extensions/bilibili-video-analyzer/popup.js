document.addEventListener("DOMContentLoaded", () => {
  const extractBtn = document.getElementById("extractBtn");
  const copyBtn = document.getElementById("copyBtn");
  const output = document.getElementById("output");
  const status = document.getElementById("status");

  // 检查当前页面是否为B站视频页面
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentUrl = tabs[0].url;
    if (!currentUrl.includes('bilibili.com/video/')) {
      showStatus('请在B站视频页面使用此插件', 'error');
      extractBtn.disabled = true;
      return;
    }
  });

  extractBtn.addEventListener("click", async () => {
    showStatus('正在提取数据...', 'loading');
    extractBtn.disabled = true;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractSingleVideoData
      });

      const data = results[0].result;
      if (data.error) {
        showStatus('提取失败: ' + data.error, 'error');
        output.textContent = JSON.stringify(data, null, 2);
      } else {
        showStatus(`成功提取视频《${data.title}》的详细数据`, 'success');
        output.textContent = JSON.stringify(data, null, 2);
      }
    } catch (err) {
      console.error("脚本执行出错:", err);
      showStatus('提取失败: ' + err.message, 'error');
      output.textContent = "提取失败: " + err.message;
    }

    extractBtn.disabled = false;
  });

  // 复制按钮逻辑
  copyBtn.addEventListener("click", () => {
    const text = output.textContent;
    if (!text || text.startsWith("点击") || text.startsWith("提取失败")) {
      alert("没有可复制的数据！");
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      showStatus('JSON已复制到剪贴板！', 'success');
    }).catch(err => {
      showStatus('复制失败: ' + err.message, 'error');
    });
  });

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    
    if (type === 'success') {
      setTimeout(() => {
        status.style.display = 'none';
      }, 3000);
    }
  }
});

// ============ 主要数据提取函数 ============
function extractSingleVideoData() {
  console.log('开始单视频数据提取...');

  try {
    // 获取视频基本信息
    const title = document.querySelector('h1[data-title]')?.getAttribute('data-title') ||
                 document.querySelector('h1')?.textContent?.trim() ||
                 document.title.split('_哔哩哔哩')[0] ||
                 '未知标题';

    // 获取作者信息
    const author = document.querySelector('.username')?.textContent?.trim() ||
                  document.querySelector('[class*="username"]')?.textContent?.trim() ||
                  '未知作者';

    // 获取视频链接
    const videoUrl = window.location.href.split('?')[0]; // 移除参数部分

    // 提取meta description中的详细数据
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    console.log('Meta描述内容:', metaDescription);

    // 解析详细互动数据 - 内联函数定义
    function parseDetailedStats(description) {
      console.log('开始解析详细统计数据:', description);
      
      const stats = {
        views: '0',           // 播放量
        danmaku: '0',         // 弹幕量
        likes: '0',           // 点赞数
        coins: '0',           // 投币数
        collections: '0',     // 收藏数
        shares: '0'           // 转发数
      };

      if (!description) return stats;

      try {
        // 使用正则表达式提取各种数据
        // 播放量: "视频播放量 189338"
        const viewsMatch = description.match(/视频播放量\s*(\d+)/);
        if (viewsMatch) stats.views = viewsMatch[1];

        // 弹幕量: "弹幕量 408"  
        const danmakuMatch = description.match(/弹幕量\s*(\d+)/);
        if (danmakuMatch) stats.danmaku = danmakuMatch[1];

        // 点赞数: "点赞数 7299"
        const likesMatch = description.match(/点赞数\s*(\d+)/);
        if (likesMatch) stats.likes = likesMatch[1];

        // 投币数: "投硬币枚数 3981"
        const coinsMatch = description.match(/投硬币枚数\s*(\d+)/);
        if (coinsMatch) stats.coins = coinsMatch[1];

        // 收藏数: "收藏人数 6141"
        const collectionsMatch = description.match(/收藏人数\s*(\d+)/);
        if (collectionsMatch) stats.collections = collectionsMatch[1];

        // 转发数: "转发人数 419"
        const sharesMatch = description.match(/转发人数\s*(\d+)/);
        if (sharesMatch) stats.shares = sharesMatch[1];

        console.log('解析得到的统计数据:', stats);
        return stats;

      } catch (error) {
        console.warn('解析详细统计数据失败:', error);
        return stats;
      }
    }

    const detailData = parseDetailedStats(metaDescription);

    // 获取视频时长（如果页面上有显示）
    const durationElement = document.querySelector('.cur-time') || 
                           document.querySelector('[class*="duration"]');
    const duration = durationElement?.textContent?.trim() || '未知时长';

    // 获取发布时间
    const publishTimeElement = document.querySelector('.pubdate-ip') ||
                              document.querySelector('[class*="pubdate"]') ||
                              document.querySelector('.video-data span');
    const publishTime = publishTimeElement?.textContent?.trim() || '未知时间';

    const result = {
      title,
      author,
      videoUrl,
      duration,
      publishTime,
      ...detailData, // 包含详细的互动数据
      extractTime: new Date().toISOString(),
      pageUrl: window.location.href,
      metaDescription: metaDescription // 保留原始meta信息用于调试
    };

    console.log('单视频提取结果:', result);
    return result;

  } catch (error) {
    console.error('单视频数据提取失败:', error);
    return {
      error: error.message,
      title: '提取失败',
      author: '未知',
      videoUrl: window.location.href,
      extractTime: new Date().toISOString()
    };
  }
}