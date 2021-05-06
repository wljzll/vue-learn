/**
 *
 * @param {*} oldVnode html模板中的真实HTML
 * @param {*} vnode
 */
export function patch(oldVnode, vnode) {
  if (oldVnode.nodeType === 1) {
    // 真实DOM节点
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
        return (oldVnode.el.textContent = vnode.text);
      }
    }

    // 3、标签一样，那就开始比较标签的属性和儿子了 => 走到这里说明是标签，并且是相同标签
    let el = (vnode.el = oldVnode.el);
    // 标签相同，新老属性对比，更新标签不同的属性
    updateProperties(vnode, oldVnode.data);
    // 比较儿子：1、老的有儿子，新的没儿子；2、老的没儿子，新的有儿子；3、老的有儿子，新的有儿子(diff算法主要用在这里)
    let oldChildren = oldVnode.children || [];
    let newChildren = vnode.children || [];

    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 老的有儿子，新的有儿子 diff算法
      updateChildren(oldChildren, newChildren, el);
    } else if (oldChildren.length > 0) {
      // 老的有儿子，新的没儿子
      el.innerHTML = "";
    } else if (newChildren.length > 0) {
      // 老的没儿子，新的有儿子
      for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i];
        // 浏览器有性能优化 不用再自己搞文档碎片了
        el.appendChild(createElm(child));
      }
    }
  }
}

function isSameVnode(oldVnode, vnode) {
  return oldVnode.tag == vnode.tag && oldVnode.key == vnode.key;
}

function updateChildren(oldChildren, newChildren, parent) {
  let oldStartIndex = 0;
  let oldStartVnode = oldChildren[0];
  let oldEndIndex = oldChildren.length - 1;
  let oldEndVnode = oldChildren[oldEndIndex];

  let newStartIndex = 0;
  let newStartVnode = newChildren[0];
  let newEndIndex = newChildren.length - 1;
  let newEndVnode = newChildren[newEndIndex];

  function makeIndexByKey(children) {
    let map = {};
    children.forEach((item, index) => {
      if (item.key) {
        map[item.key] = index;
      }
    });
    return map;
  }
  let map = makeIndexByKey(oldChildren);
  
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (!oldStartVnode) {
      // 遇到被暴力比对置为null的元素，跳过
      oldStartVnode = oldChildren[++oldStartIndex];
    } else if (!oldEndVnode) {
      oldEndVnode = oldChildren[--oldEndIndex];
    } else if (isSameVnode(oldStartVnode, newStartVnode)) {
      // 开头元素相同 头和头比 从前往后比对
      patch(oldStartVnode, newStartVnode); // 更新属性再去递归子节点
      oldStartVnode = oldChildren[++oldStartIndex]; // 老的开始指针向后走
      newStartVnode = newChildren[++newStartIndex]; // 新的开始指针向后走
    } else if (isSameVnode(oldEndVnode, newEndVnode)) {
      // 结尾元素相同 尾和尾比对 从后往前比对
      patch(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex]; // 老的结尾指针向前走
      newEndVnode = newChildren[--newEndIndex]; // 新的结尾指针向前走
    } else if (isSameVnode(oldStartVnode, newEndVnode)) {
      // 老的头部和新的尾部相同 则交叉比对
      patch(oldStartVnode, newEndVnode); // 元素相同 更新属性，递归比对子元素
      parent.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling); // 将老的头部插入到老的尾部的下一个元素前面
      oldStartVnode = oldChildren[++oldStartIndex]; // 老的开始指针向后走
      newEndVnode = newChildren[--newEndIndex]; // 新的结尾指针向前走
    } else if (isSameVnode(oldEndVnode, newStartVnode)) {
      // 老的尾部和新的头部相同 交叉比对
      patch(oldEndVnode, newStartVnode); // 元素相同 更新属性，递归比对子元素
      parent.insertBefore(oldEndVnode.el, oldStartVnode.el); // 将老的尾部插入到老的开始元素的前面
      oldEndVnode = oldChildren[--oldEndIndex]; // 老的结尾指针向前走
      newStartVnode = newChildren[++newStartIndex]; // 新的开始指针向后走
    } else {
      // 以上四种关系都不存在 暴力比对
      let moveIndex = map[newStartVnode.key]; // 拿到新虚拟DOM的开头节点的key 去老的中找
      if (moveIndex == undefined) {
        // 老的中没有新的虚拟DOM的开头元素，或者是key不存在的情况，没有老节点复用，直接创建新的插入
        parent.insertBefore(createElm(newStartVnode), oldStartVnode.el);
      } else {
        let moveVnode = oldChildren[moveIndex]; // 在老的中找到了这个对应的虚拟节点，通过移动来复用
        oldChildren[moveIndex] = null; // 将被移动的真实DOM对一个的虚拟DOM置为null，不会再进行下次比对
        parent.insertBefore(moveVnode.el, oldStartVnode.el); // 在页面真实DOM元素间将对应的老的真实DOM移动
        patch(moveVnode, newStartVnode); // 元素可以复用，对比子元素和属性
      }
      newStartVnode = newChildren[++newStartIndex]; // 开头元素已处理，将开头指针往下移
    }
  }

  // 新元素比老元素多，需要判断是向前插还是向后插
  if (newStartIndex <= newEndIndex) {
    // 说明有多的子元素
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      //    parent.appendChild(createElm(newChildren[i]));
      // 在这里就可能是向父元素尾部添加元素也可能向父元素头部添加元素
      /**
       * 1、头和头比时，newEndIndex是不动的，当newChildren[newEndIndex + 1]不存在时，如果有多出元素，说明应该向尾部追加多出元素
       * 2、尾和尾比时，newEndIndex往前走，当newChildren[newEndIndex + 1]存在时，如果有多出元素，说明应该向头部添加多出元素
       */
      let ele =
        newChildren[newEndIndex + 1] == null
          ? null
          : newChildren[newEndIndex + 1].el;
      // 当ele为null时，insertBefore元素特性将变成appendChild
      parent.insertBefore(createElm(newChildren[i]), ele);
    }
  }

  // 老的有多余的 删除
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      let child = oldChildren[i];
      if (child != undefined) {
        parent.removeChild(child.el);
      }
    }
  }
}

export function createElm(vnode) {
  let { tag, children, key, data, text } = vnode;
  if (typeof tag === "string") {
    // 如果是一个标签
    vnode.el = document.createElement(tag);
    // 处理元素属性
    updateProperties(vnode);
    children.forEach((child) => {
      vnode.el.appendChild(createElm(child));
    });
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

function updateProperties(vnode, oldProps = {}) {
  let el = vnode.el;
  let newProps = vnode.data || {};

  // 老的有新的没有 需要删除属性
  for (let key in oldProps) {
    if (!newProps[key]) {
      el.removeAttribute(key); // 移除真实DOM的属性
    }
  }
  // 样式比对
  let newStyle = newProps.style || {};
  let oldStyle = oldProps.style || {};
  for (let key in oldStyle) {
    // 老的样式里有，新的样式没有，将老的删除
    if (!newStyle[key]) {
      el.style[key] = "";
    }
  }

  // 最后将新的全部应用上去
  for (const key in newProps) {
    if (key === "style") {
      for (const styleName in newProps.style) {
        el.style[styleName] = newProps.style[styleName];
      }
    } else if (key === "class") {
      el.className = newProps.class;
    } else {
      el.setAttribute(key, newProps[key]);
    }
  }
}
