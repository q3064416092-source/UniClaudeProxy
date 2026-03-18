---
name: UniClaudeProxy 前端配置界面开发
overview: 为 UniClaudeProxy 开发一个轻量、现代、美观的前端配置界面，集成到现有 FastAPI 服务中，通过 /config 路由访问。采用纯 HTML/CSS/JavaScript 实现零依赖，重点关注工具调用类配置的详细展示和交互。
design:
  architecture:
    framework: react
    component: shadcn
  styleKeywords:
    - Modern Minimalist
    - Clean
    - Professional
    - Dark Mode Support
  fontSystem:
    fontFamily: Inter
    heading:
      size: 24px
      weight: 600
    subheading:
      size: 16px
      weight: 500
    body:
      size: 14px
      weight: 400
  colorSystem:
    primary:
      - "#2563EB"
      - "#1D4ED8"
      - "#1E40AF"
    background:
      - "#FFFFFF"
      - "#F9FAFB"
      - "#F3F4F6"
    text:
      - "#111827"
      - "#374151"
      - "#6B7280"
    functional:
      - "#10B981"
      - "#EF4444"
      - "#F59E0B"
todos:
  - id: backend-api
    content: 创建 FastAPI 配置管理 API 路由，提供配置读取、更新、验证接口
    status: completed
  - id: static-files
    content: 在 FastAPI 中添加静态文件服务，挂载前端资源到 /config 路由
    status: completed
    dependencies:
      - backend-api
  - id: frontend-init
    content: 初始化前端项目，配置 React + Vite + Tailwind CSS + shadcn/ui
    status: completed
  - id: type-definitions
    content: 创建 TypeScript 类型定义，与后端配置模型保持一致
    status: completed
    dependencies:
      - frontend-init
  - id: server-config-ui
    content: 开发服务器配置组件，支持地址、端口、安全模式设置
    status: completed
    dependencies:
      - type-definitions
  - id: provider-config-ui
    content: 开发提供商配置组件，支持添加/编辑/删除提供商
    status: completed
    dependencies:
      - type-definitions
  - id: model-config-ui
    content: 开发模型配置组件，支持模型映射和详细参数设置
    status: completed
    dependencies:
      - provider-config-ui
  - id: tool-config-ui
    content: 开发工具调用配置组件，详细配置 ReAct、工具映射、系统提示词替换等
    status: completed
    dependencies:
      - model-config-ui
  - id: config-validation
    content: 实现配置验证和 JSON 预览功能
    status: completed
    dependencies:
      - tool-config-ui
  - id: build-deploy
    content: 构建前端项目并集成到 FastAPI，测试完整功能
    status: completed
    dependencies:
      - config-validation
---

## 产品概述

为 UniClaudeProxy 开发一个轻量、现代、美观的 Web 前端配置界面，用于可视化管理代理配置，替代手动编辑 JSON 文件。

## 核心功能

### 1. 服务器配置管理

- 配置监听地址、端口
- 开关本地访问安全模式
- 实时显示服务状态

### 2. 提供商管理

- 添加/编辑/删除提供商（OpenAI、Gemini、Claude）
- 配置 API 密钥、端点 URL、自定义请求头
- 提供商类型自动识别和配置模板

### 3. 模型配置管理

- 可视化配置模型映射关系
- 详细的工具调用配置面板：
- ReAct XML 工具调用开关
- 工具名称映射编辑器
- 系统提示词替换配置
- 并行工具调用设置
- 其他高级配置：
- 推理参数配置
- 图片处理模式选择
- 流式响应设置
- 最大输出 token 设置

### 4. 配置验证与预览

- 实时 JSON 配置预览
- 配置有效性验证
- 一键导出/导入配置

### 5. 用户友好特性

- 响应式设计，支持移动端
- 暗色主题支持
- 配置自动保存
- 操作历史记录

## 技术选型

### 前端技术栈

- **框架**：React 18 + TypeScript（现代组件化开发）
- **UI 组件库**：shadcn/ui（现代、美观、可定制、基于 Radix UI）
- **样式方案**：Tailwind CSS（轻量、现代、响应式）
- **构建工具**：Vite（快速构建、优化输出）
- **状态管理**：React Hooks + Context（轻量方案）

### 后端集成

- **API 框架**：FastAPI（现有项目已使用）
- **新增接口**：
- `GET /api/config` - 获取当前配置
- `PUT /api/config` - 更新配置
- `POST /api/config/validate` - 验证配置
- `GET /api/status` - 获取服务状态
- **静态文件服务**：FastAPI StaticFiles 托管前端资源

### 部署方式

- 前端打包后放入 `frontend/dist` 目录
- FastAPI 挂载静态文件，访问 `/config` 路由
- 单服务部署，无需启动额外进程

## 架构设计

### 前端架构

```
frontend/
├── src/
│   ├── components/          # UI 组件
│   │   ├── ServerConfig/    # 服务器配置
│   │   ├── ProviderConfig/  # 提供商配置
│   │   ├── ModelConfig/     # 模型配置
│   │   ├── ToolConfig/      # 工具调用配置（重点）
│   │   └── common/          # 通用组件
│   ├── pages/               # 页面
│   │   └── ConfigPage.tsx   # 主配置页面
│   ├── hooks/               # 自定义 Hooks
│   │   ├── useConfig.ts     # 配置管理
│   │   └── useApi.ts        # API 调用
│   ├── types/               # TypeScript 类型
│   │   └── config.ts        # 配置类型定义
│   └── lib/                 # 工具函数
│       ├── api.ts           # API 客户端
│       └── validation.ts    # 配置验证
├── public/                  # 静态资源
└── dist/                    # 打包输出
```

### 数据流

1. 用户在前端界面修改配置
2. 前端调用 FastAPI 接口更新配置
3. FastAPI 更新 config.json 文件
4. ConfigWatcher 检测文件变化，自动热重载
5. 代理服务使用新配置处理请求

## 目录结构

```
UniClaudeProxy/
├── app/
│   ├── main.py              # [MODIFY] 添加静态文件服务和配置 API
│   ├── config.py            # [MODIFY] 添加配置更新函数
│   ├── api/                 # [NEW] API 路由模块
│   │   ├── __init__.py
│   │   └── config_routes.py # [NEW] 配置管理 API
│   └── ...
├── frontend/                # [NEW] 前端项目目录
│   ├── src/
│   │   ├── components/      # UI 组件目录
│   │   ├── pages/           # 页面目录
│   │   ├── hooks/           # 自定义 Hooks
│   │   ├── types/           # TypeScript 类型
│   │   └── lib/             # 工具函数
│   ├── public/              # 静态资源
│   ├── package.json         # 前端依赖配置
│   ├── vite.config.ts       # Vite 构建配置
│   ├── tailwind.config.js   # Tailwind 配置
│   └── tsconfig.json        # TypeScript 配置
├── config.json              # [MODIFY] 用户配置文件
└── requirements.txt         # [MODIFY] 添加前端相关依赖（可选）
```

## 实现要点

### 工具调用配置详细实现

创建专门的 ToolConfig 组件，包含：

- **ReAct 配置面板**：开关 + 说明文档
- **工具名称映射编辑器**：键值对表格，支持增删改
- **系统提示词替换编辑器**：多行文本编辑器，支持预览
- **并行工具调用设置**：开关 + 说明
- **配置说明文档**：内嵌帮助文本，解释每个选项的作用

### 性能优化

- 使用 React.memo 优化组件渲染
- 使用 Vite 的代码分割功能
- 图片和静态资源压缩
- Gzip 压缩响应

### 安全考虑

- API 接口仅在 local_only 模式下可访问
- 配置更新前进行严格验证
- 敏感信息（API Key）脱敏显示

## 设计风格

采用现代简约风格，强调清晰的信息层级和流畅的交互体验。使用 shadcn/ui 组件库实现一致的设计语言，支持暗色主题。

## 页面规划

### 1. 配置主页面（单页面应用）

- **顶部导航栏**：Logo、项目名称、服务状态指示器、主题切换、保存按钮
- **侧边导航**：服务器配置、提供商管理、模型映射、高级设置、JSON 预览
- **主内容区**：根据侧边导航显示对应配置面板

### 2. 配置面板设计

每个配置面板采用卡片式布局，包含：

- **标题区**：配置项名称 + 帮助图标
- **表单区**：表单控件（输入框、开关、下拉选择）
- **操作区**：保存、重置、删除按钮

## 交互设计

- **实时验证**：输入时即时验证配置有效性
- **自动保存**：配置变更后自动保存（防抖 1 秒）
- **拖拽排序**：提供商和模型支持拖拽排序
- **内联编辑**：表格支持双击直接编辑
- **工具提示**：鼠标悬停显示详细说明
- **确认对话框**：删除操作需二次确认

## SubAgent 扩展

### code-explorer

- **用途**：深入探索现有代码库结构，了解配置加载和热重载机制
- **预期结果**：准确理解配置文件的读写流程，确保前端 API 与后端逻辑正确集成