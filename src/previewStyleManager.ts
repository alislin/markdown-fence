/**
 * 预览样式管理器
 * 支持从 YAML front matter 提取样式配置并应用到 VS Code Markdown 预览
 */
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { SimpleYAMLParser } from './utils/YamlParser';

interface PreviewStyleConfig {
  customCSS?: string;
  cssFiles?: string[];
}

interface CachedCssContent {
  content: string;
  mtime: number;
  path: string;
  timestamp: number;
}

export class PreviewStyleManager {
  private context: vscode.ExtensionContext;
  private cssCache = new Map<string, CachedCssContent>();
  private readonly HTTP_CACHE_EXPIRY = 5 * 60 * 1000; // 5 分钟

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
  }

  /**
   * 从文档中提取 YAML front matter 配置
   */
  private extractFrontmatter(content: string): Record<string, any> {
    const yamlLines = content.split('\n');
    let yamlEndIndex = -1;
    const yamlLinesContent: string[] = [];

    // 检查是否以 YAML 分隔符开始
    if (yamlLines.length >= 2 && yamlLines[0].trim() === '---') {
      for (let i = 1; i < yamlLines.length; i++) {
        if (yamlLines[i].trim() === '---') {
          yamlEndIndex = i;
          break;
        }
        yamlLinesContent.push(yamlLines[i]);
      }
    }

    if (yamlEndIndex !== -1) {
      const yamlContent = yamlLinesContent.join('\n');
      try {
        return SimpleYAMLParser.parse(yamlContent);
      } catch (error) {
        console.warn('Failed to parse YAML frontmatter:', error);
      }
    }

    return {};
  }

  /**
   * 加载 CSS 文件内容（带缓存）
   */
  private async loadCssFile(cssFile: string, documentPath: string): Promise<string> {
    try {
      if (cssFile.startsWith('http://') || cssFile.startsWith('https://')) {
        // HTTP(S) URL 处理
        const cacheKey = cssFile;
        const cached = this.cssCache.get(cacheKey);

        // 检查缓存是否过期
        if (cached && (Date.now() - cached.timestamp) < this.HTTP_CACHE_EXPIRY) {
          return cached.content;
        }

        // 加载远程 CSS
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(cssFile);
        if (response.ok) {
          const content = await response.text();
          this.cssCache.set(cacheKey, {
            content,
            mtime: 0,
            path: cssFile,
            timestamp: Date.now()
          });
          return content;
        } else {
          console.warn(`Failed to load CSS from URL: ${cssFile}`);
          return '';
        }
      } else {
        // 本地文件处理
        const absolutePath = path.isAbsolute(cssFile)
          ? cssFile
          : path.join(path.dirname(documentPath), cssFile);

        const cacheKey = absolutePath;
        let cached = this.cssCache.get(cacheKey);

        // 检查文件是否存在并获取 mtime
        try {
          const stats = await fs.promises.stat(absolutePath);
          const mtime = stats.mtimeMs;

          // 如果缓存存在且 mtime 匹配，使用缓存
          if (cached && cached.mtime === mtime) {
            return cached.content;
          }

          // 重新加载文件
          const content = await fs.promises.readFile(absolutePath, 'utf8');
          this.cssCache.set(cacheKey, {
            content,
            mtime,
            path: absolutePath,
            timestamp: Date.now()
          });
          return content;
        } catch (error: any) {
          console.warn(`Failed to load CSS file: ${cssFile}, error: ${error.message}`);
          return '';
        }
      }
    } catch (error: any) {
      console.warn(`Failed to load CSS file: ${cssFile}, error: ${error.message}`);
      return '';
    }
  }

  /**
   * 加载多个 CSS 文件
   */
  private async loadCssFiles(cssFiles: string[], documentPath: string): Promise<string> {
    if (!cssFiles || cssFiles.length === 0) {
      return '';
    }

    const cssContents = await Promise.all(
      cssFiles.map(cssFile => this.loadCssFile(cssFile, documentPath))
    );

    return cssContents.join('\n');
  }

  /**
   * 生成样式标签 HTML
   */
  async generateStyleTags(document: vscode.TextDocument): Promise<string> {
    try {
      const content = document.getText();
      const frontmatter = this.extractFrontmatter(content);

      if (!frontmatter || Object.keys(frontmatter).length === 0) {
        return '';
      }

      const styleConfig: PreviewStyleConfig = {
        customCSS: frontmatter.customCSS,
        cssFiles: Array.isArray(frontmatter.cssFiles) ? frontmatter.cssFiles : undefined
      };

      if (!styleConfig.customCSS && (!styleConfig.cssFiles || styleConfig.cssFiles.length === 0)) {
        return '';
      }

      const filePath = document.uri.fsPath;
      const additionalCss = await this.loadCssFiles(styleConfig.cssFiles || [], filePath);

      const styles: string[] = [];

      // 添加自定义 CSS，使用 !important 确保优先级
      if (styleConfig.customCSS) {
        const enhancedCustomCSS = this.enhanceCSSWithImportant(styleConfig.customCSS);
        styles.push(`<style id="markdown-fence-custom-css">\n${enhancedCustomCSS}\n</style>`);
      }

      // 添加外部 CSS 文件，使用 !important 确保优先级
      if (additionalCss) {
        const enhancedExternalCSS = this.enhanceCSSWithImportant(additionalCss);
        styles.push(`<style id="markdown-fence-external-css">\n${enhancedExternalCSS}\n</style>`);
      }

      return styles.join('\n');
    } catch (error: any) {
      console.warn('Failed to generate style tags:', error.message);
      return '';
    }
  }

  /**
   * 同步方式生成样式标签（用于渲染时快速检查）
   * 这个方法会快速检查文档是否有 YAML 配置，但不加载外部文件
   */
  generateStyleTagsSync(document: vscode.TextDocument): string | null {
    try {
      const content = document.getText();
      const frontmatter = this.extractFrontmatter(content);

      if (!frontmatter || Object.keys(frontmatter).length === 0) {
        return null;
      }

      const styleConfig: PreviewStyleConfig = {
        customCSS: frontmatter.customCSS,
        cssFiles: Array.isArray(frontmatter.cssFiles) ? frontmatter.cssFiles : undefined
      };

      if (!styleConfig.customCSS && (!styleConfig.cssFiles || styleConfig.cssFiles.length === 0)) {
        return null;
      }

      // 只有 customCSS 才能同步生成，cssFiles 需要异步加载
      if (styleConfig.customCSS) {
        // const enhancedCustomCSS = this.enhanceCSSWithImportant(styleConfig.customCSS);
        // return `<style id="markdown-fence-custom-css">\n${enhancedCustomCSS}\n</style>`;
        return `<style id="markdown-fence-custom-css">\n${styleConfig.customCSS}\n</style>`;
      }

      return null;
    } catch (error: any) {
      console.warn('Failed to generate sync style tags:', error.message);
      return null;
    }
  }

  /**
   * 增强 CSS，添加 !important 确保优先级
   */
  private enhanceCSSWithImportant(css: string): string {
    return css
      .split('}')
      .map(rule => {
        const trimmedRule = rule.trim();
        if (!trimmedRule) {
          return '';
        }

        const parts = trimmedRule.split('{');
        if (parts.length !== 2) {
          return trimmedRule;
        }

        const selector = parts[0].trim();
        const properties = parts[1].trim();

        if (!properties) {
          return trimmedRule;
        }

        // 为每个属性添加 !important
        const enhancedProperties = properties
          .split(';')
          .map(prop => {
            const trimmedProp = prop.trim();
            if (!trimmedProp) {
              return '';
            }

            // 如果已经包含 !important，保持不变
            if (trimmedProp.includes('!important')) {
              return trimmedProp;
            }

            return `${trimmedProp} !important`;
          })
          .filter(Boolean)
          .join('; ');

        return `${selector} { ${enhancedProperties} }`;
      })
      .filter(Boolean)
      .join('\n');
  }

  /**
   * 资源清理
   */
  dispose(): void {
    this.cssCache.clear();
  }
}
