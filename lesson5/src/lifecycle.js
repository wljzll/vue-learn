import { patch } from "./vdom/patch";

export function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
        let vm = this;
        patch(vm.$el, vnode);
    }
}

export function mountComponent(vm, el) {
    console.log(vm._render(), '_render')
    vm._update(vm._render());
}