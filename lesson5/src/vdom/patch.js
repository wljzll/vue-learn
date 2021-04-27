/**
 * 
 * @param {*} oldVnode html模板中的真实HTML
 * @param {*} vnode 
 */
export function patch(oldVnode, vnode) {
    let el = createElm(vnode);
    let parentElm = oldVnode.parentNode; // 获取老的app的父亲 => body
    parentElm.insertBefore(el, oldVnode.nextSibling); // 当前的真实元素插入到app的前面
    parentElm.removeChild(oldVnode); // 删除老的节点
}

function createElm(vnode) {
    let { tag, children, key, data, text } = vnode;
    if (typeof tag === 'string') { // 如果是一个标签
        vnode.el = document.createElement(tag);
        // 处理元素属性
        updateProperties(vnode);
        children.forEach(child => {
            vnode.el.appendChild(createElm(child));
        })
    } else {
        vnode.el = document.createTextNode(text);
    }
    return vnode.el;
}

function updateProperties(vnode) {
    let el = vnode.el;
    let newProps = vnode.data;
    for (const key in newProps) {
        if (key === 'style') {
            for (const styleName in newProps.style) {
                el.style[styleName] = newProps.style[styleName];
            }
        } else if (key === 'class') {
            el.className = newProps.class;
        } else {
            el.setAttribute(key, newProps[key]);
        }
    }
}