# Vispie Challenge

Vispie Takehome Challenge

<video width="320" height="240" controls>
  <source src="https://pub-225a0548ff534e5c94a1c2c3707a2237.r2.dev/vispie.min.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## 安装

 确保系统安装了如下环境

 * node v18.17+

如果在中国大陆运行，可能还需要按照

* Deno 最新版，用于在代理下请求 LLM 接口

然后在项目根目录安装依赖

```
npm install .
```

## 运行

使用如下方式运行环境

1. 运行 Deno 代理服务，需要保证该 Terminal Session 下 HTTP(S)_PROXY 可用

```
npm run proxy
```

2. 运行 Next.js 应用

```bash
npm run dev
```

3. 在浏览器中访问 [http://localhost:3000](http://localhost:3000)


## 实现的主要功能

* 支持开始、HTTP 请求、LLM 调用、结束四种节点
* 节点和边的增加、删除。（增加节点的方式目前是拖动式，可以优化成和 Dify 类似，点击后再拖放；Dify 具备的指针模式和手型模式两种，但 Figma 的交互方式会更友，可以改为双指拖动，让两种模式合并）
* 节点属性的修改
* 节点运行
* 实时预览结果
* 每个节点的运行状态追溯
* Workflow 工程的保存和加载
* 历史操作前进、后退

## 项目说明

* 使用了 Next.js 框架搭建了全栈应用
* 使用了 Radix Themes 3.0 作为 UI 框架，Radix UI 具备良好的可扩展性和主题定制能力
* 使用 Tailwind 作为 CSS 框架
* 使用 jotai 作为状态管理框架
* 使用 ReactFlow 实现可视化节点编辑器
* 从 Dify 开源仓库拷贝了图标代码和部分 UI
