import { mergeOptions } from "../util";

export default function initExtend(Vue) {
    let cid = 0;
    // 核心就是创造一个子类，继承我们的父类
    Vue.extend = function(extendOptions) {
        const Super = this;
        const Sub = function vueComponent(options) {
            this._init(options);
        }
        Sub.cid = cid++;
        // 继承
        Sub.prototype = Object.create(Super.prototype);
        Sub.prototype.constructor = Sub;

        Sub.options = mergeOptions(Super.options, extendOptions)

        return Sub;
    }
}