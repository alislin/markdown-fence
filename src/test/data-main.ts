export const datas_main=[
{
    title:`[main] - 标准渲染`,
    input:`/>>>
left
/---
right
/<<<`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[main] - 增加空格1`,
    input:`/>>>
left
/---
right
/<<<`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[main] - 增加空行`,
    input:`/>>>

left
/---

right

/<<<`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[main] - 标题1`,
    input:`/>>>

**left title**

left
/---
right
/<<<`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><div class="fence-title">left title</div><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[main] - 标题2`,
    input:`/>>>

left
/---

**right title**

right
/<<<`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><div class="fence-title">right title</div><p>right</p>
</div>
</div>`,
}
,
{
    title:`[main] - 标题3`,
    input:`/>>>

**left title**

left
/---

**right title**

right
/<<<`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><div class="fence-title">left title</div><p>left</p>
</div>
<div class="fence-item"><div class="fence-title">right title</div><p>right</p>
</div>
</div>`,
}
,
{
    title:`[main] - 内嵌markdown`,
    input:`/>>>

**left title**

> test

left
/---

**right title**

## ember title
right
/<<<`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><div class="fence-title">left title</div><blockquote>
<p>test</p>
</blockquote>
<p>left</p>
</div>
<div class="fence-item"><div class="fence-title">right title</div><h2>ember title</h2>
<p>right</p>
</div>
</div>`,
}
,
{
    title:`[main] - 未闭合标记1`,
    input:`left
/---
right
/<<<`,
    except:`<p>left
/---
right
/&lt;&lt;&lt;</p>
`,
}
,
{
    title:`[main] - 未闭合标记2`,
    input:`/>>>
left
/---
right`,
    except:`<p>/&gt;&gt;&gt;left
/---
right</p>`,
}
,
{
    title:`[main] - 未闭合标记3`,
    input:`/>>>
left

right`,
    except:`<p>/&gt;&gt;&gt;left</p><p>right</p>`,
}
,
{
    title:`[main] - 标准渲染-嵌套未闭合标记`,
    input:`/>>>
/>>>

left

left
/---
right
/<<<`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><p>/&gt;&gt;&gt;</p><p>left</p><p>left</p></div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[main] - 内嵌代码1`,
    input:`/>>>

\`\`\`js
const j=100;
\`\`\`
left
/---
right
/<<<`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><pre><code class="language-js">const j=100;
</code></pre>
<p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[main] - 内嵌代码2`,
    input:`/>>>

left

\`\`\`markdown
<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->
\`\`\`

/---
right
/<<<`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
<pre><code class="language-markdown">&lt;!-- fence:start --&gt;
left
&lt;!-- fence --&gt;
right
&lt;!-- fence:end --&gt;
</code></pre>
</div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[main] - 内嵌代码3`,
    input:`/>>>

left

\`\`\`markdown
<!-- >>> -->
left
<!-- --- -->
right
<!-- <<< -->
\`\`\`

/---
right
/<<<`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
<pre><code class="language-markdown">&lt;!-- &gt;&gt;&gt; --&gt;
left
&lt;!-- --- --&gt;
right
&lt;!-- &lt;&lt;&lt; --&gt;
</code></pre>
</div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[main] - 内嵌代码4`,
    input:`/>>>

left

\`\`\`markdown
/>>>
left
/---
right
/<<<
\`\`\`

/---

right

/<<<`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
<pre><code class="language-markdown">/&gt;&gt;&gt;
left
/---
right
/&lt;&lt;&lt;
</code></pre>
</div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[main] - 单标记1`,
    input:`/>>>
left
/---
right
/<<<

剩余数据`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><p>剩余数据</p>
`,
}
,
{
    title:`[main] - 单标记2`,
    input:`head
/>>>
left
/---

**title**

right
/<<<

剩余数据`,
    except:`<p>head
/&gt;&gt;&gt;
left
/---</p>
<p><strong>title</strong></p>
<p>right
/&lt;&lt;&lt;</p>
<p>剩余数据</p>
`,
}
,
{
    title:`[main] - 多标记1`,
    input:`/>>>
left
/---
right
/<<<

/>>>
left
/---
left
/---
right
/<<<

/>>>
left
/---
right
/<<<`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[main] - 多标记2`,
    input:`/>>>
left
/---
right
/<<<

/>>>
left
/---
left
/---
right
/<<<

/>>>
left
/---
right
/<<<

尾巴`,
    except:`<div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><p>尾巴</p>
`,
}
,
{
    title:`[main] - 多标记3`,
    input:`开头的数据

/>>>
left
/---
right
/<<<

/>>>
left
/---
left
/---
right
/<<<

/>>>
left
/---
right
/<<<

尾巴`,
    except:`<p>开头的数据</p>
<div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="main">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><p>尾巴</p>
`,
}
];