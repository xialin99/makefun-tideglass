# 潮汐之镜 / TIDEGLASS

[在线使用 / Open in browser](https://xialin99.github.io/makefun-tideglass/)

[中文](#中文) · [English](#english)

![Preview](screenshots/1-turbine-hall.jpg)

## 中文

### 第一次使用

1. 用有键盘的浏览器[打开游戏](https://xialin99.github.io/makefun-tideglass/)，从观测站开始。
2. 用 **WASD** 或方向键移动，按住 **Shift** 蹲行。走近录音设备按 **E** 拾取。
3. 拿齐两份录音后往潮汐闸走，在出口按 **E** 撤离。完成后可以进入下一关。被发现时可按 **R** 重来。

潮汐观测站潜行游戏。两关均有巡逻守卫、视野遮挡和可恢复的警觉。第二关可在照明继电器和绕行路线之间选择。

### 本地运行

在项目根目录运行 `node serve.ts`，用桌面浏览器打开 `http://localhost:8080`。WASD 或方向键移动，Shift 蹲行，E 互动，鼠标点击或 Q 投掷。

页面默认显示简体中文，可以在界面选择 English。

命令行提示默认显示中文。设置 `MAKEFUN_UI_LANG=en` 可显示英文。

## English

### First use

1. [Open the game](https://xialin99.github.io/makefun-tideglass/) on a device with a keyboard. Start at the observatory.
2. Move with **WASD** or the arrows. Hold **Shift** to crouch. Approach a recorder and press **E**.
3. After collecting both recordings, press **E** at the tide-gate exit to unlock the next mission. Press **R** to restart if caught.

A two-mission stealth game set in a coastal observatory. Use cover and sound distractions, then choose the turbine hall’s dimmed crossover or lit bypass.

### Run locally

Run `node serve.ts` from the repository root and open `http://localhost:8080` in a desktop browser. Move with WASD or arrows, hold Shift to crouch, use E to interact, and click or press Q to throw.

The interface opens in Simplified Chinese. Use the language menu to switch to English.

Set `MAKEFUN_UI_LANG=en` for English terminal messages.

[中文技术说明](README.details.zh.md) · [English technical notes](README.details.md)

[make.fun 赛事 / Original bounty](https://make.fun/bounty/best-stealth-game-20261121-1759)

## 许可证 / License

MIT. See [LICENSE](LICENSE).

赛事模板组件的授权见 [LICENSE-makefun.txt](LICENSE-makefun.txt)。

Kit components are covered by [LICENSE-makefun.txt](LICENSE-makefun.txt).

