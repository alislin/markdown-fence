# markdown-fence README

vscode extension "markdown-fence". 

## Features
Use markers to split into multi-column styles

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

after render
```html
<div class="fence-block">
    <div class="fence-item">
        <h2 data-line="0" class="code-line" dir="auto"
            id="%E8%BF%99%E6%98%AF%E5%B7%A6%E8%BE%B9%E5%BC%80%E5%A7%8B%E7%9A%84%E5%86%85%E5%AE%B9">这是左边开始的内容</h2>
        <ol data-line="1" class="code-line" dir="auto">
            <li data-line="1" class="code-line" dir="auto">第一行</li>
            <li data-line="2" class="code-line code-active-line" dir="auto">第二行</li>
        </ol>
    </div>
    <div class="fence-item">
        <h2 data-line="0" class="code-line" dir="auto" id="%E5%8F%B3%E8%BE%B9%E6%A0%87%E9%A2%98">右边标题</h2>
        <p data-line="1" class="code-line" dir="auto">横向分隔</p>
    </div>
</div>
```

