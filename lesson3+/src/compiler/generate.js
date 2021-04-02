// <div id="app" style="color:red;">hello {{name}} <span>world</span></div>

//   render() {
//       return _c('div', {id: 'app', style: {color: 'red'}}, _v('hello' + _s(name)), _c('span', null, _v('hello')))
//   }

function genProps(attrs) {
  console.log(attrs);
  let str = "";

  for (let i = 0; i < attrs.length; i++) {
    // id "app"  style "fontSize: 12px; color: red;"
    let attr = attrs[i];
    if (attrs.name === "style") {
      let obj = {}; // 对样式进行特殊处理
      attr.value.split(";").forEach((item) => {
        let [key, value] = item.split(":");
        obj[key] = value;
      });
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
    return `_v(${JSON.stringify(text)})`;
  }
}

function genChildren(el) {
  const children = el.children;
  if (children) {
    return children.map((child) => gen(child)).join(",");
  }
}

export function generate(el) {
  let children = genChildren(el);
  let code = `_c('${el.tag}',${
    el.attrs.length ? `${genProps(el.attrs)}` : "undefined"
  }${children ? `, ${children}` : ""})`;
  console.log(code);
  return code;
}
