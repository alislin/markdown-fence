import MarkdownIt from "markdown-it";
import fencePlugin from "../fencePlugin";

const md = new MarkdownIt();
// 读取键盘输入（多行输入），使用/end 结束输入，获取输入文本 inputContent.
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

let inputContent = '';

readline.question('请输入内容，以 /end 结束：', (input: string) => {
    inputContent += input + '\n';

    if (input.trim() === '/end') {
        readline.close();
        console.log('输入内容：', inputContent);
    } else {
        readline.setPrompt('');
        readline.prompt();
        readline.on('line', (input: string) => {
            inputContent += input + '\n';
            if (input.trim() === '/end') {
                readline.close();
                // console.log('输入内容：', inputContent);
                const result = md.use(fencePlugin).render(inputContent.substring(0, inputContent.length - 4));
                console.log();
                console.log();
                console.log("====================== 渲染结果 ==========================");
                console.log(result);
                console.log("=========================================================");

            }
        });
    }
});

