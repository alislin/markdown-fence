/*
 * @Author: Lin Ya
 * @Date: 2025-10-21 16:53:04
 * @LastEditors: Lin Ya
 * @LastEditTime: 2025-10-21 16:56:15
 * @Description: file content
 */
export const datas_other = [
    {
        title: `[other] - html标签原样处理 - div`,
        input: `<div></div>`,
        except: `<div></div>`,
    },
    {
        title: `[other] - html标签原样处理 - 注释`,
        input: `<!-- 注释 -->`,
        except: `<!-- 注释 -->`,
    },
    {
        title: `[other] - html标签原样处理 - 注释嵌套`,
        input: `<!-- <div>注释</div> -->`,
        except: `<!-- <div>注释</div> -->`,
    },
];