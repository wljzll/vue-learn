import { isReservedTag } from "../util";

//  _c('div', {id: 'app', style: {color: 'red'}}, _v('hello' + _s(name)), _c('span', null, _v('hello')))
/**
 * @description 往Vue原型链上挂载_c/_s/_v/_render方法
 * @param {*} Vue Vue类
 */
export function renderMixin(Vue) {

    Vue.prototype._c = function() { // 创建虚拟元素
        return createElement(this, ...arguments);
    }
    
    /**
     * @description 解析插值表达式 stringify
     * @param {*} val 插值表达式的值
     * @returns 
     */
    Vue.prototype._s = function(val) {
        return val = null ? '' : (typeof val === 'object') ? JSON.stringify(val) : val;
    }
    
    /**
     * @description 创建虚拟文本元素
     * @param {*} text 
     * @returns 
     */
    Vue.prototype._v = function(text) {
        return createTextVnode(text);
    }

    Vue.prototype._render = function() {
        const vm = this;
        const render = vm.$options.render;
        let vnode = render.call(vm);
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
function createElement(vm, tag, data = {}, ...children) {
    if (isReservedTag(tag)) { // 是原生标签，不是组件，走之前逻辑
        return vnode(tag, data, data.key, children);
    } else { // 是组件
        // 获取这个组件的构造函数
        let Ctor = vm.$options.components[tag];
        // 创建组件的虚拟节点
        return createComponent(vm, tag, data, data.key, children, Ctor);
    }

}


/**
 * @description 创建组件的虚拟DOM
 * @param {*} vm 
 * @param {*} tag 组件名
 * @param {*} data 组件属性
 * @param {*} key 组件的key
 * @param {*} children 组件的子元素
 * @param {*} Ctor 组件这个类
 * @returns 
 */
function createComponent(vm, tag, data, key, children, Ctor) {
    // baseCtor就是Vue类
    const baseCtor = vm.$options._base;

    // 注册过的组件是个构造函数 typeof Ctor === 'function'
    // 如果是个object说明没注册过 调用Vue类的extend属性注册组件 返回构造函数
    if (typeof Ctor == 'object') {
        Ctor = baseCtor.extend(Ctor);
    }

    // 在组件的属性上添加一个hook属性,这个属性中有一个init()方法,在创建真实DOM时,会调用init()方法
    data.hook = {
        // vnode:虚拟DOM
        init(vnode) {
            // 创建组件实例
            let child = vnode.componentInstance = new Ctor({});
            // 挂载逻辑 组件的$mount方法中是不传递参数的
            child.$mount(); 
        }
    }
    // 返回组件的虚拟DOM
    return vnode(`vue-component-${Ctor.cid}-${tag}`, data, key, undefined, undefined, {
        Ctor,
        children
    })
}

/**
 * 
 * @param {*} text 
 * @returns 
 */
function createTextVnode(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
}

/**
 * @description 创建虚拟DOM
 * @param {*} tag 标签名
 * @param {*} data 标签属性
 * @param {*} key 标签的key属性
 * @param {*} children 子元素
 * @param {*} text 文本元素传入的值
 * @param {*} componentOptions 组件的选项
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