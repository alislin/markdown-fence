/*
 * @Author: Lin Ya
 * @Date: 2025-03-28 19:58:19
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-10-21 17:22:02
 * @Description: file content
 */
import { datas_main } from "./data-main";
import { datas_other } from "./data-other";
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
        // ...datas_other,
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
    ];
    return testData;
}