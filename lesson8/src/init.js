import { compileToFunctions } from "./compiler/index";
import { callHook, mountComponent } from "./lifecycle";
import { initState } from "./state";
import { mergeOptions } from "./util";

// 在这里进行各种初始化操作
export function initMixin(Vue) {
    Vue.prototype._init = function(options) {
        const vm = this;
        // vm.$options = options;
        vm.$options = mergeOptions(this.constructor.options, options); // 将用户new Vue时传入的options和混入的全局options做合并
        callHook(vm, 'beforeCreate');
        // console.log(this.$options, '合并');
        // 初始化状态
        initState(vm);
        callHook(vm, 'created');
        if (vm.$options.el) {
            vm.$mount(vm.$options.el);
        }
    };

    Vue.prototype.$mount = function(el) {
        //  挂载操作
        const vm = this;
        const options = vm.$options;
        el = document.querySelector(el);
        vm.$el = el;
        if (!options.render) {
            // 没有render 将template转化成render方法
            let template = options.template;
            if (!template && el) {
                template = el.outerHTML;
            }
            // 编译原理 将模板编译成render函数
            const render = compileToFunctions(template);
            options.render = render;
        }
        mountComponent(vm, el);
    };
}