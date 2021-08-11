/**
 * 
 * @param {*} oldVnode html模板中的真实HTML
 * @param {*} vnode render函数生成的虚拟DOM
 */
export function patch(oldVnode, vnode) {
    // 创建真实DOM
    let el = createElm(vnode);
    let parentElm = oldVnode.parentNode; // 获取老的app的父亲 => body
    parentElm.insertBefore(el, oldVnode.nextSibling); // 当前的真实元素插入到app的前面
    parentElm.removeChild(oldVnode); // 删除老的节点
}

/**
 * 
 * @param {*} vnode 虚拟DOM 
 * @returns 创建的真实DOM
 */
function createElm(vnode) {
    let { tag, children, key, data, text } = vnode;
    if (typeof tag === 'string') { // 如果是一个标签
        // 将创建的真实DOM挂载到虚拟DOM上
        vnode.el = document.createElement(tag);
        // 处理元素属性
        updateProperties(vnode);
        // 递归处理子元素
        children.forEach(child => {
            vnode.el.appendChild(createElm(child));
        })
    } else { // 如果是文本标签 创建文本元素
        vnode.el = document.createTextNode(text);
    }
    return vnode.el;
}

function updateProperties(vnode) {
    // 真实DOM
    let el = vnode.el;
    // DOM属性
    let newProps = vnode.data;
    for (const key in newProps) {
        if (key === 'style') { // style属性的处理
            for (const styleName in newProps.style) {
                el.style[styleName] = newProps.style[styleName];
            }
        } else if (key === 'class') { // class属性的处理
            el.className = newProps.class;
        } else { // 其他属性的处理
            el.setAttribute(key, newProps[key]);
        }
    }
}