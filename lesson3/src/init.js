import { initState } from "./state";

// 在这里进行各种初始化操作
export function initMixin(Vue) {
    Vue.prototype._init = function(options) {
        const vm = this;
        vm.$options = options

        // 初始化状态
        initState(vm)
    }
}