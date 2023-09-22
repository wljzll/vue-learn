import { initState } from "./state";

// 在这里进行各种初始化操作
export function initMixin (Vue) {
    // 在Vue类的原型上定义_init方法 new Vue的时候也会执行这个方法
    Vue.prototype._init = function(options) {
        const vm = this;
        // 将options赋值给Vue实例的$options属性
        vm.$options = options

        // 初始化状态
        initState(vm)
    }
}