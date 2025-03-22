const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/docsify/fence.ts'],
  bundle: true,
  outfile: 'out/docsify/fence.js',
  platform: 'browser',
  format: 'iife',
  globalName: "fence",
  sourcemap: true,
  tsconfig: 'tsconfig.docsify.json', // 显式指定 TS 配置
}).catch(() => process.exit(1));