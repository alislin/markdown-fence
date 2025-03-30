export const datas_standard=[
{
    title:`[standard] - 标准渲染`,
    input:`<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[standard] - 增加空格1`,
    input:`<!-- fence:start    -->
left
<!--     fence -->
right
<!--          fence:end      -->`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[standard] - 增加空行`,
    input:`<!-- fence:start -->

left
<!-- fence -->

right

<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[standard] - 标题1`,
    input:`<!-- fence:start -->

**left title**

left
<!-- fence -->
right
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><div class="fence-title">left title</div><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[standard] - 标题2`,
    input:`<!-- fence:start -->

left
<!-- fence -->

**right title**

right
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><div class="fence-title">right title</div><p>right</p>
</div>
</div>`,
}
,
{
    title:`[standard] - 标题3`,
    input:`<!-- fence:start -->

**left title**

left
<!-- fence -->

**right title**

right
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><div class="fence-title">left title</div><p>left</p>
</div>
<div class="fence-item"><div class="fence-title">right title</div><p>right</p>
</div>
</div>`,
}
,
{
    title:`[standard] - 内嵌markdown`,
    input:`<!-- fence:start -->

**left title**

> test

left
<!-- fence -->

**right title**

## ember title
right
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
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
    title:`[standard] - 未闭合标记1`,
    input:`left
<!-- fence -->
right
<!-- fence:end -->`,
    except:`<p>left
&lt;!-- fence --&gt;
right
&lt;!-- fence:end --&gt;</p>
`,
}
,
{
    title:`[standard] - 未闭合标记2`,
    input:`<!-- fence:start -->
left
<!-- fence -->
right`,
    except:`<p>&lt;!-- fence:start --&gt;left
&lt;!-- fence --&gt;
right</p>`,
}
,
{
    title:`[standard] - 未闭合标记3`,
    input:`<!-- fence:start -->
left

right`,
    except:`<p>&lt;!-- fence:start --&gt;left</p><p>right</p>`,
}
,
{
    title:`[standard] - 标准渲染-嵌套未闭合标记`,
    input:`<!-- fence:start -->
<!-- fence:start -->

left

left
<!-- fence -->
right
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>&lt;!-- fence:start --&gt;</p><p>left</p><p>left</p></div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[standard] - 内嵌代码1`,
    input:`<!-- fence:start -->

\`\`\`js
const j=100;
\`\`\`
left
<!-- fence -->
right
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
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
    title:`[standard] - 内嵌代码2`,
    input:`<!-- fence:start -->

left

\`\`\`markdown
<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->
\`\`\`

<!-- fence -->
right
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
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
    title:`[standard] - 内嵌代码3`,
    input:`<!-- fence:start -->

left

\`\`\`markdown
<!-- >>> -->
left
<!-- --- -->
right
<!-- <<< -->
\`\`\`

<!-- fence -->
right
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
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
    title:`[standard] - 内嵌代码4`,
    input:`<!-- fence:start -->

left

\`\`\`markdown
/>>>
left
/---
right
/<<<
\`\`\`

<!-- fence -->

right

<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
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
    title:`[standard] - 单标记1`,
    input:`<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->

剩余数据`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><p>剩余数据</p>
`,
}
,
{
    title:`[standard] - 单标记2`,
    input:`head
<!-- fence:start -->
left
<!-- fence -->

**title**

right
<!-- fence:end -->

剩余数据`,
    except:`<p>head
&lt;!-- fence:start --&gt;
left
&lt;!-- fence --&gt;</p>
<p><strong>title</strong></p>
<p>right
&lt;!-- fence:end --&gt;</p>
<p>剩余数据</p>
`,
}
,
{
    title:`[standard] - 多标记1`,
    input:`<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->

<!-- fence:start -->
left
<!-- fence -->
left
<!-- fence -->
right
<!-- fence:end -->

<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div>`,
}
,
{
    title:`[standard] - 多标记2`,
    input:`<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->

<!-- fence:start -->
left
<!-- fence -->
left
<!-- fence -->
right
<!-- fence:end -->

<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->

尾巴`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><p>尾巴</p>
`,
}
,
{
    title:`[standard] - 多标记3`,
    input:`开头的数据

<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->

<!-- fence:start -->
left
<!-- fence -->
left
<!-- fence -->
right
<!-- fence:end -->

<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->

尾巴`,
    except:`<p>开头的数据</p>
<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><p>尾巴</p>
`,
}
,
{
    title:`[standard] - 嵌套1`,
    input:`<!-- fence:start -->
<!-- >>> -->
left
<!-- fence -->
right
<!-- <<< -->
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>&lt;!-- &gt;&gt;&gt; --&gt;
left</p>
</div>
<div class="fence-item"><p>right
&lt;!-- &lt;&lt;&lt; --&gt;</p>
</div>
</div>`,
}
,
{
    title:`[standard] - 嵌套2`,
    input:`<!-- fence:start -->
<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>&lt;!-- fence:start --&gt;
left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><p>&lt;!-- fence:end --&gt;</p>
`,
}
,
{
    title:`[standard] - 嵌套3`,
    input:`<!-- fence:start -->
/>>>
left
<!-- fence -->
right
/<<<
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>/&gt;&gt;&gt;
left</p>
</div>
<div class="fence-item"><p>right
/&lt;&lt;&lt;</p>
</div>
</div>`,
}
,
{
    title:`[standard] - 嵌套6`,
    input:`<!-- fence:start -->
<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:start -->
in-left
<!-- fence -->
in-right
<!-- fence -->
in-third
<!-- fence:end -->
right-tail
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>&lt;!-- fence:start --&gt;
left</p>
</div>
<div class="fence-item"><p>right
&lt;!-- fence:start --&gt;
in-left</p>
</div>
<div class="fence-item"><p>in-right</p>
</div>
<div class="fence-item"><p>in-third</p>
</div>
</div><p>right-tail
&lt;!-- fence:end --&gt;</p>
`,
}
,
{
    title:`[standard] - 嵌套7`,
    input:`<!-- fence:start -->
/>>>
left
<!-- fence -->
right
/>>>
in-left
/---
in-right
/---
in-third
/<<<
right-tail
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>/&gt;&gt;&gt;
left</p>
</div>
<div class="fence-item"><p>right
/&gt;&gt;&gt;
in-left
/---
in-right
/---
in-third
/&lt;&lt;&lt;
right-tail</p>
</div>
</div>`,
}
,
{
    title:`[standard] - 嵌套8`,
    input:`<!-- fence:start -->
<!-- >>> -->
left
<!-- fence -->
right
<!-- >>> -->
in-left
<!-- --- -->
in-right
<!-- --- -->
in-third
<!-- <<< -->
right-tail
<!-- fence:end -->`,
    except:`<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>&lt;!-- &gt;&gt;&gt; --&gt;
left</p>
</div>
<div class="fence-item"><p>right
&lt;!-- &gt;&gt;&gt; --&gt;
in-left
&lt;!-- --- --&gt;
in-right
&lt;!-- --- --&gt;
in-third
&lt;!-- &lt;&lt;&lt; --&gt;
right-tail</p>
</div>
</div>`,
}
,
{
    title:`[standard] - 混合多标记1`,
    input:`开头的数据

<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->

<!-- fence:start -->
left
<!-- fence -->

left

\`\`\`markdown
<!-- >>> -->
left1
<!-- --- -->
right2
<!-- <<< -->
\`\`\`

<!-- fence -->
right
<!-- fence:end -->

<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->

尾巴`,
    except:`<p>开头的数据</p>
<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>left</p>
<pre><code class="language-markdown">&lt;!-- &gt;&gt;&gt; --&gt;
left1
&lt;!-- --- --&gt;
right2
&lt;!-- &lt;&lt;&lt; --&gt;
</code></pre>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><p>尾巴</p>
`,
}
,
{
    title:`[standard] - 混合多标记2`,
    input:`开头的数据

<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->

<!-- fence:start -->
left
<!-- fence -->

left

\`\`\`markdown
<!-- >>> -->
left1
<!-- --- -->
right2
<!-- <<< -->
\`\`\`

<!-- fence -->
right
<!-- fence:end -->

<!-- fence:start -->
left

\`\`\`markdown
/>>>
left11
/---
right22
/<<<
\`\`\`

<!-- fence -->
right
<!-- fence:end -->

尾巴`,
    except:`<p>开头的数据</p>
<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>left</p>
<pre><code class="language-markdown">&lt;!-- &gt;&gt;&gt; --&gt;
left1
&lt;!-- --- --&gt;
right2
&lt;!-- &lt;&lt;&lt; --&gt;
</code></pre>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
<pre><code class="language-markdown">/&gt;&gt;&gt;
left11
/---
right22
/&lt;&lt;&lt;
</code></pre>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><p>尾巴</p>
`,
}
,
{
    title:`[standard] - 混合多标记3`,
    input:`开头的数据

<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->

<!-- fence:start -->
left
<!-- fence -->

left

\`\`\`markdown
<!-- fence:start -->
left1
<!-- fence -->
right2
<!-- fence:end -->
\`\`\`

<!-- fence -->
right
<!-- fence:end -->

<!-- fence:start -->
left

\`\`\`markdown
<!-- fence:start -->
left11
<!-- fence -->
right22
<!-- fence:end -->
\`\`\`

<!-- fence -->
right
<!-- fence:end -->

尾巴`,
    except:`<p>开头的数据</p>
<div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
</div>
<div class="fence-item"><p>left</p>
<pre><code class="language-markdown">&lt;!-- fence:start --&gt;
left1
&lt;!-- fence --&gt;
right2
&lt;!-- fence:end --&gt;
</code></pre>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><div class="fence-block" fence-type="standard">
<div class="fence-item"><p>left</p>
<pre><code class="language-markdown">&lt;!-- fence:start --&gt;
left11
&lt;!-- fence --&gt;
right22
&lt;!-- fence:end --&gt;
</code></pre>
</div>
<div class="fence-item"><p>right</p>
</div>
</div><p>尾巴</p>
`,
}
];