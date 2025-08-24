// Content script for Bilibili Video Data Extractor
// This script runs on Bilibili space pages

console.log('Bilibili Extractor Content Script Loaded');

// 监听页面加载完成
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initExtractor);
} else {
    initExtractor();
}

function initExtractor() {
    console.log('Bilibili Extractor initialized on:', window.location.href);
    
    // 可以在这里添加页面加载完成后的处理逻辑
    // 比如等待动态内容加载
    
    // 等待视频列表加载
    waitForVideoList();
}

function waitForVideoList() {
    // 等待视频列表元素出现
    const checkInterval = setInterval(() => {
        const videoElements = document.querySelectorAll('.small-item, .list-item, .video-item');
        if (videoElements.length > 0) {
            console.log('检测到视频列表，共', videoElements.length, '个元素');
            clearInterval(checkInterval);
        }
    }, 1000);

    // 10秒后停止检查
    setTimeout(() => {
        clearInterval(checkInterval);
    }, 10000);
}

// 监听来自popup的消息
chrome.runtime.onMessage?.addListener((request, sender, sendResponse) => {
    if (request.action === 'extractData') {
        const data = extractBilibiliData();
        sendResponse(data);
    }
});

// 提取数据的备用函数（如果从popup调用失败）
function extractBilibiliData() {
    // 这个函数与popup.js中的相同
    // 作为备用方案
    return {
        message: '请使用插件弹窗中的提取按钮'
    };
}