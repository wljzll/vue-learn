import { mergeOptions } from "../util";
import initExtend from "./extend";

export function initGlobalApi(Vue) {
    // 存放全局的属性和方法
    Vue.options = {}; 

    // 将要全局混入的选项都合并到Vue类的静态属性options上
    Vue.mixin = function(mixin) {
        this.options = mergeOptions(this.options, mixin);
    }

    // 将Vue类本身保存在自己的_base上
    Vue.options._base = Vue;

    // 用来保存Vue.component()注册的组件
    Vue.options.components = {};

    // 调用initExtend方法
    initExtend(Vue);

    // Vue.component()当前注册的组件通过extend()方法创建一个Vue的子类，并将这个子类保存到Vue/Vue实例的components属性上
    Vue.component = function(id, definition) {
        
        definition.name = definition.name || id; // 默认会以name属性为准

        // 调用Vue对象的extend方法创建组件子类
        definition = this.options._base.extend(definition);

        // 将生成的【组件的类】 保存到Vue类的optios属性上 这时的definition就是Vue的子类了
        Vue.options.components[id] = definition;
    }
}