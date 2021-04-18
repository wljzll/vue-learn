import { patch } from "./vdom/patch";

export function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        let vm = this;
        patch(vm.$el, vnode);
    }
}

export function mountComponent(vm, el) {
    console.log(vm._render(), '_render')
    callHook(vm, 'beforeMount');
    vm._update(vm._render());
    callHook(vm, 'mounted');
}

export function callHook(vm, hook) {
    const handlers = vm.$options[hook];
    if(handlers) {
        for(let i = 0; i < handlers.length; i ++) {
            handlers[i].call(vm); // 更改声明周期中的this
        }
    }
}