import { initState } from "./state";

// 在这里进行各种初始化操作
export function initMixin(Vue) {
    /**
     * 在Vue原型上添加_init()方法 当用户new Vue({})时，执行this._init(options)
     * @param {Object} options new Vue({})时传入的配置项 
     */
    Vue.prototype._init = function(options) {
        const vm = this;
        vm.$options = options

        // 初始化状态 - data/props/methods/computed/watch等等
        initState(vm)
    }
}