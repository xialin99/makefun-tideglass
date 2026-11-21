const messages = {
  "WEST ARCADE": "西拱廊",
  "MERIDIAN WALK": "子午线步道",
  "SERVICE CATWALK": "检修栈道",
  "GATE APPROACH": "水闸入口",
  "AZIMUTH": "方位角",
  "LENS": "镜头",
  "DIM ZONE · SHORTER VISION": "昏暗区域 · 视线较短",
  "SECTION LIGHTING": "区域照明",
  "LIGHT RELAY": "照明继电器",
  "RELAY SPENT": "继电器已用",
  "DIM + NOISE · E": "减光并制造声响 · E",
  "RECOVERED": "已取得",
  "RECORDING · E": "录音 · E",
  "ESCAPE LADDER / EXIT": "逃生梯 / 出口",
  "TIDE GATE / EXIT": "潮汐闸 / 出口",
  "READY · E": "可撤离 · E",
  "NEEDS READOUT": "需要读数",
  "NEEDS BOTH LOGS": "需要两份录音",
  "SKIFF ↘": "小艇 ↘",
  "LOW": "蹲伏",
  "YOU": "你",
  "TIDEGLASS": "潮汐之镜",
  "TIDEGLASS · Bellwether Observatory": "潮汐之镜 · 贝尔韦瑟观测站",
  "BELLWETHER OBSERVATORY": "贝尔韦瑟观测站",
  "FLOODGATE TURBINE HALL": "水闸涡轮大厅",
  "TIDE LOG": "潮汐记录",
  "GATE ORDER": "水闸指令",
  "GATE RELAY": "水闸继电器",
  "READOUT · E": "读取 · E",
  "Top-down map of Bellwether Observatory": "贝尔韦瑟观测站俯视地图",
  "Guard suspicion": "守卫警觉度",
  "RECORDINGS 0 / 2": "录音 0 / 2",
  "Recover both logs. Extract at the tide gate.": "找回两份录音，再从潮汐闸撤离。",
  "UNSEEN": "未被发现",
  "IN SIGHT": "进入视线",
  "SEARCHING": "正在搜查",
  "ALARM": "警报",
  "EXTRACTED": "已撤离",
  "WASD / ARROWS": "WASD / 方向键",
  "Move": "移动",
  "Crouch": "蹲行",
  "Recover / exit": "拾取 / 撤离",
  "CLICK / Q": "点击 / Q",
  "Toss": "投掷",
  "Missions": "任务",
  "1 · Observatory": "1 · 观测站",
  "1 · Observatory ✓": "1 · 观测站 ✓",
  "2 · Hall locked": "2 · 大厅尚未解锁",
  "2 · Hall ✓": "2 · 大厅 ✓",
  "2 · Turbine hall": "2 · 涡轮大厅",
  "M · Sound on": "M · 开启声音",
  "M · Sound off": "M · 关闭声音",
  "R · Restart": "R · 重开",
  "BELLWETHER / FIELD REPORT": "贝尔韦瑟 / 行动报告",
  "R · Run again": "R · 再试一次",
  "2 · Enter turbine hall": "2 · 进入涡轮大厅",
  "Aim at clear floor within the dashed line.": "请瞄准虚线范围内的空地。",
  "The gate stays shut": "水闸保持关闭",
  "Signal ashore": "信号已传至岸上",
  "Gate sealed": "水闸封锁",
  "The relay readout names the override crew. The harbor pilot has the evidence and has ordered the gate closed before the morning tide.": "继电器读数揭示了强制开闸的人。港口引航员拿到了证据，并下令在晨潮前关闭水闸。",
  "Both recordings are ashore. They prove the floodgate was opened deliberately. The harbor pilot wants the relay readout before the next tide.": "两份录音已送到岸上，证明有人故意打开水闸。港口引航员希望你在下一次涨潮前取到继电器读数。",
  "The watch saw you and dropped the flood barrier. Break line of sight behind masonry when the beam turns pink.": "守卫发现了你并放下防洪闸。光束变成粉色时，请躲到石墙后切断视线。",
  "The relay has already tripped.": "继电器已经触发。",
  "Readout secured. Head to the escape ladder.": "已取得读数，前往逃生梯。",
  "Both logs secured. Head to the tide gate.": "两份录音已取得，前往潮汐闸。",
  "Recover the relay readout first.": "先取得继电器读数。",
  "The skiff is waiting for both recordings.": "带齐两份录音才能乘小艇撤离。",
  "Reach the escape ladder.": "前往逃生梯。",
  "Dim zone limits guard sight. The relay drew attention.": "昏暗区域会降低守卫的视野，继电器已经引起了注意。",
  "Copy the gate readout. Use the relay or take the bypass.": "复制水闸读数。可以使用继电器，也可以绕行。",
  "Both logs secured · reach the tide gate.": "录音已齐全 · 前往潮汐闸。",
  "READOUT": "读数",
  "RECORDINGS": "录音",
  "DIM": "减光"
};
const storageKey = "makefun-tideglass.language";
let currentLanguage = 'zh';
try { if (localStorage.getItem(storageKey) === 'en') currentLanguage = 'en'; } catch {}
window.uiLanguage = currentLanguage;
window.t = text => window.uiLanguage === 'zh' ? messages[text] ?? text : text;
const original = [];
const title = document.title;
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
for (let node; (node = walker.nextNode());) {
  if (node.parentElement.closest('script, style, #language')) continue;
  if (Object.hasOwn(messages, node.nodeValue.trim())) original.push([node, node.nodeValue]);
}
const attributes = [...document.querySelectorAll('[aria-label], [placeholder], [title]')].flatMap(el =>
  ['aria-label', 'placeholder', 'title'].filter(name => el.hasAttribute(name)).map(name => [el, name, el.getAttribute(name)]));
const language = document.getElementById('language');
function refresh() {
  document.documentElement.lang = window.uiLanguage === 'zh' ? 'zh-CN' : 'en';
  document.title = t(title);
  language.value = window.uiLanguage;
  for (const [node, text] of original) {
    node.nodeValue = text.replace(text.trim(), t(text.trim()));
  }
  for (const [el, name, value] of attributes) el.setAttribute(name, t(value));
}
language.addEventListener('change', () => {
  window.uiLanguage = language.value === 'en' ? 'en' : 'zh';
  try { localStorage.setItem(storageKey, window.uiLanguage); } catch {}
  refresh();
  window.dispatchEvent(new Event('ui-language-change'));
});
refresh();
