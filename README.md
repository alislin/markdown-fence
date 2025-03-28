# Markdown Fence

![](/media/markdown-fence-128.png)

vscode 扩展 Markdown Fence 支持多列语法  
The vscode extension "Markdown Fence" supports multi-column syntax

![](https://alislin.github.io/markdown-fence/assets/img/README_20250320-092003.png)

## 功能 Features
下面三种语法是等效的。根据需要选用其中一种即可。  
The following three syntax are equivalent. Choose one of the options according to your needs.

<!-- fence:start -->
**标准语法 Standard syntax**

> 在不支持的解析器会解析为注释，渲染输出时隐藏  
> Unsupported parsers resolve as annotations and are hidden when the output is rendered

使用下面标记进行分隔  
Use markers to split into multi-column styles
- `<!-- fence:start -->`
- `<!-- fence -->`
- `<!-- fence:end -->`

<!-- fence -->
**快速语法 Short syntax**

> 在不支持的解析器会解析为注释，渲染输出时隐藏  
> Unsupported parsers resolve as annotations and are hidden when the output is rendered

使用下面标记进行分隔  
Use markers to split into multi-column styles
- `<!-- >>> -->`
- `<!-- --- -->`
- `<!-- <<< -->`

<!-- fence -->
**简写语法 Short syntax**

> 不支持的解析器会解析为普通文本原样显示，可以在后面追加任意数量的相同符号，起到分隔线的效果  
> Unsupported parsers will parse the plain text as is, and any number of identical symbols can be appended to the end to play the role of a divider

使用下面标记进行分隔，后续字符三个以上至任意数量都可以  
Use the following tags to separate, and any number of subsequent characters from three or more can be used.
- `/>>>`
- `/---`
- `/<<<`

<!-- fence -->
**分栏标题 Column headings**

在分栏第一行使用加粗的文本，并且在后续保持一个空行。这行就会解析为分栏标题。  
Use bold text on the first line of the column and keep a blank line for the follow-up. This line resolves to a section header.

`**标题 title**`  
`<空行 empty row>`
<!-- fence:end -->

**命令 Command**

支持导出 html,pdf 两种格式  
Support export of HTML and PDF formats
- `Markdown Fence: Export to HTML`
- `Markdown Fence: Export to PDF`

> 可在 vscode 参数中设置页眉和页脚和其他相关参数   
> You can set the header and footer and other related parameters in the vscode parameter

<!-- >>> -->

**markdown**

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

**预览**

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

## 配置参数 Configuration Parameters

| Name            | Description                                                                                     | Default | Example                                                                    |
| --------------- | ----------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------- |
| `header`        | Header to be added to the exported HTML/PDF<br>keywords:`{title}`,`{pageNumber}`,`{totalPages}` |         | `<div style="color:#666666;width:100%;">{title}</div>`                     |
| `footer`        | Footer to be added to the exported HTML/PDF<br>keywords:`{title}`,`{pageNumber}`,`{totalPages}` |         | `<div></div><div style="color:#666666;">{pageNumber} / {totalPages}</div>` |
| `size`          | Page size of the exported PDF                                                                   | `A4`    | `A3`, `Letter`, `Legal`                                                    |
| `margin.top`    | Top margin of the exported PDF                                                                  | `20mm`  |                                                                            |
| `margin.right`  | Right margin of the exported PDF                                                                | `5mm`   |                                                                            |
| `margin.bottom` | Bottom margin of the exported PDF                                                               | `10mm`  |                                                                            |
| `margin.left`   | Left margin of the exported PDF                                                                 | `5mm`   |                                                                            |

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
+ <link rel="stylesheet" href="https://alislin.github.io/markdown-fence/css/fence.css" />
</head>

<body>
  <div id="app"></div>
+ <script src="https://alislin.github.io/markdown-fence/out/docsify/fence.js"></script>
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
