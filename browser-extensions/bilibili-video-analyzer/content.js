// Content script for Bilibili Single Video Data Extractor
// This script runs on Bilibili video pages

console.log('Bilibili Single Video Extractor Content Script Loaded');

// 监听页面加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSingleVideoExtractor);
} else {
    initSingleVideoExtractor();
}

function initSingleVideoExtractor() {
    console.log('Bilibili Single Video Extractor initialized on:', window.location.href);
    
    // 等待页面动态内容加载完成
    waitForVideoData();
}

function waitForVideoData() {
    // 等待视频页面关键元素加载
    const checkInterval = setInterval(() => {
        const titleElement = document.querySelector('h1[data-title]') || document.querySelector('h1');
        const metaElement = document.querySelector('meta[name="description"]');
        
        if (titleElement && metaElement) {
            console.log('检测到视频页面数据已加载');
            console.log('视频标题:', titleElement.textContent?.trim());
            console.log('Meta描述存在:', !!metaElement.getAttribute('content'));
            clearInterval(checkInterval);
        }
    }, 1000);

    // 10秒后停止检查
    setTimeout(() => {
        clearInterval(checkInterval);
        console.log('视频数据检查超时');
    }, 10000);
}

// 监听来自popup的消息（备用方案）
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'extractSingleVideoData') {
            try {
                // 这里可以调用数据提取函数
                sendResponse({ success: true, message: '请使用插件弹窗进行数据提取' });
            } catch (error) {
                sendResponse({ success: false, error: error.message });
            }
        }
    });
}