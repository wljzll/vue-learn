import Watcher from "./observer/watcher";
import { patch } from "./vdom/patch";

export function lifecycleMixin(Vue) {
    Vue.prototype._update = function(vnode) {
        const vm = this;
        // 初次渲染不存在_vnode
        const prevNode = vm._vnode;
        // 这里需要区分一下，到底是首次渲染还是更新
        if (!prevNode) {
            vm.$el = patch(vm.$el, vnode);
        } else {
            // 拿上次的vnode和本次做对比
            vm.$el = patch(prevNode, vnode);
        }
        vm._vnode = vnode; // 保存第一次的vnode
    };
}

export function mountComponent(vm, el) {
    callHook(vm, "beforeMount");
    let updateComponent = () => {
        vm._update(vm._render());
    };
    new Watcher(vm, updateComponent, () => { callHook(vm, "updated") }, true);
    callHook(vm, "mounted");
}

export function callHook(vm, hook) {
    const handlers = vm.$options[hook];
    if (handlers) {
        for (let i = 0; i < handlers.length; i++) {
            handlers[i].call(vm); // 更改声明周期中的this
        }
    }
}