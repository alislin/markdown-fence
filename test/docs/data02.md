<!--
 * @Author: Lin Ya
 * @Date: 2025-03-28 19:58:19
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-03-30 20:14:18
 * @Description: file content
-->
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


##### 嵌套6
<!-- {{fence:start}} -->
<!-- fence:start -->
left
<!-- {{fence}} -->
right
<!-- fence:start -->
in-left
<!-- fence -->
in-right
<!-- fence -->
in-third
<!-- fence:end -->
right-tail
<!-- {{fence:end}} -->

##### 嵌套7
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

##### 嵌套8
<!-- {{fence:start}} -->
<!-- >>> -->
left
<!-- {{fence}} -->
right
<!-- >>> -->
in-left
<!-- --- -->
in-right
<!-- --- -->
in-third
<!-- <<< -->
right-tail
<!-- {{fence:end}} -->
