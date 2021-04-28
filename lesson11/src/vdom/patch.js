/**
 * 
 * @param {*} oldVnode html模板中的真实HTML
 * @param {*} vnode 
 */
export function patch(oldVnode, vnode) {
    if (oldVnode.nodeType === 1) { // 真实DOM节点
        let el = createElm(vnode);
        let parentElm = oldVnode.parentNode; // 获取老的app的父亲 => body
        parentElm.insertBefore(el, oldVnode.nextSibling); // 当前的真实元素插入到app的前面
        parentElm.removeChild(oldVnode); // 删除老的节点
        return el;
    } else {
        // 1、比较两个标签，标签不一样直接替换
        if (oldVnode.tag != vnode.tag) {
            return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
        }

        // 2、走到这里说明oldVnode和vnode的tag相同，oldVnode是文本，那么vnode也肯定是文本
        if (!oldVnode.tag) {
            if (oldVnode.text !== vnode.text) {
                return oldVnode.el.textContent = vnode.text;
            }
        }

        // 3、标签一样，那就开始比较标签的属性和儿子了 => 走到这里说明是标签，并且是相同标签
        let el = vnode.el = oldVnode.el;
        // 标签相同，新老属性对比，更新标签不同的属性
        updateProperties(vnode, oldVnode.data)
        // 比较儿子：1、老的有儿子，新的没儿子；2、老的没儿子，新的有儿子；3、老的有儿子，新的有儿子(diff算法主要用在这里)
        let oldChildren = oldVnode.children || [];
        let newChildrend = vnode.children || [];

        if (oldChildren.length > 0 && newChildrend.length > 0) {
            // 老的有儿子，新的有儿子 diff算法
            updateChildren(oldChildren, newChildrend, el);
        } else if (oldChildren.length > 0) {
            // 老的有儿子，新的没儿子
            el.innerHTML = '';
        } else if (newChildrend.length > 0) {
            // 老的没儿子，新的有儿子
            for (let i = 0; i < newChildrend.length; i++) {
                let child = newChildrend[i];
                // 浏览器有性能优化 不用再自己搞文档碎片了
                el.appendChild(createElm(child));
            }
        }

    }

}

function isSameVnode(oldVnode, vnode, parent) {
  return (oldVnode.tag == vnode.tag) && (oldVnode.key == vnode.key);
}

function updateChildren(oldChildren, newChildrend) {
    let oldStartIndex = 0;
    let oldStartVnode = oldChildren[0];
    let oldEndIndex = oldChildren.length - 1;
    let oldEndVnode = oldChildren[oldEndIndex];

    let newStartIndex = 0;
    let newStartVnode = newChildren[0];
    let newEndIndex = newChildren.length - 1;
    let newEndVnode = newChildren[newEndIndex];

    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
       if(isSameVnode(oldStartVnode, newStartVnode)) {
           patch(oldStartVnode, newStartVnode);  // 更新属性再去递归子节点
           oldStartVnode = oldChildren[++oldStartIndex];
           newStartVnode = newChildren[++newStartIndex];
       }
    }

    if(newStartIndex <= newEndIndex) { // 说明有多的子元素
       for (let i = newStartIndex; i < newEndIndex; i++) {
           parent.appendChild(createElm(newChildrend[i]));
           
       }
    }
}

export function createElm(vnode) {
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

function updateProperties(vnode, oldProps = {}) {
    let el = vnode.el;
    let newProps = vnode.data || {};

    // 老的有新的没有 需要删除属性
    for (const key in oldProps) {
        if (!newProps[key]) {
            el.removeAttribute(key); // 移除真实DOM的属性
        }
    }
    // 样式比对
    let newStyle = newProps.style || {};
    let oldStyle = oldProps.style || {};
    for (let key in oldStyle) { // 老的样式里有，新的样式没有，将老的删除
        if (!newStyle[key]) {
            el.style[key] = '';
        }
    }

    // 最后将新的全部应用上去
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