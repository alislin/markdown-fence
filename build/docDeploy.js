const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const publicDir = 'public';
const outDir = 'out/docsify';
const docIndex = 'docs/html/index.html';

/**
 * 复制文件到指定目录
 * @param {string} src 源文件路径
 * @param {string} dest 目标文件路径
 */
async function copyFile(src, dest) {
  try {
    await fs.copy(src, dest);
    console.log(`复制 ${src} 到 ${dest}`);
  } catch (err) {
    console.error(`复制 ${src} 到 ${dest} 失败：`, err);
  }
}

/**
 * 部署函数
 */
async function deploy() {
  try {
    // 清空 public 目录
    await fs.remove(publicDir);

    // 创建 public 目录
    await fs.ensureDir(publicDir);

    // 复制目标列表，支持通配符
    const copyTargets = [
      '.nojekyll',
      '*.md',
      'assets/**/*',
      'css/**/*',
      'media/**/*',
      `${outDir}/**/*`,
    ];

    // 排除目标列表，支持通配符
    const excludeTargets = [
      'test/**/*',
      '**/extension.*',
      '**/*.scss',
      '**/*.map',
      '**/*.test*'
    ];

    // 循环复制目标
    for (const target of copyTargets) {
      const files = glob.sync(target);
      for (const file of files) {
        // 判断文件是否在排除列表中
        let excluded = false;
        for (const excludeTarget of excludeTargets) {
          const excludeFiles = glob.sync(excludeTarget);
          if (excludeFiles.includes(file)) {
            excluded = true;
            break;
          }
        }

        if (excluded) {
          console.log(`跳过 ${file}`);
          continue;
        }

        const src = file;
        const dest = path.join(publicDir, file);
        await copyFile(src, dest);
      }
    }

    // 指定文件复制 docs/html/index.html 复制到 publicDir
    const docIndexDest = path.join(publicDir, 'index.html');
    await copyFile(docIndex, docIndexDest);

    console.log('部署完成！');
  } catch (err) {
    console.error('部署失败：', err);
  }
}

deploy();
