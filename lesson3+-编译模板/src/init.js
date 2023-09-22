import { compileToFunctions } from "./compiler/index";
import { initState } from "./state";

// 在这里进行各种初始化操作
export function initMixin(Vue) {
    // 往Vue类的原型上添加_init方法
    Vue.prototype._init = function(options) {
        const vm = this;
        vm.$options = options;

        // 初始化状态-处理data数据
        initState(vm);
        // 有el去执行mount
        if (vm.$options.el) {
            vm.$mount(vm.$options.el);
        }
    };
    /**
     * @description 编译模板 渲染DOM
     * @param {DOM元素或者选择器} el 根节点
     */
    Vue.prototype.$mount = function(el) {
        debugger;
        // Vue实例
        const vm = this;
        // 拿到传入的配置
        const options = vm.$options;
        // 获取DOM元素
        el = document.querySelector(el);
        // 将DOM保存到实例的$el属性上
        vm.$el = el;
        // 如果没有render函数选项 - 没有render 将template转化成render方法
        if (!options.render) {
            let template = options.template; // 获取template选项
            if (!template && el) { // 如果template选项不存在并且el存在
                template = el.outerHTML; // 获取el的outerHTML赋值给template
            }
            // 编译原理 将模板编译成render函数
            /**
             function anonymous() {
                with(this){
                    return _c('div',{id:"app",style:{"color":"red"},class:"test"}, _v("hello"+_s(school)),_c('span',undefined, _v("world")))
                }
             }
             */
            const render = compileToFunctions(template);
            // 将render函数挂载到options选项上
            options.render = render;
        }
    };
}