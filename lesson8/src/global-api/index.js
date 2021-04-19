import { mergeOptions } from "../util";

export function initGlobalApi(Vue) {
    Vue.options = {}; // 存放全局的属性和方法
    Vue.mixin = function (mixin) {
        this.options = mergeOptions(this.options, mixin);
    }
}