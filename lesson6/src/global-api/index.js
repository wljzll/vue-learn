import { mergeOptions } from "../util";

export function initGlobalApi(Vue) {
    Vue.options = {}; // 存放全局的属性和方法
    Vue.mixin = function (mixin) {
        // 将mixin()方法中的option合并到Vue的options选项中
        this.options = mergeOptions(this.options, mixin);
    }
}