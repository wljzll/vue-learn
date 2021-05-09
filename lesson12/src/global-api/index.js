import { mergeOptions } from "../util";
import initExtend from "./extend";

export function initGlobalApi(Vue) {
    Vue.options = {}; // 存放全局的属性和方法
    Vue.mixin = function(mixin) {
        this.options = mergeOptions(this.options, mixin);
    }
    Vue.options._base = Vue;
    Vue.options.components = {};

    initExtend(Vue);
    Vue.component = function(id, definition) {
        definition.name = definition.name || id; // 默认会以name属性为准

        // 根据当前的组件对象 生成了一个子类的构造函数，当我们使用这个组件时，需要
        // new definition().$mount();
        definition = this.options._base.extend(definition);

        // Vue.component 注册组件就相当于 Vue.options.components[id] = definition;
        Vue.options.components[id] = definition;
    }
}