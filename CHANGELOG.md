# Change Log

All notable changes to the "markdown-fence" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]
### Fixed
- 代码中的语法标记处理

## [1.0.7] - 2025-03-25
### Fixed
- 代码中的语法标记处理

## [1.0.6] - 2025-03-24
### Added
- 增加新的语法支持，为下一步提供Obsidian支持

## [1.0.5] - 2025-03-23

### Changed
- 增加分栏标题解析

## [1.0.4] - 2025-03-22

### Added
- 添加对短标记的支持，重构 fence 插件以处理长短两种类型的 fence，更新相关样式和渲染逻辑

### Fixed
- 修正预览加载样式

## [1.0.3] - 2025-03-21

### Added
- 优化 imageToBase64 函数以支持 SVG 文件解码
- 在 exportDocument.ts 中添加 loadImageFile 函数以支持从网络下载图片，并优化 imageToBase64 函数的参数

## [1.0.2] - 2025-03-21

### Updated
- 更新 exportDocument.ts，添加 Mermaid 图表支持，优化 HTML 结构以提升可读性
- 更新 PDF 导出功能，添加页眉、页脚及页码显示，支持自定义纸张尺寸和边距设置
- 添加 PDF 导出配置选项，包括纸张尺寸和边距设置，以增强导出功能
- 添加 PDF 导出时的边距设置以改善文档格式
- 添加最大宽度限制和图像适应样式以增强布局响应性

## [1.0.1] - 2025-03-20

### Updated
- 优化 fencePlugin 以简化代码块处理，移除不必要的标志并修剪输出内容
- 更新 README.md，调整标记语法部分以优化多列样式的说明
- 调整分栏样式
- 优化 fence 函数以支持多个 fence 块的处理
- 更新文档部署脚本以支持媒体文件复制，修正 HTML 文件中的资源路径
- 添加 docsify 插件支持，更新文档和部署脚本，优化文件复制逻辑

## [1.0.0] - 2025-03-19

### Added
- 实现 PDF 导出功能，支持样式一致性和代码高亮
- 实现将 Markdown 文件导出为包含 CSS 样式的 HTML 文件

### Changed
- 优化图片路径处理，支持 URL 编码和解码以正确读取图像文件
- 重构导出文档功能，优化 HTML 和 PDF 导出流程，支持图片转换为 base64 编码
- 移除 highlight.js 依赖，优化代码结构
- 修改命令名称

### Updated

