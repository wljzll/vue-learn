import Watcher from "./observer/watcher";
import { patch } from "./vdom/patch";

export function lifecycleMixin(Vue) {
    Vue.prototype._update = function(vnode) {
        const vm = this;
        // 初次渲染不存在_vnode
        const prevNode = vm._vnode;
        if (!prevNode) { // 初次渲染 
            // vm.$el：真实DOM vnode: 虚拟DOM
            vm.$el = patch(vm.$el, vnode);
        } else { // 更新操作
            // prevNode:上一次的虚拟DOM vnode:本次的虚拟DOM
            vm.$el = patch(prevNode, vnode);
        }
        vm._vnode = vnode; // 保存上一次的vnode
    };
}

export function mountComponent(vm, el) {
    callHook(vm, "beforeMount");
    let updateComponent = () => {
        vm._update(vm._render());//vm._render()生成虚拟DOM
    };
    new Watcher(vm, updateComponent, () => { callHook(vm, "updated") }, true);
    callHook(vm, "mounted");
}

// 遍历执行对应的hook
export function callHook(vm, hook) {
    const handlers = vm.$options[hook];
    if (handlers) {
        for (let i = 0; i < handlers.length; i++) {
            handlers[i].call(vm); // 更改声明周期中的this
        }
    }
}
