import { compileToFunctions } from "./compiler/index";
import { mountComponent } from "./lifecycle";
import { initState } from "./state";

// 在这里进行各种初始化操作
export function initMixin(Vue) {
    Vue.prototype._init = function(options) {
        const vm = this;
        vm.$options = options;

        // 初始化状态
        initState(vm);
        
        // 如果el存在调用Vue原型上的$mount()方法
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
            // 把render函数保存到options上
            options.render = render;
        }
        // 开始挂载组件
        mountComponent(vm, el);
    };
}