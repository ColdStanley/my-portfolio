document.addEventListener("DOMContentLoaded", () => {
  const extractBtn = document.getElementById("extractBtn");
  const copyBtn = document.getElementById("copyBtn");
  const output = document.getElementById("output");
  const status = document.getElementById("status");

  // 检查当前页面是否为B站UP主页面
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentUrl = tabs[0].url;
    if (!currentUrl.includes("space.bilibili.com")) {
      showStatus("请在B站UP主页面使用此插件", "error");
      extractBtn.disabled = true;
      return;
    }
  });

  extractBtn.addEventListener("click", async () => {
    showStatus("正在提取数据...", "loading");
    extractBtn.disabled = true;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractBilibiliData,
      });

      const data = results[0].result;
      if (data.error) {
        showStatus("提取失败: " + data.error, "error");
        output.textContent = JSON.stringify(data, null, 2);
      } else {
        showStatus(`成功提取 ${data.videos.length} 个视频数据`, "success");
        output.textContent = JSON.stringify(data, null, 2);
      }
    } catch (err) {
      console.error("脚本执行出错:", err);
      showStatus("提取失败: " + err.message, "error");
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
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showStatus("JSON已复制到剪贴板！", "success");
      })
      .catch((err) => {
        showStatus("复制失败: " + err.message, "error");
      });
  });

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = "block";

    if (type === "success") {
      setTimeout(() => {
        status.style.display = "none";
      }, 3000);
    }
  }
});

// ============ 主函数 ============
function extractBilibiliData() {
  // 内部定义 parseStats，拆分播放量、弹幕数、时长
  function parseStats(statsText) {
    if (!statsText) return { views: "0", danmaku: "0", duration: "0:00" };
    try {
      const durationMatch = statsText.match(/(\d{1,2}:\d{2})$/);
      const duration = durationMatch ? durationMatch[1] : "0:00";

      const withoutDuration = statsText.replace(/\d{1,2}:\d{2}$/, "");
      const viewsMatch = withoutDuration.match(/^([0-9.万千]+)/);
      const views = viewsMatch ? viewsMatch[1] : "0";

      const remainingAfterViews = withoutDuration.replace(/^[0-9.万千]+/, "");
      const danmakuMatch = remainingAfterViews.match(/(\d+)/);
      const danmaku = danmakuMatch ? danmakuMatch[1] : "0";

      return { views, danmaku, duration };
    } catch (e) {
      return { views: "0", danmaku: "0", duration: "0:00" };
    }
  }

  console.log("开始数据提取...");

  // ✅ UP主名称
  const uploader =
    document.querySelector(".nickname")?.textContent?.trim() ||
    document.querySelector('[class*="name"]')?.textContent?.trim() ||
    (document.title.includes("的个人空间")
      ? document.title.split("的个人空间")[0].trim()
      : "未知UP主");

  // ✅ UP主主页统计信息
  const following = document.body.innerText.match(/关注数\s*([\d.万]+)/)?.[1] || "未知";
  const followers = document.body.innerText.match(/粉丝数\s*([\d.万]+)/)?.[1] || "未知";
  const likes = document.body.innerText.match(/获赞数\s*([\d.万]+)/)?.[1] || "未知";
  const totalPlays = document.body.innerText.match(/播放数\s*([\d.万]+)/)?.[1] || "未知";
  const charging = document.body.innerText.match(/(\d+)人充电/)?.[1] || "0";
  const certification =
    document.body.innerText.match(/bilibili\s+(.+?UP主)/)?.[1] || "无认证";

  // ✅ 只在投稿区抓取视频
  const allCards = document.querySelectorAll(".video-section .bili-video-card");
  const videos = [];

  console.log(`找到 ${allCards.length} 个投稿区视频卡片，开始提取...`);

  allCards.forEach((card, index) => {
    try {
      const title =
        card.querySelector(".bili-video-card__title")?.textContent?.trim() ||
        "未知标题";

      const statsText =
        card.querySelector('[class*="stats"]')?.textContent?.trim() || "";

      const { views, danmaku, duration } = parseStats(statsText);

      const linkElement = card.querySelector('a[href*="/video/"]');
      const link = linkElement?.href || "未知链接";

      const publishTime =
        card.querySelector('[class*="time"], [class*="date"]')?.textContent?.trim() ||
        "未知时间";

      console.log(`✅ 添加投稿视频 ${videos.length + 1}: ${title}`);
      videos.push({ title, views, danmaku, duration, link, publishTime });
    } catch (err) {
      console.error(`解析第${index + 1}个视频时出错:`, err);
    }
  });

  console.log(`提取完成: 共 ${videos.length} 个投稿视频`);

  const result = {
    uploader,
    stats: {
      following,
      followers,
      likes,
      totalPlays,
      charging,
      certification,
    },
    videos,
    totalVideos: videos.length,
    extractTime: new Date().toISOString(),
    pageUrl: window.location.href,
  };

  console.log("最终提取结果:", result);
  return result;
}
