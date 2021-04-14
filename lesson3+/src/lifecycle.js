export function lifecycleMixin(Vue) {
    Vue.prototype._update = function () {

    }
}

export function mountComponent(vm, el) {
    vm._update(vm._render());
}