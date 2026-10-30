/**
 * dsh-chat-export · 会话导出书签（Host插件·零依赖）
 * 把"网页会话全量导出成txt"做成一条可复制的书签码（bookmarklet）：
 * 自动滚顶+滚底触发懒加载→抓消息节点→附媒体附件清单→下载txt+复制剪贴板。
 * 工具: chat_export(取书签码+使用说明·按站点自定义选择器)。
 */
export const name = 'chat-export'
export const inject = ['tools']
const DEFAULTS = { enabled: true, tool: true, selectors: '' }

function norm(c) { const r = c ?? {}; return { enabled: r.enabled !== false, tool: r.tool !== false, selectors: typeof r.selectors === 'string' ? r.selectors.trim() : '' } }

function bookmarklet(extraSelectors) {
  const sel = extraSelectors ? JSON.stringify(extraSelectors) : 'null'
  return 'javascript:' + `(async function(){const wait=ms=>new Promise(r=>setTimeout(r,ms));async function autoScroll(){let sc=null,max=0;document.querySelectorAll('*').forEach(el=>{if(el.scrollHeight>el.clientHeight+200&&getComputedStyle(el).overflowY!=='visible'){if(el.scrollHeight>max){max=el.scrollHeight;sc=el;}}});if(!sc){await wait(500);return;}let last=-1,stable=0;for(let i=0;i<60;i++){sc.scrollTop=0;await wait(900);if(sc.scrollTop===0&&sc.scrollHeight===last){stable++;if(stable>=3)break;}else{stable=0;last=sc.scrollHeight;}}last=-1;stable=0;for(let i=0;i<60;i++){sc.scrollTop=sc.scrollHeight;await wait(900);if(sc.scrollHeight===last){stable++;if(stable>=3)break;}else{stable=0;last=sc.scrollHeight;}}sc.scrollTop=0;await wait(600);}await autoScroll();const EXTRA=${sel};const CAND=[...(EXTRA||[]),'[class*="message"]','[class*="Message"]','[class*="bubble"]','[class*="chat-item"]','[class*="conversation"] [class*="item"]','[class*="qa"]','[class*="dialog"]'];let nodes=[];for(const s of CAND){try{const n=document.querySelectorAll(s);if(n.length>nodes.length)nodes=n;}catch(e){}}let text='';if(nodes.length>=2){text=[...nodes].map(n=>n.innerText.trim()).filter(t=>t).join('\\n\\n─────\\n\\n');}if(text.length<200){text=(document.querySelector('[class*="scroll"],main,#root')||document.body).innerText;}let media=['\\n【媒体附件清单】'];document.querySelectorAll('img[src]').forEach(i=>{if(i.src&&!i.src.startsWith('data:')&&i.getBoundingClientRect().width>60)media.push('[IMG] '+i.src);});document.querySelectorAll('audio[src],audio source[src]').forEach(a=>media.push('[AUDIO] '+(a.src||a.getAttribute('src'))));document.querySelectorAll('video source[src],video[src]').forEach(v=>media.push('[VIDEO] '+(v.src||v.getAttribute('src'))));document.querySelectorAll('a[href]').forEach(a=>{const h=a.href||'';if(/\\.(apk|zip|jar|java|kt|py|js|txt|md|json|mp3|mp4|wav)(\\?|$)/i.test(h)&&!h.startsWith('javascript'))media.push('[FILE] '+h);});if(media.length===1)media.push('(本页无外链媒体)');text+='\\n'+media.join('\\n');const head='【会话全量导出】'+new Date().toLocaleString()+' 页面:'+document.title+'\\n\\n';const full=head+text;const b=new Blob([full],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='chat-export.txt';document.body.appendChild(a);a.click();setTimeout(function(){a.remove();URL.revokeObjectURL(a.href)},3000);try{navigator.clipboard.writeText(full);}catch(e){}alert('已导出全文'+full.length+'字·txt在下载目录·剪贴板同步');})();`
}

export default function plugin(ctx) {
  const cfg = norm(ctx.config)
  if (!cfg.enabled) return
  ctx.registerTool?.({
    name: 'chat_export',
    description: '生成"网页会话导出书签码"（bookmarklet）：拖到浏览器书签栏，点一下即自动滚动加载全对话→下载txt+复制剪贴板。附媒体附件清单（图/音/视/文件链接）。',
    parameters: {
      type: 'object',
      properties: {
        selectors: { type: 'string', description: '可选：站点专用消息节点的CSS选择器（逗号分隔），不填用通用选择器' },
      },
      additionalProperties: false,
    },
    output: { schema: { type: 'object', properties: { report: { type: 'string' } }, required: ['report'], additionalProperties: false } },
    execute: async (args) => {
      try {
        const extra = (args?.selectors ?? '').split(',').map(s => s.trim()).filter(Boolean)
        const code = bookmarklet(extra.length ? extra : null)
        return { report: [
          '【会话导出书签码】',
          '',
          '用法三步：',
          '  ① 浏览器新建书签，名称随意（如"导出会话"），网址栏粘贴下面整段代码',
          '  ② 打开目标聊天网页（滚到会话顶部）',
          '  ③ 点书签——自动滚顶+滚底触发懒加载→下载txt+复制全文',
          '',
          '书签码（单行·全选复制）：',
          code,
          '',
          '说明：兼容多数聊天页（message/bubble/chat-item等通用选择器自动试探）；导出含媒体附件URL清单；'
          + (extra.length ? '已按你给的选择器定制：' + extra.join(', ') : '某站抓不全会用其专用选择器再生成一条。'),
        ].join('\n') }
      } catch (error) {
        return { report: 'chat-export 内部错：' + String(error?.message ?? error).slice(0, 160) }
      }
    },
  })
  ctx.logger?.info?.('dsh-chat-export: registered')
}
