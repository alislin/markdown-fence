const esbuild = require('esbuild');

// 编译 scss 文件
require('child_process').execSync('sass css/fence.scss css/fence.css');

esbuild.build({
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  platform: 'node',
  format: 'cjs',
  external: ['vscode'],
  sourcemap: true,
}).catch(() => process.exit(1));