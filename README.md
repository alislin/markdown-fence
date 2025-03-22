# Markdown Fence

![](/media/markdown-fence-128.png)

vscode 扩展 Markdown Fence  
vscode extension "markdown fence". 

![](https://alislin.github.io/markdown-fence/assets/img/README_20250320-092003.png)

## 功能 Features
<!-- fence:start -->
### 标记语法 Markup syntax
使用下面标记进行分隔  
Use markers to split into multi-column styles
- `<!-- fence:start -->`
  - `<!-- >>> -->`
- `<!-- fence -->`
  - `<!-- --- -->`
- `<!-- fence:end -->`
  - `<!-- <<< -->`

<!-- fence -->
### 导出
支持 html,pdf 两种格式
- `Markdown Fence: Export to HTML`
- `Markdown Fence: Export to PDF`
<!-- fence:end -->
<!-- >>> -->
markdown 内容如下  
markdown content:
```markdown
<!-- fence:start -->
## 这是左边开始的内容
1. 第一行
2. 第二行
<!-- fence -->
## 右边标题
横向分隔
<!-- fence:end -->
```
<!-- --- -->

预览  
after render:
```html
<div class="fence-block">
    <div class="fence-item">
        <h2 data-line="0" class="code-line" dir="auto"
            id="1">这是左边开始的内容</h2>
        <ol data-line="1" class="code-line" dir="auto">
            <li data-line="1" class="code-line" dir="auto">第一行</li>
            <li data-line="2" class="code-line code-active-line" dir="auto">第二行</li>
        </ol>
    </div>
    <div class="fence-item">
        <h2 data-line="0" class="code-line" dir="auto" id="2">右边标题</h2>
        <p data-line="1" class="code-line" dir="auto">横向分隔</p>
    </div>
</div>
```
<!-- <<< -->

## 样式 style
可以根据自己的需要编写样式覆盖  
You can write style overrides according to your needs
```css
.fence-block,fence-short-block {

}

.fence-item,fence-short-item {

}
```

## docsify plugin 插件支持
Markdown Fence 也提供了docsify支持。按下面添加插件即可使用  
Markdown Fence also provides docsify support. Click below to add a plug-in to use

```diff
<!DOCTYPE html>
<html lang="zh-cn">

<head>
  <meta charset="UTF-8">
  <title>Markdown Fence</title>
  <meta keyword="" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta name="description" content="Markdown Fence" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/themes/vue.css" />
+  <link rel="stylesheet" href="https://alislin.github.io/markdown-fence/css/fence.css" />
</head>

<body>
  <div id="app"></div>
+  <script src="https://alislin.github.io/markdown-fence/out/docsify/fence.js"></script>
  <script>
    var num = 0;
    window.$docsify = {
      name: 'Markdown Fence',
      repo: '',
+     plugins:[fence]
    }
  </script>
  <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
</body>

</html>
```

<!-- ## Obisdian 支持
- [ ] 计划中 -->

<!-- ## Marp 支持
- [ ] 计划中 -->
