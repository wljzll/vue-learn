//  <div id="app"><div id="my">hello {{name}} <span>world</span></div></div>
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

function parseHTML(html) {

    function createASTElement(tagName, attrs) {
        return {
            tag: tagName, // 标签名
            type: 1, // 标签类型 
            children: [], // 子元素
            attrs, // 属性
            parent: null // 父元素
        }
    }

    let root;
    let currentParent;
    let stack = [];

    function start(tagName, attrs) {
        let element = createASTElement(tagName, attrs);
        if (!root) {
            root = element;
        }
        currentParent = element;
        stack.push(element);
    }

    function end(tagName) { // 在结尾标签处 创建父子关系
        let element = stack.pop(); // 取出栈中的最后一个
        currentParent = stack[stack.length - 1];
        if (currentParent) { // 在闭合时可以知道这个标签的父亲是谁
            element.parent = currentParent;
            currentParent.children.push({ element })
        }
    }

    function chars(text) {
        text = text.replace(/\s/g, '');
        if (text) {
            currentParent.children.push({
                type: 3,
                text: text
            })
        }
    }

    while (html) { // 只要HTML不为空就一直解析下去
        let textEnd = html.indexOf('<')
        if (textEnd == 0) { // 可能是开始标签 也可能是结束标签
            // 肯定是标签
            const startTagMatch = parseStartTag(); // 开始标签的匹配结果
            if (startTagMatch) { // 处理开始标签
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue;
            }

            const endTagMatch = html.match(endTag);
            if (endTagMatch) { // 处理结束标签
                advance(endTagMatch[0].length);
                end(endTagMatch[1]); // 将结束标签传入
                continue;
            }
        }
        let text;
        if (textEnd > 0) { // 处理文本
            text = html.substring(0, textEnd);

        }
        if (text) { // 处理文本
            advance(text.length);
            chars(text);
            console.log(html)
        }
    }

    function advance(n) {
        html = html.substring(n)
    }
    // 获取开始标签以及开始标签中的属性
    function parseStartTag() {
        const start = html.match(startTagOpen);
        if (start) {
            const match = {
                tagName: start[1],
                attrs: []
            }
            advance(start[0].length); // 删除匹配到的标签
            // 如果是闭合标签了 说明没有属性
            let end;
            let attr;
            // 不是结尾标签(开始标签的闭合 >) 并且能匹配到属性
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                // console.log(attr)
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5]
                })
                advance(attr[0].length); // 去掉当前属性
            }
            if (end) {
                advance(end[0].length);
                return match;
            }
        }
    }

    return root;
}

export function compileToFunctions(template) {
    // html模板 => render函数
    // ast语法树
    /**
     * 1、将html代码转化成AST抽象语法树 可以用AST抽象语法树来描述语言本身
     * 2、通过这棵树 重新生成代码
     */

    let ast = parseHTML(template);
    console.log(ast);
}