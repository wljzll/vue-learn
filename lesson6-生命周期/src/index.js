import { initGlobalApi } from "./global-api/index";
import { initMixin } from "./init"
import { lifecycleMixin } from "./lifecycle";
import { renderMixin } from "./vdom/index";

function Vue(options) {
   this._init(options)
}

// 原型方法初始化
// 初始化
initMixin(Vue);

// 在Vue原型上添加_update()方法
lifecycleMixin(Vue); // 混合生命周期 渲染

// 在Vue原型上添加 _render() _c() _v() _s()函数
renderMixin(Vue); // 生成虚拟DOM

// 静态方法 Vue.component/Vue.directive/Vue.extend/Vue.mixin
initGlobalApi(Vue);


export default Vue
