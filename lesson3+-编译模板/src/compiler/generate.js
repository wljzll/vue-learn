// <div id="app" style="color:red;">hello {{name}} <span>world</span></div>

//   render() {
//       return _c('div', {id: 'app', style: {color: 'red'}}, _v('hello' + _s(name)), _c('span', null, _v('hello')))
//   }
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // 插值表达式的正则
// 生成属性
function genProps(attrs) {
    let str = "";
    for (let i = 0; i < attrs.length; i++) {
        // id "app"  style "fontSize: 12px; color: red;"
        let attr = attrs[i];
        // 判断是否为style属性 单独处理
        if (attr.name === "style") {
            let obj = {}; // 对样式进行特殊处理
            attr.value.split(";").forEach((item) => {
                if (!item) return; // 处理 style="color:red;"
                let [key, value] = item.split(":");
                obj[key] = value;
            });
            console.log('obj', obj);
            attr.value = obj;
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`;
    }
    return `{${str.slice(0, -1)}}`; // slice去掉最后一个逗号
}

function gen(node) {
    if (node.type == 1) { // 如果是元素节点 递归将当前元素和其children处理成字符串函数
        return generate(node);
    } else { // 如果是文本节点
        let text = node.text;
        if (!defaultTagRE.test(text)) { // 如果只是普通文本
            return `_v(${JSON.stringify(text)})`;
        }

        // 模板字符串文本处理
        // 每次使用正则，重新初始化lastIndex
        let lastIndex = (defaultTagRE.lastIndex = 0);
        let tokens = [];
        let match, index;
        // 匹配到了插值表达式
        while ((match = defaultTagRE.exec(text))) {
            // console.log('match', match, lastIndex);
            index = match.index; // 匹配到的{{}}的开始索引 ["{{name}}", "name", index: 6, input: "hellos{{name}}", groups: undefined]
            if (index > lastIndex) { // 说明index之前的是普通文本
                // 把普通文本放到数组里
                tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }
            // 把插值表达式包装到_s函数里做成字符串放到数组里
            tokens.push(`_s(${match[1].trim()})`);
            // 移动正则的索引
            lastIndex = index + match[0].length;
        }
        // 匹配完之后，lastIndex没有走到最后，说明还剩余普通字符
        if (lastIndex < text.length) {
            // 再把普通字符串收集起来
            tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        // console.log('tokens',tokens)
        return `_v(${tokens.join("+")})`; // _v("hello"+_s(school))
    }
}

/**
 * 
 * @param {Object} el 抽象语法树
 * @returns 处理后的子元素
 */
function genChildren(el) {
    // 获取当前元素的子元素
    const children = el.children;
    if (children) { // 将所有转换后的儿子用逗号隔开
        return children.map((child) => gen(child)).join(",");
    }
}

/**
 * @description 将抽象语法树解析成_c()函数包装的字符串
 * @param {Object} el 
 * @returns 字符串函数
 */
export function generate(el) {

    let children = genChildren(el);
    console.log('children', children);

    let code = `_c('${el.tag}',${el.attrs.length ? `${genProps(el.attrs)}` : "undefined"}${children ? `, ${children}` : ""})`;

    // console.log(code);
    return code;
}