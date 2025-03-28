##### 未闭合标记1
left
<!-- {{fence}} -->
right
<!-- {{fence:end}} -->

##### 未闭合标记2
<!-- {{fence:start}} -->
left
<!-- {{fence}} -->
right

##### 未闭合标记3
<!-- {{fence:start}} -->
left

right

##### 标准渲染-嵌套未闭合标记
<!-- {{fence:start}} -->
<!-- {{fence:start}} -->

left

left
<!-- {{fence}} -->
right
<!-- {{fence:end}} -->

##### 嵌套1
<!-- {{fence:start}} -->
<!-- >>> -->
left
<!-- {{fence}} -->
right
<!-- <<< -->
<!-- {{fence:end}} -->

##### 嵌套2
<!-- {{fence:start}} -->
<!-- {{fence:start}} -->
left
<!-- {{fence}} -->
right
<!-- {{fence:end}} -->
<!-- {{fence:end}} -->


##### 嵌套3
<!-- {{fence:start}} -->
/>>>
left
<!-- {{fence}} -->
right
/<<<
<!-- {{fence:end}} -->

##### 嵌套4
<!-- {{fence:start}} -->
/>>>
left
<!-- {{fence}} -->
right
/>>>
in-left
/---
in-right
/---
in-third
/<<<
right-tail
<!-- {{fence:end}} -->

