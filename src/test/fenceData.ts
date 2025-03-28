import { datas_main } from "./data-main";
import { datas_short } from "./data-short";
import { datas_standard } from "./data-standard";

export interface TestCase {
    title: string;
    input: string;
    except: string;
}

export function generateTestData(): TestCase[] {
    const testData: TestCase[] = [
        ...datas_standard,
        ...datas_short,
        ...datas_main,
        {
            title: "标准渲染 [standard]",
            input: `<!-- fence:start -->
left
<!-- fence -->
right
<!-- fence:end -->`,
            except: `<divclass="fence-block"fence-type="standard"><divclass="fence-item"><p>left</p></div><divclass="fence-item"><p>right</p></div></div>`,
        },
        {
            title: "标准渲染-增加空格1 [standard]",
            input: `<!-- fence:start -->
left  
<!-- fence -->  
right  
<!-- fence:end -->`,
            except: `<divclass="fence-block"fence-type="standard"><divclass="fence-item"><p>left</p></div><divclass="fence-item"><p>right</p></div></div>`,
        },
        {
            title: "标准渲染-增加空格2 [standard]",
            input: `<!--   fence:start    -->
left  
<!-- fence     -->  
right  
<!-- fence:end          -->`,
            except: `<divclass="fence-block"fence-type="standard"><divclass="fence-item"><p>left</p></div><divclass="fence-item"><p>right</p></div></div>`,
        },
        {
            title: "标准渲染-增加空行 [standard]",
            input: `<!-- fence:start -->

left

<!-- fence -->

right

<!-- fence:end -->`,
            except: `<divclass="fence-block"fence-type="standard"><divclass="fence-item"><p>left</p></div><divclass="fence-item"><p>right</p></div></div>`,
        },
        {
            title: "标准渲染-嵌套 [standard]",
            input: `<!-- fence:start -->
<!-- >>> -->
left
<!-- fence -->
right
<!-- <<< -->
<!-- fence:end -->`,
            except: `<divclass="fence-block"fence-type="standard"><divclass="fence-item"><divclass="fence-block"fence-type="short"><divclass="fence-item"></div></div></div><divclass="fence-item"><p>right&lt;!--&lt;&lt;&lt;--&gt;</p></div></div>`,
        },

        // Invalid cases
        {
            title: "标准渲染-缺少起始标记 [standard]",
            input: `left
<!-- fence -->
right
<!-- fence:end -->`,
            except: `<p>left&lt;!--fence--&gt;right&lt;!--fence:end--&gt;</p>`,
        },
        {
            title: "标准渲染-缺少结束标记 [standard]",
            input: `<!-- fence:start -->left<!-- fence -->right`,
            except: `<divclass="fence-block"fence-type="standard"><divclass="fence-item"></div></div>`,
        },
        {
            title: "标准渲染-标记不匹配 [standard]",
            input: `<!-- fence:start -->left<!-- fence -->right<!-- fence:end1 -->`,
            except: `<divclass="fence-block"fence-type="standard"><divclass="fence-item"></div></div>`,
        },

        // Short syntax
        // Valid cases
        {
            title: "快速渲染 [short]",
            input: `<!-- >>> -->left<!-- --- -->right<!-- <<< -->`,
            except: `<divclass="fence-block"fence-type="short"><divclass="fence-item"></div></div>`,
        },

        // Invalid cases
        {
            title: "快速渲染-缺少起始标记 [short]",
            input: `left<!-- --- -->right<!-- <<< -->`,
            except: `<p>left&lt;!-------&gt;right&lt;!--&lt;&lt;&lt;--&gt;</p>`,
        },
        {
            title: "快速渲染-缺少结束标记 [short]",
            input: `<!-- >>> -->left<!-- --- -->right`,
            except: `<divclass="fence-block"fence-type="short"><divclass="fence-item"></div></div>`,
        },
        {
            title: "快速渲染-标记不匹配 [short]",
            input: `<!-- >>> -->left<!-- --- -->right<!-- << -->`,
            except: `<divclass="fence-block"fence-type="short"><divclass="fence-item"></div></div>`,
        },

        // Concise syntax
        // Valid cases
        {
            title: "简写渲染 [concise]",
            input: `/>>>left/---right/<<<`,
            except: `<divclass="fence-block"fence-type="main"><divclass="fence-item"></div></div>`,
        },

        // Invalid cases
        {
            title: "简写渲染-缺少起始标记 [concise]",
            input: `left/---right/<<<`,
            except: `<p>left/---right/&lt;&lt;&lt;</p>`,
        },
        {
            title: "简写渲染-缺少结束标记 [concise]",
            input: `/>>>left/---right`,
            except: `<divclass="fence-block"fence-type="main"><divclass="fence-item"></div></div>`,
        },
        {
            title: "简写渲染-标记不匹配 [concise]",
            input: `/>>>left/---right/<<`,
            except: `<divclass="fence-block"fence-type="main"><divclass="fence-item"></div></div>`,
        },
    ];
    return testData;
}