# dsh-chat-export · 会话导出书签

One tool that generates a **bookmarklet**: drag to bookmarks bar, click on any chat page → auto-scrolls to trigger lazy loading, grabs the full conversation, downloads a txt + copies to clipboard, with a media-attachment inventory (images/audio/video/file links).

## 用法
①让AI跑 `chat_export`（可选传站点专用CSS选择器）→②拿到单行书签码→③浏览器新建书签粘贴→④打开聊天页点书签即导出。

## 定制
通用选择器自动试探 message/bubble/chat-item/dialog 等；某站抓不全时传该站选择器重新生成一条专属书签码。

## 安装
```
dsh plugin add github:xushilianzhuren/dsh-chat-export
```
MIT License.
