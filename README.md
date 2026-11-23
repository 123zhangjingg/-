# 冯扬的玫瑰礼物

张靖赠予冯扬的互动网页。打开礼盒后，粒子聚成花束，实体玫瑰从内层向外层展开。轻触花冠可放飞爱心，点背景会出现星光。信件支持逐字阅读、显示全文、重读和整段重播。

## 部署到 GitHub Pages

1. 将本站文件和文件夹放在目标仓库的 `main` 分支根目录。确认 `index.html` 和 `.nojekyll` 位于根目录。
2. 在仓库的 **Settings → Pages** 中选择 **Deploy from a branch**。
3. 选择 **main** 和 **/(root)**，点 **Save**。等待 Pages 发布完成。
4. 打开 Pages 设置中的 **Visit site** 核对网页，再把该网页链接发给收件人。

本站已经是静态发布产物。资源使用相对路径，页面切换不更改网址。GitHub Pages 可直接托管全部资源，无需安装依赖或运行构建命令。只在本地预览时，可从站点目录用任意 HTTP 静态文件服务打开。Pages 上的礼物内容可被知道网址的人访问。

[GitHub Pages 发布源文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 修改信件与姓名

在 `config.js` 编辑收发件人、信件段落和结语。`{recipient}` 与 `{sender}` 会替换成配置中的姓名。当前内置 `romantic` 主题和 `pink-rose` 花型。默认静音。若添加已获授权的音轨，将音频放在站点目录中，填写相对路径 `musicSource` 并启用 `musicEnabled`。播放请求由打开礼物的操作发起。

## 资源与许可证

- 原作 **Particle-bouquet** 的七层程序化花瓣采样、枝叶和丝带、GLSL 聚合和微光保留在 `effects/particle-bouquet.js` 中。本站调整了配色和采样量，并用独立网格动画表现实体玫瑰展开。原始 MIT LICENSE 保留在站点根目录。 [上游源码及提交](https://github.com/zhouchaofei/Particle-bouquet/tree/98bbffbac946096650d7750c1ea72a863a77db8e)
- Three.js 0.160.1 随站内置，许可证见 `vendor/three-LICENSE`。
- 标题字体使用 Noto Serif SC 子集，许可证见 `assets/Noto-Serif-SC-OFL.txt`。新增字形可由系统中文字体补齐。

