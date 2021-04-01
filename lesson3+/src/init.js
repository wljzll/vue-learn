import { initState } from "./state";

// 在这里进行各种初始化操作
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    vm.$options = options;

    // 初始化状态
    initState(vm);

    if (vm.$options.el) {
      vm.$mount(vm.options.el);
    }
  };

  Vue.prototype.$mount = function (el) {
    //  挂载操作
    const vm = this;
    const options = vm.$options;
    el = document.querySelector(el);

  };
}
