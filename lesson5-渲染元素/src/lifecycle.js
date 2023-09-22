import { patch } from "./vdom/patch";

export function lifecycleMixin(Vue) {
    /**
     * 
     * @param {*} vnode 虚拟DOM 
     */
    Vue.prototype._update = function (vnode) {
        let vm = this;
        // 创建真实DOM并替换模板并渲染
        patch(vm.$el, vnode);
    }
}

/**
 * @description 生成虚拟DOM
 * @param {*} vm Vue实例 
 * @param {*} el 真实的DOM元素
 */
export function mountComponent(vm, el) {
    vm._update(vm._render());
}