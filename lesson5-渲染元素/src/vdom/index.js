export function renderMixin(Vue) {

    Vue.prototype._c = function () { // 创建虚拟元素
        return createElement(...arguments);
    }

    Vue.prototype._s = function (val) { // 解析插值表达式 stringify
        return val = null ? '' : (typeof val === 'object') ? JSON.stringify(val) : val;
    }

    Vue.prototype._v = function (text) { // 创建虚拟文本元素
        return createTextVnode(text);
    }

    Vue.prototype._render = function () {
        debugger;
        const vm = this;
        const render = vm.$options.render;
        let vnode = render.call(vm);
        console.log(vnode, '创建出的虚拟DOM');
        return vnode;
    }
}

/**
 * 
 * @param {*} tag 标签名 
 * @param {*} data 元素的属性
 * @param  {...any} children 子元素
 * @returns 
 */
function createElement(tag, data = {}, ...children) {
    return vnode(tag, data, data.key, children);
}

/**
 * 
 * @param {*} text 文本 
 * @returns 
 */
function createTextVnode(text) {
   return vnode(undefined, undefined, undefined, undefined, text);
}

/**
 * 用来产生虚拟DOM
 * @param {*} tag 标签名
 * @param {*} data 标签属性
 * @param {*} key 标签的key属性
 * @param {*} children 子元素
 * @param {*} text 文本元素传入的值
 * @returns 
 */
function vnode(tag, data, key, children, text) {
    return {
        tag,
        data,
        key,
        children,
        text
    }
}