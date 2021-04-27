/**
 * 
 * @param {*} oldVnode html模板中的真实HTML
 * @param {*} vnode 
 */
export function patch(oldVnode, vnode) {
    if(oldVnode.nodeType === 1) { // 真实DOM节点
        let el = createElm(vnode);
        let parentElm = oldVnode.parentNode; // 获取老的app的父亲 => body
        parentElm.insertBefore(el, oldVnode.nextSibling); // 当前的真实元素插入到app的前面
        parentElm.removeChild(oldVnode); // 删除老的节点
        return el;
    } else {
        // 1、比较两个标签，标签不一样直接替换
        if(oldVnode.tag != vnode.tag) {
            return oldVnode.el.parentNode.replaceChild(createElm(vnode), oldVnode.el);
        }
        
        // 2、走到这里说明oldVnode和vnode的tag相同，oldVnode是文本，那么vnode也肯定是文本
        if(!oldVnode.tag) {
           if(oldVnode.text !== vnode.text) {
              return oldVnode.el.textContent = vnode.text;
           }
        }

        // 3、标签一样，那就开始比较标签的属性和儿子了 => 走到这里说明是标签，并且是相同标签
        let el = vnode.el = oldVnode.el;
        // 新老属性对比
        updateProperties(vnode, oldVnode.data)

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
        if(!newProps[key]) {
            el.removeAttribute(key); // 移除真实DOM的属性
        }
    }
    // 样式比对
    let newStyle = newProps.style || {};
    let oldStyle = oldProps.style || {};
    for(let key in oldStyle) { // 老的样式里有，新的样式没有，将老的删除
        if(!newStyle[key]) {
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