// <div id="app" style="color:red;">hello {{name}} <span>world</span></div>

//   render() {
//       return _c('div', {id: 'app', style: {color: 'red'}}, _v('hello' + _s(name)), _c('span', null, _v('hello')))
//   }
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
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
        if(!item) return; // 处理 style="color:red;"
        let [key, value] = item.split(":");
        obj[key] = value;
      });
      // console.log('obj', obj);
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`; // slice去掉最后一个逗号
}

function gen(node) {
  if (node.type == 1) {
    return generate(node);
  } else {
    let text = node.text;
    if (!defaultTagRE.test(text)) { // 如果是普通文本
      return `_v(${JSON.stringify(text)})`;
    }
    // 每次使用正则，重新初始化lastIndex
    let lastIndex = (defaultTagRE.lastIndex = 0);
    let tokens = [];
    let match, index;

    while ((match = defaultTagRE.exec(text))) {
      // console.log('match', match, lastIndex);
      index = match.index; // 匹配到的{{}}的索引 ["{{name}}", "name", index: 6, input: "hellos{{name}}", groups: undefined]
      if (index > lastIndex) { // 说明index之前的是普通文本
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }
      tokens.push(`_s(${match[1].trim()})`);
      lastIndex = index + match[0].length;
    }
    // 匹配完之后，lastIndex没有走到最后，说明还剩余普通字符
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    }
    // console.log('tokens', tokens)
    return `_v(${tokens.join("+")})`;
  }
}

function genChildren(el) {
  const children = el.children;
  if (children) { // 将所有转换后的儿子用逗号隔开
    return children.map((child) => gen(child)).join(",");
  }
}

export function generate(el) {
  let children = genChildren(el);
  let code = `_c('${el.tag}',${el.attrs.length ? `${genProps(el.attrs)}` : "undefined"}${children ? `, ${children}` : ""})`;
  return code;
}
