const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');

const publicDir = 'public';
const outDir = 'out';

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
      `${outDir}/**/*`,
    ];

    // 循环复制目标
    for (const target of copyTargets) {
      const files = glob.sync(target);
      for (const file of files) {
        const dest = path.join(publicDir, file);
        await fs.copy(file, dest);
        console.log(`复制 ${file} 到 ${dest}`);
      }
    }

    console.log('部署完成！');
  } catch (err) {
    console.error('部署失败：', err);
  }
}

deploy();
