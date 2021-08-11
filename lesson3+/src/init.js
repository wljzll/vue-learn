import { compileToFunctions } from "./compiler/index";
import { initState } from "./state";

// 在这里进行各种初始化操作
export function initMixin(Vue) {
    Vue.prototype._init = function(options) {
        const vm = this;
        vm.$options = options;

        // 初始化状态
        initState(vm);

        if (vm.$options.el) {
            vm.$mount(vm.$options.el);
        }
    };
    /**
     * @description 编译模板 渲染DOM
     * @param {DOM元素或者选择器} el 
     */
    Vue.prototype.$mount = function(el) {
        const vm = this; // Vue实例
        const options = vm.$options; // new Vue(options)
        el = document.querySelector(el); // 获取DOM元素
        vm.$el = el; // 保存到实例的$el属性上
        if (!options.render) { // 如果没有render函数选项
            // 没有render 将template转化成render方法
            let template = options.template; // 获取template选项
            if (!template && el) { // 如果template选项不存在并且el存在
                template = el.outerHTML; // 获取el的outerHTML赋值给template
            }
            // 编译原理 将模板编译成render函数
            const render = compileToFunctions(template);
            // 将render函数挂载到options选项上
            options.render = render;
        }
    };
}