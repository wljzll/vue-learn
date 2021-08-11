const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >


/**
 * 
 * @param {String} html template字符串 
 * @returns 
 */
export function parseHTML(html) {
    /**
     * @description 将传入的tagName和attrs包装成Object
     * @param {String} tagName 标签名
     * @param {Array} attrs 标签属性
     * @returns 包装后的Object
     */
    function createASTElement(tagName, attrs) {
        return {
            tag: tagName, // 标签名
            type: 1, // 标签类型 
            children: [], // 子元素
            attrs, // 属性
            parent: null // 父元素
        }
    }

    let root; // 根元素
    let currentParent; // 当前父元素
    let stack = []; // 存放开始标签的Object形式集合

    /**
     * 2、
     * @description 一是通过返回值确定是不是开始标签 二是根据捕获到的开始标签将开始标签处理成Object形式并删除处理过的开始标签及其属性等
     * @returns 捕获到的开始标签组合成的Object
     */
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
                // console.log(attr, '======')
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
    } // end parseStartTag

    /**
     * @description 确定root元素 确定当前的currentParent 将当前元素添加到stack中
     * @param {String} tagName 
     * @param {Array} attrs 
     */
    function start(tagName, attrs) {
        let element = createASTElement(tagName, attrs);
        if (!root) {
            root = element;
        };
        // 处理开始标签时 就是开始标签
        currentParent = element;
        stack.push(element);
        // console.log(stack, 'stack')
    }
    
    /**
     * @description 标签闭合 创建当前标签的父子关系
     * @param {*} tagName 
     */
    function end(tagName) { // 在结尾标签处 创建父子关系
        let element = stack.pop(); // 取出栈中的最后一个
        // 当有闭合标签时 stack中的第二个Object肯定是这个元素的父标签
        currentParent = stack[stack.length - 1];
        if (currentParent) { // 在闭合时可以知道这个标签的父亲是谁
            element.parent = currentParent;
            currentParent.children.push(element)
        }
    }
    /**
     * @description 将文本去空格后添加到当前元素(curentParent)中
     * @param {String} text 
     */
    function chars(text) {
        // 去空格
        text = text.replace(/\s/g, '');
        if (text) {
            currentParent.children.push({
                type: 3,
                text: text
            })
        }
    }

    /**
     * @description 根据传入的length从html开头删除对应长度的字符
     * @param {Number} n 
     */
    function advance(n) {
        html = html.substring(n)
    }

    // 1、while循环 只要html字符串不为空就一直解析下去
    while (html) {
        // 获取 < 标签的位置
        let textEnd = html.indexOf('<');

        // textEnd = 0 开始位置肯定是标签 可能是开始标签 也可能是结束标签
        if (textEnd == 0) {
            // 开始标签的匹配结果 Object：匹配到了开始标签并包装成了Object undefined当前字符串开头不是开始标签
            const startTagMatch = parseStartTag();
            if (startTagMatch) { // 如果匹配到了开始标签 处理开始标签
                start(startTagMatch.tagName, startTagMatch.attrs);
                continue;
            }

            // 匹配结束标签
            const endTagMatch = html.match(endTag);
            if (endTagMatch) { // 如果匹配到了结束标签 处理结束标签
                // 从html删除结束标签字符
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
            // console.log(html);
        }
    }

    return root;
}