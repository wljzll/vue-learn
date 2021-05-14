import { isReservedTag } from "../util";

export function renderMixin(Vue) {

    Vue.prototype._c = function() { // 创建虚拟元素
        return createElement(this, ...arguments);
    }

    Vue.prototype._s = function(val) { // 解析插值表达式 stringify
        return val = null ? '' : (typeof val === 'object') ? JSON.stringify(val) : val;
    }

    Vue.prototype._v = function(text) { // 创建虚拟文本元素
        return createTextVnode(text);
    }

    Vue.prototype._render = function() {
        const vm = this;
        const render = vm.$options.render;
        let vnode = render.call(vm);
        return vnode;
    }
}

function createElement(vm, tag, data = {}, ...children) {
    console.log(arguments);
    if (isReservedTag(tag)) { // 是原生标签，不是组件，走之前逻辑
        return vnode(tag, data, data.key, children);
    } else { // 是组件
        let Ctor = vm.$options.components[tag];
        // 创建组件的虚拟节点
        return createComponent(vm, tag, data, data.key, children, Ctor);
    }

}

function createComponent(vm, tag, data, key, children, Ctor) {
    const baseCtor = vm.$options._base;
    if (typeof Ctor == 'object') {
        Ctor = baseCtor.extend(Ctor);
    }
    data.hook = {
        init(vnode) {
            let child = vnode.componentInstance = new Ctor({});
            child.$mount(); // 挂载逻辑 组件的$mount方法中是不传递参数的
        }
    }

    return vnode(`vue-component-${Ctor.cid}-${tag}`, data, key, undefined, undefined, {
        Ctor,
        children
    })
}

function createTextVnode(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
}

/**
 * 用来产生虚拟DOM
 * @param {*} tag 
 * @param {*} data 
 * @param {*} key 
 * @param {*} children 
 * @param {*} text 
 * @returns 
 */
function vnode(tag, data, key, children, text, componentOptions) {
    return {
        tag,
        data,
        key,
        children,
        text,
        componentOptions // 组件的虚拟节点多了一个componentOptions，用来保存当前组件的构造函数和它的插槽
    }
}